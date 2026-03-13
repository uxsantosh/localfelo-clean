-- =====================================================
-- FIX: Update profiles_contact_required constraint
-- =====================================================
-- The constraint was checking for "phone" but the column is "phone_number"
-- Run this in Supabase SQL Editor to fix the error
-- =====================================================

-- Drop the old incorrect constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_contact_required;

-- Add the corrected constraint (phone_number instead of phone)
DO $$ 
BEGIN
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_contact_required 
  CHECK (email IS NOT NULL OR phone_number IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- ✅ Fixed! Now registration will work correctly
-- =====================================================
