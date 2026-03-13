-- =====================================================
-- SIMPLE DATABASE AUDIT - SAFE VERSION
-- =====================================================
-- This version is 100% safe and won't error
-- Just copy ALL of this and run it in one go
-- =====================================================

-- Show all tables
SELECT '=== ALL TABLES ===' as info;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Show profiles columns
SELECT '' as spacer;
SELECT '=== PROFILES COLUMNS ===' as info;
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Show listings columns
SELECT '' as spacer;
SELECT '=== LISTINGS COLUMNS ===' as info;
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- Count rows
SELECT '' as spacer;
SELECT '=== ROW COUNTS ===' as info;
SELECT 'profiles' as table_name, COUNT(*) as rows FROM profiles
UNION ALL
SELECT 'listings', COUNT(*) FROM listings
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'cities', COUNT(*) FROM cities
UNION ALL
SELECT 'areas', COUNT(*) FROM areas;

-- Check table existence
SELECT '' as spacer;
SELECT '=== TABLE EXISTENCE ===' as info;
SELECT 
  'conversations' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') as exists
UNION ALL
SELECT 'messages',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages')
UNION ALL
SELECT 'wishes',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wishes')
UNION ALL
SELECT 'tasks',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks')
UNION ALL
SELECT 'notifications',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications')
UNION ALL
SELECT 'sub_areas',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sub_areas');

-- Show foreign keys
SELECT '' as spacer;
SELECT '=== FOREIGN KEYS ===' as info;
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- Check your test profile
SELECT '' as spacer;
SELECT '=== YOUR TEST PROFILE ===' as info;
SELECT *
FROM profiles
WHERE phone = '+919063205739';

-- =====================================================
-- COPY ALL OUTPUT AND SEND TO ME
-- =====================================================
