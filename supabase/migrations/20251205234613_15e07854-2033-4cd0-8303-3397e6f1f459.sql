-- Drop and recreate the INSERT policy with correct permissions
DROP POLICY IF EXISTS "Anyone can create a restaurant during signup" ON public.restaurants;

-- Create policy that allows any authenticated user to create a restaurant
CREATE POLICY "Authenticated users can create restaurants" 
ON public.restaurants 
FOR INSERT 
TO authenticated
WITH CHECK (true);