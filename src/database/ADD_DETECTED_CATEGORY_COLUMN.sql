-- =====================================================
-- ADD DETECTED_CATEGORY COLUMN TO TASKS TABLE
-- =====================================================
-- This migration adds the missing detected_category column
-- that stores the AI-detected service category ID
-- =====================================================

-- Add detected_category column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS detected_category TEXT;

-- Create index for fast filtering
CREATE INDEX IF NOT EXISTS idx_tasks_detected_category 
ON tasks(detected_category);

-- Add comment for documentation
COMMENT ON COLUMN tasks.detected_category IS 'AI-detected service category ID (e.g. "delivery", "tech-help") from 46 service categories';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks' 
  AND column_name = 'detected_category';

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ detected_category column added to tasks table';
  RAISE NOTICE '✅ Index created for fast category filtering';
  RAISE NOTICE '📊 Tasks can now store category IDs like: delivery, tech-help, cleaning, etc.';
END $$;
