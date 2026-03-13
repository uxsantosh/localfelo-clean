-- ========================================
-- FOOLPROOF SQL SETUP - RUN THIS
-- ========================================
-- This fixes invalid data BEFORE touching constraints
-- ========================================

-- ========================================
-- STEP 1: CHECK WHAT'S WRONG
-- ========================================

-- See what notification types exist
SELECT 
  type,
  COUNT(*) as count
FROM public.notifications
GROUP BY type
ORDER BY count DESC;

-- ========================================
-- STEP 2: FIX INVALID NOTIFICATION TYPES FIRST
-- ========================================

-- Fix NULL types
UPDATE public.notifications
SET type = 'chat'
WHERE type IS NULL;

-- Fix any types that aren't in the allowed list
-- This catches everything invalid in one go
UPDATE public.notifications
SET type = 'chat'
WHERE type NOT IN ('task', 'wish', 'listing', 'chat', 'system', 'admin', 'broadcast');

-- Verify all types are now valid
SELECT 
  type,
  COUNT(*) as count,
  'VALID' as status
FROM public.notifications
GROUP BY type;

-- ========================================
-- STEP 3: NOW SAFELY DROP OLD CONSTRAINT
-- ========================================

-- Now it's safe to drop the constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- ========================================
-- STEP 4: ADD NEW CONSTRAINT
-- ========================================

-- Add the constraint back with all valid types
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('task', 'wish', 'listing', 'chat', 'system', 'admin', 'broadcast'));

-- ========================================
-- STEP 5: MAKE USER ADMIN
-- ========================================

UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'uxsantosh@gmail.com';

-- Verify
SELECT id, email, display_name, is_admin 
FROM public.profiles 
WHERE email = 'uxsantosh@gmail.com';

-- ========================================
-- STEP 6: FIX NOTIFICATIONS RLS POLICIES
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service can create notifications" ON public.notifications;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- ========================================
-- STEP 7: CREATE TEST NOTIFICATION
-- ========================================

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id
  FROM public.profiles
  WHERE email = 'uxsantosh@gmail.com'
  LIMIT 1;
  
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
    
    RAISE NOTICE 'Test notification created!';
  END IF;
END $$;

-- ========================================
-- STEP 8: ADD PERFORMANCE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ========================================
-- STEP 9: GRANT PERMISSIONS
-- ========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ========================================
-- STEP 10: FINAL VERIFICATION
-- ========================================

-- Check everything is working
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
    WHEN (SELECT count(*) FROM pg_policies WHERE tablename = 'notifications') >= 4 
    THEN '✅ COMPLETE'
    ELSE '❌ INCOMPLETE'
  END
UNION ALL
SELECT 
  'Notifications Constraint',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.check_constraints
      WHERE constraint_name = 'notifications_type_check'
    ) THEN '✅ UPDATED'
    ELSE '❌ FAILED'
  END
UNION ALL
SELECT 
  'Test Notification',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.notifications n
      JOIN public.profiles p ON n.user_id::text = p.id::text
      WHERE p.email = 'uxsantosh@gmail.com'
      AND n.created_at > NOW() - INTERVAL '5 minutes'
    ) THEN '✅ CREATED'
    ELSE '⚠️ NONE'
  END;

-- ========================================
-- DONE! 🎉
-- ========================================
