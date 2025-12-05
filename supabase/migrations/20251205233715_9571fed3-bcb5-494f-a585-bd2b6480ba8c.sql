-- Drop the restrictive policy and create a permissive one
DROP POLICY IF EXISTS "Anyone can create a restaurant during signup" ON public.restaurants;

CREATE POLICY "Anyone can create a restaurant during signup" 
ON public.restaurants 
FOR INSERT 
TO authenticated
WITH CHECK (true);