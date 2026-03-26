-- =====================================================
-- NOTIFICATIONS RLS FIX - BOTH SIDES CAST TO TEXT
-- This handles ALL type mismatches
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

-- Step 2: Disable and re-enable RLS
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES - CAST BOTH SIDES TO TEXT
-- =====================================================

-- POLICY 1: SELECT
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (user_id::text = auth.uid()::text);

-- POLICY 2: INSERT - Regular users
CREATE POLICY "Users can insert their own notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id::text = auth.uid()::text);

-- POLICY 3: INSERT - Admins
CREATE POLICY "Admins can insert broadcast notifications"
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

-- POLICY 4: UPDATE
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id::text = auth.uid()::text);

-- POLICY 5: DELETE
CREATE POLICY "Users can delete their own notifications"
ON notifications
FOR DELETE
TO authenticated
USING (user_id::text = auth.uid()::text);

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Policies created:' as status;
SELECT 
  policyname, 
  cmd as operation
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;

SELECT 'RLS status:' as status;
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'notifications';

-- =====================================================
-- DONE!
-- =====================================================

/*
✅ THE FIX: Cast BOTH sides to TEXT

user_id::text = auth.uid()::text

This works whether user_id is:
- UUID type → casts to text
- TEXT type → already text
- Any other type → casts to text

This is the universal solution!
*/
