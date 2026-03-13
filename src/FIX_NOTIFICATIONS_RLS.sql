-- =====================================================
-- FIX NOTIFICATIONS RLS POLICIES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications for any user" ON notifications;
DROP POLICY IF EXISTS "Allow admins to insert broadcast notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own notifications
-- ⚠️ IMPORTANT: Cast both auth.uid() and user_id to UUID explicitly to avoid type mismatch errors
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

-- Check if policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'notifications';

-- =====================================================
-- DONE!
-- =====================================================

/*
WHAT THIS FIXES:
✅ Users can read their own notifications
✅ Users can update/delete their own notifications
✅ Admins can broadcast notifications to all users
✅ System can create automated notifications
✅ Fixes 406 errors when loading notifications
✅ Fixes "operator does not exist: text = uuid" errors with explicit type casting

NEXT STEPS:
1. Run this SQL in Supabase SQL Editor
2. Clear browser cache (Ctrl+Shift+R)
3. Test broadcast notifications
4. Done!
*/
