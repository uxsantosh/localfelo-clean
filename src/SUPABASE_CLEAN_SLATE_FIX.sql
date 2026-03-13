-- =====================================================
-- CLEAN SLATE FIX FOR OLDCYCLE CHAT
-- This removes ALL conflicting policies and creates fresh ones
-- Run this in Supabase SQL Editor to fix the duplicate policy mess
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL EXISTING POLICIES (Clean Slate)
-- =====================================================

-- Drop ALL message policies (including duplicates)
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Drop ALL conversation policies
DROP POLICY IF EXISTS "Users can create conversations as buyer" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- =====================================================
-- STEP 2: CREATE FRESH POLICIES (Only 6 policies total)
-- =====================================================

-- ============ CONVERSATIONS TABLE (3 policies) ============

-- 1. INSERT: Users can create conversations as buyer
CREATE POLICY "Users can create conversations as buyer"
ON conversations
FOR INSERT
WITH CHECK (
  buyer_id::text = (auth.uid())::text
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

-- 2. SELECT: Users can view conversations where they are buyer or seller
CREATE POLICY "Users can view their own conversations"
ON conversations
FOR SELECT
USING (
  buyer_id::text = (auth.uid())::text
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
  OR seller_id::text = (auth.uid())::text
  OR seller_id::text IN (
    SELECT (auth_user_id)::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR seller_id::text IN (
    SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR seller_id::text IN (
    SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR seller_id::text IN (
    SELECT id::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
);

-- 3. UPDATE: Users can update conversations they're part of
CREATE POLICY "Users can update their conversations"
ON conversations
FOR UPDATE
USING (
  buyer_id::text = (auth.uid())::text
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
  OR seller_id::text = (auth.uid())::text
  OR seller_id::text IN (
    SELECT (auth_user_id)::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR seller_id::text IN (
    SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR seller_id::text IN (
    SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR seller_id::text IN (
    SELECT id::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
);

-- ============ MESSAGES TABLE (3 policies) ============

-- 4. INSERT: Users can send messages in their conversations
CREATE POLICY "Users can insert messages in their conversations"
ON messages
FOR INSERT
WITH CHECK (
  sender_id::text = (auth.uid())::text
  OR sender_id::text IN (
    SELECT (auth_user_id)::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR sender_id::text IN (
    SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR sender_id::text IN (
    SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
  OR sender_id::text IN (
    SELECT id::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
  )
);

-- 5. SELECT: Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
ON messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      conversations.buyer_id::text = (auth.uid())::text
      OR conversations.buyer_id::text IN (
        SELECT (auth_user_id)::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.buyer_id::text IN (
        SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.buyer_id::text IN (
        SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.buyer_id::text IN (
        SELECT id::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.seller_id::text = (auth.uid())::text
      OR conversations.seller_id::text IN (
        SELECT (auth_user_id)::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.seller_id::text IN (
        SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.seller_id::text IN (
        SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.seller_id::text IN (
        SELECT id::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
    )
  )
);

-- 6. UPDATE: Users can update messages they received (mark as read)
CREATE POLICY "Users can update messages they received"
ON messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      conversations.buyer_id::text = (auth.uid())::text
      OR conversations.buyer_id::text IN (
        SELECT (auth_user_id)::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.buyer_id::text IN (
        SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.buyer_id::text IN (
        SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.buyer_id::text IN (
        SELECT id::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.seller_id::text = (auth.uid())::text
      OR conversations.seller_id::text IN (
        SELECT (auth_user_id)::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.seller_id::text IN (
        SELECT client_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.seller_id::text IN (
        SELECT owner_token::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
      OR conversations.seller_id::text IN (
        SELECT id::text FROM profiles WHERE (auth_user_id)::text = (auth.uid())::text
      )
    )
  )
);

-- =====================================================
-- STEP 3: VERIFY POLICIES ARE CREATED CORRECTLY
-- =====================================================

-- Check conversations policies (should show exactly 3 rows)
SELECT 
  tablename, 
  policyname, 
  cmd
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY policyname;

-- Check messages policies (should show exactly 3 rows)
SELECT 
  tablename, 
  policyname, 
  cmd
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- =====================================================
-- SUCCESS! 
-- You should see EXACTLY 6 policies total:
--   - 3 for conversations (INSERT, SELECT, UPDATE)
--   - 3 for messages (INSERT, SELECT, UPDATE)
-- 
-- Now test your chat - messages should work!
-- =====================================================
