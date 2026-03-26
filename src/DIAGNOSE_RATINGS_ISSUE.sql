-- =====================================================
-- DIAGNOSE RATINGS RLS ISSUE
-- =====================================================
-- Run this FIRST to understand what's wrong
-- Copy and paste the entire script into Supabase SQL Editor
-- =====================================================

-- 1. Check if ratings table exists
SELECT 'Checking if ratings table exists...' AS step;
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'ratings';

-- Expected: 1 row with table_name = 'ratings'

-- 2. Check table structure
SELECT 'Checking ratings table columns...' AS step;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'ratings'
ORDER BY ordinal_position;

-- Expected columns:
-- - id (uuid)
-- - task_id (uuid)
-- - rated_user_id (uuid)
-- - rater_user_id (uuid)
-- - rating_type (text)
-- - rating (integer)
-- - comment (text)
-- - created_at (timestamp with time zone)

-- 3. Check if RLS is enabled
SELECT 'Checking if RLS is enabled...' AS step;
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'ratings';

-- Expected: rowsecurity = true

-- 4. Check existing RLS policies
SELECT 'Checking existing RLS policies...' AS step;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'ratings'
ORDER BY policyname;

-- Expected: At least 2 policies (SELECT and INSERT)

-- 5. Check table grants/permissions
SELECT 'Checking table permissions...' AS step;
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
  AND table_name = 'ratings'
ORDER BY grantee, privilege_type;

-- Expected: authenticated role should have INSERT, SELECT, DELETE

-- 6. Test current user's auth
SELECT 'Checking current authenticated user...' AS step;
SELECT 
  auth.uid() AS current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED'
    ELSE '✅ AUTHENTICATED'
  END AS auth_status;

-- Expected: Should show a UUID and "AUTHENTICATED"

-- 7. Test a sample INSERT (will fail but shows the exact error)
SELECT 'Testing INSERT permission...' AS step;
-- This will likely fail with RLS error, but shows the exact error
DO $$
DECLARE
  test_user_id UUID;
  test_rating_id UUID;
BEGIN
  -- Get current user
  test_user_id := auth.uid();
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE '❌ Cannot test - user not authenticated';
  ELSE
    RAISE NOTICE '✅ Current user: %', test_user_id;
    
    -- Try to insert a test rating
    BEGIN
      INSERT INTO ratings (
        task_id,
        rated_user_id,
        rater_user_id,
        rating_type,
        rating,
        comment
      ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        test_user_id,
        test_user_id,
        'helper',
        5,
        'Test rating - will be deleted'
      ) RETURNING id INTO test_rating_id;
      
      RAISE NOTICE '✅ INSERT successful! Rating ID: %', test_rating_id;
      
      -- Clean up
      DELETE FROM ratings WHERE id = test_rating_id;
      RAISE NOTICE '🧹 Test rating cleaned up';
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ INSERT failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    END;
  END IF;
END $$;

-- =====================================================
-- ANALYSIS CHECKLIST
-- =====================================================
-- After running, check:
-- ✅ 1. Table exists
-- ✅ 2. All columns are present
-- ✅ 3. RLS is enabled (rowsecurity = true)
-- ✅ 4. At least INSERT and SELECT policies exist
-- ✅ 5. 'authenticated' role has INSERT permission
-- ✅ 6. auth.uid() returns a valid UUID
-- ✅ 7. Test INSERT either succeeds or shows specific error
--
-- If any of these fail, that's your problem!
-- =====================================================
