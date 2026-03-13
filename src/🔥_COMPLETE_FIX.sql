-- =====================================================
-- COMPLETE FIX: RLS Policy for Avatar Upload
-- =====================================================
-- This removes ALL existing policies and recreates them
-- with the correct configuration

-- Step 1: Remove ALL policies for user-uploads bucket
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated avatar upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated avatar update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated avatar delete" ON storage.objects;

-- Step 2: Create SELECT policy (anyone can read)
CREATE POLICY "Public avatar access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'user-uploads');

-- Step 3: Create INSERT policy (authenticated users can upload)
-- This is the critical one for your error!
CREATE POLICY "Authenticated avatar upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-uploads');

-- Step 4: Create UPDATE policy (authenticated users can update)
CREATE POLICY "Authenticated avatar update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-uploads')
  WITH CHECK (bucket_id = 'user-uploads');

-- Step 5: Create DELETE policy (authenticated users can delete)
CREATE POLICY "Authenticated avatar delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-uploads');

-- Step 6: Verify all policies are created correctly
SELECT 
  '📋 POLICIES CREATED' as status,
  policyname,
  cmd as command,
  roles,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    policyname LIKE '%avatar%' 
    OR policyname LIKE '%user-uploads%'
  )
ORDER BY cmd;

-- Step 7: Check INSERT policy specifically
SELECT 
  '🔍 INSERT POLICY CHECK' as check,
  CASE 
    WHEN with_check IS NOT NULL 
    THEN '✅ WITH CHECK is set: ' || with_check::text
    ELSE '❌ WITH CHECK is NULL - THIS IS THE PROBLEM!'
  END as result
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname = 'Authenticated avatar upload';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ POLICIES RECREATED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Hard refresh your app (Ctrl+Shift+R)';
  RAISE NOTICE '2. Try uploading avatar';
  RAISE NOTICE '3. Check browser console for success';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected console output:';
  RAISE NOTICE '✅ [AVATAR UPLOAD] Upload SUCCESS';
  RAISE NOTICE '';
END $$;
