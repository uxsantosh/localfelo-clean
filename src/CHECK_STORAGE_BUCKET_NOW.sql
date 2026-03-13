-- =====================================================
-- QUICK CHECK: Does user-uploads bucket exist?
-- =====================================================

-- Check 1: Does the bucket exist at all?
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-uploads')
    THEN '✅ YES - Bucket exists'
    ELSE '❌ NO - Bucket does NOT exist (THIS IS THE PROBLEM!)'
  END as bucket_status;

-- Check 2: If it exists, show details
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'user-uploads';

-- Check 3: List ALL buckets
SELECT 
  '📦 ALL STORAGE BUCKETS:' as info,
  id,
  name,
  public,
  created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- Check 4: RLS policies on storage.objects
SELECT 
  '🔒 STORAGE RLS POLICIES:' as info,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

-- If count is 0, that's likely the problem!

-- =====================================================
-- DIAGNOSIS
-- =====================================================

DO $$
DECLARE
  v_bucket_exists BOOLEAN;
  v_policy_count INTEGER;
BEGIN
  -- Check bucket
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'user-uploads'
  ) INTO v_bucket_exists;
  
  -- Check policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'storage' AND tablename = 'objects';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   STORAGE 400 ERROR DIAGNOSIS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  IF NOT v_bucket_exists THEN
    RAISE NOTICE '❌ PROBLEM FOUND: Bucket "user-uploads" does NOT exist!';
    RAISE NOTICE '';
    RAISE NOTICE 'This explains the 400 Bad Request error.';
    RAISE NOTICE 'The storage endpoint rejects uploads to non-existent buckets.';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 FIX: Run FIX_400_STORAGE_ERROR.sql';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ Bucket exists';
    
    IF v_policy_count = 0 THEN
      RAISE NOTICE '⚠️  BUT: No RLS policies found';
      RAISE NOTICE '';
      RAISE NOTICE 'Bucket exists but RLS will block uploads.';
      RAISE NOTICE '';
      RAISE NOTICE '🔧 FIX: Run FIX_400_STORAGE_ERROR.sql';
      RAISE NOTICE '';
    ELSE
      RAISE NOTICE '✅ Has % RLS policies', v_policy_count;
      RAISE NOTICE '';
      RAISE NOTICE 'Configuration looks good!';
      RAISE NOTICE '';
      RAISE NOTICE 'If still getting 400 error, check:';
      RAISE NOTICE '1. File size < 10MB';
      RAISE NOTICE '2. File type is image/jpeg, image/png, etc.';
      RAISE NOTICE '3. Supabase project URL is correct in .env';
    END IF;
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
