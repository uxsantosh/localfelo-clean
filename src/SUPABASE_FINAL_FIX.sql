-- =====================================================
-- FINAL FIX - Remove ALL duplicate conversation policies
-- Messages policies are correct, so we keep those
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL CONVERSATION POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can create conversations as buyer" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;

-- =====================================================
-- STEP 2: CREATE ONLY 3 CONVERSATION POLICIES
-- =====================================================

-- Policy 1: INSERT
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

-- Policy 2: SELECT
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

-- Policy 3: UPDATE
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
-- STEP 3: VERIFY FINAL STATE
-- =====================================================

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
GROUP BY tablename
ORDER BY tablename;

-- Should show:
-- conversations | 3
-- messages      | 3

-- List all policies
SELECT 
  tablename, 
  policyname, 
  cmd
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, cmd, policyname;

-- Should show EXACTLY 6 rows:
-- conversations | Users can create conversations as buyer | INSERT
-- conversations | Users can view their own conversations  | SELECT
-- conversations | Users can update their conversations    | UPDATE
-- messages      | Users can insert messages in their...   | INSERT
-- messages      | Users can view messages in their...     | SELECT
-- messages      | Users can update messages they received | UPDATE
