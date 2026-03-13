-- =====================================================
-- LOCALFELO CHAT - FINAL CHECK & VERIFICATION
-- =====================================================
-- This verifies your chat setup is complete
-- Run this to check the status
-- =====================================================

-- Check 1: Do tables exist?
SELECT 'Tables Check:' as check_type;
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages');

-- Check 2: Is RLS disabled (for testing)?
SELECT 'RLS Status:' as check_type;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages');

-- Check 3: Are tables in realtime publication?
SELECT 'Realtime Status:' as check_type;
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('conversations', 'messages');

-- Check 4: Count existing data
SELECT 'Data Count:' as check_type;
SELECT 
  (SELECT COUNT(*) FROM conversations) as conversation_count,
  (SELECT COUNT(*) FROM messages) as message_count;

-- =====================================================
-- RESULTS GUIDE:
-- =====================================================
-- ✅ Tables exist: conversations, messages
-- ✅ RLS disabled: rowsecurity = false
-- ✅ Realtime enabled: both tables listed
-- ✅ Ready to test!
-- =====================================================
