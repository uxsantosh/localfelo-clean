-- ========================================
-- DIAGNOSTIC: CHECK NOTIFICATIONS TABLE
-- ========================================
-- Run this FIRST to see what's wrong
-- ========================================

-- 1. Check what notification types currently exist
SELECT 
  type,
  COUNT(*) as count,
  CASE 
    WHEN type IN ('task', 'wish', 'listing', 'chat', 'system', 'admin', 'broadcast') 
    THEN '✅ VALID'
    ELSE '❌ INVALID'
  END as status
FROM public.notifications
GROUP BY type
ORDER BY count DESC;

-- 2. Show sample of invalid notifications (if any)
SELECT 
  id,
  user_id,
  type,
  title,
  message,
  created_at
FROM public.notifications
WHERE type NOT IN ('task', 'wish', 'listing', 'chat', 'system', 'admin', 'broadcast')
  OR type IS NULL
LIMIT 10;

-- 3. Check current constraint
SELECT 
  constraint_name, 
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%notification%';

-- 4. Count total notifications
SELECT 
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN type IS NULL THEN 1 END) as null_types,
  COUNT(CASE WHEN type IN ('task', 'wish', 'listing', 'chat', 'system', 'admin', 'broadcast') THEN 1 END) as valid_types,
  COUNT(CASE WHEN type NOT IN ('task', 'wish', 'listing', 'chat', 'system', 'admin', 'broadcast') AND type IS NOT NULL THEN 1 END) as invalid_types
FROM public.notifications;

-- ========================================
-- BASED ON THE RESULTS ABOVE:
-- ========================================
-- If you see invalid types, you have two options:
-- 
-- OPTION 1: Delete all invalid notifications
-- DELETE FROM public.notifications 
-- WHERE type NOT IN ('task', 'wish', 'listing', 'chat', 'system', 'admin', 'broadcast')
--    OR type IS NULL;
--
-- OPTION 2: Update invalid types to valid ones
-- UPDATE public.notifications SET type = 'chat' WHERE type IS NULL;
-- UPDATE public.notifications SET type = 'chat' WHERE type = 'message';
-- UPDATE public.notifications SET type = 'admin' WHERE type = 'system';
-- etc...
-- 
-- After fixing, run /FINAL_SQL_SETUP_SAFE.sql
-- ========================================
