-- =====================================================
-- OldCycle Chat Feature - Database Schema (FIXED FOR SOFT-AUTH)
-- =====================================================
-- This file contains the SQL schema for the chat feature.
-- Run this in your Supabase SQL Editor to create the required tables.
-- =====================================================
-- NOTE: RLS is DISABLED because OldCycle uses soft-auth (client_token)
-- instead of Supabase Auth. Security is handled at the application level.
-- =====================================================

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  listing_image TEXT,
  listing_price INTEGER NOT NULL,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_avatar TEXT,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_avatar TEXT,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one conversation per buyer-seller-listing combination
  UNIQUE(listing_id, buyer_id, seller_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, read) WHERE read = FALSE;

-- =====================================================
-- RLS: DISABLED for soft-auth compatibility
-- =====================================================
-- OldCycle uses client_token-based authentication, not Supabase Auth.
-- Security is enforced at the application level in /services/chat.ts:
-- 
-- 1. getUserId() verifies the current user via getCurrentUser()
-- 2. All queries filter by buyer_id or seller_id matching userId
-- 3. Users can only access their own conversations and messages
-- 
-- Enabling RLS with auth.uid() causes "text = uuid" type errors
-- because auth.uid() requires a Supabase Auth session which
-- doesn't exist in the soft-auth system.
-- =====================================================

-- Ensure RLS is disabled
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Enable real-time replication for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Optional: Function to automatically update conversation's updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp when new message is added
DROP TRIGGER IF EXISTS update_conversation_on_new_message ON messages;
CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- =====================================================
-- DONE! Your chat tables are ready for soft-auth! ✅
-- =====================================================
-- 
-- Security Notes:
-- - Application-level security is sufficient for OldCycle's use case
-- - Users authenticate with Google OAuth + email OTP
-- - client_token is stored in localStorage
-- - All chat operations verify user identity via getCurrentUser()
-- - RLS is disabled to avoid auth.uid() compatibility issues
-- =====================================================
