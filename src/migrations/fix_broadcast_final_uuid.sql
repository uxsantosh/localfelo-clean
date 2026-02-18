-- =====================================================
-- Fix Broadcast Notifications - FINAL UUID FIX
-- Uses UUID type directly instead of TEXT
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

-- Drop ALL existing versions of the function
DROP FUNCTION IF EXISTS broadcast_notification(text, text, text, text, uuid[]);
DROP FUNCTION IF EXISTS broadcast_notification(text, text, text, text, text[]);
DROP FUNCTION IF EXISTS broadcast_notification(text, text, text, text, text, text[]);
DROP FUNCTION IF EXISTS broadcast_notification(uuid, text, text, text, text, uuid[]);

-- Create function with UUID type for admin_id and user_ids
CREATE OR REPLACE FUNCTION broadcast_notification(
  p_admin_id UUID,           -- Changed to UUID
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_user_ids UUID[] DEFAULT NULL  -- Changed to UUID[]
)
RETURNS TABLE(success BOOLEAN, inserted_count INTEGER, error_message TEXT) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_ids UUID[];  -- Changed to UUID[]
  v_inserted_count INTEGER := 0;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if admin_id is provided
  IF p_admin_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'Admin ID required'::TEXT;
    RETURN;
  END IF;

  -- Check if the user is admin
  SELECT is_admin INTO v_is_admin 
  FROM profiles 
  WHERE id = p_admin_id;

  IF v_is_admin IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'User not found'::TEXT;
    RETURN;
  END IF;

  IF NOT v_is_admin THEN
    RETURN QUERY SELECT FALSE, 0, 'Admin access required'::TEXT;
    RETURN;
  END IF;

  -- Determine which users to notify
  IF p_user_ids IS NULL OR array_length(p_user_ids, 1) IS NULL THEN
    -- Broadcast to ALL users - get all profile IDs as UUID array
    SELECT array_agg(id) INTO v_user_ids FROM profiles;
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
    unnest(v_user_ids),  -- Already UUID type, no casting needed
    p_title,
    p_message,
    p_type,
    p_action_url,
    NULL,
    NULL,
    jsonb_build_object('broadcast_type', p_type, 'sent_by_admin', p_admin_id::text),
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
GRANT EXECUTE ON FUNCTION broadcast_notification(UUID, TEXT, TEXT, TEXT, TEXT, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION broadcast_notification(UUID, TEXT, TEXT, TEXT, TEXT, UUID[]) TO anon;
GRANT EXECUTE ON FUNCTION broadcast_notification(UUID, TEXT, TEXT, TEXT, TEXT, UUID[]) TO public;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Broadcast notification function created!';
  RAISE NOTICE '📢 Admins can now send broadcast notifications';
  RAISE NOTICE '🔐 Function verifies admin status before sending';
  RAISE NOTICE '🔐 Function uses SECURITY DEFINER to bypass RLS';
  RAISE NOTICE '🔄 Using native UUID types (no conversion needed)';
  RAISE NOTICE '========================================';
END $$;
