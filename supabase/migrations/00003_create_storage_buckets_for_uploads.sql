
-- Storage buckets for profile and store images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',       'avatars',       true, 5242880, ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp']),
  ('banners',       'banners',       true, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp']),
  ('backgrounds',   'backgrounds',   true, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp']),
  ('store-images',  'store-images',  true, 5242880, ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS for avatars bucket: authenticated users upload their own, anyone reads
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "avatars_owner_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_owner_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS for banners bucket
CREATE POLICY "banners_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "banners_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');
CREATE POLICY "banners_owner_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "banners_owner_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS for backgrounds bucket
CREATE POLICY "backgrounds_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'backgrounds');
CREATE POLICY "backgrounds_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'backgrounds');
CREATE POLICY "backgrounds_owner_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "backgrounds_owner_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS for store-images bucket (admin upload, public read)
CREATE POLICY "store_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'store-images');
CREATE POLICY "store_images_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'store-images');
CREATE POLICY "store_images_auth_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'store-images');
CREATE POLICY "store_images_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'store-images');

-- Add background_url column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'background_url') THEN
    ALTER TABLE profiles ADD COLUMN background_url TEXT;
  END IF;
END $$;
