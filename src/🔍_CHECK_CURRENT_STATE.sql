-- =====================================================
-- CHECK CURRENT STATE: What's Actually Saved?
-- =====================================================

-- Check your current profile avatar
SELECT 
  '👤 YOUR PROFILE' as info,
  id,
  name,
  CASE 
    WHEN avatar_url LIKE 'data:image%' THEN '📦 BASE64 (Storage upload failed)'
    WHEN avatar_url LIKE '%supabase%storage%' THEN '✅ STORAGE URL (Working!)'
    WHEN avatar_url IS NULL THEN '❌ No avatar'
    ELSE '❓ Unknown: ' || LEFT(avatar_url, 50)
  END as avatar_type,
  LENGTH(avatar_url) as url_length,
  LEFT(avatar_url, 100) as avatar_preview
FROM profiles
WHERE id = 'd7f66c14-94af-41f4-8317-b6422c96a5ab';

-- Check if any files exist in storage
SELECT 
  '📁 STORAGE CHECK' as info,
  COUNT(*) as file_count
FROM storage.objects
WHERE bucket_id = 'user-uploads';

-- List actual files if they exist
SELECT 
  '📄 FILES IN STORAGE' as info,
  name,
  created_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'user-uploads'
ORDER BY created_at DESC
LIMIT 10;

-- Check INSERT policy again
SELECT 
  '🔒 INSERT POLICY CHECK' as info,
  policyname,
  cmd,
  qual as using_check,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND cmd = 'INSERT'
  AND policyname LIKE '%avatar%';

-- Summary
DO $$
DECLARE
  v_has_base64 BOOLEAN;
  v_has_storage_url BOOLEAN;
  v_file_count INTEGER;
  v_policy_has_check BOOLEAN;
BEGIN
  -- Check avatar type
  SELECT 
    avatar_url LIKE 'data:image%',
    avatar_url LIKE '%supabase%storage%'
  INTO v_has_base64, v_has_storage_url
  FROM profiles
  WHERE id = 'd7f66c14-94af-41f4-8317-b6422c96a5ab';
  
  -- Count files
  SELECT COUNT(*) INTO v_file_count
  FROM storage.objects
  WHERE bucket_id = 'user-uploads';
  
  -- Check policy
  SELECT with_check IS NOT NULL INTO v_policy_has_check
  FROM pg_policies
  WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname = 'Authenticated avatar upload';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   CURRENT STATE DIAGNOSIS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  IF v_has_base64 THEN
    RAISE NOTICE '🟡 Profile has BASE64 avatar';
    RAISE NOTICE '   → Storage upload is FAILING';
    RAISE NOTICE '   → Falling back to base64';
    RAISE NOTICE '';
  ELSIF v_has_storage_url THEN
    RAISE NOTICE '✅ Profile has STORAGE URL';
    RAISE NOTICE '   → Everything working!';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '❌ Profile has NO avatar or unknown format';
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE 'Files in bucket: %', v_file_count;
  IF v_file_count = 0 THEN
    RAISE NOTICE '   → Bucket is EMPTY';
    RAISE NOTICE '   → Uploads are FAILING';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '   → Files exist! ✅';
    RAISE NOTICE '';
  END IF;
  
  IF NOT v_policy_has_check THEN
    RAISE NOTICE '❌ INSERT policy has NULL WITH CHECK';
    RAISE NOTICE '   → This is blocking uploads!';
    RAISE NOTICE '';
    RAISE NOTICE 'FIX: Run 🎯_FIX_INSERT_POLICY.sql';
  ELSE
    RAISE NOTICE '✅ INSERT policy has WITH CHECK';
    RAISE NOTICE '';
    RAISE NOTICE 'Policy looks OK. Check browser console for errors.';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
