-- =====================================================
-- URGENT: FIX ALL RLS POLICIES - DROP EVERYTHING AND RECREATE
-- =====================================================
-- Issue: Multiple old policies with wrong column names:
--   - c.user_id (doesn't exist)
--   - c.user1_id (doesn't exist)
--   - c.user2_id (doesn't exist)
-- Correct columns: buyer_id, seller_id
-- =====================================================

-- STEP 1: Disable RLS temporarily to clean up
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL policies (use force drop to ignore errors)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on conversations
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversations') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON conversations', r.policyname);
    END LOOP;
    
    -- Drop all policies on messages
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'messages') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON messages', r.policyname);
    END LOOP;
END $$;

-- STEP 3: Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: CREATE CORRECT RLS POLICIES
-- =====================================================

-- CONVERSATIONS POLICIES
-- =====================================================

-- Allow users to view conversations where they are buyer OR seller
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (
    buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
  );

-- Allow anyone to create conversations (app validates)
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

-- Allow admins to view all conversations
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

-- MESSAGES POLICIES
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

-- Allow users to update messages they received (for read status)
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

-- Allow admins to view all messages
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
-- STEP 5: VERIFY - Show all current policies
-- =====================================================

SELECT 
  '=== CONVERSATIONS POLICIES ===' as info,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'HAS USING CLAUSE'
    ELSE 'NO USING CLAUSE'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'HAS WITH CHECK'
    ELSE 'NO WITH CHECK'
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY policyname;

SELECT 
  '=== MESSAGES POLICIES ===' as info,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'HAS USING CLAUSE'
    ELSE 'NO USING CLAUSE'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'HAS WITH CHECK'
    ELSE 'NO WITH CHECK'
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- =====================================================
-- DONE! Chat should work now.
-- =====================================================
