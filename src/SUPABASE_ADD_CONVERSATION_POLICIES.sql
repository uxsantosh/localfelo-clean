-- =====================================================
-- FIX MISSING CONVERSATION POLICIES
-- You have messages policies but NO conversation policies!
-- This adds the 3 missing conversation policies
-- =====================================================

-- First, make sure RLS is enabled on conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP any old conversation policies (just in case)
-- =====================================================

DROP POLICY IF EXISTS "Users can create conversations as buyer" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations" ON conversations;

-- =====================================================
-- CREATE 3 CONVERSATION POLICIES
-- =====================================================

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

-- =====================================================
-- VERIFY ALL POLICIES
-- =====================================================

-- Check conversations policies (should show 3 rows now!)
SELECT 
  tablename, 
  policyname, 
  cmd
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY policyname;

-- Check messages policies (should show 3 rows as before)
SELECT 
  tablename, 
  policyname, 
  cmd
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- You should now see 6 TOTAL policies (3 + 3)
