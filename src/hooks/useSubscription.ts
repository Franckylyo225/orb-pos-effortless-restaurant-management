import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "./useRestaurant";

export interface Subscription {
  id: string;
  restaurant_id: string;
  plan: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "expired";
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  restaurant_id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "canceled";
  transaction_id: string;
  cinetpay_payment_url: string | null;
  payment_method: string | null;
  paid_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const PLAN_PRICES: Record<string, number> = {
  basic: 19000,
  pro: 49000,
  premium: 129000,
};

export function useSubscription() {
  const { restaurant } = useRestaurant();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        return;
      }

      if (data) {
        setSubscription(data as Subscription);
      } else {
        // Create trial subscription if none exists
        const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const { data: newSub, error: createError } = await supabase
          .from("subscriptions")
          .insert({
            restaurant_id: restaurant.id,
            plan: "pro", // Pro features during trial
            status: "trialing",
            trial_start: new Date().toISOString(),
            trial_end: trialEnd.toISOString(),
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating trial subscription:", createError);
        } else {
          setSubscription(newSub as Subscription);
        }
      }
    } catch (error) {
      console.error("Error in fetchSubscription:", error);
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id]);

  const fetchPayments = useCallback(async () => {
    if (!restaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from("subscription_payments")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching payments:", error);
        return;
      }

      setPayments((data || []) as SubscriptionPayment[]);
    } catch (error) {
      console.error("Error in fetchPayments:", error);
    }
  }, [restaurant?.id]);

  useEffect(() => {
    fetchSubscription();
    fetchPayments();
  }, [fetchSubscription, fetchPayments]);

  const isTrialing = subscription?.status === "trialing";

  const isTrialExpired = () => {
    if (!subscription?.trial_end) return false;
    return new Date(subscription.trial_end) < new Date();
  };

  const getTrialDaysRemaining = () => {
    if (!subscription?.trial_end) return 0;
    const diff = new Date(subscription.trial_end).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const isActive = subscription?.status === "active";

  const createPayment = async (plan: string): Promise<{ success: boolean; paymentUrl?: string; error?: string }> => {
    if (!restaurant?.id) {
      return { success: false, error: "No restaurant selected" };
    }

    setProcessingPayment(true);

    try {
      const returnUrl = `${window.location.origin}/dashboard/subscription/success?plan=${plan}`;
      
      const { data, error } = await supabase.functions.invoke("cinetpay-create-payment", {
        body: {
          restaurantId: restaurant.id,
          plan: plan,
          returnUrl: returnUrl,
        },
      });

      if (error) {
        console.error("Error creating payment:", error);
        return { success: false, error: error.message || "Failed to create payment" };
      }

      if (data?.payment_url) {
        return { success: true, paymentUrl: data.payment_url };
      }

      return { success: false, error: data?.error || "Failed to get payment URL" };
    } catch (error) {
      console.error("Error in createPayment:", error);
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setProcessingPayment(false);
    }
  };

  const checkPaymentStatus = async (transactionId: string): Promise<SubscriptionPayment | null> => {
    if (!restaurant?.id) return null;

    try {
      const { data, error } = await supabase
        .from("subscription_payments")
        .select("*")
        .eq("transaction_id", transactionId)
        .maybeSingle();

      if (error) {
        console.error("Error checking payment status:", error);
        return null;
      }

      return data as SubscriptionPayment | null;
    } catch (error) {
      console.error("Error in checkPaymentStatus:", error);
      return null;
    }
  };

  const getEffectivePlan = () => {
    if (subscription?.status === "trialing" && !isTrialExpired()) {
      return "pro"; // Pro features during trial
    }
    if (subscription?.status === "active") {
      return subscription.plan;
    }
    return restaurant?.subscription_plan || "basic";
  };

  return {
    subscription,
    payments,
    loading,
    processingPayment,
    isTrialing,
    isTrialExpired: isTrialExpired(),
    trialDaysRemaining: getTrialDaysRemaining(),
    isActive,
    effectivePlan: getEffectivePlan(),
    planPrices: PLAN_PRICES,
    createPayment,
    checkPaymentStatus,
    refetch: fetchSubscription,
  };
}
