-- =====================================================
-- COMPLETE AVATAR STORAGE FIX
-- =====================================================
-- This script fixes the RLS issue preventing avatar uploads
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: CREATE STORAGE BUCKET
-- =====================================================
-- Insert bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']::text[];

-- =====================================================
-- STEP 2: REMOVE OLD POLICIES
-- =====================================================

DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated avatar upload" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated avatar update" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated avatar delete" ON storage.objects;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- STEP 3: CREATE SIMPLE RLS POLICIES
-- =====================================================

-- Allow public read access to all files in user-uploads bucket
CREATE POLICY "Public avatar access"
  ON storage.objects 
  FOR SELECT
  USING (bucket_id = 'user-uploads');

-- Allow authenticated users to upload files to avatars folder
CREATE POLICY "Authenticated avatar upload"
  ON storage.objects 
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads'
  );

-- Allow authenticated users to update files in user-uploads bucket
CREATE POLICY "Authenticated avatar update"
  ON storage.objects 
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-uploads')
  WITH CHECK (bucket_id = 'user-uploads');

-- Allow authenticated users to delete files in user-uploads bucket  
CREATE POLICY "Authenticated avatar delete"
  ON storage.objects 
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-uploads');

-- =====================================================
-- STEP 4: VERIFY PROFILES TABLE RLS
-- =====================================================

-- Check if profiles UPDATE policy exists
DO $$
BEGIN
  -- The profiles table should already have this policy
  -- This is just to verify it exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    RAISE NOTICE 'Creating profiles update policy...';
    EXECUTE 'CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid())';
  ELSE
    RAISE NOTICE 'Profiles update policy already exists';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'user-uploads';

-- Check storage policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- Check profiles policies
SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND policyname LIKE '%update%';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Avatar storage setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify the bucket exists in Dashboard > Storage';
  RAISE NOTICE '2. Test avatar upload in the app';
  RAISE NOTICE '3. Check that avatar_url in profiles table contains storage URLs';
  RAISE NOTICE '';
  RAISE NOTICE 'Storage URL format:';
  RAISE NOTICE 'https://{project}.supabase.co/storage/v1/object/public/user-uploads/avatars/{filename}';
END $$;
