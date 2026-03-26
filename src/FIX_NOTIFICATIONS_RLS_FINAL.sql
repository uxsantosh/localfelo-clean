-- =====================================================
-- FIX NOTIFICATIONS RLS POLICIES - FINAL VERSION
-- This fixes the "new row violates row-level security policy" error
-- =====================================================

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications for any user" ON notifications;
DROP POLICY IF EXISTS "Admins can insert broadcast notifications" ON notifications;
DROP POLICY IF EXISTS "Allow admins to insert broadcast notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Step 2: Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICY 1: SELECT - Users can view their own notifications
-- =====================================================
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (user_id::uuid = auth.uid()::uuid);

-- =====================================================
-- POLICY 2: INSERT - Users can insert their own notifications
-- This is the KEY policy that was missing!
-- =====================================================
CREATE POLICY "Users can insert their own notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id::uuid = auth.uid()::uuid);

-- =====================================================
-- POLICY 3: INSERT - Admins can insert for ANY user (broadcasts)
-- =====================================================
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

-- =====================================================
-- POLICY 4: UPDATE - Users can update their own notifications
-- =====================================================
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id::uuid = auth.uid()::uuid);

-- =====================================================
-- POLICY 5: DELETE - Users can delete their own notifications
-- =====================================================
CREATE POLICY "Users can delete their own notifications"
ON notifications
FOR DELETE
TO authenticated
USING (user_id::uuid = auth.uid()::uuid);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check all policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read notifications'
    WHEN cmd = 'INSERT' THEN 'Create notifications'
    WHEN cmd = 'UPDATE' THEN 'Update notifications'
    WHEN cmd = 'DELETE' THEN 'Delete notifications'
  END as description
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;

-- Test query (should return your notifications)
SELECT COUNT(*) as my_notification_count
FROM notifications
WHERE user_id::uuid = auth.uid()::uuid;

-- =====================================================
-- DONE!
-- =====================================================

/*
✅ WHAT THIS FIXES:

The main issue was MISSING the "Users can insert their own notifications" policy!

OLD SETUP (BROKEN):
- ❌ Only admins could insert notifications
- ❌ Regular users got "violates row-level security policy" error

NEW SETUP (FIXED):
- ✅ Users can insert their own notifications (user_id = auth.uid())
- ✅ Admins can insert notifications for ANY user (for broadcasts)
- ✅ Users can read/update/delete their own notifications
- ✅ Type casting (::uuid) prevents type mismatch errors

HOW IT WORKS:
1. When YOU create a test notification for yourself → Policy 2 allows it
2. When ADMIN creates broadcast for all users → Policy 3 allows it
3. Multiple INSERT policies work with OR logic (either one passing = allowed)

NEXT STEPS:
1. Copy this entire SQL script
2. Paste into Supabase Dashboard → SQL Editor
3. Run it
4. Test the debug button again
5. The insert test should now succeed! ✅
*/