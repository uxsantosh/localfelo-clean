-- =====================================================
-- CHAT FEATURE VERIFICATION SCRIPT
-- =====================================================
-- Run this AFTER running CHAT_SUPABASE_RESET.sql to verify everything works

-- =====================================================
-- 1. CHECK TABLES EXIST
-- =====================================================
SELECT 
  'Tables exist:' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages');

-- =====================================================
-- 2. CHECK RLS IS ENABLED
-- =====================================================
SELECT 
  'RLS enabled:' as check_type,
  tablename,
  rowsecurity as enabled,
  CASE 
    WHEN rowsecurity = true THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages');

-- =====================================================
-- 3. CHECK POLICIES EXIST
-- =====================================================
SELECT 
  'RLS Policies:' as check_type,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages')
GROUP BY tablename;

-- =====================================================
-- 4. LIST ALL POLICIES (FOR DEBUGGING)
-- =====================================================
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN permissive = 'PERMISSIVE' THEN '✅ PERMISSIVE'
    ELSE '⚠️ RESTRICTIVE'
  END as type
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages')
ORDER BY tablename, cmd, policyname;

-- =====================================================
-- 5. CHECK INDEXES
-- =====================================================
SELECT 
  'Indexes:' as check_type,
  tablename,
  indexname,
  '✅ EXISTS' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages')
ORDER BY tablename, indexname;

-- =====================================================
-- 6. CHECK REALTIME IS ENABLED
-- =====================================================
SELECT 
  'Realtime enabled:' as check_type,
  tablename,
  CASE 
    WHEN tablename IN (
      SELECT tablename 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime'
    ) THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
FROM (
  VALUES ('conversations'), ('messages')
) AS t(tablename);

-- =====================================================
-- 7. CHECK TABLE STRUCTURE
-- =====================================================
SELECT 
  'conversations columns:' as check_type,
  column_name,
  data_type,
  CASE 
    WHEN is_nullable = 'NO' THEN 'NOT NULL'
    ELSE 'NULLABLE'
  END as nullable,
  '✅' as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'conversations'
ORDER BY ordinal_position;

SELECT 
  'messages columns:' as check_type,
  column_name,
  data_type,
  CASE 
    WHEN is_nullable = 'NO' THEN 'NOT NULL'
    ELSE 'NULLABLE'
  END as nullable,
  '✅' as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'messages'
ORDER BY ordinal_position;

-- =====================================================
-- 8. FINAL SUMMARY
-- =====================================================
SELECT 
  '═══════════════════════════════════════' as separator,
  'VERIFICATION COMPLETE' as message,
  'Check all statuses above for ✅ PASS' as instruction;
