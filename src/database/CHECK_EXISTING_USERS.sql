-- =====================================================
-- Check Existing Users - Diagnostic Query
-- Run this to see all existing users and their phone formats
-- =====================================================

-- Check what phone columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('phone', 'phone_number', 'password_hash', 'name', 'display_name');

-- Show all existing users with phone number formats
SELECT 
  id,
  phone,
  phone_number,
  COALESCE(name, display_name, 'NO_NAME') as name,
  CASE 
    WHEN password_hash IS NULL THEN '❌ NO PASSWORD'
    WHEN password_hash = '' THEN '⚠️ EMPTY'
    ELSE '✅ HAS PASSWORD (' || LENGTH(password_hash) || ' chars)'
  END as password_status,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- =====================================================
-- ANALYSIS: Check which phone format is used
-- =====================================================

-- Count users by phone format
SELECT 
  CASE 
    WHEN phone LIKE '+91%' THEN 'Format: +919876543210'
    WHEN phone LIKE '91%' THEN 'Format: 919876543210'
    WHEN LENGTH(phone) = 10 THEN 'Format: 9876543210'
    ELSE 'Other format'
  END as phone_format,
  COUNT(*) as user_count
FROM profiles
WHERE phone IS NOT NULL
GROUP BY 
  CASE 
    WHEN phone LIKE '+91%' THEN 'Format: +919876543210'
    WHEN phone LIKE '91%' THEN 'Format: 919876543210'
    WHEN LENGTH(phone) = 10 THEN 'Format: 9876543210'
    ELSE 'Other format'
  END;

-- =====================================================
-- TEST: Try to find a specific user
-- =====================================================
-- Replace '9876543210' with one of your test numbers

-- Try format 1: +919876543210
SELECT 'Searching: +919876543210' as search_type, *
FROM profiles
WHERE phone = '+919876543210' OR phone_number = '+919876543210'
LIMIT 1;

-- Try format 2: 9876543210
SELECT 'Searching: 9876543210' as search_type, *
FROM profiles
WHERE phone = '9876543210' OR phone_number = '9876543210'
LIMIT 1;

-- Try format 3: 919876543210
SELECT 'Searching: 919876543210' as search_type, *
FROM profiles
WHERE phone = '919876543210' OR phone_number = '919876543210'
LIMIT 1;

-- =====================================================
-- RECOMMENDATION
-- =====================================================
-- Based on the results above, you'll see which format
-- your existing users are stored in. The app now checks
-- all three formats, so it should find them!
-- =====================================================
