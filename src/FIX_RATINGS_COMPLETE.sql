-- =====================================================
-- COMPLETE FIX FOR RATINGS RLS ISSUE
-- =====================================================
-- This script will fix ALL possible causes of the RLS error:
-- "new row violates row-level security policy for table ratings"
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: Disable RLS temporarily to clean up
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Ratings cannot be updated" ON ratings;
DROP POLICY IF EXISTS "No one can update ratings" ON ratings;
DROP POLICY IF EXISTS "Users can delete own ratings within 24 hours" ON ratings;
DROP POLICY IF EXISTS "Users can delete own recent ratings" ON ratings;

-- STEP 3: Re-enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- STEP 4: Grant table permissions to authenticated users
GRANT ALL ON ratings TO authenticated;
GRANT ALL ON ratings TO anon;
GRANT ALL ON ratings TO service_role;

-- STEP 5: Create PERMISSIVE policies (allow access)

-- Policy 1: Anyone can view all ratings (SELECT)
CREATE POLICY "ratings_select_policy"
  ON ratings
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy 2: Authenticated users can insert ratings as rater
CREATE POLICY "ratings_insert_policy"
  ON ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    AND
    -- User can only insert ratings where they are the rater
    auth.uid() = rater_user_id
  );

-- Policy 3: No one can update ratings (immutable)
CREATE POLICY "ratings_update_policy"
  ON ratings
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Policy 4: Users can delete their own ratings within 24 hours
CREATE POLICY "ratings_delete_policy"
  ON ratings
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = rater_user_id
    AND
    created_at > NOW() - INTERVAL '24 hours'
  );

-- STEP 6: Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'ratings'
ORDER BY cmd, policyname;

-- STEP 7: Grant usage on sequences (if any)
DO $$ 
BEGIN
  -- This ensures any sequences can be accessed
  EXECUTE 'GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated';
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test 1: Check RLS is enabled
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'ratings' AND schemaname = 'public';
-- Expected: rls_enabled = true

-- Test 2: Check policies count
SELECT 
  COUNT(*) AS policy_count
FROM pg_policies
WHERE tablename = 'ratings' AND schemaname = 'public';
-- Expected: 4 policies

-- Test 3: Check current user
SELECT 
  auth.uid() AS current_user_uuid,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Not authenticated'
    ELSE '✅ Authenticated: ' || auth.uid()::text
  END AS status;

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 1. Run this entire script in Supabase SQL Editor
-- 2. You should see "✅ Authenticated" in Test 3
-- 3. You should see 4 policies in the verification
-- 4. Go back to your app and try submitting a rating
-- 5. It should work now!
--
-- If it STILL doesn't work:
-- - Check that your user is properly authenticated (auth.uid() returns UUID)
-- - Check that rater_user_id matches auth.uid()
-- - Check browser console for detailed error messages
-- =====================================================

-- =====================================================
-- TROUBLESHOOTING: If this doesn't work
-- =====================================================
-- If you're still getting RLS errors after running this:
--
-- 1. Check if auth.uid() is NULL:
--    SELECT auth.uid(); 
--    -- Should return your user UUID
--
-- 2. Temporarily disable RLS for testing:
--    ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
--    -- Try submitting rating
--    -- Then re-enable: ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
--
-- 3. Check the exact error in your app console
--    It will show which policy is failing
--
-- 4. Make sure you're logged in to the app!
-- =====================================================
