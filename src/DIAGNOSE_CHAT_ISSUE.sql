-- =====================================================
-- DIAGNOSE CHAT ISSUE - Find why conversations don't show
-- =====================================================
-- Run this in Supabase SQL Editor to diagnose the problem
-- =====================================================

-- Step 1: Check what columns exist in listings table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- Step 2: Check all profiles with their IDs
SELECT 
  id as profile_id,
  name,
  email,
  phone,
  client_token,
  owner_token,
  auth_user_id
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Check all conversations with buyer and seller IDs
SELECT 
  id as conversation_id,
  listing_title,
  buyer_id,
  buyer_name,
  seller_id,
  seller_name,
  created_at
FROM conversations
ORDER BY created_at DESC;

-- Step 4: Check all messages
SELECT 
  id as message_id,
  conversation_id,
  sender_id,
  sender_name,
  content,
  created_at
FROM messages
ORDER BY created_at DESC;

-- Step 5: Check a sample listing to see what seller info it has
SELECT *
FROM listings
LIMIT 1;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- 
-- The issue is likely one of these:
-- 
-- 1. seller_id in conversations doesn't match buyer's profile.id
--    → Conversations are created with listing.owner_token
--    → But buyer's user.id is their profile.id
--    → They don't match, so buyer sees the conversation but seller doesn't
-- 
-- 2. buyer_id in conversations doesn't match profile.id properly
--    → Similar mismatch issue
-- 
-- SOLUTION:
-- Either:
-- A) Store profile.id in conversations (buyer_id and seller_id)
-- B) Store client_token or owner_token consistently
-- C) Query conversations using the correct ID field
-- =====================================================
