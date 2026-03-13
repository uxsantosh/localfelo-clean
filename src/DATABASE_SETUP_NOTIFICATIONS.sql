-- =====================================================
-- OldCycle Notification System - Database Setup
-- =====================================================
-- Run this SQL in your Supabase SQL Editor

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'promotion', 'alert', 'system')),
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

-- 5. Create RLS Policies with explicit type casting

-- Users can read their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id::text = (auth.uid())::text);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id::text = (auth.uid())::text);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (user_id::text = (auth.uid())::text);

-- Only authenticated users can insert notifications (for admin broadcast)
-- Admin check will be done at application level
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Create function to automatically clean old notifications (optional)
-- Keeps only last 100 notifications per user
CREATE OR REPLACE FUNCTION clean_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE id IN (
    SELECT id FROM (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as row_num
      FROM public.notifications
    ) t
    WHERE t.row_num > 100
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if table was created successfully
SELECT 
  'Table created' as status,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'notifications' 
  AND table_schema = 'public';

-- Check if indexes were created
SELECT 
  'Index created' as status,
  indexname 
FROM pg_indexes 
WHERE tablename = 'notifications' 
  AND schemaname = 'public';

-- Check if RLS policies were created
SELECT 
  'Policy created' as status,
  policyname,
  cmd as command
FROM pg_policies 
WHERE tablename = 'notifications' 
  AND schemaname = 'public';

-- =====================================================
-- FINAL SUCCESS MESSAGE
-- =====================================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Notifications system setup complete!';
  RAISE NOTICE '✅ Table created: public.notifications';
  RAISE NOTICE '✅ Indexes created: 4 indexes';
  RAISE NOTICE '✅ RLS enabled with 4 policies';
  RAISE NOTICE '✅ Permissions granted to authenticated users';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '1. Refresh your OldCycle app (Ctrl+Shift+R)';
  RAISE NOTICE '2. Test notifications in browser console';
  RAISE NOTICE '3. Check bell icon in header';
END $$;