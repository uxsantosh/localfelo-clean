-- =====================================================
-- SCHEMA DIAGNOSTIC - Run this first!
-- =====================================================
-- This will tell us the current data types in your database
-- =====================================================

-- 1. Check categories table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'categories'
ORDER BY ordinal_position;

-- 2. Check tasks table category_id type
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
  AND column_name = 'category_id';

-- 3. Check professionals table category_id type
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'professionals'
  AND column_name = 'category_id';

-- 4. Check wishes table category_id type
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'wishes'
  AND column_name = 'category_id';

-- 5. Show current categories with their IDs and types
SELECT 
  id,
  pg_typeof(id) as id_type,
  name,
  emoji
FROM categories
LIMIT 10;

-- 6. Show sample tasks with category_id
SELECT 
  id,
  title,
  category_id,
  pg_typeof(category_id) as category_id_type
FROM tasks
WHERE category_id IS NOT NULL
LIMIT 5;

-- 7. Check foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  tc.constraint_type,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'category_id'
ORDER BY tc.table_name;

-- =====================================================
-- INSTRUCTIONS:
-- Run this entire script and send me the results.
-- This will tell me exactly how to fix the migration.
-- =====================================================
