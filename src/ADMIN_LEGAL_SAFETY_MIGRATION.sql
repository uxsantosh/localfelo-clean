-- ================================================================
-- LocalFelo Admin & Legal Safety Features Migration
-- Run this ENTIRE file in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- PART 1: User Admin Management Fields
-- ================================================================

-- Add admin fields to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS can_post BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.is_suspended IS 'User account suspended by admin';
COMMENT ON COLUMN profiles.can_post IS 'User can create listings/tasks/wishes';
COMMENT ON COLUMN profiles.admin_notes IS 'Internal admin notes about user';
COMMENT ON COLUMN profiles.suspended_at IS 'Timestamp when user was suspended';
COMMENT ON COLUMN profiles.suspended_by IS 'Admin who suspended the user';
COMMENT ON COLUMN profiles.suspension_reason IS 'Reason for suspension';

-- Add indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON profiles(is_suspended);
CREATE INDEX IF NOT EXISTS idx_profiles_reliability_score ON profiles(reliability_score);

-- ================================================================
-- PART 2: Ensure Conversations Linkable to Tasks/Wishes
-- ================================================================

-- Conversations should already have related_item_id and related_item_type
-- Let's ensure indexes exist for efficient admin queries
CREATE INDEX IF NOT EXISTS idx_conversations_related_item ON conversations(related_item_type, related_item_id);

-- ================================================================
-- PART 3: Admin View Function for User Details
-- ================================================================

