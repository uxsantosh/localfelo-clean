-- =====================================================
-- CLEAN UP DUPLICATE POLICIES
-- =====================================================
-- You have duplicate policies. This will remove the old restrictive ones
-- and keep only the permissive ones needed for Realtime

-- =====================================================
-- DROP THE OLD RESTRICTIVE POLICIES
-- =====================================================

-- Drop the restrictive conversation policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- Drop the restrictive message policies  
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;


-- =====================================================
-- VERIFY - Should show only the permissive policies
-- =====================================================

SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations')
ORDER BY tablename, cmd;

-- Expected result (6 policies total):
-- conversations | Allow all users to create conversations | INSERT
-- conversations | Allow all users to update conversations | UPDATE  
-- conversations | Allow all users to view all conversations | SELECT
-- messages | Allow all users to insert messages | INSERT
-- messages | Allow all users to update messages | UPDATE
-- messages | Allow all users to view all messages | SELECT
