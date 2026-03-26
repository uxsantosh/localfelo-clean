-- =====================================================
-- Diagnostic Queries for device_tokens Table
-- =====================================================
-- Run these in Supabase SQL Editor to diagnose the issue

-- 1. CHECK TABLE SCHEMA
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'device_tokens'
ORDER BY ordinal_position;

-- 2. CHECK CONSTRAINTS
-- =====================================================
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name = 'device_tokens';

-- 3. CHECK UNIQUE CONSTRAINTS (CRITICAL FOR UPSERT)
-- =====================================================
SELECT
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'device_tokens'
  AND tc.constraint_type = 'UNIQUE';

-- 4. CHECK RLS POLICIES
-- =====================================================
SELECT 
  policyname,
  cmd,  -- INSERT, UPDATE, DELETE, SELECT
  qual,  -- USING clause (for SELECT, UPDATE, DELETE)
  with_check  -- WITH CHECK clause (for INSERT, UPDATE)
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'device_tokens'
ORDER BY cmd, policyname;

-- 5. CHECK IF RLS IS ENABLED
-- =====================================================
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'device_tokens';

-- 6. TEST INSERT WITH YOUR USER ID
-- =====================================================
-- Replace <YOUR_USER_ID> with actual UUID from auth.users
-- This will show if basic INSERT works
/*
INSERT INTO device_tokens (
  user_id,
  device_token,
  platform,
  is_enabled
) VALUES (
  '<YOUR_USER_ID>',
  'test_token_12345',
  'android',
  true
);
*/

-- 7. CHECK CURRENT AUTH CONTEXT
-- =====================================================
SELECT 
  auth.uid() AS current_user_id,
  auth.role() AS current_role;

-- 8. VIEW EXISTING TOKENS (if any)
-- =====================================================
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
-- 
-- Query 1 should show columns like:
-- - user_id (uuid, not null)
-- - device_token (text, not null)
-- - platform (text, not null)
-- - is_enabled (boolean)
-- etc.
--
-- Query 3 should show UNIQUE constraint on device_token
-- (This is what onConflict: 'device_token' uses)
--
-- Query 4 should show RLS policies for INSERT and UPDATE
-- Both should check: auth.uid() = user_id
--
-- Query 7 should return NULL if run in SQL editor
-- (but will have UUID when called from authenticated app)
--
-- =====================================================
