-- Create a junction table for user-restaurant relationships
CREATE TABLE public.user_restaurants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  is_owner boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Enable RLS
ALTER TABLE public.user_restaurants ENABLE ROW LEVEL SECURITY;

-- Policies for user_restaurants
CREATE POLICY "Users can view their own restaurant associations"
ON public.user_restaurants
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own restaurant associations"
ON public.user_restaurants
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own restaurant associations"
ON public.user_restaurants
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own restaurant associations"
ON public.user_restaurants
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND is_owner = true);

-- Migrate existing profile->restaurant relationships to new table
INSERT INTO public.user_restaurants (user_id, restaurant_id, is_owner, is_active)
SELECT p.id, p.restaurant_id, true, true
FROM public.profiles p
WHERE p.restaurant_id IS NOT NULL;

-- Create function to get subscription restaurant limit
CREATE OR REPLACE FUNCTION public.get_subscription_restaurant_limit(plan_name text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN plan_name = 'premium' THEN 999
    WHEN plan_name = 'pro' THEN 3
    ELSE 1
  END;
$$;

-- Create function to count user's restaurants
CREATE OR REPLACE FUNCTION public.get_user_restaurant_count(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.user_restaurants
  WHERE user_id = _user_id AND is_owner = true;
$$;