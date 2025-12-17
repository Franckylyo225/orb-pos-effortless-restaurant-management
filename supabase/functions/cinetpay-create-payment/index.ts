import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CINETPAY_API_URL = "https://api-checkout.cinetpay.com/v2/payment";

const PLAN_PRICES: Record<string, number> = {
  basic: 19000,
  pro: 49000,
  premium: 129000,
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurantId, plan, returnUrl, notifyUrl } = await req.json();

    if (!restaurantId || !plan) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: restaurantId, plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const price = PLAN_PRICES[plan];
    if (!price) {
      return new Response(
        JSON.stringify({ error: "Invalid plan" }),
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

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get or create subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (subError) {
      console.error("Error fetching subscription:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subscriptionId = subscription?.id;

    // Create subscription if it doesn't exist
    if (!subscription) {
      const { data: newSub, error: createError } = await supabase
        .from("subscriptions")
        .insert({
          restaurant_id: restaurantId,
          plan: "basic",
          status: "trialing",
          trial_start: new Date().toISOString(),
          trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating subscription:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create subscription" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      subscriptionId = newSub.id;
    }

    // Generate unique transaction ID
    const transactionId = `ORBI-${restaurantId.slice(0, 8)}-${Date.now()}`;

    // Create CinetPay payment
    const cinetPayPayload = {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: price,
      currency: "XOF",
      description: `Abonnement ORBI POS - Plan ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
      return_url: returnUrl || `${SUPABASE_URL?.replace('.supabase.co', '.lovable.app')}/dashboard/subscription/success`,
      notify_url: notifyUrl || `${SUPABASE_URL}/functions/v1/cinetpay-webhook`,
      channels: "ALL",
      metadata: JSON.stringify({
        restaurant_id: restaurantId,
        plan: plan,
        subscription_id: subscriptionId,
      }),
    };

    console.log("Creating CinetPay payment:", { transactionId, amount: price, plan });

    const cinetPayResponse = await fetch(CINETPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cinetPayPayload),
    });

    const cinetPayData = await cinetPayResponse.json();
    console.log("CinetPay response:", cinetPayData);

    if (cinetPayData.code !== "201") {
      console.error("CinetPay error:", cinetPayData);
      return new Response(
        JSON.stringify({ error: cinetPayData.message || "Payment creation failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store payment record
    const { error: paymentError } = await supabase
      .from("subscription_payments")
      .insert({
        subscription_id: subscriptionId,
        restaurant_id: restaurantId,
        amount: price,
        currency: "XOF",
        status: "pending",
        transaction_id: transactionId,
        cinetpay_payment_token: cinetPayData.data?.payment_token,
        cinetpay_payment_url: cinetPayData.data?.payment_url,
        metadata: {
          plan: plan,
          created_at: new Date().toISOString(),
        },
      });

    if (paymentError) {
      console.error("Error storing payment:", paymentError);
      // Continue anyway, payment was created in CinetPay
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: cinetPayData.data?.payment_url,
        transaction_id: transactionId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
