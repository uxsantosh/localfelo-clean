-- =====================================================
-- 🔍 DIAGNOSE CHAT RECEIVING ISSUE
-- =====================================================
-- Run this to understand WHY messages aren't being received
-- =====================================================

-- STEP 1: Check if RLS is enabled
-- =====================================================
SELECT 
    '🔍 STEP 1: RLS STATUS' as diagnostic;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('conversations', 'messages');

-- =====================================================
-- STEP 2: Check current RLS policies
-- =====================================================
SELECT 
    '🔍 STEP 2: CURRENT RLS POLICIES' as diagnostic;

SELECT 
    tablename,
    policyname,
    cmd as operation,
    permissive,
    roles
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, cmd;

-- =====================================================
-- STEP 3: Check messages table structure
-- =====================================================
SELECT 
    '🔍 STEP 3: MESSAGES TABLE COLUMNS' as diagnostic;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- =====================================================
-- STEP 4: Check if messages exist
-- =====================================================
SELECT 
    '🔍 STEP 4: RECENT MESSAGES (LAST 10)' as diagnostic;

SELECT 
    id,
    conversation_id,
    sender_id,
    sender_name,
    LEFT(content, 50) as content_preview,
    read,
    created_at
FROM messages
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- STEP 5: Check conversations
-- =====================================================
SELECT 
    '🔍 STEP 5: RECENT CONVERSATIONS' as diagnostic;

SELECT 
    id,
    listing_title,
    buyer_id,
    seller_id,
    last_message,
    last_message_at,
    created_at
FROM conversations
ORDER BY updated_at DESC
LIMIT 5;

-- =====================================================
-- STEP 6: Check realtime publication
-- =====================================================
SELECT 
    '🔍 STEP 6: REALTIME PUBLICATION STATUS' as diagnostic;

SELECT 
    schemaname,
    tablename,
    'In realtime publication' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
    AND tablename IN ('conversations', 'messages');

-- =====================================================
-- STEP 7: Check triggers on messages
-- =====================================================
SELECT 
    '🔍 STEP 7: TRIGGERS ON MESSAGES TABLE' as diagnostic;

SELECT 
    trigger_name,
    event_manipulation as event,
    action_timing as timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'messages'
ORDER BY trigger_name;

-- =====================================================
-- ✅ DIAGNOSIS COMPLETE
-- =====================================================

SELECT 
    '✅ DIAGNOSIS COMPLETE' as result,
    'Check the results above to identify the issue' as next_step;
