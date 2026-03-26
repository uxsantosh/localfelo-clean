-- =====================================================
-- SIMPLE NOTIFICATIONS CHANNEL FIX
-- =====================================================
-- Fixes: ❌ [Notifications] Channel error
-- =====================================================
-- This is a simplified, safer version that works on any Supabase setup
-- =====================================================

-- STEP 1: Enable Row Level Security (if not already)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- STEP 2: Drop existing policies (clean slate)
DROP POLICY IF EXISTS notifications_user_read ON notifications;
DROP POLICY IF EXISTS notifications_user_insert ON notifications;
DROP POLICY IF EXISTS notifications_user_update ON notifications;
DROP POLICY IF EXISTS notifications_user_delete ON notifications;

-- STEP 3: Create RLS Policies with proper type casting

-- Users can read their own notifications
-- Cast both auth.uid() and user_id to TEXT for comparison
CREATE POLICY notifications_user_read ON notifications
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Anyone can insert notifications (for system/triggers)
CREATE POLICY notifications_user_insert ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_user_update ON notifications
  FOR UPDATE
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own notifications
CREATE POLICY notifications_user_delete ON notifications
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- STEP 4: Enable Realtime
-- Check if table is already in publication before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    RAISE NOTICE '✅ Added notifications to realtime publication';
  ELSE
    RAISE NOTICE 'ℹ️ Notifications already in realtime publication (this is OK)';
  END IF;
END $$;

-- STEP 5: Grant permissions
GRANT ALL ON notifications TO postgres, anon, authenticated, service_role;

-- STEP 6: Verify realtime is enabled
SELECT 
  schemaname,
  tablename,
  'Realtime Enabled ✅' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename = 'notifications';

-- Expected output:
-- schemaname | tablename      | status
-- -----------|----------------|---------------------
-- public     | notifications  | Realtime Enabled ✅

-- =====================================================
-- ✅ DONE!
-- =====================================================
-- Now:
-- 1. Refresh your browser (close all tabs, open new)
-- 2. Check console (F12)
-- 3. Should see: "✅ [Notifications] Realtime subscription active"
-- 4. Should NOT see: "❌ [Notifications] Channel error"
-- =====================================================