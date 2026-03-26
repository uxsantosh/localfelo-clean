-- =====================================================
-- LocalFelo Hybrid Location System - Database Setup
-- =====================================================
-- This file contains OPTIONAL database enhancements
-- The system works with your CURRENT setup - no changes required!
-- These are enhancements for better location data storage.
-- =====================================================

-- =====================================================
-- CURRENT STATUS: ✅ SYSTEM WORKS WITHOUT ANY CHANGES
-- =====================================================
-- Your existing database schema is fully compatible!
-- The hybrid location system uses:
-- - latitude & longitude (ALREADY EXISTS in profiles table)
-- - city, area, city_id, area_id (ALREADY EXISTS)
-- - Everything else is stored in the app, not database
-- =====================================================

-- =====================================================
-- OPTIONAL ENHANCEMENTS (Run if you want extra features)
-- =====================================================

-- 1️⃣ Add additional address fields (OPTIONAL)
-- These provide richer location data but are not required
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS full_address TEXT,
  ADD COLUMN IF NOT EXISTS locality VARCHAR(255),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
  ADD COLUMN IF NOT EXISTS detection_method VARCHAR(20) CHECK (detection_method IN ('auto', 'search', 'manual', 'dropdown'));

-- Add comments for documentation
COMMENT ON COLUMN profiles.full_address IS 'Complete human-readable address from geocoding';
COMMENT ON COLUMN profiles.locality IS 'Neighborhood/locality name (e.g., "Koramangala")';
COMMENT ON COLUMN profiles.state IS 'State name (e.g., "Karnataka")';
COMMENT ON COLUMN profiles.pincode IS 'Postal/PIN code (e.g., "560034")';
COMMENT ON COLUMN profiles.detection_method IS 'How location was determined: auto (GPS), search, manual, dropdown';

-- 2️⃣ Create spatial index for faster distance queries (OPTIONAL)
-- This speeds up "find nearby items" queries significantly
-- Requires PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add PostGIS geometry column
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS location_point GEOMETRY(Point, 4326);

-- Update existing records to populate the geometry column
UPDATE profiles 
SET location_point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_profiles_location_point 
  ON profiles USING GIST (location_point);

-- Create function to auto-update geometry when lat/lng changes
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  ELSE
    NEW.location_point := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update geometry
DROP TRIGGER IF EXISTS trg_update_location_point ON profiles;
CREATE TRIGGER trg_update_location_point
  BEFORE INSERT OR UPDATE OF latitude, longitude ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_location_point();

-- 3️⃣ Add same enhancements to listings, tasks, wishes tables (OPTIONAL)
-- This allows items to have their own precise GPS locations

-- Listings table
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS full_address TEXT,
  ADD COLUMN IF NOT EXISTS locality VARCHAR(255),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);

-- Tasks table  
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS full_address TEXT,
  ADD COLUMN IF NOT EXISTS locality VARCHAR(255),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);

-- Wishes table
ALTER TABLE wishes
  ADD COLUMN IF NOT EXISTS full_address TEXT,
  ADD COLUMN IF NOT EXISTS locality VARCHAR(255),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);

-- 4️⃣ Create helpful views for location queries (OPTIONAL)

-- View: Users with complete location data
CREATE OR REPLACE VIEW users_with_location AS
SELECT 
  id,
  name,
  city,
  area,
  locality,
  state,
  pincode,
  latitude,
  longitude,
  full_address,
  detection_method,
  location_updated_at
FROM profiles
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- View: Nearby items function (example for tasks)
CREATE OR REPLACE FUNCTION get_nearby_tasks(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
  task_id UUID,
  title TEXT,
  distance_km DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id AS task_id,
    t.title,
    -- Calculate distance using Haversine formula
    (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(t.latitude)) * 
        cos(radians(t.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(t.latitude))
      )
    )::DECIMAL(10,1) AS distance_km,
    t.latitude,
    t.longitude
  FROM tasks t
  WHERE t.latitude IS NOT NULL 
    AND t.longitude IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(t.latitude)) * 
        cos(radians(t.longitude) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(t.latitude))
      )
    ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- 5️⃣ Add indexes for performance (OPTIONAL)
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_locality ON profiles(locality);
CREATE INDEX IF NOT EXISTS idx_profiles_pincode ON profiles(pincode);
CREATE INDEX IF NOT EXISTS idx_profiles_detection_method ON profiles(detection_method);

CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_tasks_city ON tasks(city);
CREATE INDEX IF NOT EXISTS idx_wishes_city ON wishes(city);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if enhancements are installed
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('full_address', 'locality', 'state', 'pincode', 'detection_method', 'location_point')
ORDER BY column_name;

-- Check if PostGIS is available
SELECT PostGIS_Version();

-- Test spatial index
EXPLAIN ANALYZE
SELECT id, city, area
FROM profiles
WHERE ST_DWithin(
  location_point::geography,
  ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography,
  5000  -- 5km radius
);

-- Count users with complete location data
SELECT 
  detection_method,
  COUNT(*) as user_count
FROM profiles
WHERE latitude IS NOT NULL
GROUP BY detection_method
ORDER BY user_count DESC;

-- =====================================================
-- ROLLBACK (if you want to remove enhancements)
-- =====================================================

-- Drop optional columns
-- ALTER TABLE profiles DROP COLUMN IF EXISTS full_address;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS locality;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS state;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS pincode;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS detection_method;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS location_point;

-- Drop spatial index
-- DROP INDEX IF EXISTS idx_profiles_location_point;

-- Drop trigger and function
-- DROP TRIGGER IF EXISTS trg_update_location_point ON profiles;
-- DROP FUNCTION IF EXISTS update_location_point();

-- Drop helper function
-- DROP FUNCTION IF EXISTS get_nearby_tasks(DECIMAL, DECIMAL, INTEGER);

-- =====================================================
-- SUMMARY
-- =====================================================
-- ✅ NO DATABASE CHANGES REQUIRED - System works as-is!
-- ✅ Current latitude/longitude columns are sufficient
-- 🎯 Optional enhancements provide:
--    - Richer address data (full_address, locality, state, pincode)
--    - Faster distance queries (PostGIS spatial index)
--    - Better analytics (detection_method tracking)
--    - Helper functions (get_nearby_tasks, etc.)
-- 
-- RECOMMENDATION: Start without any changes, add enhancements later if needed
-- =====================================================
