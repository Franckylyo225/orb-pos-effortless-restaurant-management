-- Drop the restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Authenticated users can create restaurants" ON public.restaurants;

CREATE POLICY "Authenticated users can create restaurants" 
ON public.restaurants 
FOR INSERT 
TO authenticated
WITH CHECK (true);