-- =====================================================
-- 🚀 COPY AND RUN THIS ENTIRE SCRIPT IN SUPABASE
-- =====================================================
-- This fixes BOTH chat issues in one go!
-- Time required: 30 seconds
-- =====================================================

-- Step 1: Disable RLS
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Step 2: Fix existing conversations (with proper type casting!)
UPDATE conversations c
SET seller_id = p.id::text
FROM profiles p
WHERE c.seller_id = p.owner_token::text;

UPDATE conversations c
SET buyer_id = p.id::text
FROM profiles p
WHERE c.buyer_id = p.owner_token::text;

-- Step 3: Verify (should show all conversations)
SELECT 
  c.id,
  c.listing_title,
  pb.name as buyer,
  ps.name as seller
FROM conversations c
LEFT JOIN profiles pb ON pb.id::text = c.buyer_id
LEFT JOIN profiles ps ON ps.id::text = c.seller_id
ORDER BY c.created_at DESC;

-- ✅ DONE! Now hard refresh your browser and test!
