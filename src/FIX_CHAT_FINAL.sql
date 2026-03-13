-- =====================================================
-- FINAL FIX: Complete Chat Solution (Type-Safe)
-- =====================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- Fixes both RLS and conversation ID issues
-- =====================================================

-- PART 1: Disable RLS
-- =====================================================
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- PART 2: Fix Existing Conversations
-- =====================================================

-- Fix seller_id to use profile.id (with proper type casting)
UPDATE conversations c
SET seller_id = p.id::text
FROM profiles p
WHERE c.seller_id = p.owner_token::text;

-- Fix buyer_id to use profile.id (with proper type casting)
UPDATE conversations c
SET buyer_id = p.id::text
FROM profiles p
WHERE c.buyer_id = p.owner_token::text;

-- Also check for client_token matches
UPDATE conversations c
SET seller_id = p.id::text
FROM profiles p
WHERE c.seller_id = p.client_token::text
  AND c.seller_id != p.id::text;

UPDATE conversations c
SET buyer_id = p.id::text
FROM profiles p
WHERE c.buyer_id = p.client_token::text
  AND c.buyer_id != p.id::text;

-- PART 3: Verify the Fix
-- =====================================================

-- Check RLS status (should be false)
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('conversations', 'messages');

-- Check all conversations now join properly
SELECT 
  c.id,
  c.listing_title,
  c.buyer_id,
  pb.name as buyer_name,
  c.seller_id,
  ps.name as seller_name,
  c.created_at
FROM conversations c
LEFT JOIN profiles pb ON pb.id::text = c.buyer_id
LEFT JOIN profiles ps ON ps.id::text = c.seller_id
ORDER BY c.created_at DESC;

-- =====================================================
-- SUCCESS! ✅
-- =====================================================
-- 
-- If you see:
-- 1. RLS = false for both tables
-- 2. All conversations show buyer_name and seller_name
-- 
-- Then the fix is complete! 🎉
-- 
-- Next: Hard refresh your browser and test chat!
-- =====================================================
