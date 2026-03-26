-- =====================================================
-- DEBUG UNREAD COUNTS - Run this to check if messages are properly marked as unread
-- =====================================================

-- Replace YOUR_USER_ID with your actual auth.uid() or profile.id
-- Get your user ID by running: SELECT auth.uid();

-- =====================================================
-- 1. Check all conversations for a user
-- =====================================================
SELECT 
  c.id as conversation_id,
  c.buyer_id,
  c.seller_id,
  c.buyer_name,
  c.seller_name,
  c.listing_title,
  c.last_message,
  c.last_message_at
FROM conversations c
WHERE c.buyer_id::text = 'YOUR_USER_ID_HERE'::text
   OR c.seller_id::text = 'YOUR_USER_ID_HERE'::text
ORDER BY c.updated_at DESC;

-- =====================================================
-- 2. Check all messages with their read status
-- =====================================================
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.sender_name,
  m.content,
  m.read,
  m.created_at,
  c.buyer_id,
  c.seller_id
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE c.buyer_id::text = 'YOUR_USER_ID_HERE'::text
   OR c.seller_id::text = 'YOUR_USER_ID_HERE'::text
ORDER BY m.created_at DESC;

-- =====================================================
-- 3. Count unread messages per conversation
-- =====================================================
SELECT 
  c.id as conversation_id,
  c.listing_title,
  COUNT(CASE WHEN m.read = false AND m.sender_id::text != 'YOUR_USER_ID_HERE'::text THEN 1 END) as unread_count
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE (c.buyer_id::text = 'YOUR_USER_ID_HERE'::text OR c.seller_id::text = 'YOUR_USER_ID_HERE'::text)
GROUP BY c.id, c.listing_title
ORDER BY unread_count DESC;

-- =====================================================
-- 4. Total unread count across all conversations
-- =====================================================
SELECT 
  COUNT(*) as total_unread_messages
FROM messages m
WHERE m.read = false
  AND m.sender_id::text != 'YOUR_USER_ID_HERE'::text
  AND m.conversation_id IN (
    SELECT id FROM conversations
    WHERE buyer_id::text = 'YOUR_USER_ID_HERE'::text
       OR seller_id::text = 'YOUR_USER_ID_HERE'::text
  );

-- =====================================================
-- 5. Check if messages are being marked as read
-- =====================================================
-- This shows all messages that SHOULD have been marked as read
-- but are still showing read = false
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.sender_name,
  m.content,
  m.read,
  m.created_at,
  c.buyer_name,
  c.seller_name
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE m.read = false
  AND m.sender_id::text != 'YOUR_USER_ID_HERE'::text
  AND (c.buyer_id::text = 'YOUR_USER_ID_HERE'::text OR c.seller_id::text = 'YOUR_USER_ID_HERE'::text)
ORDER BY m.created_at DESC;

-- =====================================================
-- 6. MANUAL FIX: Mark all messages as read for testing
-- =====================================================
-- UNCOMMENT THIS TO RESET ALL MESSAGES TO READ
/*
UPDATE messages
SET read = true
WHERE conversation_id IN (
  SELECT id FROM conversations
  WHERE buyer_id::text = 'YOUR_USER_ID_HERE'::text
     OR seller_id::text = 'YOUR_USER_ID_HERE'::text
)
AND sender_id::text != 'YOUR_USER_ID_HERE'::text;
*/

-- =====================================================
-- 7. Test: Send a new unread message manually
-- =====================================================
-- UNCOMMENT AND MODIFY THIS TO CREATE A TEST MESSAGE
/*
INSERT INTO messages (
  conversation_id,
  sender_id,
  sender_name,
  content,
  read
)
VALUES (
  'YOUR_CONVERSATION_ID_HERE',
  'OTHER_USER_ID_HERE',
  'Test Sender',
  'This is an unread test message',
  false
);
*/
