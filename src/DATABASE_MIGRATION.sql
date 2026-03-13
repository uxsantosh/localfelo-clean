-- ================================================================
-- LocalFelo Task Lifecycle & Report System Migration
-- Run this SQL in your Supabase SQL Editor
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
-- OPTIONAL: Add reliability_score to profiles table (if not exists)
-- This supports future reliability enforcement
-- ================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='reliability_score'
  ) THEN
    ALTER TABLE profiles ADD COLUMN reliability_score INTEGER DEFAULT 100;
  END IF;
END $$;

-- ================================================================
-- VERIFICATION QUERIES
-- Run these to verify the migration worked
-- ================================================================

-- Check if table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'task_wish_reports'
ORDER BY ordinal_position;

-- Check if indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'task_wish_reports';

-- Check RLS policies
SELECT policyname, tablename, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'task_wish_reports';
