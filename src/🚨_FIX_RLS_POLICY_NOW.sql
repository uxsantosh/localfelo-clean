-- =====================================================
-- FIX: INSERT Policy WITH CHECK is NULL/Broken
-- =====================================================
-- Error: "new row violates row-level security policy"
-- Cause: INSERT policy has no WITH CHECK condition
-- Fix: Recreate with proper WITH CHECK

-- Step 1: Drop the broken policy
DROP POLICY IF EXISTS "Authenticated avatar upload" ON storage.objects;

-- Step 2: Create new INSERT policy with proper WITH CHECK
CREATE POLICY "Authenticated avatar upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads'
  );

-- Step 3: Verify it's fixed
SELECT 
  '✅ POLICY VERIFICATION' as status,
  policyname,
  cmd as command,
  with_check as with_check_condition
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname = 'Authenticated avatar upload';

-- Expected result:
-- with_check_condition should show: (bucket_id = 'user-uploads'::text)
-- NOT null anymore!

-- Step 4: Test insert permission
SELECT 
  '🧪 TEST RESULT' as test,
  CASE 
    WHEN with_check IS NOT NULL 
    THEN '✅ Policy fixed! Try uploading avatar now.'
    ELSE '❌ Still broken. Use Dashboard method instead.'
  END as result
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname = 'Authenticated avatar upload';
