-- =====================================================
-- COMPLETE NOTIFICATIONS FIX - WITH GRANTS
-- Includes table-level permissions + RLS policies
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
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON notifications;

-- Step 2: Grant table-level permissions to authenticated users
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- Step 3: Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SIMPLE, PERMISSIVE POLICIES
-- =====================================================

-- SELECT: Users can view their own notifications
CREATE POLICY "Enable select for authenticated users"
ON notifications
FOR SELECT
TO authenticated
USING (
  user_id::text = (SELECT auth.uid()::text)
);

-- INSERT: Users can insert their own notifications
CREATE POLICY "Enable insert for authenticated users"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (
  user_id::text = (SELECT auth.uid()::text)
);

-- UPDATE: Users can update their own notifications
CREATE POLICY "Enable update for authenticated users"
ON notifications
FOR UPDATE
TO authenticated
USING (
  user_id::text = (SELECT auth.uid()::text)
)
WITH CHECK (
  user_id::text = (SELECT auth.uid()::text)
);

-- DELETE: Users can delete their own notifications
CREATE POLICY "Enable delete for authenticated users"
ON notifications
FOR DELETE
TO authenticated
USING (
  user_id::text = (SELECT auth.uid()::text)
);

-- ADMIN INSERT: Admins can insert for any user (broadcasts)
CREATE POLICY "Admins can insert broadcast notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id::text = (SELECT auth.uid()::text)
    AND profiles.is_admin = true
  )
);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show grants
SELECT 
  grantee, 
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'notifications'
  AND grantee IN ('authenticated', 'service_role');

-- Show policies
SELECT 
  policyname, 
  cmd as operation,
  roles
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;

-- Show RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'notifications';

-- =====================================================
-- DONE!
-- =====================================================

/*
✅ WHAT THIS DOES:

1. GRANTS table-level permissions to 'authenticated' role
   - Without this, RLS policies won't work even if they pass

2. Uses (SELECT auth.uid()::text) instead of auth.uid()::text
   - Wrapping in SELECT can help with evaluation

3. Adds BOTH USING and WITH CHECK for UPDATE
   - Ensures user can both read and write their own data

4. Simple, clear policy names

This should DEFINITELY work now!
*/
