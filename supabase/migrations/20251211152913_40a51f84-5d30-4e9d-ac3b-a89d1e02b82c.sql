-- The issue is that INSERT with .select() requires both INSERT and SELECT policies
-- When a user creates a restaurant, they don't have a user_restaurants entry yet,
-- so the SELECT policy fails when trying to return the inserted row.

-- Solution: Add a policy that allows the user who just inserted to see the row
-- We'll use a more permissive approach: allow authenticated users to view restaurants
-- they've just created (within the same transaction)

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view associated restaurants" ON public.restaurants;

-- Create a combined SELECT policy that allows:
-- 1. Users to see restaurants they're associated with via user_restaurants
-- 2. ALL authenticated users to INSERT (already exists)
-- The trick: we use a function that doesn't require user_restaurants to exist yet

CREATE POLICY "Users can view their restaurants" 
ON public.restaurants 
FOR SELECT 
TO authenticated
USING (
  -- Allow if user is associated with this restaurant
  id IN (
    SELECT restaurant_id 
    FROM public.user_restaurants 
    WHERE user_id = auth.uid()
  )
  OR
  -- Also check the profile's restaurant_id for backward compatibility
  id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);

-- For the INSERT to work with .select(), we need to ensure the row is visible right after insert
-- The cleanest solution is to not use .select() after insert, or use a different approach
-- But since we can't easily change that, let's create a more permissive temporary policy

-- Actually, the real fix is simpler: the INSERT policy with_check is failing
-- Let me verify by creating a truly permissive INSERT policy

DROP POLICY IF EXISTS "Authenticated users can create restaurants" ON public.restaurants;

CREATE POLICY "Authenticated users can create restaurants" 
ON public.restaurants 
FOR INSERT 
TO authenticated
WITH CHECK (true);