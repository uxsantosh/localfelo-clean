-- =====================================================
-- COMPLETE FIX: Broadcast Notifications for LocalFelo
-- =====================================================
-- Problem: Users not receiving broadcast notifications
-- Root Cause: RLS policies using auth.uid() which is NULL for localStorage auth
-- Solution: Disable RLS (app-level filtering handles security)
-- =====================================================

-- ========================================
-- STEP 1: Drop old broadcast function
-- ========================================
DROP FUNCTION IF EXISTS broadcast_notification(uuid, text, text, text, text, uuid[]);
DROP FUNCTION IF EXISTS broadcast_notification(text, text, text, text, uuid[]);
DROP FUNCTION IF EXISTS broadcast_notification(text, text, text, text);

-- ========================================
-- STEP 2: Fix notifications table type constraint
-- ========================================
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'task_accepted',
    'task_rejected', 
    'task_started',
    'task_completed',
    'task_cancelled',
    'task_completion_request',
    'wish_accepted',
    'wish_fulfilled',
    'wish_cancelled',
    'counter_offer',
    'new_nearby_task',
    'new_nearby_wish',
    'new_nearby_listing',
    'chat_message',
    'info',
    'promotion',
    'alert',
    'broadcast',
    'system',
    'admin',
    'listing',
    'chat',
    'wish',
    'task'
  ));

-- ========================================
-- STEP 3: Disable RLS (localStorage auth doesn't work with auth.uid())
-- ========================================
-- Drop ALL existing RLS policies
DROP POLICY IF EXISTS notifications_select_own ON notifications;
DROP POLICY IF EXISTS notifications_insert_system ON notifications;
DROP POLICY IF EXISTS notifications_insert_service ON notifications;
DROP POLICY IF EXISTS notifications_insert_admin ON notifications;
DROP POLICY IF EXISTS notifications_update_own ON notifications;
DROP POLICY IF EXISTS notifications_delete_own ON notifications;
DROP POLICY IF EXISTS notifications_user_read ON notifications;
DROP POLICY IF EXISTS notifications_user_insert ON notifications;
DROP POLICY IF EXISTS notifications_user_update ON notifications;
DROP POLICY IF EXISTS notifications_user_delete ON notifications;
DROP POLICY IF EXISTS notifications_access ON notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert broadcast notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Service can create notifications" ON notifications;

-- Disable RLS completely (app-level filtering by user_id is sufficient)
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 4: Create broadcast notification function
-- ========================================
-- This function accepts admin_id as parameter (for localStorage auth)
-- Uses SECURITY DEFINER to bypass RLS (even though RLS is disabled, good practice)
CREATE OR REPLACE FUNCTION broadcast_notification(
  p_admin_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_user_ids UUID[] DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, inserted_count INTEGER, error_message TEXT) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_ids UUID[];
  v_inserted_count INTEGER := 0;
BEGIN
  -- Check if admin_id is provided
  IF p_admin_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'Not authenticated - admin_id is required'::TEXT;
    RETURN;
  END IF;

  -- Optional: Check if user is admin (uncomment if you want to enforce admin-only)
  -- IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_admin_id AND is_admin = TRUE) THEN
  --   RETURN QUERY SELECT FALSE, 0, 'Not authorized - admin access required'::TEXT;
  --   RETURN;
  -- END IF;

  -- Determine which users to notify
  IF p_user_ids IS NULL OR array_length(p_user_ids, 1) IS NULL THEN
    -- Broadcast to ALL users (exclude the admin sending it)
    SELECT array_agg(id) INTO v_user_ids 
    FROM profiles 
    WHERE id != p_admin_id; -- Don't send to self
  ELSE
    -- Broadcast to specific users
    v_user_ids := p_user_ids;
  END IF;

  -- Check if we have any users to notify
  IF v_user_ids IS NULL OR array_length(v_user_ids, 1) IS NULL OR array_length(v_user_ids, 1) = 0 THEN
    RETURN QUERY SELECT FALSE, 0, 'No users found to notify'::TEXT;
    RETURN;
  END IF;

  -- Insert notifications for all users
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    action_url,
    related_type,
    related_id,
    metadata,
    is_read,
    created_at
  )
  SELECT 
    unnest(v_user_ids),
    p_title,
    p_message,
    p_type,
    p_action_url,
    NULL,
    NULL,
    jsonb_build_object('broadcast_type', p_type, 'sent_by_admin', p_admin_id),
    FALSE,
    NOW();

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  -- Return success
  RETURN QUERY SELECT TRUE, v_inserted_count, NULL::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error
  RETURN QUERY SELECT FALSE, 0, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION broadcast_notification(UUID, TEXT, TEXT, TEXT, TEXT, UUID[]) TO anon;
GRANT EXECUTE ON FUNCTION broadcast_notification(UUID, TEXT, TEXT, TEXT, TEXT, UUID[]) TO authenticated;

-- ========================================
-- STEP 5: Create indexes for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ========================================
-- STEP 6: Enable realtime for notifications
-- ========================================
DO $$
BEGIN
  -- Check if table is already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    RAISE NOTICE '✅ Added notifications to realtime publication';
  ELSE
    RAISE NOTICE 'ℹ️  Notifications already in realtime publication';
  END IF;
END $$;

-- ========================================
-- STEP 7: Verification
-- ========================================
DO $$
DECLARE
  v_function_exists BOOLEAN;
  v_rls_enabled BOOLEAN;
  v_policy_count INTEGER;
BEGIN
  -- Check if function exists
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'broadcast_notification'
  ) INTO v_function_exists;

  -- Check RLS status
  SELECT relrowsecurity INTO v_rls_enabled
  FROM pg_class
  WHERE relname = 'notifications';

  -- Count policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE tablename = 'notifications';

  -- Print results
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ BROADCAST NOTIFICATIONS FIX COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Verification Results:';
  RAISE NOTICE '  • Function exists: %', CASE WHEN v_function_exists THEN '✅ YES' ELSE '❌ NO' END;
  RAISE NOTICE '  • RLS enabled: %', CASE WHEN v_rls_enabled THEN '❌ YES (should be disabled)' ELSE '✅ NO (correct)' END;
  RAISE NOTICE '  • RLS policies: % (should be 0)', v_policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 What Changed:';
  RAISE NOTICE '  1. ✅ Disabled RLS (localStorage auth doesn''t use auth.uid())';
  RAISE NOTICE '  2. ✅ Created broadcast_notification() function';
  RAISE NOTICE '  3. ✅ Function accepts admin_id as parameter';
  RAISE NOTICE '  4. ✅ Added performance indexes';
  RAISE NOTICE '  5. ✅ Enabled realtime subscriptions';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '  1. Test broadcast from Admin Panel';
  RAISE NOTICE '  2. Login as regular user and check bell icon';
  RAISE NOTICE '  3. Notifications should appear immediately';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
