-- =====================================================
-- VERIFY AVATAR FIX WAS SUCCESSFUL
-- =====================================================
-- Run this AFTER applying FIX_AVATAR_STORAGE_COMPLETE.sql

DO $$
DECLARE
  v_bucket_exists BOOLEAN;
  v_bucket_public BOOLEAN;
  v_policy_count INTEGER;
  v_required_policies TEXT[];
  v_missing_policies TEXT[];
  v_storage_avatars INTEGER;
  v_base64_avatars INTEGER;
  v_total_avatars INTEGER;
  v_all_good BOOLEAN := true;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   AVATAR STORAGE FIX VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Check 1: Storage Bucket
  RAISE NOTICE '1. Checking storage bucket...';
  
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'user-uploads'
  ) INTO v_bucket_exists;
  
  IF v_bucket_exists THEN
    SELECT public INTO v_bucket_public 
    FROM storage.buckets 
    WHERE id = 'user-uploads';
    
    IF v_bucket_public THEN
      RAISE NOTICE '   ✅ Bucket "user-uploads" exists and is PUBLIC';
    ELSE
      RAISE NOTICE '   ⚠️  Bucket exists but is NOT PUBLIC';
      RAISE NOTICE '      Fix: Make bucket public in Dashboard > Storage';
      v_all_good := false;
    END IF;
  ELSE
    RAISE NOTICE '   ❌ Bucket "user-uploads" does NOT exist';
    RAISE NOTICE '      Fix: Run FIX_AVATAR_STORAGE_COMPLETE.sql again';
    v_all_good := false;
  END IF;
  
  RAISE NOTICE '';
  
  -- Check 2: RLS Policies
  RAISE NOTICE '2. Checking RLS policies...';
  
  v_required_policies := ARRAY[
    'Public avatar access',
    'Authenticated avatar upload',
    'Authenticated avatar update',
    'Authenticated avatar delete'
  ];
  
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = ANY(v_required_policies);
  
  IF v_policy_count = 4 THEN
    RAISE NOTICE '   ✅ All 4 required policies exist';
  ELSE
    RAISE NOTICE '   ⚠️  Found % of 4 required policies', v_policy_count;
    
    -- Find missing policies
    SELECT ARRAY_AGG(policy)
    INTO v_missing_policies
    FROM UNNEST(v_required_policies) AS policy
    WHERE policy NOT IN (
      SELECT policyname 
      FROM pg_policies 
      WHERE schemaname = 'storage' 
        AND tablename = 'objects'
    );
    
    IF v_missing_policies IS NOT NULL THEN
      RAISE NOTICE '      Missing: %', ARRAY_TO_STRING(v_missing_policies, ', ');
      RAISE NOTICE '      Fix: Run FIX_AVATAR_STORAGE_COMPLETE.sql again';
      v_all_good := false;
    END IF;
  END IF;
  
  -- List all storage policies
  RAISE NOTICE '';
  RAISE NOTICE '   Current storage.objects policies:';
  FOR v_policy_count IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    ORDER BY policyname
  ) LOOP
    RAISE NOTICE '      - %', (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' ORDER BY policyname OFFSET v_policy_count-1 LIMIT 1);
  END LOOP;
  
  RAISE NOTICE '';
  
  -- Check 3: Profile Policy
  RAISE NOTICE '3. Checking profiles table policy...';
  
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
      AND cmd = 'UPDATE'
  ) THEN
    RAISE NOTICE '   ✅ Profiles UPDATE policy exists';
  ELSE
    RAISE NOTICE '   ❌ Profiles UPDATE policy missing';
    RAISE NOTICE '      Fix: Check database_schema.sql';
    v_all_good := false;
  END IF;
  
  RAISE NOTICE '';
  
  -- Check 4: Avatar Data Analysis
  RAISE NOTICE '4. Analyzing existing avatar data...';
  
  SELECT 
    COUNT(CASE WHEN avatar_url LIKE '%storage%' THEN 1 END),
    COUNT(CASE WHEN avatar_url LIKE 'data:image%' THEN 1 END),
    COUNT(*)
  INTO v_storage_avatars, v_base64_avatars, v_total_avatars
  FROM profiles
  WHERE avatar_url IS NOT NULL;
  
  RAISE NOTICE '   Total avatars: %', v_total_avatars;
  RAISE NOTICE '   Storage URLs: % (%.0f%%)', 
    v_storage_avatars,
    CASE WHEN v_total_avatars > 0 
      THEN (v_storage_avatars::FLOAT / v_total_avatars * 100) 
      ELSE 0 
    END;
  RAISE NOTICE '   Base64: % (%.0f%%)', 
    v_base64_avatars,
    CASE WHEN v_total_avatars > 0 
      THEN (v_base64_avatars::FLOAT / v_total_avatars * 100) 
      ELSE 0 
    END;
  
  IF v_total_avatars = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '   💡 No avatars uploaded yet - test by uploading one!';
  ELSIF v_base64_avatars > v_storage_avatars THEN
    RAISE NOTICE '';
    RAISE NOTICE '   ⚠️  Most avatars are base64 (fallback mode)';
    RAISE NOTICE '      This is expected for old avatars';
    RAISE NOTICE '      New uploads should use storage URLs';
  END IF;
  
  RAISE NOTICE '';
  
  -- Check 5: Recent Uploads
  RAISE NOTICE '5. Checking recent uploads (last 24 hours)...';
  
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE avatar_url IS NOT NULL 
      AND updated_at > NOW() - INTERVAL ''24 hours''
  ) THEN
    FOR v_policy_count IN (
      SELECT 
        name,
        CASE 
          WHEN avatar_url LIKE '%storage%' THEN '✅ Storage URL'
          WHEN avatar_url LIKE 'data:image%' THEN '❌ Base64 (fallback)'
          ELSE '? Unknown'
        END as type,
        updated_at
      FROM profiles
      WHERE avatar_url IS NOT NULL 
        AND updated_at > NOW() - INTERVAL '24 hours'
      ORDER BY updated_at DESC
      LIMIT 3
    ) LOOP
      RAISE NOTICE '   % - % (updated %)', 
        (SELECT name FROM profiles WHERE avatar_url IS NOT NULL AND updated_at > NOW() - INTERVAL '24 hours' ORDER BY updated_at DESC OFFSET v_policy_count-1 LIMIT 1),
        (SELECT CASE WHEN avatar_url LIKE '%storage%' THEN '✅ Storage' ELSE '❌ Base64' END FROM profiles WHERE avatar_url IS NOT NULL AND updated_at > NOW() - INTERVAL '24 hours' ORDER BY updated_at DESC OFFSET v_policy_count-1 LIMIT 1),
        (SELECT updated_at::TEXT FROM profiles WHERE avatar_url IS NOT NULL AND updated_at > NOW() - INTERVAL '24 hours' ORDER BY updated_at DESC OFFSET v_policy_count-1 LIMIT 1);
    END LOOP;
  ELSE
    RAISE NOTICE '   No recent uploads found';
    RAISE NOTICE '   💡 Upload a test avatar to verify the fix';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  
  IF v_all_good THEN
    RAISE NOTICE '   ✅ ALL CHECKS PASSED!';
    RAISE NOTICE '';
    RAISE NOTICE '   Next steps:';
    RAISE NOTICE '   1. Test avatar upload in the app';
    RAISE NOTICE '   2. Verify new uploads create storage URLs';
    RAISE NOTICE '   3. Old base64 avatars will convert when users update';
  ELSE
    RAISE NOTICE '   ⚠️  SOME ISSUES FOUND';
    RAISE NOTICE '';
    RAISE NOTICE '   Review the issues above and:';
    RAISE NOTICE '   1. Run FIX_AVATAR_STORAGE_COMPLETE.sql again';
    RAISE NOTICE '   2. Check Supabase Dashboard > Storage';
    RAISE NOTICE '   3. Verify bucket is public';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- Show sample avatar URLs
SELECT 
  '📋 SAMPLE AVATAR URLS' as section,
  name,
  CASE 
    WHEN avatar_url LIKE '%storage%' THEN '✅ Storage'
    WHEN avatar_url LIKE 'data:image%' THEN '❌ Base64'
    ELSE '? Unknown'
  END as type,
  LEFT(avatar_url, 80) || '...' as url_preview,
  TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as last_update
FROM profiles
WHERE avatar_url IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;
