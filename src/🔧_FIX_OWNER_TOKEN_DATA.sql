-- ========================================
-- FIX OWNER_TOKEN DATA IN PROFILES TABLE
-- ========================================
-- This script fixes the owner_token column to ensure it always contains UUIDs

-- ========================================
-- STEP 1: CHECK CURRENT STATE
-- ========================================

-- See which profiles have non-UUID owner_token values
SELECT 
  id,
  name,
  email,
  client_token,
  owner_token,
  CASE 
    WHEN owner_token = id::text THEN '✅ Correct (UUID)'
    WHEN owner_token LIKE 'token_%' THEN '❌ Wrong (client_token string)'
    WHEN owner_token IS NULL THEN '⚠️ NULL'
    ELSE '❓ Unknown'
  END as status
FROM profiles
ORDER BY created_at DESC
LIMIT 20;


-- ========================================
-- STEP 2: FIX OWNER_TOKEN VALUES
-- ========================================
-- Set owner_token to the user's UUID (id) for all profiles

UPDATE profiles
SET owner_token = id::text
WHERE owner_token IS NULL 
   OR owner_token != id::text;

-- Verify the fix
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN owner_token = id::text THEN 1 END) as correct_tokens,
  COUNT(CASE WHEN owner_token IS NULL THEN 1 END) as null_tokens,
  COUNT(CASE WHEN owner_token LIKE 'token_%' THEN 1 END) as client_token_strings
FROM profiles;

-- Should show: all profiles have correct_tokens = total_profiles


-- ========================================
-- STEP 3: VERIFY LISTINGS/TASKS/WISHES
-- ========================================

-- Check if any listings have invalid owner_token
SELECT 
  id,
  title,
  owner_token,
  CASE 
    WHEN owner_token::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN '✅ Valid UUID'
    ELSE '❌ Invalid UUID'
  END as status
FROM listings
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;


-- Check if any tasks have invalid owner_token
SELECT 
  id,
  title,
  owner_token,
  CASE 
    WHEN owner_token::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN '✅ Valid UUID'
    ELSE '❌ Invalid UUID'
  END as status
FROM tasks
WHERE status != 'deleted'
ORDER BY created_at DESC
LIMIT 10;


-- Check if any wishes have invalid owner_token (if column exists)
-- SELECT 
--   id,
--   title,
--   user_id,
--   CASE 
--     WHEN user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
--     THEN '✅ Valid UUID'
--     ELSE '❌ Invalid UUID'
--   END as status
-- FROM wishes
-- WHERE status != 'deleted'
-- ORDER BY created_at DESC
-- LIMIT 10;


-- ========================================
-- STEP 4: CLEANUP OLD INVALID DATA (OPTIONAL)
-- ========================================
-- Delete any listings/tasks with invalid owner_token strings
-- ⚠️ ONLY RUN THIS IF YOU WANT TO DELETE OLD TEST DATA

/*
-- Delete listings with non-UUID owner_token
DELETE FROM listings 
WHERE owner_token !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND is_active = true;

-- Delete tasks with non-UUID owner_token
DELETE FROM tasks 
WHERE owner_token !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND status != 'deleted';
*/


-- ========================================
-- STEP 5: RECOMMENDED - ENFORCE UUID TYPE
-- ========================================
-- Change the owner_token column type to UUID to prevent future issues
-- ⚠️ This will fail if there's any non-UUID data left

/*
-- For profiles table
ALTER TABLE profiles 
ALTER COLUMN owner_token TYPE UUID USING owner_token::uuid;

-- For listings table
ALTER TABLE listings 
ALTER COLUMN owner_token TYPE UUID USING owner_token::uuid;

-- For tasks table
ALTER TABLE tasks 
ALTER COLUMN owner_token TYPE UUID USING owner_token::uuid;

-- For wishes table (if owner_token column exists)
-- ALTER TABLE wishes 
-- ALTER COLUMN owner_token TYPE UUID USING owner_token::uuid;
*/


-- ========================================
-- FINAL VERIFICATION
-- ========================================

-- Check all profiles have valid owner_token
SELECT 
  'Profiles' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN owner_token = id::text THEN 1 END) as valid_tokens
FROM profiles

UNION ALL

-- Check database columns
SELECT 
  'Database Check' as table_name,
  1 as total,
  CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END as valid_tokens
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'owner_token';


-- ========================================
-- QUICK FIX COMMAND
-- ========================================
-- Copy and paste this single line to fix all profiles:

UPDATE profiles SET owner_token = id::text WHERE owner_token IS NULL OR owner_token != id::text;


-- Then verify:
SELECT COUNT(*) as fixed_count FROM profiles WHERE owner_token = id::text;
