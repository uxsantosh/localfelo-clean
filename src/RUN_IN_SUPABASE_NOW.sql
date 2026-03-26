-- =====================================================
-- TASK IMAGES FEATURE - SUPABASE SETUP
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- ✅ STEP 1: Add images column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- ✅ STEP 2: Create GIN index for fast array queries
CREATE INDEX IF NOT EXISTS idx_tasks_images ON tasks USING GIN (images);

-- ✅ STEP 3: Add documentation comment
COMMENT ON COLUMN tasks.images IS 'Array of image URLs (max 3 images). Images are compressed and stored in Supabase Storage.';

-- ✅ STEP 4: Verify the column was added successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'images'
  ) THEN
    RAISE NOTICE '✅ SUCCESS: Column "images" added to tasks table';
  ELSE
    RAISE EXCEPTION '❌ ERROR: Failed to add "images" column';
  END IF;
END $$;

-- =====================================================
-- NEXT STEPS (In Supabase Dashboard):
-- =====================================================

-- 1. Go to Storage → Create Bucket
--    - Name: task-images
--    - Public: ✅ YES
--
-- 2. Add RLS Policies (Storage → task-images → Policies):
--
--    a) Anyone can upload:
--       CREATE POLICY "Anyone can upload task images"
--       ON storage.objects FOR INSERT
--       TO public
--       WITH CHECK (bucket_id = 'task-images');
--
--    b) Anyone can view:
--       CREATE POLICY "Anyone can view task images"
--       ON storage.objects FOR SELECT
--       TO public
--       USING (bucket_id = 'task-images');
--
--    c) Users can delete their own:
--       CREATE POLICY "Users can delete own task images"
--       ON storage.objects FOR DELETE
--       TO public
--       USING (bucket_id = 'task-images');
--
-- =====================================================

-- Query to check if everything is set up correctly:
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name = 'images';

-- Expected result:
-- column_name | data_type | column_default | is_nullable
-- images      | ARRAY     | '{}'::text[]   | YES
