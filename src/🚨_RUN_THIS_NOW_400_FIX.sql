-- =====================================================
-- 🚨 URGENT FIX: 400 Bad Request on Avatar Upload
-- =====================================================
-- Error found in logs: POST .../user-uploads/avatars/...jpeg 400
-- Cause: Bucket "user-uploads" doesn't exist
-- Fix: Create bucket + RLS policies
-- Time: 30 seconds

-- =====================================================
-- STEP 1: CREATE THE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- =====================================================
-- STEP 2: ENABLE RLS
-- =====================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: CREATE RLS POLICIES
-- =====================================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;

-- Create new policies
CREATE POLICY "Public read access"
  ON storage.objects 
  FOR SELECT
  USING (bucket_id = 'user-uploads');

CREATE POLICY "Authenticated upload"
  ON storage.objects 
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "Authenticated update"
  ON storage.objects 
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-uploads')
  WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "Authenticated delete"
  ON storage.objects 
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-uploads');

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check bucket
SELECT 
  '✅ BUCKET CREATED' as status,
  id,
  name,
  public,
  file_size_limit / 1048576 || ' MB' as max_size
FROM storage.buckets
WHERE id = 'user-uploads';

-- Check policies  
SELECT 
  '✅ RLS POLICIES' as status,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ FIX COMPLETE! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Bucket "user-uploads" created';
  RAISE NOTICE 'RLS policies added';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Test avatar upload in app';
  RAISE NOTICE 'Should work now without 400 error!';
  RAISE NOTICE '';
END $$;
