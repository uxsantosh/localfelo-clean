-- =====================================================
-- Fix Broadcast Notifications - Simple Version
-- Just create the function, don't touch existing table
-- =====================================================

-- Update type CHECK constraint to include broadcast types
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

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS broadcast_notification(text, text, text, text, uuid[]);
DROP FUNCTION IF EXISTS broadcast_notification(text, text, text, text, text[]);

-- Create function to broadcast notifications (bypasses RLS with SECURITY DEFINER)
-- Uses TEXT[] for user_ids to match the current column type
CREATE OR REPLACE FUNCTION broadcast_notification(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_user_ids TEXT[] DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, inserted_count INTEGER, error_message TEXT) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_ids TEXT[];
  v_inserted_count INTEGER := 0;
  v_admin_id TEXT;
BEGIN
  -- Get the current user's ID (the admin calling this function)
  -- Convert UUID to TEXT to match column type
  v_admin_id := auth.uid()::text;
  
  -- Check if user is authenticated
  IF v_admin_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'Not authenticated'::TEXT;
    RETURN;
  END IF;

  -- Optional: Check if user is admin (uncomment if you want to enforce admin-only)
  -- IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id::uuid AND is_admin = TRUE) THEN
  --   RETURN QUERY SELECT FALSE, 0, 'Not authorized - admin access required'::TEXT;
  --   RETURN;
  -- END IF;

  -- Determine which users to notify
  IF p_user_ids IS NULL OR array_length(p_user_ids, 1) IS NULL THEN
    -- Broadcast to ALL users - get all profile IDs as TEXT
    SELECT array_agg(id::text) INTO v_user_ids FROM profiles;
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
    jsonb_build_object('broadcast_type', p_type, 'sent_by_admin', v_admin_id),
    FALSE,
    NOW();

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  -- Return success
  RETURN QUERY SELECT TRUE, v_inserted_count, NULL::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error with details
  RETURN QUERY SELECT FALSE, 0, ('Error: ' || SQLERRM)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION broadcast_notification(TEXT, TEXT, TEXT, TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION broadcast_notification(TEXT, TEXT, TEXT, TEXT, TEXT[]) TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Broadcast notification function created!';
  RAISE NOTICE '📢 Admins can now send broadcast notifications';
  RAISE NOTICE '🔐 Function uses SECURITY DEFINER to bypass RLS';
  RAISE NOTICE '========================================';
END $$;
