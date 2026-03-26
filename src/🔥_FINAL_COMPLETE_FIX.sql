-- =====================================================
-- 🔥 FINAL COMPLETE FIX - Chat Errors
-- =====================================================
-- This fixes ALL instances of user1_id/user2_id references
-- =====================================================

-- STEP 1: Fix the admin function that references user1_id/user2_id
-- =====================================================

DROP FUNCTION IF EXISTS get_user_activity_summary(TEXT);

CREATE OR REPLACE FUNCTION get_user_activity_summary(user_id_param TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_listings', (SELECT COUNT(*) FROM listings WHERE user_id = user_id_param),
    'total_tasks_created', (SELECT COUNT(*) FROM tasks WHERE user_id = user_id_param),
    'total_tasks_accepted', (SELECT COUNT(*) FROM tasks WHERE helper_id = user_id_param),
    'total_wishes', (SELECT COUNT(*) FROM wishes WHERE user_id = user_id_param),
    'total_reports_filed', (SELECT COUNT(*) FROM task_wish_reports WHERE reporter_id = user_id_param),
    'total_reports_against', (SELECT COUNT(*) FROM task_wish_reports WHERE reported_user_id = user_id_param),
    'total_conversations', (SELECT COUNT(*) FROM conversations WHERE buyer_id = user_id_param OR seller_id = user_id_param)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Disable RLS temporarily
-- =====================================================

ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- STEP 3: Drop ALL old policies
-- =====================================================

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

-- STEP 4: Re-enable RLS
-- =====================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create correct policies
-- =====================================================

-- CONVERSATIONS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (
    buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
  );

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  USING (
    buyer_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
    OR seller_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())::TEXT
  );

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

-- STEP 6: Verify - Show what we created
-- =====================================================

SELECT 
  '=== CONVERSATIONS POLICIES ===' as info,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY policyname;

SELECT 
  '=== MESSAGES POLICIES ===' as info,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- =====================================================
-- ✅ DONE! Chat should work now.
-- =====================================================
