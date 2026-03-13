-- =====================================================
-- COMPLETE NOTIFICATIONS FIX - IDEMPOTENT VERSION
-- Run this in Supabase SQL Editor
-- Safe to run multiple times!
-- =====================================================

-- =====================================================
-- PART 1: FIX CHECK CONSTRAINTS
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

-- =====================================================
-- PART 2: FIX RLS POLICIES
-- =====================================================

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications for any user" ON notifications;
DROP POLICY IF EXISTS "Admins can insert broadcast notifications" ON notifications;
DROP POLICY IF EXISTS "Allow admins to insert broadcast notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (user_id::uuid = auth.uid()::uuid);

-- Policy 2: Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id::uuid = auth.uid()::uuid);

-- Policy 3: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON notifications
FOR DELETE
TO authenticated
USING (user_id::uuid = auth.uid()::uuid);

-- Policy 4: Admins can insert notifications for ANY user (for broadcast)
CREATE POLICY "Admins can insert broadcast notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id::uuid = auth.uid()::uuid
    AND profiles.is_admin = true
  )
);

-- Policy 5: System can insert notifications (for automated notifications)
CREATE POLICY "System can insert notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify check constraints
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'notifications'::regclass
  AND conname LIKE '%check%'
ORDER BY conname;

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;

-- =====================================================
-- DONE!
-- =====================================================

/*
WHAT THIS FIXES:
✅ Adds support for broadcast notification types: 'info', 'promotion', 'alert'
✅ Adds support for admin notification types: 'system', 'admin', 'broadcast'
✅ Allows related_type to be NULL or 'broadcast' for broadcast notifications
✅ Fixes \"new row violates check constraint\" errors
✅ Users can read their own notifications
✅ Users can update/delete their own notifications
✅ Admins can broadcast notifications to all users
✅ System can create automated notifications
✅ Fixes 406 errors when loading notifications
✅ Fixes \"operator does not exist: text = uuid\" errors with explicit type casting

NEXT STEPS:
1. Copy this entire SQL script
2. Go to Supabase Dashboard → SQL Editor
3. Paste and run this script
4. Check the verification output at the bottom
5. Test broadcast notifications from Admin panel
6. Done!
*/
