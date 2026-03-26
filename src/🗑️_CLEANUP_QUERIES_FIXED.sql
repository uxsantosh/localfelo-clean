-- ========================================
-- COMPLETE DATABASE CLEANUP QUERIES - FIXED
-- ========================================
-- Use these queries in Supabase SQL Editor to delete all test data
-- and start fresh for testing

-- ========================================
-- RECOMMENDED: QUICK CLEAN FOR TESTING
-- ========================================
-- This is the FASTEST and SAFEST way to clean everything

BEGIN;

-- Delete all messages first (foreign key dependency)
DELETE FROM messages;

-- Delete all conversations
DELETE FROM conversations;

-- Delete all notifications
DELETE FROM notifications;

-- Delete all reports
DELETE FROM reports;

-- Delete task negotiations
DELETE FROM task_negotiations;

-- Delete all tasks
DELETE FROM tasks;

-- Delete all wishes
DELETE FROM wishes;

-- Delete all marketplace listings
DELETE FROM listings;

-- Reset user stats (optional)
UPDATE profiles 
SET 
  total_tasks_completed = 0,
  total_wishes_granted = 0
WHERE total_tasks_completed > 0 OR total_wishes_granted > 0;

COMMIT;

-- Verify clean state
SELECT 
  (SELECT COUNT(*) FROM tasks) as tasks,
  (SELECT COUNT(*) FROM wishes) as wishes,
  (SELECT COUNT(*) FROM listings) as listings,
  (SELECT COUNT(*) FROM conversations) as conversations,
  (SELECT COUNT(*) FROM messages) as messages,
  (SELECT COUNT(*) FROM notifications) as notifications,
  (SELECT COUNT(*) FROM profiles) as users_kept;


-- ========================================
-- ONE-LINER (FASTEST - NO TRANSACTION)
-- ========================================
-- Copy and paste this single line:

DELETE FROM messages; DELETE FROM conversations; DELETE FROM notifications; DELETE FROM reports; DELETE FROM task_negotiations; DELETE FROM tasks; DELETE FROM wishes; DELETE FROM listings;


-- ========================================
-- VERIFY CLEANUP
-- ========================================

SELECT 
  (SELECT COUNT(*) FROM tasks) as tasks,
  (SELECT COUNT(*) FROM wishes) as wishes,
  (SELECT COUNT(*) FROM listings) as listings,
  (SELECT COUNT(*) FROM conversations) as conversations,
  (SELECT COUNT(*) FROM messages) as messages;

-- Should return: tasks=0, wishes=0, listings=0, conversations=0, messages=0


-- ========================================
-- OPTION 1: DELETE ONLY TASKS
-- ========================================

BEGIN;

-- Get all task IDs
WITH task_ids AS (
  SELECT id FROM tasks
)
-- Delete task conversations (conversations where listing_id matches task id)
DELETE FROM messages WHERE conversation_id IN (
  SELECT c.id FROM conversations c WHERE c.listing_id IN (SELECT id FROM task_ids)
);

DELETE FROM conversations WHERE listing_id IN (SELECT id FROM task_ids);

-- Delete task notifications
DELETE FROM notifications WHERE related_id IN (SELECT id FROM task_ids);

-- Delete task reports
DELETE FROM reports WHERE item_id IN (SELECT id FROM task_ids) AND item_type = 'task';

-- Delete task negotiations
DELETE FROM task_negotiations WHERE task_id IN (SELECT id FROM task_ids);

-- Finally, delete tasks
DELETE FROM tasks;

COMMIT;

-- Verify
SELECT COUNT(*) as remaining_tasks FROM tasks;


-- ========================================
-- OPTION 2: DELETE ONLY WISHES
-- ========================================

BEGIN;

-- Get all wish IDs
WITH wish_ids AS (
  SELECT id FROM wishes
)
-- Delete wish conversations
DELETE FROM messages WHERE conversation_id IN (
  SELECT c.id FROM conversations c WHERE c.listing_id IN (SELECT id FROM wish_ids)
);

DELETE FROM conversations WHERE listing_id IN (SELECT id FROM wish_ids);

-- Delete wish notifications
DELETE FROM notifications WHERE related_id IN (SELECT id FROM wish_ids);

-- Delete wish reports
DELETE FROM reports WHERE item_id IN (SELECT id FROM wish_ids) AND item_type = 'wish';

-- Finally, delete wishes
DELETE FROM wishes;

COMMIT;

-- Verify
SELECT COUNT(*) as remaining_wishes FROM wishes;


-- ========================================
-- OPTION 3: DELETE ONLY LISTINGS
-- ========================================

BEGIN;

-- Get all listing IDs
WITH listing_ids AS (
  SELECT id FROM listings
)
-- Delete listing conversations
DELETE FROM messages WHERE conversation_id IN (
  SELECT c.id FROM conversations c WHERE c.listing_id IN (SELECT id FROM listing_ids)
);

DELETE FROM conversations WHERE listing_id IN (SELECT id FROM listing_ids);

-- Delete listing notifications
DELETE FROM notifications WHERE related_id IN (SELECT id FROM listing_ids);

-- Delete listing reports
DELETE FROM reports WHERE item_id IN (SELECT id FROM listing_ids) AND item_type = 'listing';

