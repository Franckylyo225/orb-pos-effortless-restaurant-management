-- Drop and recreate the get_user_restaurant_id function to handle users without restaurants
CREATE OR REPLACE FUNCTION public.get_user_restaurant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT restaurant_id FROM public.user_restaurants WHERE user_id = _user_id AND is_active = true LIMIT 1),
    (SELECT restaurant_id FROM public.profiles WHERE id = _user_id)
  )
$$;

-- Fix the INSERT policy for restaurants - allow any authenticated user to insert
DROP POLICY IF EXISTS "Authenticated users can create restaurants" ON public.restaurants;

CREATE POLICY "Authenticated users can create restaurants" 
ON public.restaurants 
FOR INSERT 
TO authenticated
WITH CHECK (true);