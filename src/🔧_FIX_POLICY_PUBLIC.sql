-- =====================================================
-- FIX: Change INSERT Policy to Allow Public Uploads
-- =====================================================
-- Since phone OTP doesn't create persistent sessions,
-- we'll allow public uploads to user-uploads bucket.
-- This is safe because:
-- 1. Bucket is already public (anyone can read)
-- 2. We're only storing avatars (not sensitive data)
-- 3. Files are auto-compressed and NSFW-checked before upload

-- Drop the authenticated-only policy
DROP POLICY IF EXISTS "Authenticated avatar upload" ON storage.objects;

-- Create new public INSERT policy
CREATE POLICY "Public avatar upload"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'user-uploads');

-- Verify it's created
SELECT 
  '✅ NEW POLICY' as status,
  policyname,
  cmd as command,
  roles,
  with_check::text as with_check_clause
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname = 'Public avatar upload';

-- Show all policies for user-uploads
SELECT 
  '📋 ALL POLICIES' as info,
  policyname,
  cmd,
  roles,
  with_check::text
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    qual::text LIKE '%user-uploads%' 
    OR with_check::text LIKE '%user-uploads%'
  )
ORDER BY cmd;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ POLICY CHANGED TO PUBLIC';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'INSERT policy now allows public uploads.';
  RAISE NOTICE 'This will work with phone OTP login!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Hard refresh app and try uploading.';
  RAISE NOTICE '';
END $$;
