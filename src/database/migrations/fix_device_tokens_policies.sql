-- =====================================================
-- Fix device_tokens RLS Policies
-- =====================================================
-- This removes all duplicate/incomplete policies and
-- creates a clean minimal set of RLS policies
-- =====================================================

-- Step 1: Drop ALL existing policies
-- =====================================================
DROP POLICY IF EXISTS "TEMP allow insert device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can insert own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "user can upsert own device token" ON device_tokens;
DROP POLICY IF EXISTS "Users can read own tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can view own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Allow user to update own device token" ON device_tokens;
DROP POLICY IF EXISTS "Users can update own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Users can update own tokens" ON device_tokens;
DROP POLICY IF EXISTS "user can update own device token" ON device_tokens;
DROP POLICY IF EXISTS "Users can delete own device tokens" ON device_tokens;

-- Step 2: Create clean, minimal RLS policies
-- =====================================================

-- INSERT: Users can insert their own device tokens
CREATE POLICY "Users can insert own device tokens"
  ON device_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- SELECT: Users can read their own device tokens
CREATE POLICY "Users can read own device tokens"
  ON device_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- UPDATE: Users can update their own device tokens
-- CRITICAL: Must have BOTH USING and WITH CHECK for upsert to work
CREATE POLICY "Users can update own device tokens"
  ON device_tokens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own device tokens
CREATE POLICY "Users can delete own device tokens"
  ON device_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 3: Verify RLS is enabled (should already be true)
-- =====================================================
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this after migration to verify:
/*
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'device_tokens'
ORDER BY cmd, policyname;

-- Should show exactly 4 policies:
-- 1. "Users can delete own device tokens" (DELETE)
-- 2. "Users can insert own device tokens" (INSERT)
-- 3. "Users can read own device tokens" (SELECT)
-- 4. "Users can update own device tokens" (UPDATE)
*/
