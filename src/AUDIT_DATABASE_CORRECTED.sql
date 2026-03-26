-- =====================================================
-- DATABASE AUDIT - CORRECTED VERSION
-- =====================================================
-- This version handles different column names
-- Run EACH query separately and share results
-- =====================================================

-- =====================================================
-- QUERY 1: List ALL tables
-- =====================================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- QUERY 2: Check profiles table columns (CRITICAL)
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- =====================================================
-- QUERY 3: Check listings table columns
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- =====================================================
-- QUERY 4: Sample profile data (see actual structure)
-- =====================================================
SELECT 
  id,
  phone,
  name,
  CASE WHEN password_hash IS NOT NULL THEN 'HAS_PASSWORD' ELSE 'NULL' END as password_status,
  CASE WHEN client_token IS NOT NULL THEN 'HAS_TOKEN' ELSE 'NULL' END as token_status,
  CASE WHEN owner_token IS NOT NULL THEN 'HAS_OWNER' ELSE 'NULL' END as owner_status,
  created_at
FROM profiles
LIMIT 3;

-- NOTE: If you get "column does not exist" error, that column is missing!

-- =====================================================
-- QUERY 5: Check ALL foreign keys
-- =====================================================
SELECT
  tc.table_name AS from_table,
  kcu.column_name AS from_column,
  ccu.table_name AS to_table,
  ccu.column_name AS to_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- =====================================================
-- QUERY 6: Check for duplicate phones
-- =====================================================
SELECT 
  phone,
  COUNT(*) as count
FROM profiles
GROUP BY phone
HAVING COUNT(*) > 1;

-- =====================================================
-- QUERY 7: Count rows in major tables
-- =====================================================
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'listings', COUNT(*) FROM listings
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'cities', COUNT(*) FROM cities
UNION ALL
SELECT 'areas', COUNT(*) FROM areas;

-- =====================================================
-- QUERY 8: Check if conversations table exists
-- =====================================================
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'conversations'
) AS conversations_exists;

-- =====================================================
-- QUERY 9: Check if wishes table exists
-- =====================================================
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'wishes'
) AS wishes_exists;

-- =====================================================
-- QUERY 10: Check if tasks table exists
-- =====================================================
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'tasks'
) AS tasks_exists;

-- =====================================================
-- QUERY 11: Check if notifications table exists
-- =====================================================
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'notifications'
) AS notifications_exists;

-- =====================================================
-- QUERY 12: Check if sub_areas table exists
-- =====================================================
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'sub_areas'
) AS sub_areas_exists;

-- =====================================================
-- QUERY 13: Your specific profile
-- =====================================================
-- Check YOUR test profile that's having issues
SELECT *
FROM profiles
WHERE phone = '+919063205739';

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. Run each query above (copy one, paste, run, copy result)
-- 2. If a query gives "column does not exist" error, note which column
-- 3. Share ALL results with me
-- 4. Then I'll create the perfect migration for YOUR database
-- =====================================================
