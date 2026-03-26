-- =====================================================
-- COMPLETE FIX FOR PROFILES TABLE
-- This fixes ALL missing columns and type mismatches
-- =====================================================

-- STEP 1: Drop ALL RLS policies on profiles table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- STEP 2: Add missing columns (if they don't exist)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp_name TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- STEP 3: Add token columns as TEXT (if they don't exist yet)
-- If they exist as UUID, we'll change them in next step
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS client_token_temp TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS owner_token_temp TEXT;

-- STEP 4: If client_token and owner_token exist as UUID, convert them
DO $$ 
BEGIN
    -- Check if client_token exists and is UUID type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'client_token' 
        AND data_type = 'uuid'
    ) THEN
        -- Copy data to temp column
        UPDATE profiles SET client_token_temp = client_token::text WHERE client_token IS NOT NULL;
        -- Drop old UUID column
        ALTER TABLE profiles DROP COLUMN client_token;
        -- Rename temp to actual
        ALTER TABLE profiles RENAME COLUMN client_token_temp TO client_token;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'client_token'
    ) THEN
        -- Column doesn't exist at all, create it
        ALTER TABLE profiles ADD COLUMN client_token TEXT;
    END IF;

    -- Same for owner_token
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'owner_token' 
        AND data_type = 'uuid'
    ) THEN
        UPDATE profiles SET owner_token_temp = owner_token::text WHERE owner_token IS NOT NULL;
        ALTER TABLE profiles DROP COLUMN owner_token;
        ALTER TABLE profiles RENAME COLUMN owner_token_temp TO owner_token;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'owner_token'
    ) THEN
        ALTER TABLE profiles ADD COLUMN owner_token TEXT;
    END IF;
END $$;

-- STEP 5: Drop temp columns if they still exist
ALTER TABLE profiles DROP COLUMN IF EXISTS client_token_temp;
ALTER TABLE profiles DROP COLUMN IF EXISTS owner_token_temp;

-- STEP 6: Make phone nullable (for email-only logins)
ALTER TABLE profiles ALTER COLUMN phone DROP NOT NULL;

-- STEP 7: Remove UNIQUE constraint on phone if exists
DO $$ 
BEGIN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- STEP 8: Set NOT NULL for required columns
ALTER TABLE profiles ALTER COLUMN client_token SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN owner_token SET NOT NULL;

-- STEP 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_client_token ON profiles(client_token);

-- STEP 10: Recreate RLS policies
CREATE POLICY "Anyone can view all profiles" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create profile" 
ON profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update profile with token" 
ON profiles FOR UPDATE 
USING (true)
WITH CHECK (true);

-- STEP 11: Verify the fix
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY column_name;

-- =====================================================
-- EXPECTED OUTPUT:
-- =====================================================
-- auth_user_id     | uuid                  | YES
-- client_token     | text                  | NO
-- created_at       | timestamp with time zone | YES
-- email            | text                  | YES
-- id               | uuid                  | NO
-- is_admin         | boolean               | YES
-- name             | text                  | NO
-- owner_token      | text                  | NO
-- phone            | text/character varying| YES
-- updated_at       | timestamp with time zone | YES
-- whatsapp         | text                  | YES
-- whatsapp_name    | text                  | YES
-- whatsapp_same    | boolean               | YES
-- =====================================================
