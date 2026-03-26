-- =====================================================
-- CORRECTED DATABASE DIAGNOSTIC FOR TASKS & WISHES
-- (Fixed: removed helper_id references)
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

-- ==================== PART 2: ACTUAL DATA ====================

-- 3. Show ALL tasks with ALL relevant columns
SELECT 
    id,
    title,
    status,
    user_id,
    accepted_by,
    accepted_at,
    helper_completed,
    creator_completed,
    created_at,
    updated_at
FROM tasks
ORDER BY created_at DESC
LIMIT 10;

-- 4. Show ALL wishes with ALL relevant columns
SELECT 
    id,
    title,
    status,
    user_id,
    accepted_by,
    accepted_at,
    helper_completed,
    creator_completed,
    created_at,
    updated_at
FROM wishes
ORDER BY created_at DESC
LIMIT 10;

-- ==================== PART 3: RELATIONSHIPS ====================

-- 5. Join tasks with creator and helper profiles
SELECT 
    t.id as task_id,
    t.title,
    t.status,
    t.user_id as creator_uuid,
    p1.name as creator_name,
    t.accepted_by as helper_uuid,
    p2.name as helper_name,
    t.helper_completed,
    t.creator_completed
FROM tasks t
LEFT JOIN profiles p1 ON t.user_id = p1.id
LEFT JOIN profiles p2 ON t.accepted_by = p2.id
ORDER BY t.created_at DESC
LIMIT 10;

-- 6. Join wishes with creator and helper profiles
SELECT 
    w.id as wish_id,
    w.title,
    w.status,
    w.user_id as creator_uuid,
    p1.name as creator_name,
    w.accepted_by as helper_uuid,
    p2.name as helper_name,
    w.helper_completed,
    w.creator_completed
FROM wishes w
LEFT JOIN profiles p1 ON w.user_id = p1.id
LEFT JOIN profiles p2 ON w.accepted_by = p2.id
ORDER BY w.created_at DESC
LIMIT 10;

-- ==================== PART 4: COLUMN EXISTENCE CHECK ====================

-- 7. Check which helper-related columns exist in tasks
SELECT 
    column_name
FROM information_schema.columns
WHERE table_name = 'tasks'
    AND column_name IN ('helper_id', 'accepted_by', 'helper_completed', 'creator_completed');

-- 8. Check which helper-related columns exist in wishes
SELECT 
    column_name
FROM information_schema.columns
WHERE table_name = 'wishes'
    AND column_name IN ('helper_id', 'accepted_by', 'helper_completed', 'creator_completed');

-- ==================== PART 5: STATUS VALUES ====================

-- 9. Check all unique status values in tasks
SELECT 
    status,
    COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY count DESC;

-- 10. Check all unique status values in wishes
SELECT 
    status,
    COUNT(*) as count
FROM wishes
GROUP BY status
ORDER BY count DESC;

-- ==================== RESULTS ====================
/*
Please share the results of ALL queries above!

Key things to check:
1. Does helper_id column exist? (Query 7-8)
2. Are accepted_by values populated correctly? (Query 5-6)
3. What status values are actually used? (Query 9-10)
4. Are helper_completed and creator_completed columns present? (Query 7-8)
*/
