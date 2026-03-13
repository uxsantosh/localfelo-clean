-- =====================================================
-- CLEANUP AND TEST REGISTRATION
-- =====================================================
-- Run this to prepare for testing the fix
-- =====================================================

-- Step 1: Delete test profile (if exists)
DELETE FROM profiles WHERE phone = '+919063205739';
DELETE FROM profiles WHERE phone_number = '+919063205739';
DELETE FROM profiles WHERE email = '9063205739@localfelo.app';

-- Confirm deletion
SELECT 'Cleanup complete - ready to test registration!' as status;

-- =====================================================
-- After running this, try registering in the app:
-- 1. Phone: 9063205739
-- 2. OTP: (check SMS)
-- 3. Name: John Doe
-- 4. Password: test123
-- 
-- Then verify with this query:
-- =====================================================

/*
SELECT 
  id,
  phone,
  phone_number,
  email,
  name,
  display_name,
  CASE 
    WHEN password_hash IS NOT NULL THEN '✅ HAS PASSWORD (length: ' || LENGTH(password_hash) || ')'
    ELSE '❌ NULL'
  END as password_status,
  client_token IS NOT NULL as has_client_token,
  created_at
FROM profiles
WHERE phone_number = '+919063205739';
*/

-- =====================================================
-- If registration fails again, run this to see the error:
-- =====================================================

/*
-- Test insert directly
INSERT INTO profiles (
  id,
  phone,
  phone_number,
  email,
  name,
  display_name,
  password_hash,
  client_token,
  owner_token,
  whatsapp_same,
  created_at
) VALUES (
  gen_random_uuid(),
  '+919999999999',
  '+919999999999',
  '9999999999@localfelo.app',
  'Test User',
  'Test User',
  '$2a$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234',
  'test_token_123',
  'test_owner_123',
  true,
  NOW()
);

-- Check if it worked
SELECT * FROM profiles WHERE phone_number = '+919999999999';

-- Clean up test
DELETE FROM profiles WHERE phone_number = '+919999999999';
*/
