-- =====================================================
-- FIX RATINGS RLS POLICIES
-- =====================================================
-- This script fixes the RLS policy error when submitting ratings
-- Error: "new row violates row-level security policy for table ratings"
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Drop existing policies (if any)
DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Ratings cannot be updated" ON ratings;
DROP POLICY IF EXISTS "Users can delete own ratings within 24 hours" ON ratings;

-- 2. Ensure RLS is enabled
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- 3. Create new policies with proper type casting

-- Allow EVERYONE to view all ratings (public data)
CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  USING (true);

-- Allow authenticated users to insert ratings
-- ✅ FIX: Cast both sides to TEXT for comparison
CREATE POLICY "Users can create ratings"
  ON ratings FOR INSERT
  WITH CHECK (
    auth.uid()::text = rater_user_id::text
  );

-- Prevent updates to ratings (immutable after creation)
CREATE POLICY "No one can update ratings"
  ON ratings FOR UPDATE
  USING (false);

-- Allow users to delete their own ratings within 24 hours (for mistakes)
CREATE POLICY "Users can delete own recent ratings"
  ON ratings FOR DELETE
  USING (
    auth.uid()::text = rater_user_id::text AND
    created_at > NOW() - INTERVAL '24 hours'
  );

-- 4. Grant necessary permissions to authenticated users
GRANT SELECT ON ratings TO authenticated;
GRANT INSERT ON ratings TO authenticated;
GRANT DELETE ON ratings TO authenticated;

-- 5. Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'ratings'
ORDER BY policyname;

-- =====================================================
-- TESTING
-- =====================================================
-- After running this, test by:
-- 1. Complete a task
-- 2. Try to submit a rating
-- 3. Check if it works without RLS errors
-- =====================================================

-- Expected output: 4 policies should be listed
-- 1. Anyone can view ratings (SELECT, USING: true)
-- 2. Users can create ratings (INSERT, WITH CHECK: auth.uid() = rater_user_id)
-- 3. No one can update ratings (UPDATE, USING: false)
-- 4. Users can delete own recent ratings (DELETE, USING: [complex condition])
