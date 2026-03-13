-- =====================================================
-- Test Device Token Insert (Run as Authenticated User)
-- =====================================================
-- This tests if the policies work correctly
-- IMPORTANT: Run this in Supabase SQL Editor while logged in
-- =====================================================

-- Step 1: Check current auth context
-- =====================================================
SELECT 
  auth.uid() AS my_user_id,
  auth.role() AS my_role;

-- If my_user_id is NULL, you need to run this from the app
-- or use the "RPC" tab in Supabase with authentication

-- Step 2: Try manual insert (replace <YOUR_USER_ID> with actual ID)
-- =====================================================
-- Get your user_id first:
SELECT id, email FROM auth.users LIMIT 5;

-- Then try insert (REPLACE the user_id below):
INSERT INTO device_tokens (
  user_id,
  device_token,
  platform,
  is_enabled
) VALUES (
  'YOUR_USER_ID_HERE',  -- ⚠️ REPLACE THIS
  'test_token_' || extract(epoch from now())::text,
  'android',
  true
)
RETURNING *;

-- Step 3: Try upsert with conflict (simulates app behavior)
-- =====================================================
-- First insert:
INSERT INTO device_tokens (
  user_id,
  device_token,
  platform,
  is_enabled,
  last_used_at
) VALUES (
  'YOUR_USER_ID_HERE',  -- ⚠️ REPLACE THIS
  'test_upsert_token_12345',
  'android',
  true,
  NOW()
)
ON CONFLICT (device_token) DO UPDATE SET
  last_used_at = NOW(),
  is_enabled = EXCLUDED.is_enabled
RETURNING *;

-- Run again - should UPDATE instead of INSERT:
INSERT INTO device_tokens (
  user_id,
  device_token,
  platform,
  is_enabled,
  last_used_at
) VALUES (
  'YOUR_USER_ID_HERE',  -- ⚠️ REPLACE THIS
  'test_upsert_token_12345',
  'android',
  true,
  NOW()
)
ON CONFLICT (device_token) DO UPDATE SET
  last_used_at = NOW(),
  is_enabled = EXCLUDED.is_enabled
RETURNING *;

-- Step 4: View all tokens for user
-- =====================================================
SELECT * FROM device_tokens 
WHERE user_id = 'YOUR_USER_ID_HERE'  -- ⚠️ REPLACE THIS
ORDER BY created_at DESC;

-- Step 5: Clean up test tokens
-- =====================================================
DELETE FROM device_tokens 
WHERE device_token LIKE 'test_%'
  AND user_id = 'YOUR_USER_ID_HERE';  -- ⚠️ REPLACE THIS
