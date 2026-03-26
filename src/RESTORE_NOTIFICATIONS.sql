-- =====================================================
-- RESTORE NOTIFICATIONS SYSTEM
-- Run this to restore working notifications
-- =====================================================

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS notifications_select_own ON notifications;
DROP POLICY IF EXISTS notifications_insert_system ON notifications;
DROP POLICY IF EXISTS notifications_update_own ON notifications;
DROP POLICY IF EXISTS notifications_delete_own ON notifications;

-- Policy: Users can only see their own notifications
CREATE POLICY notifications_select_own 
  ON notifications FOR SELECT 
  USING (user_id = current_setting('app.user_token', true));

-- Policy: System can insert notifications (using service role)
CREATE POLICY notifications_insert_system 
  ON notifications FOR INSERT 
  WITH CHECK (true);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own 
  ON notifications FOR UPDATE 
  USING (user_id = current_setting('app.user_token', true));

-- Policy: Users can delete their own notifications
CREATE POLICY notifications_delete_own 
  ON notifications FOR DELETE 
  USING (user_id = current_setting('app.user_token', true));

-- Enable realtime for notifications
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
  END IF;
END $$;

-- Drop and recreate functions to ensure they're up to date
DROP FUNCTION IF EXISTS create_notification(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS mark_notification_read(UUID);
DROP FUNCTION IF EXISTS mark_all_notifications_read();
DROP FUNCTION IF EXISTS get_unread_notification_count();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id TEXT,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_id TEXT DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_id,
    related_type,
    action_url,
    metadata
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_related_id,
    p_related_type,
    p_action_url,
    p_metadata
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications 
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = current_setting('app.user_token', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
  UPDATE notifications 
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE user_id = current_setting('app.user_token', true)
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = current_setting('app.user_token', true)
      AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify notifications table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    RAISE EXCEPTION '❌ Notifications table does not exist! Run /migrations/create_notifications_system.sql first';
  ELSE
    RAISE NOTICE '✅ Notifications system restored successfully!';
  END IF;
END $$;
