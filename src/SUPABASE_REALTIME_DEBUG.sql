-- =====================================================
-- DEBUG SUPABASE REALTIME SETUP
-- Run this to check if realtime is properly configured
-- =====================================================

-- 1. Check if realtime is enabled on tables
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Expected to see:
-- public | conversations | supabase_realtime
-- public | messages      | supabase_realtime
-- (If you DON'T see messages and conversations, realtime is NOT enabled!)

-- =====================================================

-- 2. Check RLS policies on messages table
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY cmd, policyname;

-- Should show 3 policies:
-- messages | Users can insert messages in their... | INSERT
-- messages | Users can view messages in their...   | SELECT
-- messages | Users can update messages they received | UPDATE

-- =====================================================

-- 3. Check RLS policies on conversations table
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY cmd, policyname;

-- Should show 3 policies:
-- conversations | Users can create conversations as buyer | INSERT
-- conversations | Users can view their own conversations  | SELECT
-- conversations | Users can update their conversations    | UPDATE

-- =====================================================

-- 4. Check if RLS is enabled on both tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('messages', 'conversations')
ORDER BY tablename;

-- Both should have rowsecurity = true

-- =====================================================

-- 5. Test message insertion manually
-- (Replace UUIDs with actual values from your database)
/*
INSERT INTO messages (conversation_id, sender_id, sender_name, content, read)
VALUES (
    'YOUR_CONVERSATION_ID_HERE',
    'YOUR_USER_ID_HERE',
    'Test User',
    'Test message from SQL',
    false
);
*/

-- =====================================================
-- SUMMARY OF WHAT TO CHECK:
-- =====================================================
-- ✅ Realtime enabled on messages and conversations tables
-- ✅ 6 total RLS policies (3 for messages, 3 for conversations)
-- ✅ RLS enabled on both tables (rowsecurity = true)
-- ✅ No duplicate policies
-- =====================================================
