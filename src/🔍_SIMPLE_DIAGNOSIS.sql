-- =====================================================
-- 🔍 SIMPLE CHAT DIAGNOSIS
-- =====================================================
-- Run each section separately and share results
-- =====================================================

-- 1️⃣ CHECK RLS STATUS
SELECT 
    'RLS Status Check' as test,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('conversations', 'messages');

-- 2️⃣ CHECK RLS POLICIES
SELECT 
    'RLS Policies' as test,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename;

-- 3️⃣ CHECK MESSAGES TABLE STRUCTURE
SELECT 
    'Messages Columns' as test,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 4️⃣ CHECK IF MESSAGES EXIST
SELECT 
    'Total Messages' as test,
    COUNT(*) as count
FROM messages;

-- 5️⃣ CHECK RECENT MESSAGES
SELECT 
    'Recent Messages' as test,
    id,
    LEFT(sender_id::text, 30) as sender_id_preview,
    sender_name,
    LEFT(content, 50) as content_preview,
    read,
    created_at
FROM messages
ORDER BY created_at DESC
LIMIT 5;

-- 6️⃣ CHECK REALTIME
SELECT 
    'Realtime Tables' as test,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
    AND tablename IN ('conversations', 'messages');

-- 7️⃣ CHECK CONVERSATIONS
SELECT 
    'Recent Conversations' as test,
    id,
    listing_title,
    LEFT(buyer_id::text, 30) as buyer_preview,
    LEFT(seller_id::text, 30) as seller_preview,
    updated_at
FROM conversations
ORDER BY updated_at DESC
LIMIT 3;
