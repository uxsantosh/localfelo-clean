-- =====================================================
-- COMPLETE FIX: Tasks Table Schema Issues
-- Run this in your Supabase SQL Editor
-- This prevents similar issues with the tasks table
-- =====================================================

-- =====================================================
-- PART 1: Remove Incorrect Foreign Key Constraints
-- =====================================================

-- Drop incorrect foreign key on owner_token (should be TEXT, not FK)
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_owner_token_fkey;

-- Drop incorrect foreign key on client_token (should be TEXT, not FK)
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_client_token_fkey;

-- Drop incorrect foreign key on user_id (we use soft-auth)
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;

-- =====================================================
-- PART 2: Fix Column Types
-- =====================================================

-- Ensure owner_token is TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'owner_token'
    ) THEN
        ALTER TABLE tasks ALTER COLUMN owner_token TYPE TEXT;
        ALTER TABLE tasks ALTER COLUMN owner_token DROP NOT NULL;
    ELSE
        ALTER TABLE tasks ADD COLUMN owner_token TEXT;
    END IF;
END $$;

-- Ensure client_token is TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'client_token'
    ) THEN
        ALTER TABLE tasks ALTER COLUMN client_token TYPE TEXT;
        ALTER TABLE tasks ALTER COLUMN client_token DROP NOT NULL;
    ELSE
        ALTER TABLE tasks ADD COLUMN client_token TEXT;
    END IF;
END $$;

-- Ensure user_id is UUID and nullable (for soft-auth)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE tasks ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        ALTER TABLE tasks ALTER COLUMN user_id DROP NOT NULL;
    ELSE
        ALTER TABLE tasks ADD COLUMN user_id UUID;
    END IF;
END $$;

-- =====================================================
-- PART 3: Fix Time Window Constraint
-- =====================================================

-- Drop existing time_window constraint if it exists
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_time_window_check;

-- Add time_window column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'time_window'
    ) THEN
        ALTER TABLE tasks ADD COLUMN time_window TEXT;
    END IF;
END $$;

-- Add the correct time_window constraint
ALTER TABLE tasks 
ADD CONSTRAINT tasks_time_window_check 
CHECK (time_window IN ('asap', 'today', 'tomorrow'));

-- Set default time_window for NULL rows
UPDATE tasks 
SET time_window = 'today' 
WHERE time_window IS NULL;

-- =====================================================
-- PART 4: Ensure All Required Columns Exist
-- =====================================================

-- Add exact_location if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'exact_location'
    ) THEN
        ALTER TABLE tasks ADD COLUMN exact_location TEXT;
    END IF;
END $$;

-- Add latitude if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE tasks ADD COLUMN latitude NUMERIC;
    END IF;
END $$;

-- Add longitude if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE tasks ADD COLUMN longitude NUMERIC;
    END IF;
END $$;

-- Add status if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'status'
    ) THEN
        ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'open';
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
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tasks'::regclass
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
  AND tc.table_name = 'tasks';

-- =====================================================
-- SUCCESS! ✅
-- =====================================================
-- Your tasks table should now be properly configured:
-- ✓ owner_token is TEXT (not a foreign key)
-- ✓ client_token is TEXT (not a foreign key)
-- ✓ user_id is UUID and nullable
-- ✓ time_window has correct CHECK constraint
-- ✓ All required columns exist
-- =====================================================
