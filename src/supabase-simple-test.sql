-- =====================================================
-- SIMPLE TEST - Just check the basics
-- =====================================================

-- 1. How many messages exist?
SELECT COUNT(*) as total_messages FROM messages;

-- 2. Show policies (simplified view)
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations')
ORDER BY tablename, cmd;

-- 3. Are tables in Realtime?
SELECT tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversations');

-- 4. What's the replica identity?
SELECT 
  relname as table_name,
  CASE relreplident
    WHEN 'd' THEN 'default (not good for realtime)'
    WHEN 'f' THEN 'full (perfect for realtime!)'
  END as replica_identity_status
FROM pg_class 
WHERE relname IN ('messages', 'conversations');