-- Finally, delete listings
DELETE FROM listings;

COMMIT;

-- Verify
SELECT COUNT(*) as remaining_listings FROM listings;


-- ========================================
-- OPTION 4: DELETE EVERYTHING + ALL USERS
-- ========================================
-- ⚠️ WARNING: This deletes EVERYTHING including user accounts!
-- Only use if you want to start completely fresh

/*
BEGIN;

-- Delete all user data
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM notifications;
DELETE FROM reports;
DELETE FROM task_negotiations;
DELETE FROM tasks;
DELETE FROM wishes;
DELETE FROM listings;
DELETE FROM push_tokens;
DELETE FROM user_activity_logs;
DELETE FROM profiles;

COMMIT;

-- Verify
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM tasks) as tasks,
  (SELECT COUNT(*) FROM wishes) as wishes,
  (SELECT COUNT(*) FROM listings) as listings;
*/


-- ========================================
-- RESET USER RELIABILITY SCORES
-- ========================================

UPDATE profiles 
SET 
  reliability_score = 100,
  total_tasks_completed = 0,
  total_wishes_granted = 0,
  is_verified = false,
  is_trusted = false
WHERE id IS NOT NULL;

-- Verify
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN reliability_score = 100 THEN 1 END) as users_with_default_score,
  COUNT(CASE WHEN total_tasks_completed = 0 THEN 1 END) as users_with_zero_tasks
FROM profiles;


-- ========================================
-- DIAGNOSTIC QUERIES
-- ========================================

-- 1. Check all table counts
SELECT 
  'tasks' as table_name, COUNT(*) as count FROM tasks
UNION ALL
SELECT 'wishes', COUNT(*) FROM wishes
UNION ALL
SELECT 'listings', COUNT(*) FROM listings
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'reports', COUNT(*) FROM reports
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
ORDER BY count DESC;


-- 2. Check tasks by status
SELECT status, COUNT(*) as count 
FROM tasks 
GROUP BY status 
ORDER BY count DESC;


-- 3. Check wishes by status
SELECT status, COUNT(*) as count 
FROM wishes 
GROUP BY status 
ORDER BY count DESC;


-- 4. Check listings count
SELECT COUNT(*) as total_listings FROM listings;


-- 5. Find conversations without matching items
SELECT 
  c.id,
  c.listing_id,
  CASE 
    WHEN EXISTS (SELECT 1 FROM tasks WHERE id = c.listing_id) THEN 'task'
    WHEN EXISTS (SELECT 1 FROM wishes WHERE id = c.listing_id) THEN 'wish'
    WHEN EXISTS (SELECT 1 FROM listings WHERE id = c.listing_id) THEN 'listing'
    ELSE 'orphaned'
  END as item_type
FROM conversations c;


-- 6. Check notifications distribution
SELECT 
  type as notification_type,
  COUNT(*) as count
FROM notifications
GROUP BY type
ORDER BY count DESC;


-- 7. Check user stats
SELECT 
  COUNT(*) as total_users,
  AVG(reliability_score) as avg_reliability,
  SUM(total_tasks_completed) as total_tasks,
  SUM(total_wishes_granted) as total_wishes
FROM profiles
WHERE reliability_score IS NOT NULL;


-- ========================================
-- DELETE SPECIFIC USER'S DATA
-- ========================================
-- Replace 'YOUR_USER_ID' with your actual UUID

/*
-- Get user ID first
SELECT id, name, email FROM profiles WHERE email = 'your-email@example.com';

-- Then delete their data (replace the UUID below)
BEGIN;

WITH user_data AS (
  SELECT 'YOUR_USER_ID_HERE'::UUID as user_id
)
-- Delete messages from user's conversations
DELETE FROM messages WHERE conversation_id IN (
  SELECT c.id FROM conversations c, user_data u
  WHERE c.buyer_id = u.user_id OR c.seller_id = u.user_id
);

-- Delete user's conversations
DELETE FROM conversations c USING user_data u
WHERE c.buyer_id = u.user_id OR c.seller_id = u.user_id;

-- Delete user's tasks
DELETE FROM tasks t USING user_data u
WHERE t.user_id = u.user_id OR t.accepted_by = u.user_id;

-- Delete user's wishes
DELETE FROM wishes w USING user_data u
WHERE w.user_id = u.user_id OR w.accepted_by = u.user_id;

-- Delete user's listings
DELETE FROM listings l USING user_data u
WHERE l.user_id = u.user_id;

COMMIT;
*/


-- ========================================
-- FINAL RECOMMENDED COMMAND
-- ========================================
-- Copy this ONE LINE for fastest cleanup:

DELETE FROM messages; DELETE FROM conversations; DELETE FROM notifications; DELETE FROM reports; DELETE FROM task_negotiations; DELETE FROM tasks; DELETE FROM wishes; DELETE FROM listings;


-- Then verify with this:
SELECT (SELECT COUNT(*) FROM tasks) as tasks, (SELECT COUNT(*) FROM wishes) as wishes, (SELECT COUNT(*) FROM listings) as listings, (SELECT COUNT(*) FROM conversations) as conversations;

-- Should return: tasks=0, wishes=0, listings=0, conversations=0
