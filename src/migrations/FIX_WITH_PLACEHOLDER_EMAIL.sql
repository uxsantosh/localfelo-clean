-- =====================================================
-- FIX: Add placeholder data instead of deleting
-- =====================================================
-- This script will:
-- 1. Add placeholder email to profiles with no contact info
-- 2. Add the corrected constraint
-- Safe to run - doesn't delete any data!
-- =====================================================

-- STEP 1: Check which profiles need fixing
SELECT id, name, email, phone_number, created_at
FROM profiles
WHERE email IS NULL AND phone_number IS NULL;

-- STEP 2: Add placeholder email to invalid profiles
-- Format: oldcycle_[first8chars_of_id]@temp.local
UPDATE profiles 
SET email = 'oldcycle_' || substring(id::text, 1, 8) || '@temp.local'
WHERE email IS NULL AND phone_number IS NULL;

-- STEP 3: Drop old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_contact_required;

-- STEP 4: Add corrected constraint (phone_number instead of phone)
DO $$ 
BEGIN
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_contact_required 
  CHECK (email IS NOT NULL OR phone_number IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- STEP 5: Verify the fix
SELECT id, name, email, phone_number, created_at
FROM profiles
WHERE email LIKE 'oldcycle_%@temp.local';

-- =====================================================
-- ✅ Fixed! Placeholder emails added, constraint added
-- =====================================================
-- Note: Users with placeholder emails can update them later in Profile settings
