-- =====================================================
-- FIX: INSERT Policy Has NULL Condition
-- =====================================================
-- The "Authenticated avatar upload" policy exists but
-- has no WITH CHECK condition, so it's not working!

-- Drop the broken policy
DROP POLICY IF EXISTS "Authenticated avatar upload" ON storage.objects;

-- Recreate with proper WITH CHECK condition
CREATE POLICY "Authenticated avatar upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-uploads');

-- Verify it's fixed
SELECT 
  '✅ POLICY FIXED' as status,
  policyname,
  cmd as operation,
  with_check as with_check_condition
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname = 'Authenticated avatar upload';

-- Expected result:
-- policyname: "Authenticated avatar upload"
-- operation: INSERT
-- with_check_condition: (bucket_id = 'user-uploads'::text)
-- 
-- Should NOT be null anymore!
