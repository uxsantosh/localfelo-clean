-- =====================================================
-- STORAGE RLS POLICIES FOR AVATAR UPLOADS
-- =====================================================
-- Run this in Supabase SQL Editor to fix avatar upload issues

-- First, ensure the storage bucket exists (create if needed)
-- Note: You may need to create this bucket manually in Dashboard > Storage
-- Bucket name: user-uploads
-- Public: true

-- =====================================================
-- CLEAN UP OLD POLICIES (if any)
-- =====================================================

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated avatar upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated avatar update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated avatar delete" ON storage.objects;

-- =====================================================
-- CREATE NEW STORAGE RLS POLICIES
-- =====================================================

-- Allow anyone to view/download avatars (public read)
CREATE POLICY "Public avatar access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-uploads');

-- Allow authenticated users to upload avatars
-- File path format: avatars/{filename}
CREATE POLICY "Authenticated avatar upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads' 
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- Allow authenticated users to update/replace avatars
CREATE POLICY "Authenticated avatar update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-uploads' 
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- Allow authenticated users to delete avatars
CREATE POLICY "Authenticated avatar delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-uploads' 
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- =====================================================
-- VERIFY SETUP
-- =====================================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'user-uploads';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- 1. If the bucket doesn't exist, create it:
--    - Go to Dashboard > Storage > Create Bucket
--    - Name: user-uploads
--    - Public: true (checked)
--
-- 2. These policies allow ANY authenticated user to upload/update/delete
--    avatars. This is intentional for the fallback system to work.
--
-- 3. The app handles cleanup of old avatars in the frontend code.
--
-- 4. Storage URLs will look like:
--    https://{project}.supabase.co/storage/v1/object/public/user-uploads/avatars/{filename}
--
-- 5. The fallback to base64 still works if storage upload fails for any reason.
--
