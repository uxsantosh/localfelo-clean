-- =====================================================
-- LOCALFELO CHAT FEATURE - SIMPLE SETUP (NO PROFILES TABLE)
-- =====================================================
-- This script creates the chat tables WITHOUT profiles dependency
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create conversations table
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

-- Step 2: Create messages table
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

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at ASC);

-- Step 4: Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all conversations read" ON conversations;
DROP POLICY IF EXISTS "Allow all conversations insert" ON conversations;
DROP POLICY IF EXISTS "Allow all conversations update" ON conversations;
DROP POLICY IF EXISTS "Allow all messages read" ON messages;
DROP POLICY IF EXISTS "Allow all messages insert" ON messages;
DROP POLICY IF EXISTS "Allow all messages update" ON messages;

-- Step 6: Create PERMISSIVE RLS policies (for testing)
-- Note: In production, you should tighten these policies

-- Allow anyone to read conversations (we filter on client side)
CREATE POLICY "Allow all conversations read"
  ON conversations
  FOR SELECT
  USING (true);

-- Allow anyone to create conversations
CREATE POLICY "Allow all conversations insert"
  ON conversations
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update conversations
CREATE POLICY "Allow all conversations update"
  ON conversations
  FOR UPDATE
  USING (true);

-- Allow anyone to read messages
CREATE POLICY "Allow all messages read"
  ON messages
  FOR SELECT
  USING (true);

-- Allow anyone to insert messages
CREATE POLICY "Allow all messages insert"
  ON messages
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update messages (for marking as read)
CREATE POLICY "Allow all messages update"
  ON messages
  FOR UPDATE
  USING (true);

-- Step 7: Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Step 8: Add triggers to update updated_at
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

-- =====================================================
-- SUCCESS! 
-- Now test at /chat-test
-- =====================================================
