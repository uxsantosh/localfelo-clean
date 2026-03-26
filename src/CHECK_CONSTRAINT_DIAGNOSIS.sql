-- =====================================================
-- DIAGNOSE CHECK CONSTRAINT ERROR
-- =====================================================
-- Error: "profiles_email_or_phone" constraint violated
-- =====================================================

-- Show the exact constraint definition
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'profiles'
  AND con.conname = 'profiles_email_or_phone';

-- Show which columns are used for phone
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('phone', 'phone_number', 'email');

-- Check existing profiles to see which column they use
SELECT 
  id,
  email,
  phone,
  phone_number,
  CASE 
    WHEN email IS NOT NULL THEN 'HAS_EMAIL'
    ELSE 'NO_EMAIL'
  END as email_status,
  CASE 
    WHEN phone IS NOT NULL THEN 'HAS_PHONE'
    ELSE 'NO_PHONE'
  END as phone_status,
  CASE 
    WHEN phone_number IS NOT NULL THEN 'HAS_PHONE_NUMBER'
    ELSE 'NO_PHONE_NUMBER'
  END as phone_number_status
FROM profiles
LIMIT 5;

-- =====================================================
-- COPY OUTPUT AND SHARE
-- =====================================================
