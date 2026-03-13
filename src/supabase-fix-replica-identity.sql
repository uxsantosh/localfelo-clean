-- =====================================================
-- FIX REPLICA IDENTITY FOR REALTIME
-- =====================================================
-- This is THE fix for real-time messages!

-- Set replica identity to FULL for messages table
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Verify it worked
SELECT 
  relname as table_name,
  CASE relreplident
    WHEN 'd' THEN 'default (not good for realtime)'
    WHEN 'f' THEN 'full (perfect for realtime!)'
  END as replica_identity_status
FROM pg_class 
WHERE relname IN ('messages', 'conversations');

-- Also verify messages are in the realtime publication
SELECT tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename = 'messages';
