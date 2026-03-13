-- =====================================================
-- QUICK FIX - Add Area Coordinates
-- =====================================================
-- Copy this entire file and paste into Supabase SQL Editor
-- Then click RUN
-- =====================================================

-- Step 1: Add latitude/longitude columns to areas table
ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_areas_coordinates ON areas(latitude, longitude);

-- =====================================================
-- Done! Now run /COMPREHENSIVE_LOCATION_SETUP.sql 
-- to add coordinates for all 500+ areas
-- =====================================================

-- Verify columns were added:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'areas' 
AND column_name IN ('latitude', 'longitude');
