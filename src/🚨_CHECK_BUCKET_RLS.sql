-- =====================================================
-- CHECK: Is RLS even enabled on storage.objects?
-- =====================================================

-- Check 1: Is RLS enabled on storage.objects table?
SELECT 
  '🔒 RLS STATUS' as check,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- Check 2: Bucket configuration
SELECT 
  '📦 BUCKET CONFIG' as check,
  id as bucket_name,
  public as is_public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'user-uploads';

-- Check 3: List ALL policies for storage.objects
SELECT 
  '📋 ALL STORAGE POLICIES' as info,
  policyname,
  cmd as operation,
  roles,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY cmd, policyname;

-- Diagnostic with fix suggestions
DO $$
DECLARE
  v_rls_enabled BOOLEAN;
  v_bucket_exists BOOLEAN;
  v_bucket_public BOOLEAN;
  v_insert_policy_count INTEGER;
  v_insert_policy_has_check BOOLEAN;
BEGIN
  -- Check RLS
  SELECT rowsecurity INTO v_rls_enabled
  FROM pg_tables
  WHERE schemaname = 'storage' AND tablename = 'objects';
  
  -- Check bucket
  SELECT 
    EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'user-uploads'),
    COALESCE((SELECT public FROM storage.buckets WHERE id = 'user-uploads'), false)
  INTO v_bucket_exists, v_bucket_public;
  
  -- Check INSERT policies
  SELECT 
    COUNT(*),
    BOOL_OR(with_check IS NOT NULL)
  INTO v_insert_policy_count, v_insert_policy_has_check
  FROM pg_policies
  WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND cmd = 'INSERT'
    AND policyname LIKE '%upload%';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   COMPLETE RLS DIAGNOSTIC';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- RLS Status
  IF NOT v_rls_enabled THEN
    RAISE NOTICE '❌ CRITICAL: RLS is DISABLED on storage.objects';
    RAISE NOTICE '   This should never happen!';
    RAISE NOTICE '';
    RAISE NOTICE '   FIX:';
    RAISE NOTICE '   ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ RLS is enabled on storage.objects';
    RAISE NOTICE '';
  END IF;
  
  -- Bucket Status
  IF NOT v_bucket_exists THEN
    RAISE NOTICE '❌ Bucket "user-uploads" does not exist';
    RAISE NOTICE '   Create it in Dashboard → Storage → New Bucket';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ Bucket "user-uploads" exists';
    
    IF NOT v_bucket_public THEN
      RAISE NOTICE '⚠️  Bucket is PRIVATE';
      RAISE NOTICE '   Make it public for easier access';
      RAISE NOTICE '';
    ELSE
      RAISE NOTICE '✅ Bucket is PUBLIC';
      RAISE NOTICE '';
    END IF;
  END IF;
  
  -- Policy Status
  IF v_insert_policy_count = 0 THEN
    RAISE NOTICE '❌ NO INSERT POLICIES FOUND';
    RAISE NOTICE '   This is why uploads fail!';
    RAISE NOTICE '';
    RAISE NOTICE '   FIX: Run 🔥_COMPLETE_FIX.sql';
    RAISE NOTICE '';
  ELSIF NOT v_insert_policy_has_check THEN
    RAISE NOTICE '❌ INSERT policy exists but WITH CHECK is NULL';
    RAISE NOTICE '   This is THE problem causing 403 error!';
    RAISE NOTICE '';
    RAISE NOTICE '   FIX: Run 🔥_COMPLETE_FIX.sql';
    RAISE NOTICE '   OR: Delete and recreate via Dashboard';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ INSERT policy exists with WITH CHECK';
    RAISE NOTICE '';
    RAISE NOTICE '   Policy configuration looks correct!';
    RAISE NOTICE '';
    RAISE NOTICE '   If still getting 403 errors, the problem is:';
    RAISE NOTICE '   1. Auth token not being sent';
    RAISE NOTICE '   2. Session expired';
    RAISE NOTICE '   3. User not authenticated';
    RAISE NOTICE '';
    RAISE NOTICE '   DEBUG STEPS:';
    RAISE NOTICE '   1. Check browser console for auth token';
    RAISE NOTICE '   2. Check Network tab → Headers → Authorization';
    RAISE NOTICE '   3. Try logging out and back in';
    RAISE NOTICE '   4. Clear browser cache and localStorage';
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE '========================================';
  
  -- Show exact policy that should work
  RAISE NOTICE '';
  RAISE NOTICE 'CORRECT INSERT POLICY SQL:';
  RAISE NOTICE '';
  RAISE NOTICE 'CREATE POLICY "Authenticated avatar upload"';
  RAISE NOTICE '  ON storage.objects';
  RAISE NOTICE '  FOR INSERT';
  RAISE NOTICE '  TO authenticated';
  RAISE NOTICE '  WITH CHECK (bucket_id = ''user-uploads'');';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
