-- =====================================================
-- DEBUG SCRIPT - Check Supabase Realtime Configuration
-- =====================================================

-- 1. Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename IN ('messages', 'conversations');

-- 2. Check all current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as "Command",
  qual as "USING clause",
  with_check as "WITH CHECK clause"
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations')
ORDER BY tablename, cmd;

-- 3. Check if tables are in Realtime publication
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversations');

-- 4. Check replica identity
SELECT 
  c.relname as "Table",
  CASE c.relreplident
    WHEN 'd' THEN 'default'
    WHEN 'n' THEN 'nothing'
    WHEN 'f' THEN 'full'
    WHEN 'i' THEN 'index'
  END as "Replica Identity"
FROM pg_class c
WHERE c.relname IN ('messages', 'conversations');

-- 5. Sample some actual messages to verify data exists
SELECT 
  id,
  conversation_id,
  sender_name,
  LEFT(content, 50) as content_preview,
  read,
  created_at
FROM messages
ORDER BY created_at DESC
LIMIT 5;

-- 6. Check for any active Realtime subscriptions (this requires elevated permissions)
-- SELECT * FROM pg_stat_subscription;
