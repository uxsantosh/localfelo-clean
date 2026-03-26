-- =====================================================
-- 🔧 MASTER DATABASE FIX - Run This Once
-- =====================================================
-- This fixes ALL database issues for OldCycle:
-- ✓ Wishes table constraints and schema
-- ✓ Tasks table constraints and schema  
-- ✓ Removes incorrect foreign keys
-- ✓ Adds missing columns
-- ✓ Sets up proper soft-auth
--
-- SAFE TO RUN MULTIPLE TIMES (idempotent)
-- =====================================================

-- =====================================================
-- SECTION 1: FIX WISHES TABLE
-- =====================================================

-- Remove incorrect foreign key constraints
ALTER TABLE wishes DROP CONSTRAINT IF EXISTS wishes_owner_token_fkey;
ALTER TABLE wishes DROP CONSTRAINT IF EXISTS wishes_client_token_fkey;
ALTER TABLE wishes DROP CONSTRAINT IF EXISTS wishes_user_id_fkey;

-- Fix owner_token column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'owner_token') THEN
        ALTER TABLE wishes ALTER COLUMN owner_token TYPE TEXT;
        ALTER TABLE wishes ALTER COLUMN owner_token DROP NOT NULL;
    ELSE
        ALTER TABLE wishes ADD COLUMN owner_token TEXT;
    END IF;
END $$;

-- Fix client_token column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'client_token') THEN
        ALTER TABLE wishes ALTER COLUMN client_token TYPE TEXT;
        ALTER TABLE wishes ALTER COLUMN client_token DROP NOT NULL;
    ELSE
        ALTER TABLE wishes ADD COLUMN client_token TEXT;
    END IF;
END $$;

-- Fix user_id column (nullable for soft-auth)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'user_id') THEN
        ALTER TABLE wishes ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        ALTER TABLE wishes ALTER COLUMN user_id DROP NOT NULL;
    ELSE
        ALTER TABLE wishes ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Fix urgency constraint
ALTER TABLE wishes DROP CONSTRAINT IF EXISTS wishes_urgency_check;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'urgency') THEN
        ALTER TABLE wishes ADD COLUMN urgency TEXT;
    END IF;
END $$;

ALTER TABLE wishes ADD CONSTRAINT wishes_urgency_check CHECK (urgency IN ('asap', 'today', 'flexible'));
UPDATE wishes SET urgency = 'flexible' WHERE urgency IS NULL;

-- Add missing columns to wishes
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'exact_location') THEN ALTER TABLE wishes ADD COLUMN exact_location TEXT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'latitude') THEN ALTER TABLE wishes ADD COLUMN latitude NUMERIC; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'longitude') THEN ALTER TABLE wishes ADD COLUMN longitude NUMERIC; END IF; END $$;

-- =====================================================
-- SECTION 2: FIX TASKS TABLE
-- =====================================================

-- Remove incorrect foreign key constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_owner_token_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_client_token_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;

-- Fix owner_token column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'owner_token') THEN
        ALTER TABLE tasks ALTER COLUMN owner_token TYPE TEXT;
        ALTER TABLE tasks ALTER COLUMN owner_token DROP NOT NULL;
    ELSE
        ALTER TABLE tasks ADD COLUMN owner_token TEXT;
    END IF;
END $$;

-- Fix client_token column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'client_token') THEN
        ALTER TABLE tasks ALTER COLUMN client_token TYPE TEXT;
        ALTER TABLE tasks ALTER COLUMN client_token DROP NOT NULL;
    ELSE
        ALTER TABLE tasks ADD COLUMN client_token TEXT;
    END IF;
END $$;

-- Fix user_id column (nullable for soft-auth)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'user_id') THEN
        ALTER TABLE tasks ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        ALTER TABLE tasks ALTER COLUMN user_id DROP NOT NULL;
    ELSE
        ALTER TABLE tasks ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Fix time_window constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_time_window_check;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time_window') THEN
        ALTER TABLE tasks ADD COLUMN time_window TEXT;
    END IF;
END $$;

ALTER TABLE tasks ADD CONSTRAINT tasks_time_window_check CHECK (time_window IN ('asap', 'today', 'tomorrow'));
UPDATE tasks SET time_window = 'today' WHERE time_window IS NULL;

-- Add missing columns to tasks
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'exact_location') THEN ALTER TABLE tasks ADD COLUMN exact_location TEXT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'latitude') THEN ALTER TABLE tasks ADD COLUMN latitude NUMERIC; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'longitude') THEN ALTER TABLE tasks ADD COLUMN longitude NUMERIC; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'open'; END IF; END $$;

-- =====================================================
-- SECTION 3: VERIFICATION
-- =====================================================

-- Verify wishes table
SELECT 
    '=== WISHES TABLE COLUMNS ===' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- Verify wishes constraints
SELECT 
    '=== WISHES TABLE CONSTRAINTS ===' as info,
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'wishes'::regclass
ORDER BY conname;

-- Verify tasks table
SELECT 
    '=== TASKS TABLE COLUMNS ===' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Verify tasks constraints
SELECT 
    '=== TASKS TABLE CONSTRAINTS ===' as info,
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tasks'::regclass
ORDER BY conname;

-- =====================================================
-- ✅ DONE! Database is now fixed!
-- =====================================================
-- You can now:
-- ✓ Create wishes without constraint errors
-- ✓ Create tasks without constraint errors
-- ✓ Use soft-auth properly
-- ✓ Save location data
-- =====================================================
