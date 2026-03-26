-- =====================================================
-- 🔍 TEST RLS POLICIES - FIND THE ISSUE
-- =====================================================
-- This will help us understand why messages aren't being received
-- =====================================================

-- First, let's see what your current client_token resolves to
SELECT 
    'Your Profile ID:' as label,
    id::text as value,
    display_name,
    client_token
FROM profiles
WHERE client_token = (
    (current_setting('request.headers', true))::json ->> 'x-client-token'
)
LIMIT 1;

-- Check recent conversations
SELECT 
    'Recent Conversations' as section,
    id::text as conv_id,
    listing_title,
    buyer_id,
    seller_id,
    last_message,
    updated_at
FROM conversations
ORDER BY updated_at DESC
LIMIT 5;

-- Check recent messages (this might fail if RLS blocks it)
SELECT 
    'Recent Messages' as section,
    id::text as msg_id,
    conversation_id::text as conv_id,
    sender_id,
    LEFT(content, 30) as content_preview,
    read,
    created_at
FROM messages
ORDER BY created_at DESC
LIMIT 10;

-- Count messages by conversation
SELECT 
    'Message Count by Conversation' as section,
    conversation_id::text,
    COUNT(*) as message_count,
    SUM(CASE WHEN read = false THEN 1 ELSE 0 END) as unread_count
FROM messages
GROUP BY conversation_id
ORDER BY MAX(created_at) DESC
LIMIT 5;
