-- =====================================================
-- DEBUG CHAT ISSUE
-- Check what's happening with conversations and messages
-- =====================================================

-- Step 1: Check if conversations exist
SELECT 
  id,
  listing_id,
  listing_title,
  listingtype,
  buyer_id,
  buyer_name,
  seller_id,
  seller_name,
  last_message,
  last_message_at,
  created_at,
  updated_at
FROM conversations
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Check if messages exist
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.sender_name,
  m.content,
  m.created_at,
  c.listing_title
FROM messages m
LEFT JOIN conversations c ON m.conversation_id = c.id
ORDER BY m.created_at DESC
LIMIT 10;

-- Step 3: Check RLS policies on conversations
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'conversations'
ORDER BY policyname;

-- Step 4: Check RLS policies on messages
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- Step 5: Check if any listings exist for the conversations
SELECT 
  c.listing_id,
  c.listingtype,
  c.created_at,
  CASE 
    WHEN EXISTS (SELECT 1 FROM listings WHERE id::text = c.listing_id AND is_active = true) THEN 'EXISTS in listings'
    WHEN EXISTS (SELECT 1 FROM tasks WHERE id::text = c.listing_id) THEN 'EXISTS in tasks'
    WHEN EXISTS (SELECT 1 FROM wishes WHERE id::text = c.listing_id) THEN 'EXISTS in wishes'
    ELSE 'NOT FOUND'
  END as listing_status
FROM conversations c
ORDER BY c.created_at DESC
LIMIT 10;