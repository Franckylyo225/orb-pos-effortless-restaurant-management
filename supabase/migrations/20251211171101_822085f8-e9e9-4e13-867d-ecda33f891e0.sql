-- Add cover image column to restaurants
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS menu_cover_image TEXT DEFAULT NULL;

-- Create storage bucket for menu assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-assets', 'menu-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to menu assets
CREATE POLICY "Public can view menu assets"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'menu-assets');

-- Allow authenticated users to upload to their restaurant folder
CREATE POLICY "Authenticated users can upload menu assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-assets');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update menu assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-assets');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete menu assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'menu-assets');