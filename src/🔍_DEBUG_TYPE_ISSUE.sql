-- =====================================================
-- 🔍 DEBUG TYPE ISSUE
-- =====================================================
-- This script helps identify where the text = uuid error is coming from
-- =====================================================

-- STEP 1: Check column types
-- =====================================================

SELECT 
  '=== PROFILES TABLE SCHEMA ===' as info;

SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT 
  '=== CONVERSATIONS TABLE SCHEMA ===' as info;

SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'conversations'
  AND column_name IN ('id', 'buyer_id', 'seller_id')
ORDER BY ordinal_position;

SELECT 
  '=== MESSAGES TABLE SCHEMA ===' as info;

SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'messages'
  AND column_name IN ('id', 'conversation_id', 'sender_id')
ORDER BY ordinal_position;

-- STEP 2: Test if client_token exists and its type
-- =====================================================

SELECT 
  '=== TEST PROFILES.CLIENT_TOKEN ===' as info;

SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'profiles' 
    AND column_name = 'client_token'
) as client_token_exists;

SELECT data_type
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'client_token';

-- STEP 3: Sample data types
-- =====================================================

SELECT 
  '=== SAMPLE DATA FROM PROFILES ===' as info;

SELECT 
  pg_typeof(id) as id_type,
  pg_typeof(client_token) as client_token_type,
  pg_typeof(phone) as phone_type
FROM profiles
LIMIT 1;

-- STEP 4: Test the comparison that's failing
-- =====================================================

SELECT 
  '=== TEST COMPARISON ===' as info;

-- This should work: comparing UUID to UUID
DO $$
DECLARE
  test_uuid UUID;
  test_id UUID;
BEGIN
  SELECT id INTO test_id FROM profiles LIMIT 1;
  SELECT id INTO test_uuid FROM profiles WHERE id = test_id;
  RAISE NOTICE 'UUID to UUID comparison: OK';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'UUID to UUID comparison: FAILED - %', SQLERRM;
END $$;

-- This might fail: comparing TEXT to UUID
DO $$
DECLARE
  test_text TEXT := 'some-text';
  test_id UUID;
BEGIN
  SELECT id INTO test_id FROM profiles LIMIT 1;
  -- This will fail
  IF test_id = test_text THEN
    RAISE NOTICE 'Should not reach here';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'TEXT to UUID comparison: FAILED (expected) - %', SQLERRM;
END $$;

-- =====================================================
-- ✅ RUN THIS FIRST to understand your schema
-- =====================================================
