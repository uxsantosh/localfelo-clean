-- =====================================================
-- QUICK FIX: DISABLE RLS ON CHAT TABLES
-- =====================================================
-- This is a simpler approach for testing/development
-- Run this in Supabase SQL Editor if the other fix doesn't work

-- Disable RLS on messages table
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Disable RLS on conversations table
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Ensure Realtime is enabled
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('messages', 'conversations');

-- Should show rowsecurity = false for both tables
