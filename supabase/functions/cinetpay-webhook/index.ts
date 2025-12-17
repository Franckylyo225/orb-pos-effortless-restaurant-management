import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CINETPAY_CHECK_URL = "https://api-checkout.cinetpay.com/v2/payment/check";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", body);

    const { cpm_trans_id, cpm_site_id } = body;

    if (!cpm_trans_id) {
      console.error("Missing transaction ID");
      return new Response(
        JSON.stringify({ error: "Missing transaction ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const CINETPAY_API_KEY = Deno.env.get("CINETPAY_API_KEY");
    const CINETPAY_SITE_ID = Deno.env.get("CINETPAY_SITE_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!CINETPAY_API_KEY || !CINETPAY_SITE_ID) {
      console.error("Missing CinetPay credentials");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify transaction status with CinetPay
    const checkResponse = await fetch(CINETPAY_CHECK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: cpm_trans_id,
      }),
    });

    const checkData = await checkResponse.json();
    console.log("CinetPay check response:", checkData);

    if (checkData.code !== "00") {
      console.error("Transaction verification failed:", checkData);
      return new Response(
        JSON.stringify({ error: "Transaction verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transactionStatus = checkData.data?.status;
    const transactionAmount = checkData.data?.amount;
    const paymentMethod = checkData.data?.payment_method;

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from("subscription_payments")
      .select("*, subscriptions(*)")
      .eq("transaction_id", cpm_trans_id)
      .maybeSingle();

    if (paymentError || !payment) {
      console.error("Payment not found:", paymentError);
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let paymentStatus = "pending";
    let subscriptionUpdate: Record<string, unknown> = {};

    if (transactionStatus === "ACCEPTED") {
      paymentStatus = "completed";
      const plan = payment.metadata?.plan || "basic";
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      subscriptionUpdate = {
        status: "active",
        plan: plan,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        trial_end: null, // End trial
      };

      // Update restaurant subscription_plan
      await supabase
        .from("restaurants")
        .update({ subscription_plan: plan })
        .eq("id", payment.restaurant_id);

      console.log(`Subscription activated for restaurant ${payment.restaurant_id}, plan: ${plan}`);
    } else if (transactionStatus === "REFUSED" || transactionStatus === "CANCELLED") {
      paymentStatus = "failed";
    }

    // Update payment record
    await supabase
      .from("subscription_payments")
      .update({
        status: paymentStatus,
        payment_method: paymentMethod,
        paid_at: paymentStatus === "completed" ? new Date().toISOString() : null,
        metadata: {
          ...payment.metadata,
          cinetpay_status: transactionStatus,
          verified_amount: transactionAmount,
          verified_at: new Date().toISOString(),
        },
      })
      .eq("id", payment.id);

    // Update subscription if payment successful
    if (Object.keys(subscriptionUpdate).length > 0) {
      await supabase
        .from("subscriptions")
        .update(subscriptionUpdate)
        .eq("id", payment.subscription_id);
    }

    return new Response(
      JSON.stringify({ success: true, status: paymentStatus }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
