-- =====================================================
-- SCHEMA CHECK QUERIES
-- Run these to verify your actual database structure
-- =====================================================

-- Query 1: Check categories table structure and type
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'categories'
ORDER BY ordinal_position;

-- Query 2: Check listings table structure
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- Query 3: Check tasks table structure
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Query 4: Check wishes table structure
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- Query 5: Check what tables actually exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Query 6: Quick sample of categories data (to see actual ID format)
SELECT id, name, slug 
FROM categories 
LIMIT 5;

-- =====================================================
-- INSTRUCTIONS:
-- 1. Run each query separately
-- 2. Copy the results
-- 3. Share them so we can fix the SQL setup file
-- =====================================================
