-- =====================================================
-- Fix Notifications System for LocalFelo
-- Fixes RLS policies to allow admin broadcasts
-- =====================================================

-- First, check if notifications table exists and has the correct structure
DO $$
BEGIN
  -- Update user_id column to reference profiles.id instead of client_token if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'user_id'
  ) THEN
    -- Drop the old foreign key constraint if it exists
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
    
    -- Change user_id column type to UUID if it's TEXT
    ALTER TABLE notifications ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    
    -- Add new foreign key constraint to profiles.id
    ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

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

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS notifications_select_own ON notifications;
DROP POLICY IF EXISTS notifications_insert_system ON notifications;
DROP POLICY IF EXISTS notifications_insert_admin ON notifications;
DROP POLICY IF EXISTS notifications_update_own ON notifications;
DROP POLICY IF EXISTS notifications_delete_own ON notifications;

-- Policy: Users can see their own notifications
CREATE POLICY notifications_select_own 
  ON notifications FOR SELECT 
  USING (
    user_id = auth.uid()::uuid
  );

-- Policy: Allow INSERT for authenticated users (for system/service operations)
-- This allows the Supabase client to insert notifications when called from the application
CREATE POLICY notifications_insert_system 
  ON notifications FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow INSERT for service role (for server-side operations)
CREATE POLICY notifications_insert_service 
  ON notifications FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own 
  ON notifications FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

-- Policy: Users can delete their own notifications
CREATE POLICY notifications_delete_own 
  ON notifications FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid()::uuid);

-- Create indexes if they don't exist
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

-- Enable realtime for notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'supabase_realtime publication does not exist, skipping...';
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ LocalFelo notifications system fixed successfully!';
  RAISE NOTICE '📢 Admin broadcast notifications are now enabled';
  RAISE NOTICE '🔐 RLS policies updated to use auth.uid()';
END $$;
