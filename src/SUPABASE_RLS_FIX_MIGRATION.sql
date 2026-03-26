-- =====================================================
-- SUPABASE RLS FIX MIGRATION FOR OLDCYCLE CHAT
-- Run this in your Supabase SQL Editor to fix ALL chat RLS issues
-- This fixes:
--   1. "new row violates row-level security policy" for conversations
--   2. Messages not being delivered (blocked by RLS)
--   3. Messages not visible to users
-- =====================================================

-- =====================================================
-- STEP 1: FIX CONVERSATIONS TABLE POLICIES
-- =====================================================

-- Drop old conversation policies
DROP POLICY IF EXISTS "Users can create conversations as buyer" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- Create improved conversation INSERT policy (handles all user ID formats)
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

-- Create conversation SELECT policy (view conversations where user is buyer or seller)
CREATE POLICY "Users can view their own conversations"
ON conversations
FOR SELECT
USING (
  -- User is the buyer
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
  -- OR user is the seller
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

-- Create conversation UPDATE policy (update last_message, etc.)
CREATE POLICY "Users can update their conversations"
ON conversations
FOR UPDATE
USING (
  -- Same logic as SELECT - user must be buyer or seller
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

-- =====================================================
-- STEP 2: FIX MESSAGES TABLE POLICIES
-- =====================================================

-- Drop old message policies if they exist
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;

-- Create message INSERT policy (users can send messages in conversations they're part of)
CREATE POLICY "Users can insert messages in their conversations"
ON messages
FOR INSERT
WITH CHECK (
  -- User must be sender
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

-- Create message SELECT policy (users can view messages in their conversations)
CREATE POLICY "Users can view messages in their conversations"
ON messages
FOR SELECT
USING (
  -- Message is in a conversation where user is buyer or seller
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      -- User is buyer
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
      -- OR user is seller
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

-- Create message UPDATE policy (users can mark messages as read)
CREATE POLICY "Users can update messages they received"
ON messages
FOR UPDATE
USING (
  -- Message is in a conversation where user is buyer or seller (not the sender)
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      -- User is buyer
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
      -- OR user is seller
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
-- STEP 3: VERIFY POLICIES WERE CREATED
-- =====================================================

-- Check conversations policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY policyname;

-- Check messages policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- =====================================================
-- SUCCESS! 
-- You should see 3 policies for conversations and 3 for messages
-- Now try sending messages in OldCycle - they should work!
-- =====================================================
