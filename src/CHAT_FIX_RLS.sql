-- =====================================================
-- LOCALFELO CHAT - FIX RLS POLICIES
-- =====================================================
-- This disables RLS temporarily to test chat functionality
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Disable RLS on both tables (for testing)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify RLS is disabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages');

-- You should see rowsecurity = false for both tables

-- =====================================================
-- SUCCESS! 
-- RLS is now disabled for testing
-- Visit /chat-test to test again
-- =====================================================
