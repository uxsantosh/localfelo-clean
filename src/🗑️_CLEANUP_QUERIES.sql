-- ========================================
-- COMPLETE DATABASE CLEANUP QUERIES
-- ========================================
-- Use these queries in Supabase SQL Editor to delete all test data
-- and start fresh for testing

-- ========================================
-- OPTION 1: DELETE EVERYTHING (NUCLEAR)
-- ========================================
-- This deletes all user-generated content but keeps users/profiles

-- Step 1: Delete all messages (to avoid foreign key issues)
DELETE FROM messages;

-- Step 2: Delete all conversations
DELETE FROM conversations;

-- Step 3: Delete all task/wish/listing reports
DELETE FROM reports;

-- Step 4: Delete all notifications
DELETE FROM notifications;

-- Step 5: Delete all tasks
DELETE FROM tasks;

-- Step 6: Delete all wishes
DELETE FROM wishes;

-- Step 7: Delete all marketplace listings
DELETE FROM listings;

-- Step 8: (Optional) Delete all task negotiations
DELETE FROM task_negotiations;

-- Verify deletion counts:
SELECT 
  (SELECT COUNT(*) FROM tasks) as tasks_count,
  (SELECT COUNT(*) FROM wishes) as wishes_count,
  (SELECT COUNT(*) FROM listings) as listings_count,
  (SELECT COUNT(*) FROM conversations) as conversations_count,
  (SELECT COUNT(*) FROM messages) as messages_count,
  (SELECT COUNT(*) FROM notifications) as notifications_count,
  (SELECT COUNT(*) FROM reports) as reports_count;


-- ========================================
-- OPTION 2: DELETE ONLY TASKS
-- ========================================

-- Delete task-related data
DELETE FROM messages WHERE conversation_id IN (
  SELECT id FROM conversations WHERE related_type = 'task'
);
DELETE FROM conversations WHERE related_type = 'task';
DELETE FROM notifications WHERE related_type = 'task';
DELETE FROM reports WHERE item_type = 'task';
DELETE FROM task_negotiations;
DELETE FROM tasks;

-- Verify:
SELECT COUNT(*) as remaining_tasks FROM tasks;


-- ========================================
-- OPTION 3: DELETE ONLY WISHES
-- ========================================

-- Delete wish-related data
DELETE FROM messages WHERE conversation_id IN (
  SELECT id FROM conversations WHERE related_type = 'wish'
);
DELETE FROM conversations WHERE related_type = 'wish';
DELETE FROM notifications WHERE related_type = 'wish';
DELETE FROM reports WHERE item_type = 'wish';
DELETE FROM wishes;

-- Verify:
SELECT COUNT(*) as remaining_wishes FROM wishes;


-- ========================================
-- OPTION 4: DELETE ONLY LISTINGS
-- ========================================

-- Delete listing-related data
DELETE FROM messages WHERE conversation_id IN (
  SELECT id FROM conversations WHERE related_type = 'listing'
);
DELETE FROM conversations WHERE related_type = 'listing';
DELETE FROM notifications WHERE related_type = 'listing';
DELETE FROM reports WHERE item_type = 'listing';
DELETE FROM listings;

-- Verify:
SELECT COUNT(*) as remaining_listings FROM listings;


-- ========================================
-- OPTION 5: KEEP USER PROFILES, DELETE EVERYTHING ELSE
-- ========================================

-- This is the SAFEST option for testing
-- Keeps: profiles, categories, cities, areas
-- Deletes: all content (tasks, wishes, listings, chats, notifications)

BEGIN;

-- Delete in order (to respect foreign keys)
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM reports;
DELETE FROM notifications;
DELETE FROM task_negotiations;
DELETE FROM tasks;
DELETE FROM wishes;
DELETE FROM listings;

-- Verify counts
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles_remaining,
  (SELECT COUNT(*) FROM tasks) as tasks_remaining,
  (SELECT COUNT(*) FROM wishes) as wishes_remaining,
  (SELECT COUNT(*) FROM listings) as listings_remaining,
  (SELECT COUNT(*) FROM conversations) as conversations_remaining,
  (SELECT COUNT(*) FROM messages) as messages_remaining,
  (SELECT COUNT(*) FROM notifications) as notifications_remaining;

COMMIT;


-- ========================================
-- OPTION 6: NUCLEAR + RESET PROFILES
-- ========================================
-- ⚠️ WARNING: This will delete ALL users too!
-- Only use if you want a completely fresh start