-- Function to get user statistics for admin panel
CREATE OR REPLACE FUNCTION get_user_admin_stats(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_listings', (SELECT COUNT(*) FROM listings WHERE user_id = user_id_param),
    'total_tasks_created', (SELECT COUNT(*) FROM tasks WHERE user_id = user_id_param),
    'total_tasks_accepted', (SELECT COUNT(*) FROM tasks WHERE helper_id = user_id_param),
    'total_wishes', (SELECT COUNT(*) FROM wishes WHERE user_id = user_id_param),
    'total_reports_filed', (SELECT COUNT(*) FROM task_wish_reports WHERE reporter_id = user_id_param),
    'total_reports_against', (SELECT COUNT(*) FROM task_wish_reports WHERE reported_user_id = user_id_param),
    'total_conversations', (SELECT COUNT(*) FROM conversations WHERE user1_id = user_id_param OR user2_id = user_id_param)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- PART 4: Admin RLS Policies for Chat Access
-- ================================================================

-- Allow admins to read all conversations (read-only)
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
CREATE POLICY "Admins can view all conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow admins to read all messages (read-only)
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ================================================================
-- PART 5: Repeat Offender Tracking
-- ================================================================

-- Create function to check for repeat offenders
CREATE OR REPLACE FUNCTION check_repeat_offender(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  report_count INTEGER;
  recent_reports INTEGER;
  result JSON;
BEGIN
  -- Count total reports against user
  SELECT COUNT(*) INTO report_count
  FROM task_wish_reports
  WHERE reported_user_id = user_id_param;
  
  -- Count reports in last 30 days
  SELECT COUNT(*) INTO recent_reports
  FROM task_wish_reports
  WHERE reported_user_id = user_id_param
    AND created_at > NOW() - INTERVAL '30 days';
  
  SELECT json_build_object(
    'total_reports', report_count,
    'recent_reports_30d', recent_reports,
    'is_repeat_offender', (report_count >= 3 OR recent_reports >= 2),
    'risk_level', CASE
      WHEN report_count >= 5 OR recent_reports >= 3 THEN 'high'
      WHEN report_count >= 3 OR recent_reports >= 2 THEN 'medium'
      ELSE 'low'
    END
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- PART 6: Admin Action Log Table
-- ================================================================

-- Create table to track admin actions
CREATE TABLE IF NOT EXISTS admin_action_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('suspend', 'unsuspend', 'freeze_posting', 'unfreeze_posting', 'add_note', 'delete_content', 'resolve_report')),
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_content_id UUID,
  target_content_type TEXT,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admin_action_log_admin ON admin_action_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_target_user ON admin_action_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_created_at ON admin_action_log(created_at DESC);

-- Enable RLS
ALTER TABLE admin_action_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin action log
DROP POLICY IF EXISTS "Admins can view action log" ON admin_action_log;
CREATE POLICY "Admins can view action log" ON admin_action_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ================================================================
-- PART 7: Functions for Admin Actions
-- ================================================================

-- Function to suspend user
CREATE OR REPLACE FUNCTION admin_suspend_user(
  target_user_id UUID,
  admin_id UUID,
  reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;
  
  -- Suspend user
  UPDATE profiles
  SET is_suspended = TRUE,
      suspended_at = NOW(),
      suspended_by = admin_id,
      suspension_reason = reason
  WHERE id = target_user_id;
  
  -- Log action
  INSERT INTO admin_action_log (admin_id, action_type, target_user_id, reason)
  VALUES (admin_id, 'suspend', target_user_id, reason);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unsuspend user
CREATE OR REPLACE FUNCTION admin_unsuspend_user(
  target_user_id UUID,
  admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;
  
  -- Unsuspend user
  UPDATE profiles
  SET is_suspended = FALSE,
      suspended_at = NULL,
      suspended_by = NULL,
      suspension_reason = NULL
  WHERE id = target_user_id;
  
  -- Log action
  INSERT INTO admin_action_log (admin_id, action_type, target_user_id)
  VALUES (admin_id, 'unsuspend', target_user_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to freeze/unfreeze posting
CREATE OR REPLACE FUNCTION admin_toggle_posting(
  target_user_id UUID,
  admin_id UUID,
  can_post_value BOOLEAN,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;
  
  -- Update posting permission
  UPDATE profiles
  SET can_post = can_post_value
  WHERE id = target_user_id;
  
  -- Log action
  INSERT INTO admin_action_log (admin_id, action_type, target_user_id, reason)
  VALUES (
    admin_id,
    CASE WHEN can_post_value THEN 'unfreeze_posting' ELSE 'freeze_posting' END,
    target_user_id,
    reason
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add admin note to user
CREATE OR REPLACE FUNCTION admin_add_user_note(
  target_user_id UUID,
  admin_id UUID,
  note_text TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;
  
  -- Append note with timestamp and admin info
  UPDATE profiles
  SET admin_notes = COALESCE(admin_notes || E'\n\n', '') || 
                    '[' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI') || '] ' || note_text
  WHERE id = target_user_id;
  
  -- Log action
  INSERT INTO admin_action_log (admin_id, action_type, target_user_id, notes)
  VALUES (admin_id, 'add_note', target_user_id, note_text);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- VERIFICATION QUERIES
-- Run these to verify everything worked
-- ================================================================

-- Verify admin fields
SELECT 'Admin fields in profiles' AS check_name, 
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'profiles' AND column_name = 'is_suspended'
       ) 
       THEN '✅ EXISTS' ELSE '❌ MISSING' END AS status;

-- Verify admin_action_log table
SELECT 'admin_action_log table' AS check_name, 
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_name = 'admin_action_log'
       ) 
       THEN '✅ EXISTS' ELSE '❌ MISSING' END AS status;

-- Verify functions
SELECT 'Admin functions' AS check_name, 
       COUNT(*)::TEXT || ' functions created' AS status
FROM information_schema.routines 
WHERE routine_name LIKE 'admin_%' OR routine_name LIKE '%_admin_%';

-- Verify RLS policies for admin
SELECT 'Admin RLS policies' AS check_name, 
       COUNT(*)::TEXT || ' policies found' AS status
FROM pg_policies 
WHERE policyname LIKE '%admin%';

-- ================================================================
-- NOTES FOR DEVELOPERS
-- ================================================================

-- To use these functions in your application:
-- 1. Admin can suspend user: SELECT admin_suspend_user('user_uuid', 'admin_uuid', 'Reason');
-- 2. Admin can unsuspend user: SELECT admin_unsuspend_user('user_uuid', 'admin_uuid');
-- 3. Admin can freeze posting: SELECT admin_toggle_posting('user_uuid', 'admin_uuid', false, 'Reason');
-- 4. Admin can add note: SELECT admin_add_user_note('user_uuid', 'admin_uuid', 'Note text');
-- 5. Check repeat offender: SELECT check_repeat_offender('user_uuid');
-- 6. Get user stats: SELECT get_user_admin_stats('user_uuid');

-- ================================================================
-- END OF MIGRATION
-- ================================================================
