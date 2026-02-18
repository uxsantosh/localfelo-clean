-- =====================================================
-- TASK COMPLETION TRACKING - TWO-PARTY CONFIRMATION
-- =====================================================

-- Add completion tracking fields to tasks table
-- Both creator and helper must confirm before task is marked as complete

-- Add creator_completed column (default false)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS creator_completed BOOLEAN DEFAULT false;

-- Add helper_completed column (default false)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS helper_completed BOOLEAN DEFAULT false;

-- Add updated_at column for tracking last update (if not exists)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add comment for documentation
COMMENT ON COLUMN tasks.creator_completed IS 'Task creator confirmed task completion';
COMMENT ON COLUMN tasks.helper_completed IS 'Helper confirmed task completion';
COMMENT ON COLUMN tasks.updated_at IS 'Last time task was updated';

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS tasks_updated_at_trigger ON tasks;
CREATE TRIGGER tasks_updated_at_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_tasks_updated_at();

-- =====================================================
-- TASK STATUS TRANSITIONS
-- =====================================================

-- Task completion flow:
-- 1. Task in 'accepted' or 'in_progress' status
-- 2. Creator clicks "Mark Complete" → creator_completed = true
-- 3. Helper gets notification → clicks "Confirm Completion"
-- 4. Helper confirms → helper_completed = true
-- 5. Both confirmed → status = 'completed', completed_at = NOW()

-- Users can undo their completion before the other party confirms
-- Once both confirm and status = 'completed', no undo is allowed

-- =====================================================
-- EXAMPLE QUERIES
-- =====================================================

-- Check if task is ready to be completed (both parties confirmed)
-- SELECT 
--   id,
--   title,
--   creator_completed,
--   helper_completed,
--   (creator_completed = true AND helper_completed = true) AS ready_to_complete
-- FROM tasks
-- WHERE id = 'task-id-here';

-- Get tasks pending creator confirmation
-- SELECT id, title, helper_completed
-- FROM tasks
-- WHERE status IN ('accepted', 'in_progress')
-- AND helper_completed = true
-- AND creator_completed = false;

-- Get tasks pending helper confirmation
-- SELECT id, title, creator_completed
-- FROM tasks
-- WHERE status IN ('accepted', 'in_progress')
-- AND creator_completed = true
-- AND helper_completed = false;

-- Reset completion flags when task is cancelled
-- UPDATE tasks
-- SET 
--   creator_completed = false,
--   helper_completed = false
-- WHERE id = 'task-id-here';
