-- =====================================================
-- AVATAR UPLOAD DIAGNOSTIC SCRIPT
-- =====================================================
-- Run this to diagnose why avatars aren't saving properly

-- =====================================================
-- 1. CHECK STORAGE BUCKET
-- =====================================================

SELECT 
  'STORAGE BUCKET CHECK' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-uploads') 
    THEN '✅ Bucket exists'
    ELSE '❌ Bucket missing - needs to be created'
  END as status,
  COALESCE(
    (SELECT public::text FROM storage.buckets WHERE id = 'user-uploads'),
    'N/A'
  ) as is_public;

-- =====================================================
-- 2. CHECK STORAGE RLS POLICIES
-- =====================================================

SELECT 
  'STORAGE RLS POLICIES' as check_type,
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname ILIKE '%avatar%';

-- List all storage.objects policies
SELECT 
  policyname,
  cmd as operation,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY cmd, policyname;

-- =====================================================
-- 3. CHECK PROFILES TABLE RLS
-- =====================================================

SELECT 
  'PROFILES UPDATE POLICY' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'profiles' 
        AND cmd = 'UPDATE'
    ) 
    THEN '✅ Update policy exists'
    ELSE '❌ Update policy missing'
  END as status;

-- List profiles UPDATE policies
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'UPDATE';

-- =====================================================
-- 4. CHECK RECENT PROFILE UPDATES
-- =====================================================

-- Check if profiles are being updated at all
SELECT 
  'RECENT PROFILE UPDATES' as check_type,
  COUNT(*) as update_count,
  COUNT(DISTINCT id) as unique_users,
  MAX(updated_at) as last_update
FROM profiles
WHERE updated_at > NOW() - INTERVAL '1 hour';

-- =====================================================
-- 5. CHECK AVATAR_URL PATTERNS
-- =====================================================

-- Analyze avatar_url data to see if they're base64 or storage URLs
SELECT 
  'AVATAR URL ANALYSIS' as check_type,
  COUNT(*) as total_avatars,
  COUNT(CASE WHEN avatar_url LIKE 'data:image%' THEN 1 END) as base64_count,
  COUNT(CASE WHEN avatar_url LIKE '%supabase%storage%' THEN 1 END) as storage_url_count,
  COUNT(CASE WHEN avatar_url IS NOT NULL 
              AND avatar_url NOT LIKE 'data:image%' 
              AND avatar_url NOT LIKE '%supabase%storage%' 
        THEN 1 END) as other_count
FROM profiles
WHERE avatar_url IS NOT NULL;

-- Show sample avatar URLs
SELECT 
  id,
  name,
  CASE 
    WHEN avatar_url LIKE 'data:image%' THEN 'Base64 (fallback)'
    WHEN avatar_url LIKE '%supabase%storage%' THEN 'Storage URL (correct)'
    ELSE 'Other'
  END as avatar_type,
  LEFT(avatar_url, 100) || '...' as avatar_url_sample,
  updated_at
FROM profiles
WHERE avatar_url IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- =====================================================
-- 6. CHECK STORAGE FILES
-- =====================================================

-- Check if any files exist in storage
SELECT 
  'STORAGE FILES CHECK' as check_type,
  COUNT(*) as file_count,
  COUNT(CASE WHEN name LIKE 'avatars/%' THEN 1 END) as avatar_files
FROM storage.objects
WHERE bucket_id = 'user-uploads';

-- List recent storage uploads
SELECT 
  name as file_path,
  created_at,
  updated_at,
  metadata->>'size' as file_size
FROM storage.objects
WHERE bucket_id = 'user-uploads'
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 7. SUMMARY & RECOMMENDATIONS
-- =====================================================

DO $$
DECLARE
  bucket_exists BOOLEAN;
  storage_policies INTEGER;
  profile_policy BOOLEAN;
  base64_count INTEGER;
  storage_count INTEGER;
BEGIN
  -- Check bucket
  SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-uploads') INTO bucket_exists;
  
  -- Check storage policies
  SELECT COUNT(*) INTO storage_policies 
  FROM pg_policies 
  WHERE schemaname = 'storage' AND tablename = 'objects';
  
  -- Check profile policy
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND cmd = 'UPDATE'
  ) INTO profile_policy;
  
  -- Check avatar types
  SELECT 
    COUNT(CASE WHEN avatar_url LIKE 'data:image%' THEN 1 END),
    COUNT(CASE WHEN avatar_url LIKE '%supabase%storage%' THEN 1 END)
  INTO base64_count, storage_count
  FROM profiles
  WHERE avatar_url IS NOT NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'AVATAR UPLOAD DIAGNOSTIC SUMMARY';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  
  IF NOT bucket_exists THEN
    RAISE NOTICE '❌ ISSUE: Storage bucket "user-uploads" does not exist';
    RAISE NOTICE '   FIX: Run FIX_AVATAR_STORAGE_COMPLETE.sql';
  ELSE
    RAISE NOTICE '✅ Storage bucket exists';
  END IF;
  
  IF storage_policies = 0 THEN
    RAISE NOTICE '❌ ISSUE: No RLS policies found for storage.objects';
    RAISE NOTICE '   FIX: Run FIX_AVATAR_STORAGE_COMPLETE.sql';
  ELSE
    RAISE NOTICE '✅ Storage has % RLS policies', storage_policies;
  END IF;
  
  IF NOT profile_policy THEN
    RAISE NOTICE '❌ ISSUE: No UPDATE policy found for profiles table';
    RAISE NOTICE '   FIX: Check database_schema.sql';
  ELSE
    RAISE NOTICE '✅ Profiles UPDATE policy exists';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Avatar URL Analysis:';
  RAISE NOTICE '  - Base64 (fallback): %', base64_count;
  RAISE NOTICE '  - Storage URLs: %', storage_count;
  
  IF base64_count > storage_count THEN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Most avatars are using base64 fallback';
    RAISE NOTICE '   This indicates RLS policies are blocking storage uploads';
    RAISE NOTICE '   Run FIX_AVATAR_STORAGE_COMPLETE.sql to fix this';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
END $$;
