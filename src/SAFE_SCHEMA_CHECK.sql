-- =====================================================
-- 🔒 SAFE SCHEMA CHECK - Read-Only Verification
-- OldCycle - No modifications, just checks
-- =====================================================

-- =====================================================
-- TABLES CHECK
-- =====================================================

SELECT '========================================' as divider;
SELECT '🗂️  ALL TABLES IN DATABASE' as section;
SELECT '========================================' as divider;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('profiles', 'listings', 'listing_images', 'categories', 'cities', 'areas', 'wishes', 'tasks', 'conversations', 'messages', 'reports') 
        THEN '✅ Expected'
        ELSE '⚠️  Extra'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- CONVERSATIONS TABLE DETAILS
-- =====================================================

SELECT '========================================' as divider;
SELECT '💬 CONVERSATIONS TABLE COLUMNS' as section;
SELECT '========================================' as divider;

SELECT 
    ordinal_position as position,
    column_name,
    data_type,
    CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END as nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- =====================================================
-- MESSAGES TABLE DETAILS
-- =====================================================

SELECT '========================================' as divider;
SELECT '✉️  MESSAGES TABLE COLUMNS' as section;
SELECT '========================================' as divider;

SELECT 
    ordinal_position as position,
    column_name,
    data_type,
    CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END as nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- =====================================================
-- WISHES TABLE DETAILS
-- =====================================================

SELECT '========================================' as divider;
SELECT '⭐ WISHES TABLE COLUMNS' as section;
SELECT '========================================' as divider;

SELECT 
    ordinal_position as position,
    column_name,
    data_type,
    CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END as nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- =====================================================
-- TASKS TABLE DETAILS
-- =====================================================

SELECT '========================================' as divider;
SELECT '📋 TASKS TABLE COLUMNS' as section;
SELECT '========================================' as divider;

SELECT 
    ordinal_position as position,
    column_name,
    data_type,
    CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END as nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- =====================================================
-- LISTINGS TABLE DETAILS
-- =====================================================

SELECT '========================================' as divider;
SELECT '📦 LISTINGS TABLE COLUMNS' as section;
SELECT '========================================' as divider;

SELECT 
    ordinal_position as position,
    column_name,
    data_type,
    CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END as nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- =====================================================
-- SOFT-AUTH TOKEN CHECK
-- =====================================================

SELECT '========================================' as divider;
SELECT '🔐 SOFT-AUTH TOKEN COLUMNS' as section;
SELECT '========================================' as divider;

SELECT 
    'listings' as table_name,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'owner_token') as has_owner_token,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'client_token') as has_client_token
UNION ALL
SELECT 
    'wishes' as table_name,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'owner_token'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'client_token')
UNION ALL
SELECT 
    'tasks' as table_name,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'owner_token'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'client_token');

-- =====================================================
-- MISSING COLUMNS DETECTION
-- =====================================================

SELECT '========================================' as divider;
SELECT '🔍 MISSING COLUMNS DETECTION' as section;
SELECT '========================================' as divider;

-- Check WISHES table for required columns
SELECT 
    'wishes' as table_name,
    'status' as column_name,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'status') as exists
UNION ALL
SELECT 'wishes', 'exact_location',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'exact_location')
UNION ALL
SELECT 'wishes', 'latitude',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'latitude')
UNION ALL
SELECT 'wishes', 'longitude',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'longitude')
UNION ALL
SELECT 'wishes', 'urgency',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishes' AND column_name = 'urgency')
UNION ALL
-- Check TASKS table for required columns
SELECT 'tasks', 'status',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status')
UNION ALL
SELECT 'tasks', 'exact_location',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'exact_location')
UNION ALL
SELECT 'tasks', 'latitude',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'latitude')
UNION ALL
SELECT 'tasks', 'longitude',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'longitude')
UNION ALL
SELECT 'tasks', 'time_window',
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time_window')
ORDER BY table_name, column_name;

-- =====================================================
-- EXISTING INDEXES
-- =====================================================

SELECT '========================================' as divider;
SELECT '📊 CURRENT INDEXES' as section;
SELECT '========================================' as divider;

SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('listings', 'wishes', 'tasks', 'conversations', 'messages')
ORDER BY tablename, indexname;

-- =====================================================
-- RLS STATUS
-- =====================================================

SELECT '========================================' as divider;
SELECT '🔒 ROW LEVEL SECURITY STATUS' as section;
SELECT '========================================' as divider;

SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('listings', 'wishes', 'tasks', 'conversations', 'messages')
ORDER BY tablename;

-- =====================================================
-- RECORD COUNTS
-- =====================================================

SELECT '========================================' as divider;
SELECT '📈 RECORD COUNTS' as section;
SELECT '========================================' as divider;

SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'listings', COUNT(*) FROM listings
UNION ALL
SELECT 'wishes', COUNT(*) FROM wishes
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'cities', COUNT(*) FROM cities
UNION ALL
SELECT 'areas', COUNT(*) FROM areas
ORDER BY table_name;

-- =====================================================
-- FOREIGN KEYS
-- =====================================================

SELECT '========================================' as divider;
SELECT '🔗 FOREIGN KEY RELATIONSHIPS' as section;
SELECT '========================================' as divider;

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
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('listings', 'wishes', 'tasks', 'conversations', 'messages', 'listing_images')
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- SUMMARY
-- =====================================================

SELECT '========================================' as divider;
SELECT '✅ READ-ONLY CHECK COMPLETE' as section;
SELECT '========================================' as divider;

SELECT 
    'Total Tables' as metric,
    COUNT(*)::text as value
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'Total Listings',
    COUNT(*)::text
FROM listings
UNION ALL
SELECT 
    'Total Wishes',
    COUNT(*)::text
FROM wishes
UNION ALL
SELECT 
    'Total Tasks',
    COUNT(*)::text
FROM tasks;

SELECT 'ℹ️  This was a read-only check. No changes were made to the database.' as note;

-- =====================================================
-- ✅ SAFE CHECK COMPLETE - NO MODIFICATIONS MADE
-- =====================================================