-- Uncomment below ONLY if you're sure:
/*
BEGIN;

-- Delete all user data
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM reports;
DELETE FROM notifications;
DELETE FROM task_negotiations;
DELETE FROM tasks;
DELETE FROM wishes;
DELETE FROM listings;
DELETE FROM push_tokens;
DELETE FROM user_activity_logs;

-- Delete all profiles (but keep auth.users intact)
DELETE FROM profiles;

-- Verify
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM tasks) as tasks_count,
  (SELECT COUNT(*) FROM wishes) as wishes_count,
  (SELECT COUNT(*) FROM listings) as listings_count;

COMMIT;
*/


-- ========================================
-- OPTION 7: RESET RELIABILITY SCORES
-- ========================================
-- Reset all user reliability scores to default (100)

UPDATE profiles 
SET 
  reliability_score = 100,
  total_tasks_completed = 0,
  total_wishes_granted = 0
WHERE reliability_score IS NOT NULL 
   OR total_tasks_completed IS NOT NULL 
   OR total_wishes_granted IS NOT NULL;

-- Verify:
SELECT 
  COUNT(*) as users_updated,
  AVG(reliability_score) as avg_score
FROM profiles;


-- ========================================
-- USEFUL DIAGNOSTIC QUERIES
-- ========================================

-- Check current data counts
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


-- Check tasks by status
SELECT status, COUNT(*) as count 
FROM tasks 
GROUP BY status 
ORDER BY count DESC;


-- Check wishes by status
SELECT status, COUNT(*) as count 
FROM wishes 
GROUP BY status 
ORDER BY count DESC;


-- Check listings by city
SELECT city_id, COUNT(*) as count 
FROM listings 
GROUP BY city_id 
ORDER BY count DESC;


-- Find orphaned conversations (no related task/wish/listing)
SELECT c.id, c.related_type, c.related_id
FROM conversations c
WHERE c.related_type = 'task' 
  AND NOT EXISTS (SELECT 1 FROM tasks WHERE id = c.related_id)
UNION ALL
SELECT c.id, c.related_type, c.related_id
FROM conversations c
WHERE c.related_type = 'wish' 
  AND NOT EXISTS (SELECT 1 FROM wishes WHERE id = c.related_id)
UNION ALL
SELECT c.id, c.related_type, c.related_id
FROM conversations c
WHERE c.related_type = 'listing' 
  AND NOT EXISTS (SELECT 1 FROM listings WHERE id = c.related_id);


-- ========================================
-- RECOMMENDED TESTING CLEANUP
-- ========================================
-- This is what I recommend for your testing:

-- 1. Keep your user account (so you don't need to re-register)
-- 2. Delete all content (tasks, wishes, listings, chats)
-- 3. Keep categories and location data

BEGIN;

-- Delete all content
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM notifications WHERE related_type IN ('task', 'wish', 'listing');
DELETE FROM reports WHERE item_type IN ('task', 'wish', 'listing');
DELETE FROM task_negotiations;
DELETE FROM tasks;
DELETE FROM wishes;
DELETE FROM listings;

-- Reset user stats
UPDATE profiles 
SET 
  total_tasks_completed = 0,
  total_wishes_granted = 0
WHERE total_tasks_completed > 0 OR total_wishes_granted > 0;

COMMIT;

-- Verify clean state
SELECT 
  '✅ Tasks deleted: ' || COUNT(*) as status FROM tasks
UNION ALL
SELECT '✅ Wishes deleted: ' || COUNT(*) FROM wishes
UNION ALL
SELECT '✅ Listings deleted: ' || COUNT(*) FROM listings
UNION ALL
SELECT '✅ Conversations deleted: ' || COUNT(*) FROM conversations
UNION ALL
SELECT '✅ Messages deleted: ' || COUNT(*) FROM messages
UNION ALL
SELECT '👤 Profiles kept: ' || COUNT(*) FROM profiles;


-- ========================================
-- QUICK COMMANDS FOR SUPABASE SQL EDITOR
-- ========================================

/*
COPY AND PASTE THESE ONE AT A TIME:

1. Quick nuclear delete (all content, keep users):
   DELETE FROM messages; DELETE FROM conversations; DELETE FROM notifications; DELETE FROM reports; DELETE FROM task_negotiations; DELETE FROM tasks; DELETE FROM wishes; DELETE FROM listings;

2. Quick verify:
   SELECT (SELECT COUNT(*) FROM tasks) as tasks, (SELECT COUNT(*) FROM wishes) as wishes, (SELECT COUNT(*) FROM listings) as listings;

3. Delete only your test data (replace with your user ID):
   DELETE FROM tasks WHERE user_id = 'YOUR_USER_ID_HERE';
   DELETE FROM wishes WHERE user_id = 'YOUR_USER_ID_HERE';
   DELETE FROM listings WHERE user_id = 'YOUR_USER_ID_HERE';
*/
