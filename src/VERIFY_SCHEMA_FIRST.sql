-- =====================================================
-- RUN THIS FIRST TO VERIFY YOUR DATABASE SCHEMA
-- =====================================================
-- This will show you what columns actually exist in each table
-- Copy the output and check before running the main migration
-- =====================================================

-- ✅ Check listings table columns
SELECT 
  'listings' as table_name,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- ✅ Check wishes table columns
SELECT 
  'wishes' as table_name,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- ✅ Check shops table columns
SELECT 
  'shops' as table_name,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'shops'
ORDER BY ordinal_position;

-- ✅ Check shop_categories table columns
SELECT 
  'shop_categories' as table_name,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'shop_categories'
ORDER BY ordinal_position;

-- ✅ Check professionals table columns
SELECT 
  'professionals' as table_name,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'professionals'
ORDER BY ordinal_position;

-- ✅ Check tasks table columns
SELECT 
  'tasks' as table_name,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- =====================================================
-- SUMMARY: List all tables in your database
-- =====================================================
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns c 
   WHERE c.table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
