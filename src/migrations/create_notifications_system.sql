-- =====================================================
-- Notifications System for OldCycle
-- SAFE VERSION - Handles existing objects
-- =====================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(client_token) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
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
    'chat_message'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id TEXT, -- task_id, wish_id, or conversation_id
  related_type TEXT CHECK (related_type IN ('task', 'wish', 'listing', 'chat')),
  action_url TEXT, -- where to navigate on click
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB, -- extra data like price, username, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Create indexes (IF NOT EXISTS only works in PostgreSQL 9.5+)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_id') THEN
    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_created_at') THEN
    CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_unread') THEN
    CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
  END IF;
END $$;

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

COMMENT ON TABLE notifications IS 'User notifications for tasks, wishes, and chat events';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Notifications system created/updated successfully!';
END $$;