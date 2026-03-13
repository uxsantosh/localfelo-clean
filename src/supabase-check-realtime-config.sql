-- =====================================================
-- COMPREHENSIVE REALTIME DIAGNOSTIC
-- =====================================================

-- 1. Check RLS status
SELECT 
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  CASE c.relreplident
    WHEN 'd' THEN 'default'
    WHEN 'f' THEN 'full'
    WHEN 'n' THEN 'nothing'
    WHEN 'i' THEN 'index'
  END as replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('messages', 'conversations')
  AND c.relkind = 'r'
ORDER BY c.relname;

-- 2. Check publication configuration
SELECT 
  pubname,
  puballtables,
  pubinsert,
  pubupdate,
  pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- 3. Check which tables are in the publication
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 4. Check if there are any RLS policies still active
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename IN ('messages', 'conversations')
ORDER BY tablename, policyname;

-- 5. Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE ON messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON conversations TO anon, authenticated;

-- 6. Ensure sequences are accessible
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

SELECT '✅ Diagnostic complete - check results above' as status;
