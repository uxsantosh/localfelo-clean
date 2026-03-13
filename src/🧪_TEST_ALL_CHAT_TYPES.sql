-- =====================================================
-- 🧪 TEST ALL THREE CHAT TYPES (Marketplace, Wishes, Tasks)
-- =====================================================
-- Run this query to verify chat works for all listing types!

-- 1️⃣ COUNT CONVERSATIONS BY TYPE
SELECT 
    '1. CONVERSATIONS BY TYPE' as test,
    listingtype,
    COUNT(*) as total_conversations,
    COUNT(DISTINCT buyer_id) as unique_buyers,
    COUNT(DISTINCT seller_id) as unique_sellers
FROM conversations
GROUP BY listingtype
ORDER BY listingtype;

-- 2️⃣ COUNT MESSAGES BY TYPE
SELECT 
    '2. MESSAGES BY TYPE' as test,
    c.listingtype,
    COUNT(m.id) as message_count,
    COUNT(DISTINCT m.conversation_id) as active_conversations,
    MAX(m.created_at) as latest_message
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
GROUP BY c.listingtype
ORDER BY c.listingtype;

-- 3️⃣ SAMPLE CONVERSATION FOR EACH TYPE
SELECT 
    '3. SAMPLE CONVERSATIONS' as test,
    c.listingtype,
    c.id as conversation_id,
    c.listing_title,
    c.buyer_name,
    c.seller_name,
    (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as msg_count,
    c.created_at
FROM conversations c
WHERE c.id IN (
    SELECT DISTINCT ON (listingtype) id
    FROM conversations
    ORDER BY listingtype, created_at DESC
)
ORDER BY c.listingtype;

-- =====================================================
-- ✅ EXPECTED RESULTS:
-- - Test 1: Shows 'listing', 'wish', 'task' with counts > 0
-- - Test 2: Shows messages exist for all three types
-- - Test 3: Shows one sample conversation per type
-- 
-- ❌ If any type is missing or has 0 messages:
-- - That listing type's chat is not working properly!
-- =====================================================
