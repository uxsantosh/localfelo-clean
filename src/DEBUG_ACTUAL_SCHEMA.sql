-- =====================================================
-- DISCOVER ACTUAL DATABASE SCHEMA
-- No assumptions - just show what actually exists
-- =====================================================

-- 1. Show ALL columns in tasks table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- 2. Show ALL columns in wishes table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- 3. Show sample task data (WITHOUT assuming columns)
SELECT *
FROM tasks
ORDER BY created_at DESC
LIMIT 5;

-- 4. Show sample wish data (WITHOUT assuming columns)
SELECT *
FROM wishes
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- PLEASE SHARE THE RESULTS OF THESE 4 QUERIES
-- This will show me exactly what columns exist
-- =====================================================
