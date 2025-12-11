-- Add public read access for menu display
-- Allow anyone to view restaurant basic info for public menu
CREATE POLICY "Public can view restaurant for menu" 
ON public.restaurants 
FOR SELECT 
TO anon
USING (true);

-- Allow anyone to view active categories for public menu
CREATE POLICY "Public can view active categories" 
ON public.categories 
FOR SELECT 
TO anon
USING (is_active = true);

-- Allow anyone to view available menu items for public menu
CREATE POLICY "Public can view available menu items" 
ON public.menu_items 
FOR SELECT 
TO anon
USING (is_available = true);