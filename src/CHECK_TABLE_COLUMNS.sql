-- =====================================================
-- CHECK TABLE COLUMNS
-- =====================================================
-- This shows the actual column names in your tables
-- =====================================================

-- Check listings table columns
SELECT 
  'LISTINGS TABLE' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- Check tasks table columns
SELECT 
  'TASKS TABLE' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Check wishes table columns
SELECT 
  'WISHES TABLE' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- Check profiles table columns
SELECT 
  'PROFILES TABLE' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
