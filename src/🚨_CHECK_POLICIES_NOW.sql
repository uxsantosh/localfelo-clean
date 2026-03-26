-- =====================================================
-- CHECK IF RLS POLICIES EXIST
-- =====================================================

-- Check 1: Does bucket exist? (Should be YES)
SELECT 
  '📦 BUCKET STATUS' as check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-uploads')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status;

-- Check 2: Is bucket public? (Should be YES)
SELECT 
  '🌍 PUBLIC STATUS' as check,
  CASE 
    WHEN public THEN '✅ Public'
    ELSE '❌ Private'
  END as status
FROM storage.buckets 
WHERE id = 'user-uploads';

-- Check 3: RLS policies exist? (THIS IS LIKELY THE PROBLEM)
SELECT 
  '🔒 RLS POLICIES' as check,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ Policies exist'
    WHEN COUNT(*) > 0 THEN '⚠️  Only ' || COUNT(*) || ' policy/policies (need at least 3)'
    ELSE '❌ NO POLICIES - THIS IS THE PROBLEM!'
  END as status
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%upload%' OR policyname LIKE '%read%' OR policyname LIKE '%public%';

-- Check 4: List all policies
SELECT 
  '📋 POLICY LIST' as info,
  policyname,
  cmd as operation,
  qual as condition
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY cmd;

-- DIAGNOSIS
DO $$
DECLARE
  v_bucket_exists BOOLEAN;
  v_is_public BOOLEAN;
  v_policy_count INTEGER;
BEGIN
  -- Check bucket
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'user-uploads'
  ) INTO v_bucket_exists;
  
  -- Check if public
  SELECT public INTO v_is_public
  FROM storage.buckets WHERE id = 'user-uploads';
  
  -- Count policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'storage' 
    AND tablename = 'objects';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   STORAGE DIAGNOSTIC';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  IF NOT v_bucket_exists THEN
    RAISE NOTICE '❌ PROBLEM: Bucket does not exist';
    RAISE NOTICE 'Create it in Dashboard → Storage → New Bucket';
  ELSE
    RAISE NOTICE '✅ Bucket exists';
    
    IF NOT v_is_public THEN
      RAISE NOTICE '⚠️  Bucket is PRIVATE (should be public)';
      RAISE NOTICE 'Fix: Dashboard → Storage → user-uploads → Settings → Check "Public"';
    ELSE
      RAISE NOTICE '✅ Bucket is public';
    END IF;
    
    IF v_policy_count = 0 THEN
      RAISE NOTICE '';
      RAISE NOTICE '❌ PROBLEM FOUND: NO RLS POLICIES!';
      RAISE NOTICE '';
      RAISE NOTICE 'This is why uploads fail!';
      RAISE NOTICE 'Bucket exists but RLS blocks all access.';
      RAISE NOTICE '';
      RAISE NOTICE 'FIX: Add policies via Dashboard';
      RAISE NOTICE '1. Go to Storage → user-uploads → Policies';
      RAISE NOTICE '2. Click "New Policy"';
      RAISE NOTICE '3. Add "Allow public read access"';
      RAISE NOTICE '4. Add "Allow authenticated upload"';
      RAISE NOTICE '5. Add "Allow users to update own files"';
      RAISE NOTICE '';
    ELSIF v_policy_count < 3 THEN
      RAISE NOTICE '';
      RAISE NOTICE '⚠️  Only % policies found (need at least 3)', v_policy_count;
      RAISE NOTICE '';
      RAISE NOTICE 'You need:';
      RAISE NOTICE '- SELECT policy (public read)';
      RAISE NOTICE '- INSERT policy (authenticated upload)';
      RAISE NOTICE '- UPDATE policy (authenticated update)';
      RAISE NOTICE '';
    ELSE
      RAISE NOTICE '✅ Has % RLS policies', v_policy_count;
      RAISE NOTICE '';
      RAISE NOTICE 'Configuration looks good!';
      RAISE NOTICE '';
      RAISE NOTICE 'If still failing, check browser console for errors.';
    END IF;
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
