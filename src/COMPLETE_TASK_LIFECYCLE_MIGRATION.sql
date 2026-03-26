-- ================================================================
-- LocalFelo Complete Task Lifecycle & Dual-Confirmation System
-- Run this ENTIRE file in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- PART 1: Task/Wish Reports Table
-- ================================================================

-- Create table for task/wish reports
CREATE TABLE IF NOT EXISTS task_wish_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_type TEXT NOT NULL CHECK (item_type IN ('task', 'wish')),
  item_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('payment', 'harassment', 'no_response')),
  details TEXT,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_wish_reports_item ON task_wish_reports(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_task_wish_reports_reporter ON task_wish_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_task_wish_reports_reported_user ON task_wish_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_task_wish_reports_status ON task_wish_reports(status);

-- Enable Row Level Security
ALTER TABLE task_wish_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can create reports" ON task_wish_reports;
DROP POLICY IF EXISTS "Users can view their reports" ON task_wish_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON task_wish_reports;

-- Policy: Users can create reports
CREATE POLICY "Users can create reports" ON task_wish_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Policy: Users can view their own reports (both as reporter and reported)
CREATE POLICY "Users can view their reports" ON task_wish_reports
  FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() = reported_user_id);

-- Policy: Admins can view and manage all reports
CREATE POLICY "Admins can view all reports" ON task_wish_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ================================================================
-- PART 2: Dual-Completion Confirmation System
-- ================================================================

-- Add completion confirmation fields to tasks table
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS helper_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS creator_completed BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN tasks.helper_completed IS 'Helper has confirmed task completion';
COMMENT ON COLUMN tasks.creator_completed IS 'Creator has confirmed task completion';

-- Add index for faster queries on in-progress tasks
CREATE INDEX IF NOT EXISTS idx_tasks_completion ON tasks(helper_completed, creator_completed) 
WHERE status = 'in_progress';

-- ================================================================
-- PART 3: Reliability Score (Optional - For Future Use)
-- ================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='reliability_score'
  ) THEN
    ALTER TABLE profiles ADD COLUMN reliability_score INTEGER DEFAULT 100;
    COMMENT ON COLUMN profiles.reliability_score IS 'User reliability score (0-100, default 100). Decreases with reports.';
  END IF;
END $$;

-- ================================================================
-- VERIFICATION QUERIES
-- Run these to verify everything worked
-- ================================================================

-- Verify task_wish_reports table
SELECT 'task_wish_reports table' AS check_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_wish_reports') 
       THEN '✅ EXISTS' ELSE '❌ MISSING' END AS status;

-- Verify completion columns
SELECT 'helper_completed column' AS check_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'helper_completed')
       THEN '✅ EXISTS' ELSE '❌ MISSING' END AS status
UNION ALL
SELECT 'creator_completed column' AS check_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'creator_completed')
       THEN '✅ EXISTS' ELSE '❌ MISSING' END AS status;

-- Verify indexes
SELECT 'Indexes created' AS check_name,
       COUNT(*)::TEXT || ' indexes found' AS status
FROM pg_indexes 
WHERE tablename IN ('task_wish_reports', 'tasks')
AND indexname IN ('idx_task_wish_reports_item', 'idx_task_wish_reports_reporter', 
                  'idx_task_wish_reports_reported_user', 'idx_task_wish_reports_status',
                  'idx_tasks_completion');

-- Verify RLS policies
SELECT 'RLS policies' AS check_name,
       COUNT(*)::TEXT || ' policies found' AS status
FROM pg_policies 
WHERE tablename = 'task_wish_reports';

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ ================================================================';
  RAISE NOTICE '✅ LocalFelo Task Lifecycle System - Installation Complete!';
  RAISE NOTICE '✅ ================================================================';
  RAISE NOTICE '✅ ';
  RAISE NOTICE '✅ Components Installed:';
  RAISE NOTICE '✅   1. Task/Wish Reports Table';
  RAISE NOTICE '✅   2. Dual-Completion Confirmation';
  RAISE NOTICE '✅   3. Reliability Score (optional)';
  RAISE NOTICE '✅ ';
  RAISE NOTICE '✅ Next Steps:';
  RAISE NOTICE '✅   1. Test task lifecycle with 2 users';
  RAISE NOTICE '✅   2. Verify both must confirm completion';
  RAISE NOTICE '✅   3. Test report system';
  RAISE NOTICE '✅ ';
  RAISE NOTICE '✅ Documentation: See /DUAL_CONFIRMATION_GUIDE.md';
  RAISE NOTICE '✅ ================================================================';
END $$;
