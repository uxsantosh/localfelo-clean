-- =====================================================
-- 🔥 ULTIMATE FIX - Explicit Casts Everywhere
-- =====================================================
-- LocalFelo uses ONLY client_token authentication
-- This version has explicit type casts on EVERY comparison
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

-- STEP 4: Create NEW policies with EXPLICIT CASTS
-- =====================================================

-- CONVERSATIONS POLICIES
-- =====================================================

-- View: Users can view conversations they're part of
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (
    buyer_id::text IN (
      SELECT id::text FROM profiles 
      WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
    )
    OR seller_id::text IN (
      SELECT id::text FROM profiles 
      WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
    )
  );

-- Create: Allow authenticated users to create conversations
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (
    buyer_id::text IN (
      SELECT id::text FROM profiles 
      WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
    )
  );

-- Update: Users can update their own conversations
CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  USING (
    buyer_id::text IN (
      SELECT id::text FROM profiles 
      WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
    )
    OR seller_id::text IN (
      SELECT id::text FROM profiles 
      WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
    )
  );

-- MESSAGES POLICIES
-- =====================================================

-- View: Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    conversation_id::text IN (
      SELECT id::text FROM conversations 
      WHERE buyer_id::text IN (
        SELECT id::text FROM profiles 
        WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
      )
      OR seller_id::text IN (
        SELECT id::text FROM profiles 
        WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
      )
    )
  );

-- Create: Users can create messages in their conversations
CREATE POLICY "Users can create messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    conversation_id::text IN (
      SELECT id::text FROM conversations 
      WHERE buyer_id::text IN (
        SELECT id::text FROM profiles 
        WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
      )
      OR seller_id::text IN (
        SELECT id::text FROM profiles 
        WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
      )
    )
  );

-- Update: Users can update messages they received (mark as read)
CREATE POLICY "Users can update messages they received"
  ON messages
  FOR UPDATE
  USING (
    -- Not the sender
    sender_id::text NOT IN (
      SELECT id::text FROM profiles 
      WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
    )
    -- And in their conversation
    AND conversation_id::text IN (
      SELECT id::text FROM conversations 
      WHERE buyer_id::text IN (
        SELECT id::text FROM profiles 
        WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
      )
      OR seller_id::text IN (
        SELECT id::text FROM profiles 
        WHERE client_token::text = (current_setting('request.headers', true)::json->>'x-client-token')::text
      )
    )
  );

-- STEP 5: Verify
-- =====================================================

SELECT 
  '✅ CONVERSATIONS POLICIES:' as status,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'conversations';

SELECT 
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY policyname;

SELECT 
  '✅ MESSAGES POLICIES:' as status,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'messages';

SELECT 
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- =====================================================
-- ✅ DONE! All comparisons use explicit ::text casts
-- This should eliminate any "text = uuid" errors
-- =====================================================
