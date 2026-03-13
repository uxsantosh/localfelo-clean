-- =====================================================
-- FIX BOTH TABLES - Set replica identity to FULL
-- =====================================================

-- Set replica identity to FULL for BOTH tables
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Verify BOTH tables are set correctly
SELECT 
  relname as table_name,
  CASE relreplident
    WHEN 'd' THEN 'default'
    WHEN 'f' THEN 'full ✅'
  END as replica_identity
FROM pg_class 
WHERE relname IN ('messages', 'conversations')
ORDER BY relname;

-- Check if BOTH are in realtime publication
SELECT 
  tablename,
  'in realtime ✅' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversations')
ORDER BY tablename;
