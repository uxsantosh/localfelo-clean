-- =====================================================
-- PHONE AUTH MIGRATION - Add Missing Columns
-- =====================================================
-- This migration adds password_hash and token columns needed
-- for the new phone-based authentication system.
-- Run this in Supabase SQL Editor.

-- =====================================================
-- 1. ADD MISSING COLUMNS TO PROFILES TABLE
-- =====================================================

-- Add password_hash column (bcrypt hash storage)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add display_name column (for UI display)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add client_token column (soft auth token)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS client_token TEXT;

-- Add owner_token column (listing owner identification)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS owner_token TEXT;

-- Add phone_number column (alternate phone storage)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add avatar_url column (profile picture)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add is_active column (account status)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for password lookups
CREATE INDEX IF NOT EXISTS idx_profiles_password_hash 
ON profiles(password_hash) 
WHERE password_hash IS NOT NULL;

-- Index for client_token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_client_token 
ON profiles(client_token);

-- Index for owner_token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_owner_token 
ON profiles(owner_token);

-- Index for phone_number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number 
ON profiles(phone_number);

-- =====================================================
-- 3. ADD UNIQUE CONSTRAINTS (OPTIONAL BUT RECOMMENDED)
-- =====================================================

-- Ensure phone numbers are unique (drop if exists first)
DO $$ 
BEGIN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS unique_phone;
    ALTER TABLE profiles ADD CONSTRAINT unique_phone UNIQUE (phone);
EXCEPTION
    WHEN duplicate_key THEN NULL;
END $$;

-- Ensure client_token is unique (if not already)
DO $$ 
BEGIN
    ALTER TABLE profiles ADD CONSTRAINT unique_client_token UNIQUE (client_token);
EXCEPTION
    WHEN duplicate_key THEN NULL;
END $$;

-- Ensure owner_token is unique (if not already)
DO $$ 
BEGIN
    ALTER TABLE profiles ADD CONSTRAINT unique_owner_token UNIQUE (owner_token);
EXCEPTION
    WHEN duplicate_key THEN NULL;
END $$;

-- =====================================================
-- 4. MIGRATE EXISTING DATA (IF NEEDED)
-- =====================================================

-- Copy name to display_name if display_name is empty
UPDATE profiles 
SET display_name = name 
WHERE display_name IS NULL AND name IS NOT NULL;

-- Copy phone to phone_number if phone_number is empty
UPDATE profiles 
SET phone_number = phone 
WHERE phone_number IS NULL AND phone IS NOT NULL;

-- Generate client_token for existing profiles without one
UPDATE profiles 
SET client_token = 'token_' || floor(extract(epoch from now()) * 1000)::text || '_' || substr(md5(random()::text), 1, 12)
WHERE client_token IS NULL;

-- Generate owner_token for existing profiles without one
UPDATE profiles 
SET owner_token = 'token_' || floor(extract(epoch from now()) * 1000)::text || '_' || substr(md5(random()::text), 1, 12)
WHERE owner_token IS NULL;

-- Set is_active to true for existing profiles
UPDATE profiles 
SET is_active = true 
WHERE is_active IS NULL;

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================

-- Check the updated schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check profiles without password (need to set password on next login)
SELECT 
    id,
    phone,
    name,
    password_hash IS NULL as needs_password,
    client_token IS NULL as needs_client_token,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 6. NOTES
-- =====================================================
-- After running this migration:
-- 
-- ✅ All columns are now present in profiles table
-- ✅ Existing profiles have tokens generated
-- ✅ Unique constraints prevent duplicates
-- ✅ Indexes improve query performance
-- 
-- For existing users without password_hash:
-- - They will be treated as "legacy users"
-- - System will send OTP on first login
-- - They can set password after OTP verification
-- 
-- For new registrations:
-- - Phone → OTP → Name + Password → Account created
-- - password_hash is set immediately
-- 
-- =====================================================
-- 7. CLEANUP DUPLICATE PROFILES (IF ANY)
-- =====================================================

-- Find duplicate phones
SELECT phone, COUNT(*) as count
FROM profiles
GROUP BY phone
HAVING COUNT(*) > 1;

-- To remove duplicates, keep the OLDEST profile per phone:
-- (Run this ONLY if you have duplicates and want to clean them)
/*
DELETE FROM profiles
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at ASC) as rn
        FROM profiles
    ) t
    WHERE t.rn > 1
);
*/

-- =====================================================
-- MIGRATION COMPLETE ✅
-- =====================================================
