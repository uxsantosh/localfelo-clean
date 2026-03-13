-- =====================================================
-- QUICK COLUMN CHECK
-- Run this first to see actual table structure
-- =====================================================

-- Check WISHES table structure
SELECT '=== WISHES TABLE COLUMNS ===' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wishes' 
ORDER BY ordinal_position;

-- Check TASKS table structure  
SELECT '=== TASKS TABLE COLUMNS ===' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- Check LISTINGS table structure
SELECT '=== LISTINGS TABLE COLUMNS ===' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings' 
ORDER BY ordinal_position;

-- Check CONVERSATIONS table structure
SELECT '=== CONVERSATIONS TABLE COLUMNS ===' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversations' 
ORDER BY ordinal_position;

-- Sample data from each table
SELECT '=== SAMPLE WISHES DATA ===' as info;
SELECT * FROM wishes LIMIT 1;

SELECT '=== SAMPLE TASKS DATA ===' as info;
SELECT * FROM tasks LIMIT 1;

SELECT '=== SAMPLE LISTINGS DATA ===' as info;
SELECT * FROM listings LIMIT 1;