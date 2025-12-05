-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.get_subscription_restaurant_limit(plan_name text)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN plan_name = 'premium' THEN 999
    WHEN plan_name = 'pro' THEN 3
    ELSE 1
  END;
$$;