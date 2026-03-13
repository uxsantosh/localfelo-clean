-- =====================================================
-- OLDCYCLE CHAT FEATURE - COMPLETE RESET & REBUILD
-- =====================================================
-- FIXED VERSION: Works with OldCycle's soft-auth system
-- Supports matching by: auth_user_id, client_token, owner_token
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: DROP EXISTING CHAT TABLES
-- =====================================================

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
  
  -- Buyer info (can be profile.id, client_token, owner_token, or auth_user_id)
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_avatar TEXT,
  
  -- Seller info (can be profile.id, client_token, owner_token, or auth_user_id)
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

-- Indexes for faster queries
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
  
  -- Sender info (can be profile.id, client_token, owner_token, or auth_user_id)
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
-- STEP 5: HELPER FUNCTION TO CHECK USER IDENTITY
-- =====================================================
-- This function checks if a given ID matches any of the user's IDs
-- (profile.id, client_token, owner_token, or auth_user_id)

CREATE OR REPLACE FUNCTION public.is_user_id_match(check_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- If not authenticated, return false
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if the ID matches any of:
  -- 1. auth.uid() directly (as text)
  -- 2. profile.id (UUID converted to text)
  -- 3. profile.client_token (TEXT)
  -- 4. profile.owner_token (TEXT)
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
    AND (
      check_id = auth.uid()::TEXT
      OR check_id = id::TEXT
      OR check_id = client_token
      OR check_id = owner_token
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- STEP 6: RLS POLICIES FOR CONVERSATIONS
-- =====================================================

-- Allow users to view conversations they're part of (as buyer OR seller)
CREATE POLICY "Users can view their own conversations"
  ON public.conversations
  FOR SELECT
  USING (
    is_user_id_match(buyer_id) 
    OR is_user_id_match(seller_id)
  );

-- Allow users to create conversations where they are the buyer
CREATE POLICY "Users can create conversations as buyer"
  ON public.conversations
  FOR INSERT
  WITH CHECK (
    is_user_id_match(buyer_id)
  );

-- Allow users to update conversations they're part of
CREATE POLICY "Users can update their conversations"
  ON public.conversations
  FOR UPDATE
  USING (
    is_user_id_match(buyer_id) 
    OR is_user_id_match(seller_id)
  )
  WITH CHECK (
    is_user_id_match(buyer_id) 
    OR is_user_id_match(seller_id)
  );

-- =====================================================
-- STEP 7: RLS POLICIES FOR MESSAGES
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
        is_user_id_match(conversations.buyer_id) 
        OR is_user_id_match(conversations.seller_id)
      )
    )
  );

-- Allow users to insert messages in conversations they're part of
CREATE POLICY "Users can send messages in their conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    is_user_id_match(sender_id)
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        is_user_id_match(conversations.buyer_id) 
        OR is_user_id_match(conversations.seller_id)
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
        is_user_id_match(conversations.buyer_id) 
        OR is_user_id_match(conversations.seller_id)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        is_user_id_match(conversations.buyer_id) 
        OR is_user_id_match(conversations.seller_id)
      )
    )
  );

-- =====================================================
-- STEP 8: ENABLE REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- =====================================================
-- STEP 9: CREATE FUNCTION TO AUTO-UPDATE updated_at
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

SELECT 
  '✅ CHAT TABLES CREATED SUCCESSFULLY!' as status,
  'Run CHAT_VERIFY.sql to verify everything works' as next_step;
