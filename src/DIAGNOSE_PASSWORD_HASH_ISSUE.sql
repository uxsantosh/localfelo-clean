-- =====================================================
-- DIAGNOSTIC: Why is password_hash NULL?
-- =====================================================
-- Run this to check constraints and triggers
-- =====================================================

-- Check if password_hash column exists and type
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'password_hash';

-- Check for any CHECK constraints on password_hash
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'profiles'
  AND con.contype = 'c'; -- CHECK constraints

-- Check for triggers on profiles table
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- Check RLS policies that might prevent updates
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
WHERE tablename = 'profiles';

-- =====================================================
-- TEST: Try to insert a profile with password_hash
-- =====================================================
-- This will test if we CAN actually insert password_hash

DO $$
DECLARE
  test_id UUID := gen_random_uuid();
  test_token TEXT := 'test_token_' || gen_random_uuid()::text;
  test_owner TEXT := 'test_owner_' || gen_random_uuid()::text;
BEGIN
  -- Try to insert
  INSERT INTO profiles (
    id,
    phone,
    name,
    display_name,
    password_hash,
    client_token,
    owner_token,
    created_at
  ) VALUES (
    test_id,
    '+919999999999',
    'Test User',
    'Test User',
    '$2a$10$abcdefghijklmnopqrstuv',  -- Fake bcrypt hash
    test_token,
    test_owner,
    NOW()
  );

  -- Check if it worked
  PERFORM * FROM profiles WHERE id = test_id AND password_hash IS NOT NULL;
  
  IF FOUND THEN
    RAISE NOTICE '✅ SUCCESS: password_hash CAN be inserted';
  ELSE
    RAISE NOTICE '❌ FAILED: password_hash was set to NULL';
  END IF;

  -- Clean up test data
  DELETE FROM profiles WHERE id = test_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERROR: %', SQLERRM;
    -- Try to clean up
    DELETE FROM profiles WHERE id = test_id;
END $$;

-- =====================================================
-- Check your actual profile
-- =====================================================
SELECT 
  id,
  phone,
  name,
  display_name,
  password_hash,
  CASE 
    WHEN password_hash IS NULL THEN '❌ NULL'
    WHEN password_hash = '' THEN '❌ EMPTY STRING'
    WHEN LENGTH(password_hash) > 0 THEN '✅ HAS VALUE (length: ' || LENGTH(password_hash) || ')'
  END as password_status,
  client_token IS NOT NULL as has_client_token,
  created_at,
  updated_at
FROM profiles
WHERE phone = '+919063205739';

-- =====================================================
-- SHARE ALL OUTPUT WITH ME
-- =====================================================
