-- ================================================================
-- LocalFelo Dual-Completion Confirmation System
-- Add this to the previous DATABASE_MIGRATION.sql or run separately
-- ================================================================

-- Add completion confirmation fields to tasks table
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS helper_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS creator_completed BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN tasks.helper_completed IS 'Helper has confirmed task completion';
COMMENT ON COLUMN tasks.creator_completed IS 'Creator has confirmed task completion';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_completion ON tasks(helper_completed, creator_completed) 
WHERE status = 'in_progress';

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Check if columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('helper_completed', 'creator_completed');
