-- =====================================================
-- LOCALFELO CHAT FEATURE - COMPREHENSIVE CHECK & FIX
-- =====================================================
-- This script will:
-- 1. Check if chat tables exist
-- 2. Create them if they don't exist
-- 3. Add RLS policies
-- 4. Enable real-time
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop existing tables if they exist (OPTIONAL - use only if you want to start fresh)
-- UNCOMMENT THE LINES BELOW IF YOU WANT TO RESET EVERYTHING
-- DROP TABLE IF EXISTS public.messages CASCADE;
-- DROP TABLE IF EXISTS public.conversations CASCADE;

-- Step 2: Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Listing details
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  listing_image TEXT,
  listing_price NUMERIC,
  
  -- Buyer details
  buyer_id UUID NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_avatar TEXT,
  
  -- Seller details  
  seller_id UUID NOT NULL,
  seller_name TEXT NOT NULL,
  seller_avatar TEXT,
  
  -- Last message info
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at ASC);

-- Step 5: Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;

-- Step 7: Create RLS policies for conversations
-- Allow users to view conversations where they are buyer or seller
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (
    buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR buyer_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers')::json->>'x-client-token')
    OR seller_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers')::json->>'x-client-token')
  );

-- Allow users to create conversations
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (true); -- Allow anyone to create, we validate on app side

-- Allow users to update their conversations
CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  USING (
    buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR buyer_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers')::json->>'x-client-token')
    OR seller_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers')::json->>'x-client-token')
  );

-- Step 8: Create RLS policies for messages
-- Allow users to view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR buyer_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers')::json->>'x-client-token')
         OR seller_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers')::json->>'x-client-token')
    )
  );

-- Allow users to create messages in their conversations
CREATE POLICY "Users can create messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR buyer_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers')::json->>'x-client-token')
         OR seller_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers')::json->>'x-client-token')
    )
  );

-- Allow users to update messages they received (for marking as read)
CREATE POLICY "Users can update messages they received"
  ON messages
  FOR UPDATE
  USING (
    sender_id != (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR sender_id != (SELECT id FROM profiles WHERE client_token = current_setting('request.headers')::json->>'x-client-token')
  );

-- Step 9: Enable Realtime (optional, but recommended)
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Step 10: Add triggers to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify everything is set up correctly:

-- Check if tables exist
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages');

-- Check RLS status
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages');

-- Check policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages');

-- Check realtime status
SELECT 
  schemaname, 
  tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('conversations', 'messages');

-- =====================================================
-- DONE! 
-- Now test your chat feature
-- Visit /chat-test in your app to run diagnostics
-- =====================================================
