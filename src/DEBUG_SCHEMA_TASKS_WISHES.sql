-- =====================================================
-- DATABASE SCHEMA UNDERSTANDING FOR TASKS & WISHES
-- Run these queries in Supabase SQL Editor to understand structure
-- =====================================================

-- 1. TASKS TABLE STRUCTURE
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- 2. WISHES TABLE STRUCTURE
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- 3. SAMPLE TASKS DATA (to understand actual values)
SELECT 
    id,
    title,
    status,
    user_id,
    helper_id,
    accepted_by,
    accepted_at,
    helper_completed,
    creator_completed,
    created_at,
    completed_at
FROM tasks
ORDER BY created_at DESC
LIMIT 5;

-- 4. SAMPLE WISHES DATA
SELECT 
    id,
    title,
    status,
    user_id,
    helper_id,
    accepted_by,
    accepted_at,
    helper_completed,
    creator_completed,
    created_at,
    completed_at
FROM wishes
ORDER BY created_at DESC
LIMIT 5;

-- 5. UNDERSTAND TASK STATUS VALUES
SELECT DISTINCT status, COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY count DESC;

-- 6. UNDERSTAND WISH STATUS VALUES
SELECT DISTINCT status, COUNT(*) as count
FROM wishes
GROUP BY status
ORDER BY count DESC;

-- 7. CHECK FOREIGN KEY RELATIONSHIPS FOR TASKS
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'tasks';

-- 8. CHECK FOREIGN KEY RELATIONSHIPS FOR WISHES
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'wishes';

-- 9. CHECK IF OWNER_TOKEN AND CLIENT_TOKEN EXIST
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
    AND column_name IN ('owner_token', 'client_token', 'user_id', 'helper_id', 'accepted_by');

-- 10. CHECK IF OWNER_TOKEN AND CLIENT_TOKEN EXIST FOR WISHES
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'wishes'
    AND column_name IN ('owner_token', 'client_token', 'user_id', 'helper_id', 'accepted_by');

-- 11. UNDERSTAND USER RELATIONSHIP - TASKS
SELECT 
    t.id,
    t.title,
    t.status,
    t.user_id,
    t.accepted_by,
    p1.name as creator_name,
    p2.name as helper_name
FROM tasks t
LEFT JOIN profiles p1 ON t.user_id = p1.id
LEFT JOIN profiles p2 ON t.accepted_by = p2.id
ORDER BY t.created_at DESC
LIMIT 5;

-- 12. UNDERSTAND USER RELATIONSHIP - WISHES
SELECT 
    w.id,
    w.title,
    w.status,
    w.user_id,
    w.accepted_by,
    p1.name as creator_name,
    p2.name as helper_name
FROM wishes w
LEFT JOIN profiles p1 ON w.user_id = p1.id
LEFT JOIN profiles p2 ON w.accepted_by = p2.id
ORDER BY w.created_at DESC
LIMIT 5;
