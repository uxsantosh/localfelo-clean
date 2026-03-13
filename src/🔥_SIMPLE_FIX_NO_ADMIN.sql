-- =====================================================
-- 🔥 SIMPLE FIX - Client Token Only (No Admin Checks)
-- =====================================================
-- LocalFelo uses ONLY client_token authentication
-- This version excludes admin policies to avoid any errors
-- =====================================================

-- STEP 1: Disable RLS temporarily
-- =====================================================

ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL old policies
-- =====================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversations') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON conversations', r.policyname);
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'messages') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON messages', r.policyname);
    END LOOP;
END $$;

-- STEP 3: Re-enable RLS
-- =====================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create NEW policies - CLIENT TOKEN ONLY
-- =====================================================

-- CONVERSATIONS POLICIES
-- =====================================================

-- View: Users can view conversations they're part of
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (
    buyer_id IN (
      SELECT id FROM profiles 
      WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
    )
    OR seller_id IN (
      SELECT id FROM profiles 
      WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
    )
  );

-- Create: Allow authenticated users to create conversations
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (
    buyer_id IN (
      SELECT id FROM profiles 
      WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
    )
  );

-- Update: Users can update their own conversations
CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  USING (
    buyer_id IN (
      SELECT id FROM profiles 
      WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
    )
    OR seller_id IN (
      SELECT id FROM profiles 
      WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
    )
  );

-- MESSAGES POLICIES
-- =====================================================

-- View: Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id IN (
        SELECT id FROM profiles 
        WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
      )
      OR seller_id IN (
        SELECT id FROM profiles 
        WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
      )
    )
  );

-- Create: Users can create messages in their conversations
CREATE POLICY "Users can create messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id IN (
        SELECT id FROM profiles 
        WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
      )
      OR seller_id IN (
        SELECT id FROM profiles 
        WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
      )
    )
  );

-- Update: Users can update messages they received (mark as read)
CREATE POLICY "Users can update messages they received"
  ON messages
  FOR UPDATE
  USING (
    -- Not the sender
    sender_id NOT IN (
      SELECT id FROM profiles 
      WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
    )
    -- And in their conversation
    AND conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id IN (
        SELECT id FROM profiles 
        WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
      )
      OR seller_id IN (
        SELECT id FROM profiles 
        WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'
      )
    )
  );

-- STEP 5: Verify
-- =====================================================

SELECT 
  '✅ CONVERSATIONS POLICIES:' as info,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY policyname;

SELECT 
  '✅ MESSAGES POLICIES:' as info,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- STEP 6: Verify schema
-- =====================================================

SELECT 
  '✅ VERIFY PROFILES SCHEMA:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('id', 'client_token')
ORDER BY column_name;

SELECT 
  '✅ VERIFY CONVERSATIONS SCHEMA:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'conversations' 
  AND column_name IN ('id', 'buyer_id', 'seller_id')
ORDER BY column_name;

-- =====================================================
-- ✅ DONE! Chat should work with client token auth.
-- Simple version without admin policies.
-- =====================================================
