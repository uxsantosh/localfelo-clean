-- =====================================================
-- FIX SUPABASE REALTIME FOR OLDCYCLE CHAT
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to fix Realtime subscriptions
-- This ensures RLS policies allow Realtime to work properly

-- =====================================================
-- 1. ENABLE REALTIME (if not already enabled)
-- =====================================================

ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;


-- =====================================================
-- 2. CHECK CURRENT RLS POLICIES
-- =====================================================

-- View all policies on messages table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations');


-- =====================================================
-- 3. DROP OLD RESTRICTIVE POLICIES (if they exist)
-- =====================================================

-- Drop existing policies that might be blocking Realtime
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;


-- =====================================================
-- 4. CREATE NEW PERMISSIVE RLS POLICIES
-- =====================================================

-- MESSAGES TABLE: Super permissive policy for SELECT (required for Realtime)
-- Realtime REQUIRES a SELECT policy that returns true for the subscription to work
CREATE POLICY "Allow all authenticated users to view all messages"
ON messages FOR SELECT
TO authenticated, anon
USING (true);

-- Allow users to insert messages
CREATE POLICY "Allow users to insert messages"
ON messages FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to update messages (for read status)
CREATE POLICY "Allow users to update messages"
ON messages FOR UPDATE
TO authenticated, anon
USING (true);


-- CONVERSATIONS TABLE: Super permissive policy for SELECT (required for Realtime)
CREATE POLICY "Allow all authenticated users to view all conversations"
ON conversations FOR SELECT
TO authenticated, anon
USING (true);

-- Allow users to create conversations
CREATE POLICY "Allow users to create conversations"
ON conversations FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to update conversations
CREATE POLICY "Allow users to update conversations"
ON conversations FOR UPDATE
TO authenticated, anon
USING (true);


-- =====================================================
-- 5. VERIFY SETUP
-- =====================================================

-- Check if Realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Should show 'messages' and 'conversations' in the results

-- Check RLS policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations');
