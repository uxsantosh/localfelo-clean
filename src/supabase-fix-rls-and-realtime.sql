-- =====================================================
-- COMPLETE FIX FOR REALTIME CHAT
-- =====================================================

-- Step 1: Drop ALL existing policies on messages table
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Allow users to view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Allow users to insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Allow users to update read status in their conversations" ON messages;

-- Step 2: Set replica identity to FULL (required for Realtime)
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Step 3: Enable Realtime on tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Step 4: Create SIMPLE, PERMISSIVE RLS policies for messages
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

-- Step 5: Verify setup
SELECT 
  'messages' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'messages'
GROUP BY tablename;

SELECT 
  c.relname as table_name,
  CASE c.relreplident
    WHEN 'd' THEN 'default (BAD - needs FULL)'
    WHEN 'f' THEN 'full (GOOD)'
    WHEN 'n' THEN 'nothing'
    WHEN 'i' THEN 'index'
  END as replica_identity_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('messages', 'conversations')
  AND c.relkind = 'r';

-- Success message
SELECT '✅ RLS policies updated, replica identity set to FULL, Realtime enabled' as status;
