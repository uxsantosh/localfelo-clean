-- =====================================================
-- TASK COMPLETION SYSTEM - COMPLETE SETUP
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- ============ STEP 1: ADD DATABASE COLUMNS ============

-- Add completion tracking fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS creator_completed BOOLEAN DEFAULT false;

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS helper_completed BOOLEAN DEFAULT false;

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add helpful comments for documentation
COMMENT ON COLUMN tasks.creator_completed IS 'Task creator confirmed completion';
COMMENT ON COLUMN tasks.helper_completed IS 'Helper confirmed completion';
COMMENT ON COLUMN tasks.updated_at IS 'Last update timestamp';

-- ============ STEP 2: CREATE AUTO-UPDATE TRIGGER ============

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists and create new one
DROP TRIGGER IF EXISTS tasks_updated_at_trigger ON tasks;

CREATE TRIGGER tasks_updated_at_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_tasks_updated_at();

-- ============ STEP 3: UPDATE RLS POLICIES ============

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Participants can update completion status" ON tasks;
DROP POLICY IF EXISTS "Users can read task completion status" ON tasks;

-- Allow users to read all task data (including completion status)
CREATE POLICY "Users can read task completion status"
ON tasks
FOR SELECT
USING (true);

-- Allow task participants (creator or helper) to update completion status
CREATE POLICY "Participants can update completion status"
ON tasks
FOR UPDATE
USING (
  auth.uid() = user_id OR auth.uid() = helper_id
)
WITH CHECK (
  auth.uid() = user_id OR auth.uid() = helper_id
);

-- ============ STEP 4: ADD NOTIFICATION ACTION FIELDS (OPTIONAL) ============

-- Add action URL and label for notification action buttons
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS action_url TEXT;

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS action_label TEXT;

COMMENT ON COLUMN notifications.action_url IS 'Deep link URL for notification action button';
COMMENT ON COLUMN notifications.action_label IS 'Text label for notification action button';

-- ============ STEP 5: INITIALIZE EXISTING DATA ============

-- Set default values for existing tasks (if any)
UPDATE tasks
SET 
  creator_completed = COALESCE(creator_completed, false),
  helper_completed = COALESCE(helper_completed, false),
  updated_at = COALESCE(updated_at, created_at)
WHERE creator_completed IS NULL 
   OR helper_completed IS NULL
   OR updated_at IS NULL;

-- For tasks that are already completed, mark both parties as confirmed
UPDATE tasks
SET 
  creator_completed = true,
  helper_completed = true
WHERE status = 'completed'
  AND completed_at IS NOT NULL
  AND (creator_completed = false OR helper_completed = false);

-- ============ VERIFICATION ============

-- Verify new columns exist
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
  AND column_name IN ('creator_completed', 'helper_completed', 'updated_at')
ORDER BY column_name;

-- Verify trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'tasks_updated_at_trigger';

-- Verify RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'tasks'
  AND policyname IN ('Participants can update completion status', 'Users can read task completion status');

-- Show sample data
SELECT 
  id,
  title,
  status,
  creator_completed,
  helper_completed,
  completed_at,
  updated_at
FROM tasks
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- SETUP COMPLETE! ✅
-- 
-- The task completion system is now ready to use.
-- Both creator and helper must confirm before tasks are marked complete.
-- =====================================================
