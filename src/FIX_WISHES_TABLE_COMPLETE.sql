-- =====================================================
-- COMPLETE FIX: Wishes Table Schema Issues
-- Run this in your Supabase SQL Editor
-- This fixes BOTH the urgency constraint AND owner_token FK issues
-- =====================================================

-- =====================================================
-- PART 1: Remove Incorrect Foreign Key Constraints
-- =====================================================

-- Drop incorrect foreign key on owner_token (should be TEXT, not FK)
ALTER TABLE wishes 
DROP CONSTRAINT IF EXISTS wishes_owner_token_fkey;

-- Drop incorrect foreign key on client_token (should be TEXT, not FK)
ALTER TABLE wishes 
DROP CONSTRAINT IF EXISTS wishes_client_token_fkey;

-- Drop incorrect foreign key on user_id (we use soft-auth)
ALTER TABLE wishes 
DROP CONSTRAINT IF EXISTS wishes_user_id_fkey;

-- =====================================================
-- PART 2: Fix Column Types
-- =====================================================

-- Ensure owner_token is TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'owner_token'
    ) THEN
        ALTER TABLE wishes ALTER COLUMN owner_token TYPE TEXT;
        ALTER TABLE wishes ALTER COLUMN owner_token DROP NOT NULL;
    ELSE
        ALTER TABLE wishes ADD COLUMN owner_token TEXT;
    END IF;
END $$;

-- Ensure client_token is TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'client_token'
    ) THEN
        ALTER TABLE wishes ALTER COLUMN client_token TYPE TEXT;
        ALTER TABLE wishes ALTER COLUMN client_token DROP NOT NULL;
    ELSE
        ALTER TABLE wishes ADD COLUMN client_token TEXT;
    END IF;
END $$;

-- Ensure user_id is UUID and nullable (for soft-auth)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE wishes ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        ALTER TABLE wishes ALTER COLUMN user_id DROP NOT NULL;
    ELSE
        ALTER TABLE wishes ADD COLUMN user_id UUID;
    END IF;
END $$;

-- =====================================================
-- PART 3: Fix Urgency Constraint
-- =====================================================

-- Drop existing urgency constraint if it exists
ALTER TABLE wishes 
DROP CONSTRAINT IF EXISTS wishes_urgency_check;

-- Add urgency column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'urgency'
    ) THEN
        ALTER TABLE wishes ADD COLUMN urgency TEXT;
    END IF;
END $$;

-- Add the correct urgency constraint
ALTER TABLE wishes 
ADD CONSTRAINT wishes_urgency_check 
CHECK (urgency IN ('asap', 'today', 'flexible'));

-- Set default urgency for NULL rows
UPDATE wishes 
SET urgency = 'flexible' 
WHERE urgency IS NULL;

-- =====================================================
-- PART 4: Ensure All Required Columns Exist
-- =====================================================

-- Add exact_location if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'exact_location'
    ) THEN
        ALTER TABLE wishes ADD COLUMN exact_location TEXT;
    END IF;
END $$;

-- Add latitude if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE wishes ADD COLUMN latitude NUMERIC;
    END IF;
END $$;

-- Add longitude if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE wishes ADD COLUMN longitude NUMERIC;
    END IF;
END $$;

-- =====================================================
-- PART 5: Verify the Fixes
-- =====================================================

-- Check column types
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'wishes'::regclass
ORDER BY conname;

-- Check foreign keys (should be empty or only valid ones)
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'wishes';

-- =====================================================
-- SUCCESS! ✅
-- =====================================================
-- Your wishes table should now be properly configured:
-- ✓ owner_token is TEXT (not a foreign key)
-- ✓ client_token is TEXT (not a foreign key)
-- ✓ user_id is UUID and nullable
-- ✓ urgency has correct CHECK constraint
-- ✓ All required columns exist
-- =====================================================
