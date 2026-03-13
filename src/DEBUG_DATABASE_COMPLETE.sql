-- =====================================================
-- COMPLETE DATABASE DIAGNOSTIC FOR TASKS & WISHES
-- Run these in Supabase SQL Editor and share ALL results
-- =====================================================

-- ==================== PART 1: TABLE STRUCTURE ====================

-- 1. Get COMPLETE tasks table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- 2. Get COMPLETE wishes table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'wishes'
ORDER BY ordinal_position;

-- 3. Get profiles table structure (to understand user IDs)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ==================== PART 2: ACTUAL DATA ====================

-- 4. Show ALL tasks with ALL relevant columns
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
    updated_at
FROM tasks
ORDER BY created_at DESC
LIMIT 10;

-- 5. Show ALL wishes with ALL relevant columns
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
    updated_at
FROM wishes
ORDER BY created_at DESC
LIMIT 10;

-- 6. Show profiles with their IDs
SELECT 
    id,
    name,
    email,
    phone,
    client_token,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- ==================== PART 3: RELATIONSHIPS ====================

-- 7. Join tasks with creator and helper profiles
SELECT 
    t.id as task_id,
    t.title,
    t.status,
    t.user_id as creator_uuid,
    p1.name as creator_name,
    p1.client_token as creator_token,
    t.accepted_by as helper_uuid,
    p2.name as helper_name,
    p2.client_token as helper_token,
    t.helper_completed,
    t.creator_completed
FROM tasks t
LEFT JOIN profiles p1 ON t.user_id = p1.id
LEFT JOIN profiles p2 ON t.accepted_by = p2.id
ORDER BY t.created_at DESC
LIMIT 10;

-- 8. Join wishes with creator and helper profiles
SELECT 
    w.id as wish_id,
    w.title,
    w.status,
    w.user_id as creator_uuid,
    p1.name as creator_name,
    p1.client_token as creator_token,
    w.accepted_by as helper_uuid,
    p2.name as helper_name,
    p2.client_token as helper_token,
    w.helper_completed,
    w.creator_completed
FROM wishes w
LEFT JOIN profiles p1 ON w.user_id = p1.id
LEFT JOIN profiles p2 ON w.accepted_by = p2.id
ORDER BY w.created_at DESC
LIMIT 10;

-- ==================== PART 4: DATA VALIDATION ====================

-- 9. Check for NULL or mismatched IDs in tasks
SELECT 
    id,
    title,
    status,
    user_id IS NULL as missing_creator,
    accepted_by IS NULL as missing_helper,
    helper_id IS NULL as missing_helper_id,
    (accepted_by IS NOT NULL AND helper_id IS NULL) as mismatch_helper,
    (accepted_by IS NULL AND helper_id IS NOT NULL) as mismatch_helper_2
FROM tasks
WHERE status != 'open'
ORDER BY created_at DESC;

-- 10. Check for NULL or mismatched IDs in wishes
SELECT 
    id,
    title,
    status,
    user_id IS NULL as missing_creator,
    accepted_by IS NULL as missing_helper,
    helper_id IS NULL as missing_helper_id,
    (accepted_by IS NOT NULL AND helper_id IS NULL) as mismatch_helper,
    (accepted_by IS NULL AND helper_id IS NOT NULL) as mismatch_helper_2
FROM wishes
WHERE status != 'open'
ORDER BY created_at DESC;

-- ==================== PART 5: FOREIGN KEY CONSTRAINTS ====================

-- 11. Check foreign keys on tasks
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'tasks';

-- 12. Check foreign keys on wishes
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'wishes';

-- ==================== PART 6: STATUS VALUES ====================

-- 13. Check all unique status values in tasks
SELECT 
    status,
    COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY count DESC;

-- 14. Check all unique status values in wishes
SELECT 
    status,
    COUNT(*) as count
FROM wishes
GROUP BY status
ORDER BY count DESC;

-- ==================== INSTRUCTIONS ====================
/*
RUN ALL THESE QUERIES IN SUPABASE SQL EDITOR AND SEND ME:

1. The table structures (queries 1-3)
2. Sample data (queries 4-6)
3. The joined data showing creator/helper relationships (queries 7-8)
4. Data validation results (queries 9-10)
5. Foreign key constraints (queries 11-12)
6. Status values (queries 13-14)

This will help me understand:
- What columns actually exist
- How user IDs are stored
- If helper_id and accepted_by are in sync
- If there are data inconsistencies
- What status values are being used
*/
