-- Fix: Allow authenticated users to also read from menu-assets bucket
CREATE POLICY "Authenticated users can view menu assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'menu-assets');