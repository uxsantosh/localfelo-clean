-- =====================================================
-- Add Images Column to Tasks Table
-- =====================================================
-- This migration adds image upload functionality to tasks,
-- allowing users to upload up to 3 images per task

-- Add images column (array of text URLs)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_images ON tasks USING GIN (images);

-- Add comment for documentation
COMMENT ON COLUMN tasks.images IS 'Array of image URLs (max 3 images). Images are compressed and stored in Supabase Storage.';

-- Verify the column was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'images'
  ) THEN
    RAISE NOTICE '✅ Column "images" successfully added to tasks table';
  ELSE
    RAISE EXCEPTION '❌ Failed to add "images" column to tasks table';
  END IF;
END $$;
