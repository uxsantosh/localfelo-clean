-- =====================================================
-- COMPLETE CLEANUP AND FIX
-- =====================================================
-- Run this entire script to fix all issues
-- =====================================================

-- Step 1: Remove foreign key constraint (CRITICAL FIX)
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Verify constraint is removed
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'profiles' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'profiles_id_fkey'
    ) 
    THEN '❌ CONSTRAINT STILL EXISTS'
    ELSE '✅ CONSTRAINT REMOVED'
  END as status;

-- Step 3: Clean up test data
DELETE FROM profiles WHERE phone_number = '+919063205739';
DELETE FROM profiles WHERE phone = '+919063205739';
DELETE FROM profiles WHERE email = '9063205739@localfelo.app';

-- Step 4: Verify cleanup
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE phone_number = '+919063205739' 
         OR phone = '+919063205739'
    )
    THEN '❌ TEST DATA STILL EXISTS'
    ELSE '✅ TEST DATA CLEANED UP'
  END as cleanup_status;

-- Step 5: Add helpful comments to columns
COMMENT ON COLUMN profiles.id IS 
  'Primary key. Can be any UUID. For custom phone auth users, this is a random UUID. For Supabase Auth users (Google, etc.), this matches auth_user_id.';

COMMENT ON COLUMN profiles.auth_user_id IS 
  'References auth.users.id for Supabase Auth users (Google, email, OAuth). NULL for custom phone auth users.';

COMMENT ON COLUMN profiles.password_hash IS 
  'Bcrypt password hash for custom phone auth. NULL for Supabase Auth users (they use auth.users for authentication).';

-- Step 6: Show final status
SELECT 
  '✅ ALL FIXES APPLIED' as status,
  'Ready to test registration!' as next_step;

-- =====================================================
-- After running this, test registration:
-- 1. Phone: 9063205739
-- 2. OTP: (from SMS)
-- 3. Name: John Doe
-- 4. Password: test123
-- 
-- Should work without errors!
-- =====================================================

-- =====================================================
-- Verification query (run AFTER registration test):
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
    WHEN password_hash IS NOT NULL THEN '✅ HAS PASSWORD'
    ELSE '❌ NULL'
  END as password_status,
  CASE 
    WHEN auth_user_id IS NOT NULL THEN 'Supabase Auth User'
    ELSE 'Custom Phone Auth User'
  END as auth_type,
  client_token IS NOT NULL as has_client_token,
  created_at
FROM profiles
WHERE phone_number = '+919063205739'
   OR phone = '+919063205739';
*/
