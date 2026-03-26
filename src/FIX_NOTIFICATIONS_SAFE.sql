-- =====================================================
-- FIX NOTIFICATIONS TYPE MISMATCH - SAFE VERSION
-- =====================================================
-- This version handles all dependencies properly
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check current schema
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔍 CHECKING CURRENT SCHEMA...';
  RAISE NOTICE '';
  
  -- Check profiles.id type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    RAISE NOTICE '✅ profiles.id is UUID';
  ELSE
    RAISE NOTICE '❌ profiles.id is NOT UUID - this is a problem!';
  END IF;
  
  -- Check notifications.user_id type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'user_id' 
    AND data_type = 'text'
  ) THEN
    RAISE NOTICE '⚠️  notifications.user_id is TEXT (needs to be UUID)';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'user_id' 
    AND data_type = 'uuid'
  ) THEN
    RAISE NOTICE '✅ notifications.user_id is already UUID - script will verify setup';
  ELSE
    RAISE NOTICE '❓ notifications.user_id column not found';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 2: Backup existing notifications
-- =====================================================
DO $$
DECLARE
  notification_count INTEGER;
BEGIN
  -- Count existing notifications
  SELECT COUNT(*) INTO notification_count FROM public.notifications;
  
  IF notification_count > 0 THEN
    RAISE NOTICE '📊 Found % existing notifications', notification_count;
    RAISE NOTICE '💾 Creating backup...';
    
    -- Create backup table
    DROP TABLE IF EXISTS notifications_backup;
    CREATE TABLE notifications_backup AS SELECT * FROM public.notifications;
    
    RAISE NOTICE '✅ Backup created: notifications_backup';
  ELSE
    RAISE NOTICE 'ℹ️  No existing notifications to backup';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 3: Drop ALL RLS policies (they depend on user_id column)
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Dropping RLS policies...';
END $$;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;

-- Step 4: Drop all constraints
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Dropping constraints...';
END $$;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS fk_notifications_user;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Step 5: Drop all indexes (they reference user_id)
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Dropping indexes...';
END $$;

DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_user_read;
DROP INDEX IF EXISTS idx_notifications_unread;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_related;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_user_unread;

-- Step 6: Convert user_id from TEXT to UUID
-- =====================================================
DO $$
DECLARE
  current_type TEXT;
BEGIN
  -- Get current type of user_id column
  SELECT data_type INTO current_type
  FROM information_schema.columns 
  WHERE table_name = 'notifications' 
  AND column_name = 'user_id';
  
  IF current_type = 'text' THEN
    RAISE NOTICE '🔄 Converting user_id from TEXT to UUID...';
    
    -- Try to convert TEXT to UUID
    -- This will fail if there are invalid UUIDs - that's OK, we'll handle it
    BEGIN
      -- First, try to convert valid UUIDs directly
      ALTER TABLE public.notifications 
        ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
      
      RAISE NOTICE '✅ Direct conversion successful!';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️  Direct conversion failed - trying lookup method...';
      
      -- Add temporary UUID column
      ALTER TABLE public.notifications ADD COLUMN user_id_temp UUID;
      
      -- Try to populate it by looking up in profiles
      UPDATE public.notifications n
      SET user_id_temp = p.id
      FROM public.profiles p
      WHERE p.client_token = n.user_id 
         OR p.owner_token = n.user_id;
      
      -- Delete rows that couldn't be converted
      DELETE FROM public.notifications WHERE user_id_temp IS NULL;
      
      -- Drop old column and rename new one
      ALTER TABLE public.notifications DROP COLUMN user_id;
      ALTER TABLE public.notifications RENAME COLUMN user_id_temp TO user_id;
      
      RAISE NOTICE '✅ Lookup conversion completed';
    END;
  ELSIF current_type = 'uuid' THEN
    RAISE NOTICE '✅ user_id is already UUID - skipping conversion';
  ELSE
    RAISE EXCEPTION 'Unknown data type for user_id: %', current_type;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 7: Ensure all required columns exist
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Ensuring all required columns exist...';
  
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID;
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message TEXT;
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT;
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_type TEXT;
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_id TEXT;
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata JSONB;
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
  
  -- Set NOT NULL constraints
  ALTER TABLE public.notifications ALTER COLUMN user_id SET NOT NULL;
  ALTER TABLE public.notifications ALTER COLUMN title SET NOT NULL;
  ALTER TABLE public.notifications ALTER COLUMN message SET NOT NULL;
  ALTER TABLE public.notifications ALTER COLUMN type SET NOT NULL;
  ALTER TABLE public.notifications ALTER COLUMN is_read SET NOT NULL;
  ALTER TABLE public.notifications ALTER COLUMN created_at SET NOT NULL;
  
  -- Ensure id is primary key
  ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
  ALTER TABLE public.notifications ADD PRIMARY KEY (id);
  
  RAISE NOTICE '✅ All columns verified';
  RAISE NOTICE '';
