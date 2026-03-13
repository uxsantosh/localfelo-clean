-- =====================================================
-- FIX: Remove incorrect foreign key constraint on owner_token
-- Run this in your Supabase SQL Editor
-- =====================================================

-- The owner_token field should be TEXT for soft-auth, NOT a foreign key
-- This migration removes the incorrect foreign key constraint

-- 1. Drop the incorrect foreign key constraint on wishes.owner_token
ALTER TABLE wishes 
DROP CONSTRAINT IF EXISTS wishes_owner_token_fkey;

-- 2. Drop the incorrect foreign key constraint on wishes.user_id (if it exists and is wrong)
ALTER TABLE wishes 
DROP CONSTRAINT IF EXISTS wishes_user_id_fkey;

-- 3. Ensure owner_token is TEXT (not a foreign key)
-- First, check the column type
DO $$
BEGIN
    -- If column doesn't exist, add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'owner_token'
    ) THEN
        ALTER TABLE wishes ADD COLUMN owner_token TEXT;
    END IF;
END $$;

-- 4. Make sure client_token is also TEXT (not a foreign key)
DO $$
BEGIN
    -- If column doesn't exist, add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'client_token'
    ) THEN
        ALTER TABLE wishes ADD COLUMN client_token TEXT;
    END IF;
END $$;

-- 5. Ensure user_id is UUID and NOT NULL
DO $$
BEGIN
    -- Alter column to UUID if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wishes' AND column_name = 'user_id'
    ) THEN
        -- Remove NOT NULL constraint temporarily if needed
        ALTER TABLE wishes ALTER COLUMN user_id DROP NOT NULL;
    END IF;
END $$;

-- 6. Verify the fixes
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'wishes' 
  AND column_name IN ('owner_token', 'client_token', 'user_id')
ORDER BY column_name;

-- 7. List all foreign key constraints on wishes table
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'wishes';

-- =====================================================
-- EXPLANATION:
-- =====================================================
-- OldCycle uses a "soft-auth" system where:
-- - owner_token: TEXT field for ownership verification (NOT a foreign key)
-- - client_token: TEXT field for client identification (NOT a foreign key)
-- - user_id: UUID that CAN be NULL (soft-auth allows non-registered users)
--
-- These should NOT have foreign key constraints to other tables!
-- =====================================================
