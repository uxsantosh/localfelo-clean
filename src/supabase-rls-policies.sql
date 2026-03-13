-- =====================================================
-- RLS POLICIES FOR OLDCYCLE CHAT SYSTEM
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Enable RLS on conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CONVERSATIONS TABLE POLICIES
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations as buyer" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;

-- Policy: Users can only view conversations where they are buyer OR seller
CREATE POLICY "Users can view their own conversations"
ON conversations
FOR SELECT
USING (
  buyer_id::text = (auth.uid())::text 
  OR seller_id::text = (auth.uid())::text
  OR buyer_id::text IN (
    SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR seller_id::text IN (
    SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR buyer_id::text IN (
    SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR seller_id::text IN (
    SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
);

-- Policy: Users can create conversations as buyer
CREATE POLICY "Users can create conversations as buyer"
ON conversations
FOR INSERT
WITH CHECK (
  -- Allow if buyer_id matches auth.uid() directly
  buyer_id::text = (auth.uid())::text
  -- OR if buyer_id matches any user identifier from profiles table
  OR buyer_id::text IN (
    SELECT (auth_user_id)::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR buyer_id::text IN (
    SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR buyer_id::text IN (
    SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR buyer_id::text IN (
    SELECT id::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
);

-- Policy: Users can update conversations they're part of
CREATE POLICY "Users can update their own conversations"
ON conversations
FOR UPDATE
USING (
  buyer_id::text = (auth.uid())::text 
  OR seller_id::text = (auth.uid())::text
  OR buyer_id::text IN (
    SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR seller_id::text IN (
    SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR buyer_id::text IN (
    SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR seller_id::text IN (
    SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
);

-- =====================================================
-- MESSAGES TABLE POLICIES
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Policy: Users can only view messages in conversations they're part of
CREATE POLICY "Users can view messages in their conversations"
ON messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE buyer_id::text = (auth.uid())::text 
      OR seller_id::text = (auth.uid())::text
      OR buyer_id::text IN (
        SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR seller_id::text IN (
        SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR buyer_id::text IN (
        SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR seller_id::text IN (
        SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
  )
);

-- Policy: Users can send messages in conversations they're part of
CREATE POLICY "Users can send messages in their conversations"
ON messages
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE buyer_id::text = (auth.uid())::text 
      OR seller_id::text = (auth.uid())::text
      OR buyer_id::text IN (
        SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR seller_id::text IN (
        SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR buyer_id::text IN (
        SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR seller_id::text IN (
        SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
  )
  AND (
    sender_id::text = (auth.uid())::text
    OR sender_id::text IN (
      SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
    )
    OR sender_id::text IN (
      SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
    )
  )
);

-- Policy: Users can update (mark as read) messages in their conversations
CREATE POLICY "Users can update their own messages"
ON messages
FOR UPDATE
USING (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE buyer_id::text = (auth.uid())::text 
      OR seller_id::text = (auth.uid())::text
      OR buyer_id::text IN (
        SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR seller_id::text IN (
        SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR buyer_id::text IN (
        SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR seller_id::text IN (
        SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
  )
);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('conversations', 'messages');

-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('conversations', 'messages');