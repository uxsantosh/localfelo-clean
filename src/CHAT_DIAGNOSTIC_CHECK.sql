-- =====================================================
-- CHAT SYSTEM DIAGNOSTIC CHECK
-- =====================================================
-- Run this in Supabase SQL Editor to check your chat system status
-- =====================================================

-- 1. Check if conversations table exists and its columns
SELECT 
    'Conversations Table Schema' as check_name,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- Separator
SELECT '---' as separator;

-- 2. Check if listingType column exists
SELECT 
    'listingType Column Check' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'conversations' 
            AND column_name = 'listingtype'
        ) THEN '✅ Column EXISTS'
        ELSE '❌ Column MISSING - Run ADD_LISTING_TYPE_TO_CONVERSATIONS.sql migration'
    END as status;

-- Separator
SELECT '---' as separator;

-- 3. Check existing conversations
SELECT 
    'Existing Conversations' as check_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN listingtype = 'listing' THEN 1 END) as listing_count,
    COUNT(CASE WHEN listingtype = 'wish' THEN 1 END) as wish_count,
    COUNT(CASE WHEN listingtype = 'task' THEN 1 END) as task_count,
    COUNT(CASE WHEN listingtype IS NULL THEN 1 END) as null_count
FROM conversations;

-- Separator
SELECT '---' as separator;

-- 4. Check listing_id data type
SELECT 
    'listing_id Data Type' as check_name,
    data_type as current_type,
    CASE 
        WHEN data_type = 'uuid' THEN '✅ UUID type (recommended)'
        WHEN data_type = 'text' THEN '⚠️ TEXT type (works but not ideal)'
        ELSE '❌ Unexpected type'
    END as status
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND column_name = 'listing_id';

-- Separator
SELECT '---' as separator;

-- 5. Sample conversations (most recent 5)
SELECT 
    'Recent Conversations Sample' as check_name,
    id,
    LEFT(listing_id::text, 20) as listing_id_sample,
    listing_title,
    listingtype,
    created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 5;

-- Separator
SELECT '---' as separator;

-- 6. Check RLS policies
SELECT 
    'RLS Policies' as check_name,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'conversations';

-- Separator
SELECT '---' as separator;

-- 7. Check if messages table exists
SELECT 
    'Messages Table Check' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'messages'
        ) THEN '✅ Table EXISTS'
        ELSE '❌ Table MISSING'
    END as status;

-- =====================================================
-- INTERPRETATION GUIDE
-- =====================================================
-- 
-- ✅ If listingType column exists: Good! Chat system should work
-- ❌ If listingType column missing: Run ADD_LISTING_TYPE_TO_CONVERSATIONS.sql
-- 
-- ✅ If listing_id is UUID: Perfect! Standard setup
-- ⚠️ If listing_id is TEXT: Works, but you're using the old schema
-- 
-- Check the sample conversations:
-- - If you see UUIDs without prefixes: Good!
-- - If you see 'wish_' or 'task_' prefixes: Old data, will be migrated
-- 
-- Check RLS policies:
-- - Should have policies allowing inserts and selects
-- - If missing, chat creation might fail
-- =====================================================
