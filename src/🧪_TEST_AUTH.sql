-- =====================================================
-- TEST: Are you actually authenticated?
-- =====================================================
-- The RLS error could mean you're not authenticated
-- when trying to upload

-- Check 1: Current auth status
SELECT 
  '🔐 AUTH CHECK' as check,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ You are authenticated'
    ELSE '❌ You are NOT authenticated - this is the problem!'
  END as auth_status;

-- Check 2: Does your user exist in auth.users?
SELECT 
  '👤 USER EXISTS' as check,
  id,
  email,
  created_at
FROM auth.users
WHERE id = 'd7f66c14-94af-41f4-8317-b6422c96a5ab';

-- Check 3: Profile exists?
SELECT 
  '📋 PROFILE CHECK' as check,
  id,
  name,
  email
FROM profiles
WHERE id = 'd7f66c14-94af-41f4-8317-b6422c96a5ab';

-- Check 4: Test if INSERT policy would allow upload
SELECT 
  '🧪 POLICY TEST' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname = 'Authenticated avatar upload'
        AND with_check IS NOT NULL
    )
    THEN '✅ INSERT policy exists with WITH CHECK'
    ELSE '❌ INSERT policy missing or broken'
  END as result;

-- Diagnostic
DO $$
DECLARE
  v_auth_uid UUID;
  v_user_exists BOOLEAN;
  v_policy_ok BOOLEAN;
BEGIN
  -- Check auth
  v_auth_uid := auth.uid();
  
  -- Check user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = 'd7f66c14-94af-41f4-8317-b6422c96a5ab'
  ) INTO v_user_exists;
  
  -- Check policy
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND policyname = 'Authenticated avatar upload'
      AND with_check IS NOT NULL
  ) INTO v_policy_ok;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   AUTHENTICATION DIAGNOSTIC';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  IF v_auth_uid IS NULL THEN
    RAISE NOTICE '⚠️  WARNING: Running as anonymous user';
    RAISE NOTICE '   (This is normal in SQL Editor)';
    RAISE NOTICE '';
    RAISE NOTICE '   In your app, check:';
    RAISE NOTICE '   - localStorage has "oldcycle_user"';
    RAISE NOTICE '   - Supabase session is active';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ Authenticated as: %', v_auth_uid;
    RAISE NOTICE '';
  END IF;
  
  IF NOT v_user_exists THEN
    RAISE NOTICE '❌ User does not exist in auth.users!';
    RAISE NOTICE '   This should not happen.';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ User exists in database';
    RAISE NOTICE '';
  END IF;
  
  IF NOT v_policy_ok THEN
    RAISE NOTICE '❌ INSERT policy is broken or missing!';
    RAISE NOTICE '';
    RAISE NOTICE 'FIX: Run 🔥_COMPLETE_FIX.sql';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ INSERT policy looks OK';
    RAISE NOTICE '';
    RAISE NOTICE 'Policy is correct. The issue might be:';
    RAISE NOTICE '1. Your app is not sending auth token';
    RAISE NOTICE '2. Session expired';
    RAISE NOTICE '3. Browser cache issue';
    RAISE NOTICE '';
    RAISE NOTICE 'Try:';
    RAISE NOTICE '- Hard refresh (Ctrl+Shift+R)';
    RAISE NOTICE '- Clear localStorage and login again';
    RAISE NOTICE '- Check Network tab for Authorization header';
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
