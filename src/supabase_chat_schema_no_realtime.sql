-- =====================================================
-- OldCycle Chat Feature - Database Schema
-- =====================================================
-- This file contains the SQL schema for the chat feature.
-- Run this in your Supabase SQL Editor to create the required tables.
-- (Version without Realtime publication - for when tables already exist)
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

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
-- Users can see conversations where they are either buyer or seller
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    buyer_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
    seller_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
    buyer_id::text = auth.uid()::text OR
    seller_id::text = auth.uid()::text
  );

-- Users can create conversations (as buyer)
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    buyer_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
    buyer_id::text = auth.uid()::text
  );

-- Users can update conversations they're part of
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (
    buyer_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
    seller_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
    buyer_id::text = auth.uid()::text OR
    seller_id::text = auth.uid()::text
  );

-- RLS Policies for messages
-- Users can view messages in their conversations
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.buyer_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
        conversations.seller_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
        conversations.buyer_id::text = auth.uid()::text OR
        conversations.seller_id::text = auth.uid()::text
      )
    )
  );

-- Users can send messages in their conversations
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.buyer_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
        conversations.seller_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
        conversations.buyer_id::text = auth.uid()::text OR
        conversations.seller_id::text = auth.uid()::text
      )
    )
  );

-- Users can update messages (for marking as read)
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;
CREATE POLICY "Users can update messages in their conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.buyer_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
        conversations.seller_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
        conversations.buyer_id::text = auth.uid()::text OR
        conversations.seller_id::text = auth.uid()::text
      )
    )
  );

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
-- DONE! Your chat tables are ready.
-- Realtime is already enabled from previous setup.
-- =====================================================
