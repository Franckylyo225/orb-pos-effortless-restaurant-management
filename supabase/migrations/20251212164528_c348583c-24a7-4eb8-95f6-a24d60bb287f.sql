-- Create promo codes table for subscription discounts
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  applicable_plans TEXT[] DEFAULT ARRAY['basic', 'pro', 'premium'],
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage promo codes
CREATE POLICY "Super admins can view promo codes"
ON public.promo_codes
FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can create promo codes"
ON public.promo_codes
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update promo codes"
ON public.promo_codes
FOR UPDATE
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete promo codes"
ON public.promo_codes
FOR DELETE
USING (is_super_admin(auth.uid()));

-- Public can validate promo codes (for applying during subscription)
CREATE POLICY "Anyone can validate promo codes"
ON public.promo_codes
FOR SELECT
USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));