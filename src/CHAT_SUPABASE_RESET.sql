-- =====================================================
-- OLDCYCLE CHAT FEATURE - COMPLETE RESET & REBUILD
-- =====================================================
-- Run this in Supabase SQL Editor to completely reset chat tables
-- This will NOT affect other tables (profiles, listings, etc.)

-- =====================================================
-- STEP 1: DROP EXISTING CHAT TABLES
-- =====================================================

-- Drop existing tables (cascades will remove triggers, policies, etc.)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- =====================================================
-- STEP 2: CREATE CONVERSATIONS TABLE
-- =====================================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Listing info
  listing_id UUID NOT NULL,
  listing_title TEXT NOT NULL,
  listing_image TEXT,
  listing_price INTEGER NOT NULL DEFAULT 0,
  
  -- Buyer info
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_avatar TEXT,
  
  -- Seller info
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_avatar TEXT,
  
  -- Last message tracking
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure no duplicate conversations for same listing + buyer + seller
  UNIQUE(listing_id, buyer_id, seller_id)
);

-- Index for faster queries
CREATE INDEX idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON public.conversations(seller_id);
CREATE INDEX idx_conversations_listing_id ON public.conversations(listing_id);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- =====================================================
-- STEP 3: CREATE MESSAGES TABLE
-- =====================================================

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conversation reference
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  -- Sender info
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  
  -- Message content
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(conversation_id, created_at);
CREATE INDEX idx_messages_unread ON public.messages(conversation_id, read) WHERE read = FALSE;

-- =====================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: RLS POLICIES FOR CONVERSATIONS
-- =====================================================

-- Allow users to view conversations they're part of (as buyer OR seller)
-- Using auth.uid() which works with Google Sign-In
CREATE POLICY "Users can view their own conversations"
  ON public.conversations
  FOR SELECT
  USING (
    buyer_id = auth.uid()::TEXT 
    OR seller_id = auth.uid()::TEXT
  );

-- Allow users to create conversations where they are the buyer
CREATE POLICY "Users can create conversations as buyer"
  ON public.conversations
  FOR INSERT
  WITH CHECK (
    buyer_id = auth.uid()::TEXT
  );

-- Allow users to update conversations they're part of
CREATE POLICY "Users can update their conversations"
  ON public.conversations
  FOR UPDATE
  USING (
    buyer_id = auth.uid()::TEXT 
    OR seller_id = auth.uid()::TEXT
  )
  WITH CHECK (
    buyer_id = auth.uid()::TEXT 
    OR seller_id = auth.uid()::TEXT
  );

-- =====================================================
-- STEP 6: RLS POLICIES FOR MESSAGES
-- =====================================================

-- Allow users to view messages in conversations they're part of
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.buyer_id = auth.uid()::TEXT 
        OR conversations.seller_id = auth.uid()::TEXT
      )
    )
  );

-- Allow users to insert messages in conversations they're part of
CREATE POLICY "Users can send messages in their conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()::TEXT
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.buyer_id = auth.uid()::TEXT 
        OR conversations.seller_id = auth.uid()::TEXT
      )
    )
  );

-- Allow users to update messages (for marking as read)
CREATE POLICY "Users can update messages in their conversations"
  ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.buyer_id = auth.uid()::TEXT 
        OR conversations.seller_id = auth.uid()::TEXT
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.buyer_id = auth.uid()::TEXT 
        OR conversations.seller_id = auth.uid()::TEXT
      )
    )
  );

-- =====================================================
-- STEP 7: ENABLE REALTIME
-- =====================================================

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- =====================================================
-- STEP 8: CREATE FUNCTION TO AUTO-UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for conversations
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- DONE! 🎉
-- =====================================================

-- Verify tables were created
SELECT 
  'conversations' as table_name, 
  COUNT(*) as row_count 
FROM public.conversations
UNION ALL
SELECT 
  'messages' as table_name, 
  COUNT(*) as row_count 
FROM public.messages;

-- Verify RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('conversations', 'messages');

-- Show all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;
