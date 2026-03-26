-- =====================================================
-- FIX SUPABASE REALTIME FOR OLDCYCLE CHAT (v2)
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- This version skips the publication setup (already done)

-- =====================================================
-- 1. SET REPLICA IDENTITY (safe to run multiple times)
-- =====================================================

ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;


-- =====================================================
-- 2. DROP OLD RESTRICTIVE POLICIES
-- =====================================================

-- Drop existing policies that might be blocking Realtime
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;
DROP POLICY IF EXISTS "Allow users to view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Allow anonymous users to view their messages" ON messages;
DROP POLICY IF EXISTS "Allow users to insert messages" ON messages;
DROP POLICY IF EXISTS "Allow users to update messages" ON messages;

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations" ON conversations;
DROP POLICY IF EXISTS "Allow users to view their conversations" ON conversations;
DROP POLICY IF EXISTS "Allow anonymous users to view their conversations" ON conversations;
DROP POLICY IF EXISTS "Allow users to create conversations" ON conversations;
DROP POLICY IF EXISTS "Allow users to update conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all authenticated users to view all messages" ON messages;
DROP POLICY IF EXISTS "Allow all authenticated users to view all conversations" ON conversations;


-- =====================================================
-- 3. CREATE NEW PERMISSIVE RLS POLICIES
-- =====================================================

-- MESSAGES TABLE: Super permissive policy for SELECT (required for Realtime)
-- Realtime REQUIRES a SELECT policy that returns true for subscriptions to work
CREATE POLICY "Allow all users to view all messages"
ON messages FOR SELECT
TO authenticated, anon
USING (true);

-- Allow users to insert messages
CREATE POLICY "Allow all users to insert messages"
ON messages FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to update messages (for read status)
CREATE POLICY "Allow all users to update messages"
ON messages FOR UPDATE
TO authenticated, anon
USING (true);


-- CONVERSATIONS TABLE: Super permissive policy for SELECT (required for Realtime)
CREATE POLICY "Allow all users to view all conversations"
ON conversations FOR SELECT
TO authenticated, anon
USING (true);

-- Allow users to create conversations
CREATE POLICY "Allow all users to create conversations"
ON conversations FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to update conversations
CREATE POLICY "Allow all users to update conversations"
ON conversations FOR UPDATE
TO authenticated, anon
USING (true);


-- =====================================================
-- 4. VERIFY SETUP
-- =====================================================

-- Check if Realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'conversations');

-- Should show 'messages' and 'conversations' in the results

-- Check RLS policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations')
ORDER BY tablename, cmd;
