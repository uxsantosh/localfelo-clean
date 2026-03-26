-- ============================================
-- SUPABASE REALTIME FIX - RUN THIS IN SQL EDITOR
-- ============================================

-- 1. ENABLE RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2. DROP all existing policies (clean slate)
DROP POLICY IF EXISTS "Enable read for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;

-- 3. CREATE PERMISSIVE POLICIES (allow all authenticated users)
-- This works with soft-auth because Supabase considers anon key as "authenticated"

-- Allow SELECT: Anyone can read messages
CREATE POLICY "messages_select_policy" ON messages
FOR SELECT
USING (true);

-- Allow INSERT: Anyone can insert messages
CREATE POLICY "messages_insert_policy" ON messages
FOR INSERT
WITH CHECK (true);

-- Allow UPDATE: Anyone can update messages (for marking as read)
CREATE POLICY "messages_update_policy" ON messages
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 4. ENABLE RLS on conversations table and add policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "conversations_select_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_update_policy" ON conversations;

-- Allow SELECT: Anyone can read conversations
CREATE POLICY "conversations_select_policy" ON conversations
FOR SELECT
USING (true);

-- Allow INSERT: Anyone can create conversations
CREATE POLICY "conversations_insert_policy" ON conversations
FOR INSERT
WITH CHECK (true);

-- Allow UPDATE: Anyone can update conversations
CREATE POLICY "conversations_update_policy" ON conversations
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 5. ENABLE REALTIME for conversations table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- 6. VERIFY SETUP
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('messages', 'conversations')
ORDER BY tablename, policyname;
