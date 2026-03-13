-- =====================================================
-- Fix Existing Conversations - Update seller_id
-- =====================================================
-- This SQL fixes conversations that have owner_token in seller_id
-- instead of profile.id, so sellers can see their conversations.
-- =====================================================

-- Step 1: Check how many conversations are affected
SELECT 
  COUNT(*) as affected_conversations
FROM conversations c
LEFT JOIN profiles p ON p.id::text = c.seller_id
WHERE p.id IS NULL;

-- Step 2: Preview the fix (see what will change)
SELECT 
  c.id as conversation_id,
  c.listing_title,
  c.seller_id as old_seller_id,
  c.seller_name,
  p.id as new_seller_id,
  p.name as profile_name
FROM conversations c
LEFT JOIN profiles p ON p.owner_token = c.seller_id
WHERE p.id IS NOT NULL
ORDER BY c.created_at DESC;

-- Step 3: Fix buyer_id (if needed)
-- Some old conversations might have owner_token in buyer_id too
UPDATE conversations c
SET buyer_id = p.id::text
FROM profiles p
WHERE c.buyer_id = p.owner_token::text;

-- Step 4: Fix seller_id
-- Update conversations to use profile.id instead of owner_token
UPDATE conversations c
SET seller_id = p.id::text
FROM profiles p
WHERE c.seller_id = p.owner_token::text;

-- Step 5: Also check for client_token matches
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

-- Step 6: Verify the fix - all conversations should now join with profiles
SELECT 
  c.id as conversation_id,
  c.listing_title,
  c.buyer_id,
  pb.name as buyer_name_from_profile,
  c.seller_id,
  ps.name as seller_name_from_profile,
  c.created_at
FROM conversations c
LEFT JOIN profiles pb ON pb.id::text = c.buyer_id
LEFT JOIN profiles ps ON ps.id::text = c.seller_id
ORDER BY c.created_at DESC;

-- Step 7: Check for any orphaned conversations (should be none now)
SELECT 
  c.*
FROM conversations c
LEFT JOIN profiles pb ON pb.id::text = c.buyer_id
LEFT JOIN profiles ps ON ps.id::text = c.seller_id
WHERE pb.id IS NULL OR ps.id IS NULL;

-- =====================================================
-- DONE! Existing conversations are fixed! ✅
-- =====================================================
-- 
-- What this does:
-- - Updates buyer_id and seller_id in all conversations
-- - Changes from owner_token/client_token to profile.id
-- - Now sellers can see conversations in their chat list
-- - Both buyer and seller will see the conversation
-- =====================================================
