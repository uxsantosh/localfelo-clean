-- =====================================================
-- FIX: Disable RLS on chat tables for soft-auth compatibility
-- =====================================================
-- The error "operator does not exist: text = uuid" occurs because
-- RLS policies are trying to use auth.uid() which doesn't work
-- with OldCycle's soft-auth system (client_token/owner_token).
-- 
-- Since OldCycle uses soft-auth and handles security at the
-- application level, we disable RLS on chat tables.
-- =====================================================

-- Drop all existing policies on conversations table
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;

-- Drop all existing policies on messages table
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;

-- Disable RLS on both tables
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- DONE! RLS disabled - soft-auth will work now! ✅
-- =====================================================
-- 
-- NOTE: Security is handled at the application level through:
-- 1. client_token verification for user identity
-- 2. Application-level checks in the chat service
-- 3. Users can only see/modify their own conversations and messages
-- =====================================================
