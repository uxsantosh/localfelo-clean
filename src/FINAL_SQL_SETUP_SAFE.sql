-- ========================================
-- FINAL SQL SETUP FOR OLDCYCLE (SAFE VERSION)
-- ========================================
-- This version safely handles existing data
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
-- 2. CHECK EXISTING NOTIFICATION TYPES
-- ========================================

-- See what notification types currently exist in the table
SELECT DISTINCT type, COUNT(*) as count
FROM public.notifications
GROUP BY type
ORDER BY count DESC;

-- ========================================
-- 3. FIX INVALID NOTIFICATION TYPES
-- ========================================

-- Update any NULL types to 'chat' (or another valid type)
UPDATE public.notifications
SET type = 'chat'
WHERE type IS NULL;

-- Update common invalid types (adjust based on what you see above)
-- Uncomment and modify these if you see other invalid types:

-- UPDATE public.notifications SET type = 'chat' WHERE type = 'message';
-- UPDATE public.notifications SET type = 'chat' WHERE type = 'new_message';
-- UPDATE public.notifications SET type = 'admin' WHERE type = 'system';
-- UPDATE public.notifications SET type = 'listing' WHERE type = 'new_listing';

-- ========================================
-- 4. DROP AND RECREATE NOTIFICATION TYPE CONSTRAINT
-- ========================================

-- Drop the old constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new constraint with all needed types
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('task', 'wish', 'listing', 'chat', 'system', 'admin', 'broadcast'));

-- ========================================
-- 5. VERIFY CONSTRAINT WAS ADDED
-- ========================================

SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'notifications_type_check';

-- ========================================
-- 6. FIX NOTIFICATIONS RLS POLICIES
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
-- 7. VERIFY NOTIFICATIONS TABLE STRUCTURE
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
-- 8. TEST NOTIFICATION CREATION
-- ========================================

-- Test creating a notification for the admin user
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
-- 9. VERIFY ADMIN SCREEN ACCESS
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
-- 10. CHECK NOTIFICATION COUNTS
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
-- 11. CREATE NOTIFICATION INDEXES (PERFORMANCE)
-- ========================================

-- Create indexes for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ========================================
-- 12. GRANT PERMISSIONS (IF NEEDED)
-- ========================================

-- Ensure authenticated users can access notifications
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ========================================
-- 13. FINAL VERIFICATION
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
      AND n.created_at > NOW() - INTERVAL '1 minute'
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
-- 14. CHECK ALL NOTIFICATION TYPES ARE NOW VALID
-- ========================================

-- This should return 0 rows if everything is fixed
SELECT type, COUNT(*) as count
FROM public.notifications
WHERE type NOT IN ('task', 'wish', 'listing', 'chat', 'system', 'admin', 'broadcast')
GROUP BY type;

-- If you see any rows above, run this to see the actual invalid types:
-- SELECT DISTINCT type FROM public.notifications 
-- WHERE type NOT IN ('task', 'wish', 'listing', 'chat', 'system', 'admin', 'broadcast');

-- ========================================
-- DONE! 🎉
-- ========================================
-- After running this script:
-- 1. uxsantosh@gmail.com should be admin ✅
-- 2. Invalid notification types fixed ✅
-- 3. Notification constraint updated ✅
-- 4. RLS policies working ✅
-- 5. Test notification created ✅
-- 6. Admin menu should be visible ✅
-- ========================================
