-- =====================================================
-- FIX CONVERSATIONS RLS POLICIES
-- Issue: Old policies may reference c.user_id which doesn't exist
-- Solution: Drop all old policies and recreate with correct column names
-- =====================================================

-- Drop all existing policies on conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations as buyer" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all conversations read" ON conversations;
DROP POLICY IF EXISTS "Allow all conversations insert" ON conversations;
DROP POLICY IF EXISTS "Allow all conversations update" ON conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;

-- Drop all existing policies on messages  
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;
DROP POLICY IF EXISTS "Allow all messages read" ON messages;
DROP POLICY IF EXISTS "Allow all messages insert" ON messages;
DROP POLICY IF EXISTS "Allow all messages update" ON messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;

-- =====================================================
-- RECREATE CORRECT RLS POLICIES FOR CONVERSATIONS
-- =====================================================

-- Allow users to view conversations where they are buyer OR seller
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (
    buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
  );

-- Allow anyone to create conversations (we validate on app side)
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update conversations they're part of
CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  USING (
    buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
  );

-- Allow admins to view all conversations (read-only)
CREATE POLICY "Admins can view all conversations"
  ON conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- RECREATE CORRECT RLS POLICIES FOR MESSAGES
-- =====================================================

-- Allow users to view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
         OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    )
  );

-- Allow users to create messages in their conversations
CREATE POLICY "Users can create messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
         OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    )
  );

-- Allow users to update messages they received (for marking as read)
CREATE POLICY "Users can update messages they received"
  ON messages
  FOR UPDATE
  USING (
    sender_id != (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    AND conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
         OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    )
  );

-- Allow admins to view all messages (read-only)
CREATE POLICY "Admins can view all messages"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

-- Show all policies on conversations
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY policyname;

-- Show all policies on messages
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;
