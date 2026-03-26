-- =====================================================
-- Check User Password Status - Diagnostic Script
-- Run this in Supabase SQL Editor to see which users
-- have passwords set and which don't
-- =====================================================

-- Check if password_hash column exists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('password_hash', 'phone', 'phone_number', 'email', 'name', 'display_name');

-- Show all users with their password status
SELECT 
  id,
  COALESCE(phone, phone_number, 'NO_PHONE') as phone,
  COALESCE(email, 'NO_EMAIL') as email,
  COALESCE(name, display_name, 'NO_NAME') as name,
  CASE 
    WHEN password_hash IS NULL THEN '❌ NO PASSWORD'
    WHEN password_hash = '' THEN '⚠️ EMPTY PASSWORD'
    ELSE '✅ HAS PASSWORD (' || LENGTH(password_hash) || ' chars)'
  END as password_status,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 20;

-- Count users by password status
SELECT 
  CASE 
    WHEN password_hash IS NULL THEN 'No Password (NULL)'
    WHEN password_hash = '' THEN 'Empty Password'
    ELSE 'Has Password'
  END as status,
  COUNT(*) as count
FROM profiles
GROUP BY 
  CASE 
    WHEN password_hash IS NULL THEN 'No Password (NULL)'
    WHEN password_hash = '' THEN 'Empty Password'
    ELSE 'Has Password'
  END;

-- =====================================================
-- IMPORTANT: If you see users without passwords,
-- they will be prompted to use "Forgot Password" flow
-- to set a password on their next login attempt.
-- =====================================================
