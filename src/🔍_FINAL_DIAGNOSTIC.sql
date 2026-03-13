-- =====================================================
-- 🔍 COMPREHENSIVE CHAT DIAGNOSTIC
-- =====================================================
-- Run these queries ONE BY ONE in Supabase SQL Editor
-- This bypasses RLS to show us the ACTUAL data
-- =====================================================

-- QUERY 1: Show all conversations (bypassing RLS)
SELECT 
    '1. ALL CONVERSATIONS' as diagnostic_step,
    id::text as conversation_id,
    listing_title,
    buyer_id,
    seller_id,
    last_message,
    updated_at
FROM conversations
ORDER BY updated_at DESC
LIMIT 10;

-- QUERY 2: Show all messages (bypassing RLS)  
SELECT 
    '2. ALL MESSAGES' as diagnostic_step,
    id::text as message_id,
    conversation_id::text,
    sender_id,
    sender_name,
    LEFT(content, 50) as content_preview,
    read,
    created_at
FROM messages
ORDER BY created_at DESC
LIMIT 20;

-- QUERY 3: Show profiles with client tokens
SELECT 
    '3. PROFILES' as diagnostic_step,
    id::text as profile_id,
    display_name,
    LEFT(client_token, 20) as client_token_preview,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- QUERY 4: Check if buyer_id/seller_id match profile IDs
SELECT 
    '4. CONVERSATION-PROFILE MATCH CHECK' as diagnostic_step,
    c.id::text as conv_id,
    c.buyer_id,
    c.seller_id,
    bp.id::text as buyer_profile_exists,
    sp.id::text as seller_profile_exists
FROM conversations c
LEFT JOIN profiles bp ON bp.id::text = c.buyer_id
LEFT JOIN profiles sp ON sp.id::text = c.seller_id
ORDER BY c.updated_at DESC
LIMIT 10;

-- QUERY 5: Count messages per conversation
SELECT 
    '5. MESSAGE COUNTS' as diagnostic_step,
    conversation_id::text,
    COUNT(*) as total_messages,
    COUNT(DISTINCT sender_id) as unique_senders,
    SUM(CASE WHEN read = false THEN 1 ELSE 0 END) as unread_count
FROM messages
GROUP BY conversation_id
ORDER BY MAX(created_at) DESC
LIMIT 10;
