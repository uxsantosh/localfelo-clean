-- =====================================================
-- FIX max_distance_km COLUMN ERROR
-- Standardize to use max_distance (without _km suffix)
-- =====================================================

-- STEP 1: Check if max_distance_km exists and migrate data
DO $$
BEGIN
  -- If max_distance_km column exists, migrate the data
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'helper_preferences' 
      AND column_name = 'max_distance_km'
  ) THEN
    -- Update max_distance with data from max_distance_km
    UPDATE helper_preferences
    SET max_distance = COALESCE(max_distance_km, max_distance, 10)
    WHERE max_distance_km IS NOT NULL;
    
    -- Drop the old column
    ALTER TABLE helper_preferences DROP COLUMN max_distance_km;
    
    RAISE NOTICE '✅ Migrated data from max_distance_km to max_distance and dropped old column';
  ELSE
    RAISE NOTICE 'ℹ️ Column max_distance_km does not exist (already migrated)';
  END IF;
END $$;

-- STEP 2: Ensure max_distance column exists with correct default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'helper_preferences' 
      AND column_name = 'max_distance'
  ) THEN
    ALTER TABLE helper_preferences 
    ADD COLUMN max_distance INTEGER DEFAULT 10;
    
    RAISE NOTICE '✅ Added max_distance column';
  ELSE
    RAISE NOTICE 'ℹ️ Column max_distance already exists';
  END IF;
END $$;

-- STEP 3: Set default for existing NULL values
UPDATE helper_preferences
SET max_distance = 10
WHERE max_distance IS NULL;

-- STEP 4: Ensure the column has a default constraint
ALTER TABLE helper_preferences 
ALTER COLUMN max_distance SET DEFAULT 10;

-- STEP 5: Verify the fix
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'helper_preferences' 
  AND column_name LIKE 'max_distance%'
ORDER BY column_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ max_distance column fixed successfully!';
  RAISE NOTICE '📊 Column should now be: max_distance (INTEGER, default 10)';
END $$;
