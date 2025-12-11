-- Drop the current restrictive SELECT policy on restaurants
DROP POLICY IF EXISTS "Users can view their own restaurant" ON public.restaurants;

-- Create a new SELECT policy that allows users to see restaurants they are associated with
CREATE POLICY "Users can view associated restaurants" 
ON public.restaurants 
FOR SELECT 
TO authenticated
USING (
  id IN (
    SELECT restaurant_id 
    FROM public.user_restaurants 
    WHERE user_id = auth.uid()
  )
);

-- Also add policy for user_roles INSERT (currently only admins can manage, but new users need to add their first role)
DROP POLICY IF EXISTS "Admins can manage roles for their restaurant" ON public.user_roles;

-- Allow users to insert their own roles when they are the owner of the restaurant
CREATE POLICY "Users can insert their own roles for owned restaurants"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  restaurant_id IN (
    SELECT restaurant_id 
    FROM public.user_restaurants 
    WHERE user_id = auth.uid() AND is_owner = true
  )
);

-- Admins can manage all roles for their restaurant (SELECT, UPDATE, DELETE)
CREATE POLICY "Admins can view roles for their restaurant"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM public.user_restaurants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update roles for their restaurant"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  restaurant_id = get_user_restaurant_id(auth.uid())
);

CREATE POLICY "Admins can delete roles for their restaurant"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  restaurant_id = get_user_restaurant_id(auth.uid())
);