-- =====================================================
-- DEBUG: Device Tokens Table Setup
-- =====================================================
-- Run these queries in Supabase SQL Editor to diagnose
-- why tokens aren't being saved
-- =====================================================

-- 1. Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'device_tokens'
ORDER BY ordinal_position;

-- =====================================================

-- 2. Check constraints (CRITICAL - need UNIQUE on device_token)
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'device_tokens'::regclass;

-- =====================================================

-- 3. Check indexes (need UNIQUE index on device_token)
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'device_tokens';

-- =====================================================

-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'device_tokens';

-- =====================================================

-- 5. Check RLS policies (MUST have INSERT, SELECT, UPDATE, DELETE)
SELECT 
  policyname,
  cmd AS operation,
  permissive,
  roles,
  qual AS using_clause,
  with_check AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'device_tokens'
ORDER BY cmd, policyname;

-- =====================================================

-- 6. Test if you can insert manually (run while logged in)
-- This will fail if RLS is blocking you
INSERT INTO device_tokens (
  user_id,
  device_token,
  platform,
  is_enabled,
  last_used_at
) VALUES (
  auth.uid(),
  'test_token_' || gen_random_uuid()::text,
  'web',
  true,
  now()
) RETURNING *;

-- =====================================================

-- 7. Check existing tokens
SELECT 
  id,
  user_id,
  device_token,
  platform,
  is_enabled,
  created_at,
  last_used_at
FROM device_tokens
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================

-- Query 2 should show:
-- - PRIMARY KEY on id
-- - FOREIGN KEY on user_id
-- - UNIQUE constraint on device_token (CRITICAL!)

-- Query 3 should show:
-- - UNIQUE index on device_token

-- Query 5 should show 4 policies:
-- - Users can insert own device tokens (INSERT)
-- - Users can read own device tokens (SELECT)
-- - Users can update own device tokens (UPDATE)
-- - Users can delete own device tokens (DELETE)

-- If Query 6 fails, RLS is blocking you!
-- =====================================================
