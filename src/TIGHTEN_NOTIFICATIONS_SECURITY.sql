-- =====================================================
-- TIGHTEN NOTIFICATIONS SECURITY
-- Now that it works, let's add proper user_id checks
-- =====================================================

-- Drop the ultra-permissive policies
DROP POLICY IF EXISTS "notifications_insert_all" ON notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;

-- =====================================================
-- PROPER SECURE POLICIES
-- =====================================================

-- SELECT: Users can only view their own notifications
CREATE POLICY "notifications_select_own"
ON notifications
FOR SELECT
TO authenticated
USING (user_id::text = auth.uid()::text);

-- INSERT: Users can only insert notifications for themselves
CREATE POLICY "notifications_insert_own"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id::text = auth.uid()::text);

-- UPDATE: Users can only update their own notifications
CREATE POLICY "notifications_update_own"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id::text = auth.uid()::text)
WITH CHECK (user_id::text = auth.uid()::text);

-- DELETE: Users can only delete their own notifications
CREATE POLICY "notifications_delete_own"
ON notifications
FOR DELETE
TO authenticated
USING (user_id::text = auth.uid()::text);

-- ADMIN: Admins can insert notifications for any user (for broadcasts)
CREATE POLICY "notifications_admin_insert"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id::text = auth.uid()::text
    AND profiles.is_admin = true
  )
);

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT '✅ Secure Policies Created' as status;
SELECT 
  policyname, 
  cmd as operation
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;

-- =====================================================
-- DONE!
-- =====================================================

/*
✅ WHAT THIS DOES:

1. SELECT: Users can only read their own notifications
2. INSERT: Users can only create notifications for themselves
3. UPDATE: Users can only update their own notifications (mark as read)
4. DELETE: Users can only delete their own notifications
5. ADMIN: Admins can create notifications for any user (broadcasts)

🔒 SECURITY:
- user_id::text = auth.uid()::text ensures proper matching
- Each user is isolated to their own data
- Admins have special broadcast permission

✅ NO CODE CHANGES NEEDED!
Your frontend is already correctly passing user_id.
*/
