-- =====================================================
-- FIX: Clean up profiles data and add correct constraint
-- =====================================================
-- This script will:
-- 1. Show rows with missing contact info
-- 2. Delete invalid rows (optional)
-- 3. Add the corrected constraint
-- =====================================================

-- STEP 1: Check for invalid rows (run this first to see the problem)
SELECT id, name, email, phone_number, created_at
FROM profiles
WHERE email IS NULL AND phone_number IS NULL;

-- =====================================================
-- IMPORTANT: Review the rows above before proceeding!
-- =====================================================

-- STEP 2: Delete invalid rows (UNCOMMENT THE LINE BELOW TO EXECUTE)
-- DELETE FROM profiles WHERE email IS NULL AND phone_number IS NULL;

-- OR Alternative: Update invalid rows with placeholder email
-- UPDATE profiles 
-- SET email = 'noemail_' || id || '@oldcycle.temp'
-- WHERE email IS NULL AND phone_number IS NULL;

-- STEP 3: Drop the old incorrect constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_contact_required;

-- STEP 4: Add the corrected constraint (phone_number instead of phone)
DO $$ 
BEGIN
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_contact_required 
  CHECK (email IS NOT NULL OR phone_number IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- ✅ Done! Constraint added successfully
-- =====================================================

-- STEP 5: Verify the constraint is working
SELECT 
  constraint_name, 
  table_name, 
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'profiles' 
  AND constraint_name = 'profiles_contact_required';
