-- ========================================
-- FINAL SQL SETUP FOR OLDCYCLE (FIXED)
-- ========================================
-- Run these SQL queries in Supabase SQL Editor
-- to complete all remaining setup tasks
-- ========================================

-- ========================================
-- 1. MAKE uxsantosh@gmail.com ADMIN
-- ========================================

UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'uxsantosh@gmail.com';

-- Verify admin status
SELECT id, email, display_name, is_admin 
FROM public.profiles 
WHERE email = 'uxsantosh@gmail.com';

-- ========================================
-- 2. CHECK NOTIFICATION TYPE CONSTRAINT
-- ========================================

-- First, let's see what types are allowed
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%notification%type%';

-- ========================================
-- 3. UPDATE NOTIFICATION TYPE CONSTRAINT (IF NEEDED)
-- ========================================

-- Drop the old constraint if it exists
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new constraint with all needed types
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('task', 'wish', 'listing', 'chat', 'system', 'admin', 'broadcast'));

-- ========================================
-- 4. FIX NOTIFICATIONS RLS POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service can create notifications" ON public.notifications;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (
  auth.uid()::text = user_id::text
);

-- Policy 2: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (
  auth.uid()::text = user_id::text
);

-- Policy 3: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (
  auth.uid()::text = user_id::text
);

-- Policy 4: Allow service/system to create notifications for any user
CREATE POLICY "Service can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- ========================================
-- 5. VERIFY NOTIFICATIONS TABLE STRUCTURE
-- ========================================

-- Check if notifications table exists and has correct columns
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- ========================================
-- 6. TEST NOTIFICATION CREATION
-- ========================================

-- Test creating a notification for the admin user
-- Using 'admin' type instead of 'system'
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM public.profiles
  WHERE email = 'uxsantosh@gmail.com'
  LIMIT 1;
  
  -- Create test notification
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      is_read,
      created_at
    ) VALUES (
      admin_user_id,
      'admin',
      'Welcome to OldCycle Admin! 🎉',
      'Your account has been set up as an admin. You now have access to admin features!',
      '/admin',
      false,
      NOW()
    );
    
    RAISE NOTICE 'Test notification created successfully for admin user!';
  ELSE
    RAISE NOTICE 'Admin user not found!';
  END IF;
END $$;

-- ========================================
-- 7. VERIFY ADMIN SCREEN ACCESS
-- ========================================

-- Check if admin menu items should be visible
SELECT 
  id,
  email,
  display_name,
  is_admin,
  CASE 
    WHEN is_admin = true THEN 'Admin menu should be visible'
    ELSE 'Regular user - no admin access'
  END as access_level
FROM public.profiles
WHERE email = 'uxsantosh@gmail.com';

-- ========================================
-- 8. CHECK NOTIFICATION COUNTS
-- ========================================

-- Count notifications for admin user
SELECT 
  p.email,
  COUNT(n.id) as total_notifications,
  COUNT(CASE WHEN n.is_read = false THEN 1 END) as unread_count
FROM public.profiles p
LEFT JOIN public.notifications n ON p.id::text = n.user_id::text
WHERE p.email = 'uxsantosh@gmail.com'
GROUP BY p.email;

-- ========================================
-- 9. CLEANUP OLD/INVALID NOTIFICATIONS (OPTIONAL)
-- ========================================

-- Delete notifications for users that don't exist (COMMENTED OUT - uncomment if needed)
-- DELETE FROM public.notifications
-- WHERE user_id::text NOT IN (
--   SELECT id::text FROM public.profiles
-- );

-- ========================================
-- 10. CREATE NOTIFICATION INDEXES (PERFORMANCE)
-- ========================================

-- Create indexes for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ========================================
-- 11. GRANT PERMISSIONS (IF NEEDED)
-- ========================================

-- Ensure authenticated users can access notifications
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ========================================
-- 12. FINAL VERIFICATION
-- ========================================

-- Show summary of setup
SELECT 
  'Admin Setup' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE email = 'uxsantosh@gmail.com' AND is_admin = true
    ) THEN '✅ COMPLETE'
    ELSE '❌ FAILED'
  END as status
UNION ALL
SELECT 
  'Notifications RLS',
  CASE 
    WHEN (
      SELECT count(*) 
      FROM pg_policies 
      WHERE tablename = 'notifications'
    ) >= 4 THEN '✅ COMPLETE'
    ELSE '❌ INCOMPLETE'
  END
UNION ALL
SELECT 
  'Notifications Table',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'notifications'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  'Test Notification',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.notifications n
      JOIN public.profiles p ON n.user_id::text = p.id::text
      WHERE p.email = 'uxsantosh@gmail.com'
    ) THEN '✅ CREATED'
    ELSE '⚠️ NONE'
  END
UNION ALL
SELECT 
  'Notification Constraint',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.check_constraints
      WHERE constraint_name = 'notifications_type_check'
    ) THEN '✅ UPDATED'
    ELSE '⚠️ CHECK MANUALLY'
  END;

-- ========================================
-- DONE! 🎉
-- ========================================
-- After running this script:
-- 1. uxsantosh@gmail.com should be admin
-- 2. Notifications should work correctly
-- 3. Test notification should appear in app
-- 4. Admin menu should be visible to admin user
-- 5. Notification type constraint updated with all types
-- ========================================
