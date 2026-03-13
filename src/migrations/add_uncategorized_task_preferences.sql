-- Add preferences for handling uncategorized tasks
-- This allows helpers to opt-in to see all tasks, even if no category match

-- Add column to helper_preferences table
ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS show_uncategorized_tasks BOOLEAN DEFAULT true;

-- Add column to track if helper wants to see ALL tasks regardless of category
ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS show_all_tasks BOOLEAN DEFAULT false;

-- Add column to track minimum confidence threshold for category matching
ALTER TABLE helper_preferences 
ADD COLUMN IF NOT EXISTS min_confidence_threshold INTEGER DEFAULT 60 CHECK (min_confidence_threshold >= 0 AND min_confidence_threshold <= 100);

-- Add comments for documentation
COMMENT ON COLUMN helper_preferences.show_uncategorized_tasks IS 'Whether to show tasks that could not be automatically categorized';
COMMENT ON COLUMN helper_preferences.show_all_tasks IS 'Whether to show ALL tasks regardless of category match (overrides other filters)';
COMMENT ON COLUMN helper_preferences.min_confidence_threshold IS 'Minimum AI confidence percentage (0-100) required to show a task';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_helper_preferences_show_all 
ON helper_preferences(user_id, show_all_tasks) 
WHERE show_all_tasks = true;

CREATE INDEX IF NOT EXISTS idx_helper_preferences_uncategorized 
ON helper_preferences(user_id, show_uncategorized_tasks) 
WHERE show_uncategorized_tasks = true;

-- Update existing rows to have default values
UPDATE helper_preferences 
SET 
  show_uncategorized_tasks = COALESCE(show_uncategorized_tasks, true),
  show_all_tasks = COALESCE(show_all_tasks, false),
  min_confidence_threshold = COALESCE(min_confidence_threshold, 60)
WHERE show_uncategorized_tasks IS NULL 
   OR show_all_tasks IS NULL 
   OR min_confidence_threshold IS NULL;
