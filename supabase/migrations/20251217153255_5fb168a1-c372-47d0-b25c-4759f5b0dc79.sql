-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'basic',
  status TEXT NOT NULL DEFAULT 'trialing', -- 'trialing', 'active', 'past_due', 'canceled', 'expired'
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id)
);

-- Create subscription_payments table
CREATE TABLE public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'canceled'
  transaction_id TEXT UNIQUE NOT NULL,
  cinetpay_payment_token TEXT,
  cinetpay_payment_url TEXT,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users can view their restaurant subscription"
ON public.subscriptions FOR SELECT
USING (restaurant_id = get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can insert subscription for their restaurant"
ON public.subscriptions FOR INSERT
WITH CHECK (restaurant_id = get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can update their restaurant subscription"
ON public.subscriptions FOR UPDATE
USING (restaurant_id = get_user_restaurant_id(auth.uid()));

-- RLS policies for subscription_payments
CREATE POLICY "Users can view their restaurant payments"
ON public.subscription_payments FOR SELECT
USING (restaurant_id = get_user_restaurant_id(auth.uid()));

CREATE POLICY "Users can insert payments for their restaurant"
ON public.subscription_payments FOR INSERT
WITH CHECK (restaurant_id = get_user_restaurant_id(auth.uid()));

-- Service role policy for webhook updates
CREATE POLICY "Service role can update payments"
ON public.subscription_payments FOR UPDATE
USING (true);

CREATE POLICY "Service role can update subscriptions"
ON public.subscriptions FOR UPDATE
USING (true);

-- Indexes for performance
CREATE INDEX idx_subscriptions_restaurant_id ON public.subscriptions(restaurant_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscription_payments_transaction_id ON public.subscription_payments(transaction_id);
CREATE INDEX idx_subscription_payments_restaurant_id ON public.subscription_payments(restaurant_id);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_payments_updated_at
BEFORE UPDATE ON public.subscription_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();