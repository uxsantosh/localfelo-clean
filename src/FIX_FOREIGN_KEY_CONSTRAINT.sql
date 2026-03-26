-- =====================================================
-- FIX OPTION 1: Remove Foreign Key Constraint (RECOMMENDED)
-- =====================================================
-- Use this if you're using custom phone auth without Supabase Auth
-- =====================================================

-- Drop the foreign key constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Verify it's removed
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
  AND constraint_type = 'FOREIGN KEY';

-- =====================================================
-- FIX OPTION 2: Create Auth User First (Complex)
-- =====================================================
-- Only use this if you want to integrate with Supabase Auth
-- This requires significant code changes
-- =====================================================

/*
-- This would require:
-- 1. Using Supabase signInWithOtp() instead of custom OTP
-- 2. Creating auth.users entry before profiles entry
-- 3. More complex flow - NOT RECOMMENDED for your use case
*/

-- =====================================================
-- FIX OPTION 3: Change profiles.id to NOT reference auth.users
-- =====================================================
-- Make profiles.id independent
-- Add a separate auth_user_id column for Supabase Auth users
-- =====================================================

/*
-- Already done - you have both:
-- - id (primary key, can be independent)
-- - auth_user_id (for Supabase Auth users, can be NULL)

-- Just need to remove the foreign key constraint with Option 1
*/

-- =====================================================
-- RECOMMENDED: Run Option 1
-- =====================================================
