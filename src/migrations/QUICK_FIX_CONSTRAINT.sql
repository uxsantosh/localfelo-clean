-- =====================================================
-- QUICK FIX: Add placeholder emails to invalid profiles
-- =====================================================
-- Safe to run - this will:
-- 1. Add placeholder email to profiles with no contact info
-- 2. Add the corrected constraint
-- Does NOT delete any data!
-- =====================================================

-- Add placeholder email to invalid profiles
UPDATE profiles 
SET email = 'oldcycle_' || substring(id::text, 1, 8) || '@temp.local'
WHERE email IS NULL AND phone_number IS NULL;

-- Drop old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_contact_required;

-- Add corrected constraint
DO $$ 
BEGIN
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_contact_required 
  CHECK (email IS NOT NULL OR phone_number IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- ✅ Fixed! Placeholder emails added, constraint added
-- =====================================================