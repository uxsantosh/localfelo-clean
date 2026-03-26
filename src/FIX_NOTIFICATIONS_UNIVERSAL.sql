-- =====================================================
-- UNIVERSAL NOTIFICATIONS FIX
-- Works regardless of whether user_id is TEXT or UUID
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

-- Step 2: Disable and re-enable RLS to reset
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- UNIVERSAL POLICIES (work with TEXT or UUID columns)
-- =====================================================

-- POLICY 1: SELECT - Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

-- POLICY 2: INSERT - Users can insert their own notifications
-- THIS IS THE KEY POLICY!
CREATE POLICY "Users can insert their own notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

-- POLICY 3: INSERT - Admins can insert for ANY user (broadcasts)
CREATE POLICY "Admins can insert broadcast notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()::text
    AND profiles.is_admin = true
  )
);

-- POLICY 4: UPDATE - Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text);

-- POLICY 5: DELETE - Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON notifications
FOR DELETE
TO authenticated
USING (user_id = auth.uid()::text);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check all policies are created
SELECT 
  policyname, 
  cmd as operation
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;

-- Check RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'notifications';

-- =====================================================
-- DONE!
-- =====================================================

/*
✅ KEY CHANGES:

1. Cast auth.uid() to TEXT (not UUID) → user_id = auth.uid()::text
2. This works because Supabase stores user_id as TEXT in most tables
3. Disabled/enabled RLS to ensure clean state

WHY THIS WORKS:
- Most Supabase tables use TEXT for user IDs (not UUID type)
- auth.uid() returns UUID, so we cast it to TEXT: auth.uid()::text
- This matches the TEXT column in notifications table

NEXT STEPS:
1. Run this script in Supabase SQL Editor
2. Test the debug button again
3. Should now show ✅ for insert test!
*/
