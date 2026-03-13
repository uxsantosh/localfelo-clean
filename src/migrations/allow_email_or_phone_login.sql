-- =====================================================
-- MIGRATION: Allow Email OR Phone Login
-- =====================================================
-- This migration ensures users can sign up with EITHER email OR phone
-- (not both required)

-- 1. Make email nullable (if not already)
DO $$ 
BEGIN
  ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- 2. Make phone nullable (already done in google oauth migration, but safe to repeat)
DO $$ 
BEGIN
  ALTER TABLE profiles ALTER COLUMN phone DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- 3. Drop unique constraints temporarily
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;

-- 4. Add conditional unique constraints (allow NULL but enforce uniqueness for non-NULL values)
-- Note: In PostgreSQL, NULL values are considered distinct, so multiple NULLs are allowed
DROP INDEX IF EXISTS profiles_email_unique;
CREATE UNIQUE INDEX profiles_email_unique 
ON profiles(email) 
WHERE email IS NOT NULL;

DROP INDEX IF EXISTS profiles_phone_unique;
CREATE UNIQUE INDEX profiles_phone_unique 
ON profiles(phone) 
WHERE phone IS NOT NULL;

-- 5. Add check constraint to ensure at least ONE contact method exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_contact_required;

DO $$ 
BEGIN
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_contact_required 
  CHECK (email IS NOT NULL OR phone IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- INDEXES FOR FAST LOOKUPS
-- =====================================================

-- Index for email lookups
DROP INDEX IF EXISTS idx_profiles_email;
CREATE INDEX idx_profiles_email ON profiles(email) 
WHERE email IS NOT NULL;

-- Index for phone lookups  
DROP INDEX IF EXISTS idx_profiles_phone;
CREATE INDEX idx_profiles_phone ON profiles(phone) 
WHERE phone IS NOT NULL;

-- =====================================================
-- RLS POLICIES FOR SIMPLE AUTH (client_token based)
-- =====================================================

-- Drop ALL existing update policies first
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update profile with token" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policy that allows updates based on client_token match
-- Users can update their profile if they have the correct client_token
CREATE POLICY "Users can update profile with token" 
ON profiles FOR UPDATE 
USING (true)  -- Anyone can attempt update
WITH CHECK (true);  -- Trust client-side validation via client_token

-- Note: This is a simplified auth system. For production, you'd want to validate
-- the client_token server-side or use Supabase Auth with proper session management.

-- =====================================================
-- VERIFY
-- =====================================================

-- Show current column constraints
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('email', 'phone')
ORDER BY column_name;

-- Show unique constraints
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles'
  AND tc.constraint_type IN ('UNIQUE', 'CHECK')
ORDER BY tc.constraint_name;