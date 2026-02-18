-- =====================================================
-- OldCycle Complete Authentication Setup
-- Run this in Supabase SQL Editor
-- Safe to run multiple times - won't throw errors
-- =====================================================

-- STEP 1: Add all required columns (safe to run multiple times)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hint TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS client_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_same BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- STEP 2: Add unique constraints (silently skip if they exist)
DO $$ 
BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_phone_number_unique UNIQUE (phone_number);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_client_token_unique UNIQUE (client_token);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- STEP 3: Create indexes for faster lookups (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email) WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_phone_number 
ON profiles(phone_number) WHERE phone_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_password_hash 
ON profiles(password_hash) WHERE password_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_client_token 
ON profiles(client_token) WHERE client_token IS NOT NULL;

-- STEP 4: Add placeholder email to profiles with no contact info
-- (Can't delete because they're referenced by tasks, listings, etc.)
UPDATE profiles 
SET email = 'oldcycle_' || substring(id::text, 1, 8) || '@temp.local'
WHERE email IS NULL AND phone_number IS NULL;

-- STEP 5: Add check constraint to ensure at least ONE contact method exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_contact_required;

DO $$ 
BEGIN
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_contact_required 
  CHECK (email IS NOT NULL OR phone_number IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- Migration Complete! ✅
-- Safe to run multiple times without errors
-- =====================================================