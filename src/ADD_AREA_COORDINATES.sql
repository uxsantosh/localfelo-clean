-- =====================================================
-- ADD AREA COORDINATES - For Manual Location Selection
-- =====================================================
-- This migration adds representative coordinates to each area
-- so that users who manually select a location (without GPS)
-- can still see distance calculations.
--
-- How it works:
-- 1. Each area gets a center point coordinate
-- 2. When user manually selects an area, we use this coordinate
-- 3. When user uses GPS, we use their exact coordinate
-- 4. Distances are always calculated from SOME coordinate
-- =====================================================

-- Step 1: Add latitude and longitude columns to areas table
ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);

-- Step 2: Add representative coordinates for existing areas
-- These are approximate center points for each area in Chennai

-- Adyar areas
UPDATE areas SET latitude = 13.0067, longitude = 80.2570 WHERE id = 'adyar-adyar' AND latitude IS NULL;
UPDATE areas SET latitude = 13.0189, longitude = 80.2500 WHERE id = 'adyar-thiruvanmiyur' AND latitude IS NULL;
UPDATE areas SET latitude = 12.9916, longitude = 80.2500 WHERE id = 'adyar-besant-nagar' AND latitude IS NULL;

-- Anna Nagar areas
UPDATE areas SET latitude = 13.0850, longitude = 80.2101 WHERE id = 'anna-nagar-anna-nagar-west' AND latitude IS NULL;
UPDATE areas SET latitude = 13.0889, longitude = 80.2250 WHERE id = 'anna-nagar-anna-nagar-east' AND latitude IS NULL;
UPDATE areas SET latitude = 13.0950, longitude = 80.2200 WHERE id = 'anna-nagar-thirumangalam' AND latitude IS NULL;

-- T Nagar areas
UPDATE areas SET latitude = 13.0418, longitude = 80.2341 WHERE id = 't-nagar-t-nagar' AND latitude IS NULL;
UPDATE areas SET latitude = 13.0500, longitude = 80.2400 WHERE id = 't-nagar-west-mambalam' AND latitude IS NULL;
UPDATE areas SET latitude = 13.0333, longitude = 80.2500 WHERE id = 't-nagar-ashok-nagar' AND latitude IS NULL;

-- Velachery areas
UPDATE areas SET latitude = 12.9750, longitude = 80.2210 WHERE id = 'velachery-velachery' AND latitude IS NULL;
UPDATE areas SET latitude = 12.9650, longitude = 80.2100 WHERE id = 'velachery-madipakkam' AND latitude IS NULL;
UPDATE areas SET latitude = 12.9500, longitude = 80.2200 WHERE id = 'velachery-pallikaranai' AND latitude IS NULL;

-- Porur areas
UPDATE areas SET latitude = 13.0358, longitude = 80.1570 WHERE id = 'porur-porur' AND latitude IS NULL;
UPDATE areas SET latitude = 13.0250, longitude = 80.1650 WHERE id = 'porur-ramapuram' AND latitude IS NULL;
UPDATE areas SET latitude = 13.0450, longitude = 80.1500 WHERE id = 'porur-mangadu' AND latitude IS NULL;

-- OMR areas
UPDATE areas SET latitude = 12.9200, longitude = 80.2270 WHERE id = 'omr-thoraipakkam' AND latitude IS NULL;
UPDATE areas SET latitude = 12.8950, longitude = 80.2200 WHERE id = 'omr-sholinganallur' AND latitude IS NULL;
UPDATE areas SET latitude = 12.8500, longitude = 80.2270 WHERE id = 'omr-siruseri' AND latitude IS NULL;

-- Tambaram areas
UPDATE areas SET latitude = 12.9250, longitude = 80.1270 WHERE id = 'tambaram-tambaram' AND latitude IS NULL;
UPDATE areas SET latitude = 12.9350, longitude = 80.1200 WHERE id = 'tambaram-chromepet' AND latitude IS NULL;
UPDATE areas SET latitude = 12.9150, longitude = 80.1350 WHERE id = 'tambaram-selaiyur' AND latitude IS NULL;

-- Step 3: For any areas without coordinates, use city center (Chennai)
UPDATE areas 
SET latitude = 13.0827, longitude = 80.2707 
WHERE latitude IS NULL 
AND city_id IN (SELECT id FROM cities WHERE name = 'Chennai');

-- Step 4: Add index for faster coordinate lookups
CREATE INDEX IF NOT EXISTS idx_areas_coordinates ON areas(latitude, longitude);

-- Step 5: Add comment
COMMENT ON COLUMN areas.latitude IS 'Representative latitude for area center (used for distance calculations when user manually selects location)';
COMMENT ON COLUMN areas.longitude IS 'Representative longitude for area center (used for distance calculations when user manually selects location)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the migration worked:

-- Check if all areas now have coordinates
-- SELECT 
--   a.id, 
--   a.name, 
--   c.name as city_name,
--   a.latitude, 
--   a.longitude,
--   CASE WHEN a.latitude IS NULL THEN '❌ Missing' ELSE '✅ Set' END as status
-- FROM areas a
-- JOIN cities c ON a.city_id = c.id
-- ORDER BY c.name, a.name;

-- Count areas with/without coordinates
-- SELECT 
--   CASE WHEN latitude IS NULL THEN 'Missing Coordinates' ELSE 'Has Coordinates' END as status,
--   COUNT(*) as count
-- FROM areas
-- GROUP BY CASE WHEN latitude IS NULL THEN 'Missing Coordinates' ELSE 'Has Coordinates' END;