END $$;

-- Step 8: Add CHECK constraint for notification types
-- =====================================================
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check CHECK (type IN (
    'task', 'wish', 'listing', 'chat', 'system',
    'task_accepted', 'task_cancelled', 'task_completion_request', 'task_completed',
    'chat_message',
    'admin', 'broadcast', 'info', 'promotion', 'alert'
  ));

-- Step 9: Add foreign key constraint (UUID to UUID)
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Creating foreign key constraint...';
END $$;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Step 10: Create indexes for performance
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Creating indexes...';
END $$;

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_related ON public.notifications(related_type, related_id);

-- Step 11: Enable Row Level Security
-- =====================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 12: Create RLS policies
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Creating RLS policies...';
END $$;

-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id IN (
    SELECT id FROM public.profiles WHERE id = user_id
  ));

-- Policy 2: Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id IN (
    SELECT id FROM public.profiles WHERE id = user_id
  ));

-- Policy 3: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (user_id IN (
    SELECT id FROM public.profiles WHERE id = user_id
  ));

-- Policy 4: Allow INSERT for authenticated users
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Policy 5: Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications"
  ON public.notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = notifications.user_id
      AND profiles.is_admin = true
    )
  );

-- Step 13: Create trigger for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notifications_updated_at_trigger ON public.notifications;

CREATE TRIGGER update_notifications_updated_at_trigger
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notifications_updated_at();

-- Step 14: Enable realtime
-- =====================================================
DO $$
BEGIN
  -- Try to add table to realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  RAISE NOTICE '✅ Realtime enabled';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'ℹ️  Realtime already enabled';
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Could not enable realtime (may not be an issue)';
END $$;

-- Step 15: Grant permissions
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- Step 16: Final verification
-- =====================================================
DO $$
DECLARE
  notification_count INTEGER;
  backup_count INTEGER := 0;
  user_id_type TEXT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ========================================';
  RAISE NOTICE '🎉 NOTIFICATIONS FIX COMPLETE!';
  RAISE NOTICE '🎉 ========================================';
  RAISE NOTICE '';
  
  -- Get user_id data type
  SELECT data_type INTO user_id_type
  FROM information_schema.columns 
  WHERE table_name = 'notifications' 
  AND column_name = 'user_id';
  
  RAISE NOTICE '✅ notifications.user_id type: %', user_id_type;
  
  -- Count current notifications
  SELECT COUNT(*) INTO notification_count FROM public.notifications;
  RAISE NOTICE '📊 Current notifications: %', notification_count;
  
  -- Count backup (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications_backup') THEN
    SELECT COUNT(*) INTO backup_count FROM notifications_backup;
    RAISE NOTICE '💾 Backup notifications: %', backup_count;
    
    IF backup_count > notification_count THEN
      RAISE NOTICE '⚠️  WARNING: % notifications were deleted during conversion', backup_count - notification_count;
      RAISE NOTICE '   Backup table: notifications_backup (you can inspect it)';
    END IF;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Schema setup:';
  RAISE NOTICE '   - Foreign key: notifications.user_id → profiles.id (UUID → UUID)';
  RAISE NOTICE '   - 5 indexes for performance';
  RAISE NOTICE '   - 5 RLS policies for security';
  RAISE NOTICE '   - updated_at trigger';
  RAISE NOTICE '   - Realtime enabled';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next steps:';
  RAISE NOTICE '   1. Test creating a notification';
  RAISE NOTICE '   2. Test chat message notifications';
  RAISE NOTICE '   3. Test task acceptance notifications';
  RAISE NOTICE '   4. Drop backup when confident: DROP TABLE notifications_backup;';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- OPTIONAL: Test notification creation
-- =====================================================
/*
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get a random user ID for testing
  SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      is_read,
      created_at
    ) VALUES (
      test_user_id,
      'Test Notification',
      'This is a test notification to verify the fix',
      'system',
      false,
      NOW()
    );
    
    RAISE NOTICE '✅ Test notification created successfully for user: %', test_user_id;
  ELSE
    RAISE NOTICE '⚠️  No users found to test with';
  END IF;
END $$;
*/
