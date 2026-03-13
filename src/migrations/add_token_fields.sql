-- =====================================================
-- MIGRATION: Add Token Fields for Simple Auth
-- =====================================================
-- This migration adds client_token and owner_token fields
-- needed for the simple passwordless authentication system

-- 1. Add client_token column (required, unique)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS client_token TEXT NOT NULL DEFAULT gen_random_uuid()::text;

-- 2. Add owner_token column (required, unique)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS owner_token TEXT NOT NULL DEFAULT gen_random_uuid()::text;

-- 3. Add auth_user_id column (optional, for Supabase Auth if needed later)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Create unique constraints on tokens
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_client_token_key;
ALTER TABLE profiles ADD CONSTRAINT profiles_client_token_key UNIQUE (client_token);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_owner_token_key;
ALTER TABLE profiles ADD CONSTRAINT profiles_owner_token_key UNIQUE (owner_token);

-- 5. Add indexes for faster token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_client_token ON profiles(client_token);
CREATE INDEX IF NOT EXISTS idx_profiles_owner_token ON profiles(owner_token);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);

-- 6. Update existing rows to have unique tokens if they don't have them
UPDATE profiles 
SET client_token = gen_random_uuid()::text
WHERE client_token IS NULL OR client_token = '';

UPDATE profiles 
SET owner_token = gen_random_uuid()::text
WHERE owner_token IS NULL OR owner_token = '';

-- 7. Verify the columns exist
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('client_token', 'owner_token', 'email', 'phone', 'auth_user_id')
ORDER BY column_name;
