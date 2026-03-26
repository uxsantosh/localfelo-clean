-- =====================================================
-- DIAGNOSE FOREIGN KEY CONSTRAINT ERROR
-- =====================================================
-- Error: profiles_id_fkey constraint violated
-- Details: Key is not present in table "users"
-- =====================================================

-- Step 1: Show the foreign key constraint
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'profiles';

-- Step 2: Check if auth.users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'auth' 
  AND table_name = 'users'
) as auth_users_exists;

-- Step 3: Count records in both tables
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count;

-- Step 4: Check existing profiles - do they have matching auth.users?
SELECT 
  p.id as profile_id,
  p.phone,
  p.phone_number,
  p.email,
  p.name,
  au.id as auth_user_id,
  au.email as auth_email,
  au.phone as auth_phone,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ HAS AUTH USER'
    ELSE '❌ NO AUTH USER'
  END as auth_status
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
LIMIT 10;

-- =====================================================
-- COPY ALL OUTPUT AND SHARE
-- =====================================================
