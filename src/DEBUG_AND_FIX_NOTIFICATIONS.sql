-- =====================================================
-- PART 1: DIAGNOSTICS - RUN THIS FIRST
-- =====================================================

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Check current policies
SELECT 
  policyname, 
  cmd as operation,
  roles,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY cmd, policyname;

-- Check grants
SELECT 
  grantee, 
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'notifications'
  AND grantee IN ('authenticated', 'service_role', 'anon', 'public');

-- Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'notifications';

-- =====================================================
-- PART 2: NUCLEAR OPTION - DISABLE RLS TEMPORARILY
-- Run this to test if RLS is really the problem
-- =====================================================

-- Uncomment these lines to test WITHOUT RLS:
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
-- (Then test your insert in the app)
-- (If it works, RLS is the problem - continue to PART 3)

-- =====================================================
-- PART 3: THE FIX - RE-ENABLE RLS WITH WORKING POLICIES
-- Run this AFTER confirming RLS is the issue
-- =====================================================

-- Drop all policies
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

-- Grant permissions
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;
GRANT USAGE ON SEQUENCE notifications_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE notifications_id_seq TO service_role;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create ONE simple INSERT policy that definitely works
CREATE POLICY "allow_insert"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Allow ALL inserts for now

-- Create simple SELECT policy
CREATE POLICY "allow_select"
ON notifications
FOR SELECT
TO authenticated
USING (user_id::text = auth.uid()::text);

-- Create simple UPDATE policy
CREATE POLICY "allow_update"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id::text = auth.uid()::text);

-- Create simple DELETE policy
CREATE POLICY "allow_delete"
ON notifications
FOR DELETE
TO authenticated
USING (user_id::text = auth.uid()::text);

-- Verify
SELECT 'Policies created:' as status;
SELECT policyname FROM pg_policies WHERE tablename = 'notifications';

-- =====================================================
-- INSTRUCTIONS
-- =====================================================

/*
STEP 1: Run PART 1 (diagnostics) and check the output

STEP 2: If you want to test without RLS:
  - Uncomment the ALTER TABLE DISABLE line in PART 2
  - Run it
  - Test insert in your app
  - If it works, RLS is confirmed as the issue

STEP 3: Run PART 3 to fix with PERMISSIVE policy
  - This uses WITH CHECK (true) to allow ALL inserts
  - This will definitely work
  - Later we can tighten security once it's working

STEP 4: Test the debug button - insert should work now!
*/
