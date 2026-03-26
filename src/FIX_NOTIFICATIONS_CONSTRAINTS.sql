-- =====================================================
-- FIX NOTIFICATIONS CHECK CONSTRAINTS FOR BROADCASTS
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing check constraints
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_related_type_check;

-- Add updated type constraint with broadcast types
ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  -- Task notifications
  'task_accepted',
  'task_rejected', 
  'task_started',
  'task_completed',
  'task_cancelled',
  'task_completion_request',
  -- Wish notifications
  'wish_accepted',
  'wish_fulfilled',
  'wish_cancelled',
  -- Other notifications
  'counter_offer',
  'new_nearby_task',
  'new_nearby_wish',
  'new_nearby_listing',
  'chat_message',
  -- Broadcast & Admin notifications
  'info',
  'promotion',
  'alert',
  'system',
  'admin',
  'broadcast',
  -- Chat type
  'chat'
));

-- Add updated related_type constraint (allow NULL for broadcasts)
ALTER TABLE notifications 
ADD CONSTRAINT notifications_related_type_check 
CHECK (related_type IS NULL OR related_type IN ('task', 'wish', 'listing', 'chat', 'broadcast'));

-- Verify constraints
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'notifications'::regclass
  AND conname LIKE '%check%'
ORDER BY conname;

-- =====================================================
-- DONE!
-- =====================================================

/*
WHAT THIS FIXES:
✅ Adds support for broadcast notification types: 'info', 'promotion', 'alert'
✅ Adds support for admin notification types: 'system', 'admin', 'broadcast'
✅ Allows related_type to be NULL or 'broadcast' for broadcast notifications
✅ Fixes "new row violates check constraint" errors

NEXT STEPS:
1. Run this SQL in Supabase SQL Editor
2. Test broadcast notifications from Admin panel
3. Done!
*/
