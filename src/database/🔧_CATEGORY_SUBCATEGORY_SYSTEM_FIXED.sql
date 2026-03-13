-- =====================================================
-- CATEGORY + SUBCATEGORY SYSTEM SETUP - FIXED
-- Complete 46 categories with subcategories + matching logic
-- =====================================================

-- ✅ STEP 1: Add subcategory column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS subcategory TEXT;

COMMENT ON COLUMN tasks.subcategory IS 'Subcategory ID selected by user (e.g., "tap-repair")';

-- ✅ STEP 2: Add columns to helper_preferences
ALTER TABLE helper_preferences
ADD COLUMN IF NOT EXISTS selected_categories TEXT[],
ADD COLUMN IF NOT EXISTS selected_subcategories TEXT[],
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_distance INTEGER DEFAULT 10;

COMMENT ON COLUMN helper_preferences.selected_categories IS 'Array of category IDs helper is interested in (e.g., ["delivery", "tech-help"])';
COMMENT ON COLUMN helper_preferences.selected_subcategories IS 'Array of subcategory IDs helper is interested in';
COMMENT ON COLUMN helper_preferences.latitude IS 'Helper current latitude for distance calculation';
COMMENT ON COLUMN helper_preferences.longitude IS 'Helper current longitude for distance calculation';
COMMENT ON COLUMN helper_preferences.is_available IS 'Whether helper is currently available for tasks';
COMMENT ON COLUMN helper_preferences.max_distance IS 'Maximum distance (in km) helper is willing to travel';

-- ✅ STEP 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_detected_category ON tasks(detected_category);
CREATE INDEX IF NOT EXISTS idx_tasks_subcategory ON tasks(subcategory);
CREATE INDEX IF NOT EXISTS idx_helper_prefs_categories ON helper_preferences USING GIN(selected_categories);
CREATE INDEX IF NOT EXISTS idx_helper_prefs_subcategories ON helper_preferences USING GIN(selected_subcategories);

-- ✅ STEP 4: Create simplified view for task-helper matching
CREATE OR REPLACE VIEW task_helper_matches AS
SELECT 
  t.id as task_id,
  t.title as task_title,
  t.detected_category as task_category,
  t.subcategory as task_subcategory,
  t.price as task_budget,
  t.latitude as task_lat,
  t.longitude as task_lon,
  t.created_at as task_created_at,
  hp.user_id as helper_user_id,
  hp.selected_categories as helper_categories,
  hp.selected_subcategories as helper_subcategories,
  hp.is_available as helper_available,
  hp.max_distance as helper_max_distance,
  -- Calculate distance (only if helper has location)
  CASE 
    WHEN hp.latitude IS NOT NULL AND hp.longitude IS NOT NULL THEN
      SQRT(
        POW(111.0 * (t.latitude - hp.latitude), 2) + 
        POW(111.0 * (t.longitude - hp.longitude) * COS(t.latitude / 57.3), 2)
      )
    ELSE NULL
  END as distance_km,
  -- Match score logic:
  -- 1. Exact subcategory match = 100 points
  -- 2. Main category match + "other" subcategory = 75 points
  -- 3. Main category match = 50 points
  CASE
    -- Perfect match: subcategory matches
    WHEN hp.selected_subcategories IS NOT NULL 
      AND t.subcategory IS NOT NULL
      AND hp.selected_subcategories @> ARRAY[t.subcategory] THEN 100
    -- Good match: main category matches + "other" subcategory
    WHEN hp.selected_categories IS NOT NULL
      AND t.detected_category IS NOT NULL
      AND hp.selected_categories @> ARRAY[t.detected_category] 
      AND t.subcategory = 'other' THEN 75
    -- Decent match: main category matches
    WHEN hp.selected_categories IS NOT NULL
      AND t.detected_category IS NOT NULL
      AND hp.selected_categories @> ARRAY[t.detected_category] THEN 50
    ELSE 0
  END as match_score
FROM tasks t
CROSS JOIN helper_preferences hp
WHERE 
  t.status = 'open'
  AND t.detected_category IS NOT NULL
  -- Helpers must have selected at least one category
  AND hp.selected_categories IS NOT NULL 
  AND array_length(hp.selected_categories, 1) > 0
  -- Match logic: main category OR subcategory match
  AND (
    -- Main category match
    hp.selected_categories @> ARRAY[t.detected_category]
    OR
    -- Subcategory match
    (
      hp.selected_subcategories IS NOT NULL
      AND t.subcategory IS NOT NULL
      AND hp.selected_subcategories @> ARRAY[t.subcategory]
    )
  );

COMMENT ON VIEW task_helper_matches IS 'Matches tasks with helpers based on category/subcategory, availability, and distance';

-- =====================================================
-- ✅ STEP 5: Create function to get matching helpers for a task
-- =====================================================
CREATE OR REPLACE FUNCTION get_matching_helpers_for_task(
  p_task_id UUID,
  p_max_distance_km INTEGER DEFAULT 50
)
RETURNS TABLE (
  helper_user_id UUID,
  match_score INTEGER,
  distance_km NUMERIC,
  helper_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    thm.helper_user_id,
    thm.match_score,
    thm.distance_km::NUMERIC,
    thm.helper_available
  FROM task_helper_matches thm
  WHERE 
    thm.task_id = p_task_id
    AND (thm.distance_km IS NULL OR thm.distance_km <= p_max_distance_km)
    AND thm.match_score > 0
  ORDER BY 
    thm.match_score DESC,  -- Best matches first
    thm.distance_km ASC NULLS LAST    -- Closest helpers first
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_matching_helpers_for_task IS 'Get all matching helpers for a specific task, sorted by match quality';

-- =====================================================
-- ✅ STEP 6: Create function to get matching tasks for a helper
-- =====================================================
CREATE OR REPLACE FUNCTION get_matching_tasks_for_helper(
  p_helper_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  task_id UUID,
  task_title TEXT,
  task_category TEXT,
  task_subcategory TEXT,
  task_budget INTEGER,
  match_score INTEGER,
  distance_km NUMERIC,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    thm.task_id,
    thm.task_title,
    thm.task_category,
    thm.task_subcategory,
    thm.task_budget,
    thm.match_score,
    thm.distance_km::NUMERIC,
    thm.task_created_at
  FROM task_helper_matches thm
  WHERE 
    thm.helper_user_id = p_helper_user_id
    AND thm.match_score > 0
  ORDER BY 
    thm.task_created_at DESC,  -- Newest first
    thm.match_score DESC,       -- Best matches first
    thm.distance_km ASC NULLS LAST         -- Closest first
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_matching_tasks_for_helper IS 'Get all matching tasks for a specific helper, sorted by recency and match quality';

-- =====================================================
-- ✅ STEP 7: Verification queries
-- =====================================================

-- Check if new columns exist in tasks
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks' 
  AND column_name IN ('detected_category', 'subcategory');

-- Check if new columns exist in helper_preferences
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'helper_preferences' 
  AND column_name IN ('selected_categories', 'selected_subcategories', 'latitude', 'longitude', 'is_available', 'max_distance');

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('tasks', 'helper_preferences')
  AND indexname LIKE '%categor%';

-- Test the view (should return empty if no tasks/helpers yet)
SELECT COUNT(*) as total_matches
FROM task_helper_matches
WHERE match_score > 0;

-- =====================================================
-- ✅ DONE!
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Category + Subcategory system installed successfully!';
  RAISE NOTICE '📊 Check the verification queries above to confirm.';
END $$;
