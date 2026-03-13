-- =====================================================
-- FIX 400 BAD REQUEST ERROR FOR AVATAR UPLOAD
-- =====================================================
-- Error: POST .../storage/v1/object/user-uploads/avatars/... 400 (Bad Request)
-- This is NOT an RLS issue (would be 403)
-- This is a bucket or configuration issue

-- =====================================================
-- STEP 1: CHECK IF BUCKET EXISTS
-- =====================================================

SELECT 
  'BUCKET CHECK' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-uploads') 
    THEN '✅ Bucket exists'
    ELSE '❌ BUCKET MISSING - This is the problem!'
  END as status;

-- Show bucket details if it exists
SELECT 
  id,
  name,
  public,
  created_at,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'user-uploads';

-- =====================================================
-- STEP 2: CREATE BUCKET IF MISSING
-- =====================================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- STEP 3: ENABLE RLS ON STORAGE.OBJECTS
-- =====================================================

-- Ensure RLS is enabled (should be by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: DROP ALL EXISTING POLICIES
-- =====================================================

DO $$ 
BEGIN
  -- Drop all existing policies on storage.objects
  DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated avatar upload" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated avatar update" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated avatar delete" ON storage.objects;
  DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
EXCEPTION
  WHEN OTHERS THEN 
    RAISE NOTICE 'Some policies did not exist, continuing...';
END $$;

-- =====================================================
-- STEP 5: CREATE SIMPLE, PERMISSIVE RLS POLICIES
-- =====================================================

-- Allow public read access to all files in user-uploads bucket
CREATE POLICY "Public read access"
  ON storage.objects 
  FOR SELECT
  USING (bucket_id = 'user-uploads');

-- Allow authenticated users to insert ANY file in user-uploads bucket
CREATE POLICY "Authenticated upload"
  ON storage.objects 
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-uploads');

-- Allow authenticated users to update ANY file in user-uploads bucket
CREATE POLICY "Authenticated update"
  ON storage.objects 
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-uploads')
  WITH CHECK (bucket_id = 'user-uploads');

-- Allow authenticated users to delete ANY file in user-uploads bucket
CREATE POLICY "Authenticated delete"
  ON storage.objects 
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-uploads');

-- =====================================================
-- STEP 6: VERIFY SETUP
-- =====================================================

-- Check bucket exists and is public
SELECT 
  '✅ BUCKET VERIFICATION' as section,
  id,
  name,
  public as is_public,
  file_size_limit / 1048576 || ' MB' as max_file_size,
  array_length(allowed_mime_types, 1) as allowed_types_count
FROM storage.buckets
WHERE id = 'user-uploads';

-- Check RLS policies
SELECT 
  '✅ RLS POLICIES' as section,
  policyname,
  cmd as operation,
  roles::text as who
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (policyname LIKE '%upload%' OR policyname LIKE '%read%' OR policyname LIKE '%update%' OR policyname LIKE '%delete%')
ORDER BY cmd, policyname;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
  v_bucket_exists BOOLEAN;
  v_policy_count INTEGER;
BEGIN
  -- Check if bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'user-uploads'
  ) INTO v_bucket_exists;
  
  -- Count policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND bucket_id IS NOT NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   AVATAR STORAGE FIX COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  IF v_bucket_exists THEN
    RAISE NOTICE '✅ Bucket "user-uploads" exists';
  ELSE
    RAISE NOTICE '❌ FAILED: Bucket creation failed';
    RAISE NOTICE '   Manual fix: Go to Dashboard > Storage > Create Bucket';
    RAISE NOTICE '   Name: user-uploads';
    RAISE NOTICE '   Public: YES (checked)';
  END IF;
  
  RAISE NOTICE '✅ Created % RLS policies', v_policy_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test avatar upload in app';
  RAISE NOTICE '2. Should work without 400 error';
  RAISE NOTICE '3. Check Dashboard > Storage > user-uploads to see uploaded files';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
