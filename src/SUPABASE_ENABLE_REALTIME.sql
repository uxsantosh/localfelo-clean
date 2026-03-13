-- =====================================================
-- ENABLE REALTIME ON MESSAGES AND CONVERSATIONS TABLES
-- This is required for real-time subscriptions to work!
-- =====================================================

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for conversations table  
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Verify realtime is enabled
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
    AND tablename IN ('messages', 'conversations')
ORDER BY tablename;

-- Should show 2 rows:
-- public | conversations | supabase_realtime
-- public | messages      | supabase_realtime

-- =====================================================
-- If you get an error "relation already exists in publication"
-- it means realtime is already enabled - that's GOOD!
-- =====================================================
