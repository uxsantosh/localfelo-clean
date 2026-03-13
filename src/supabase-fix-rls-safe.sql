-- =====================================================
-- SAFE FIX FOR REALTIME CHAT (No duplicates)
-- =====================================================

-- Step 1: Drop ALL existing policies on messages table
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Allow users to view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Allow users to insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Allow users to update read status in their conversations" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;

-- Step 2: Set replica identity to FULL (CRITICAL for Realtime)
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Step 3: Create SIMPLE, PERMISSIVE RLS policies for messages
-- Policy 1: SELECT - Allow users to see messages where they are buyer OR seller
CREATE POLICY "messages_select_policy" ON messages
FOR SELECT
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (
      c.buyer_id = auth.uid()::text OR 
      c.seller_id = auth.uid()::text OR
      c.buyer_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
      c.seller_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
);

-- Policy 2: INSERT - Allow users to insert messages in their conversations
CREATE POLICY "messages_insert_policy" ON messages
FOR INSERT
TO authenticated, anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (
      c.buyer_id = auth.uid()::text OR 
      c.seller_id = auth.uid()::text OR
      c.buyer_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
      c.seller_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
);

-- Policy 3: UPDATE - Allow users to update read status of messages in their conversations
CREATE POLICY "messages_update_policy" ON messages
FOR UPDATE
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (
      c.buyer_id = auth.uid()::text OR 
      c.seller_id = auth.uid()::text OR
      c.buyer_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
      c.seller_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (
      c.buyer_id = auth.uid()::text OR 
      c.seller_id = auth.uid()::text OR
      c.buyer_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
      c.seller_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
);

-- Step 4: Verify setup
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

SELECT 
  c.relname as table_name,
  CASE c.relreplident
    WHEN 'd' THEN 'default (❌ BAD - Realtime will fail)'
    WHEN 'f' THEN 'full (✅ GOOD - Realtime enabled)'
    WHEN 'n' THEN 'nothing'
    WHEN 'i' THEN 'index'
  END as replica_identity_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('messages', 'conversations')
  AND c.relkind = 'r'
ORDER BY c.relname;

-- Check if tables are in publication (should already be there)
SELECT 
  schemaname,
  tablename,
  '✅ In supabase_realtime publication' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('messages', 'conversations')
ORDER BY tablename;
