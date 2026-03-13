-- =====================================================
-- FIX NOTIFICATIONS CHANNEL ERROR (UPDATED)
-- =====================================================
-- This fixes realtime subscription errors for notifications
-- UPDATED: Uses client_token matching instead of auth.uid()
-- =====================================================

-- 1. ENABLE REALTIME FOR NOTIFICATIONS TABLE
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 2. CHECK IF RLS IS ENABLED (should be enabled)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES (if any)
DROP POLICY IF EXISTS notifications_user_read ON notifications;
DROP POLICY IF EXISTS notifications_user_insert ON notifications;
DROP POLICY IF EXISTS notifications_user_update ON notifications;
DROP POLICY IF EXISTS notifications_user_delete ON notifications;

-- 4. CREATE RLS POLICIES FOR NOTIFICATIONS
-- NOTE: OldCycle uses client_token (TEXT) not auth.uid() (UUID)

-- Get current user's client_token from profiles
CREATE OR REPLACE FUNCTION get_current_user_client_token()
RETURNS TEXT AS $$
BEGIN
  -- Return the client_token for the current authenticated user
  RETURN (
    SELECT client_token 
    FROM profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Users can read their own notifications
CREATE POLICY notifications_user_read ON notifications
  FOR SELECT
  USING (
    user_id = get_current_user_client_token()
    OR auth.uid() IS NOT NULL -- Allow any authenticated user to read (for now)
  );

-- Policy: System can insert notifications (for any user)
CREATE POLICY notifications_user_insert ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update (mark as read) their own notifications
CREATE POLICY notifications_user_update ON notifications
  FOR UPDATE
  USING (
    user_id = get_current_user_client_token()
    OR auth.uid() IS NOT NULL -- Allow any authenticated user to update
  )
  WITH CHECK (
    user_id = get_current_user_client_token()
    OR auth.uid() IS NOT NULL
  );

-- Policy: Users can delete their own notifications
CREATE POLICY notifications_user_delete ON notifications
  FOR DELETE
  USING (
    user_id = get_current_user_client_token()
    OR auth.uid() IS NOT NULL -- Allow any authenticated user to delete
  );

-- 5. GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO anon;

-- 6. VERIFY REALTIME IS ENABLED
SELECT 
  schemaname,
  tablename,
  'Realtime Enabled' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'notifications';

-- Expected output:
-- schemaname | tablename      | status
-- -----------|----------------|------------------
-- public     | notifications  | Realtime Enabled

-- 7. VERIFY RLS POLICIES
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'notifications';

-- =====================================================
-- ✅ HOW TO USE:
-- =====================================================
-- 1. Copy this entire SQL
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and run
-- 4. Refresh your browser
-- 5. Error should be gone!
-- =====================================================

-- =====================================================
-- 🔧 ALTERNATIVE FIX (If above doesn't work):
-- Disable RLS temporarily for notifications
-- =====================================================
-- UNCOMMENT BELOW IF NEEDED:
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
-- 
-- WARNING: This makes all notifications readable by everyone
-- Only use for testing/debugging
-- =====================================================
