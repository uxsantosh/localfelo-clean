-- =====================================================
-- COMPLETE 3-LEVEL LOCATION SETUP
-- =====================================================
-- This script does EVERYTHING needed for 3-level locations:
-- 1. Adds lat/lng columns to areas table
-- 2. Generates estimated coordinates for all areas
-- 3. Creates sub_areas table
-- 4. Generates 8 sub-areas for each area (North, South, etc.)
-- 5. Creates area_distances table
-- 6. Adds sub_area_id to all content tables
-- =====================================================

-- STEP 1: Add coordinates to areas table
ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

CREATE INDEX IF NOT EXISTS idx_areas_coordinates ON areas(latitude, longitude);

-- STEP 2: Update areas with estimated coordinates based on city centers
-- (These are approximate - you can refine specific areas later)

-- Bangalore areas
UPDATE areas SET 
  latitude = 12.9716 + (RANDOM() * 0.15 - 0.075),  -- ±8km variance
  longitude = 77.5946 + (RANDOM() * 0.15 - 0.075)
WHERE city_id = 'bangalore' AND latitude IS NULL;

-- Chennai areas  
UPDATE areas SET 
  latitude = 13.0827 + (RANDOM() * 0.15 - 0.075),
  longitude = 80.2707 + (RANDOM() * 0.15 - 0.075)
WHERE city_id = 'chennai' AND latitude IS NULL;

-- Delhi areas
UPDATE areas SET 
  latitude = 28.7041 + (RANDOM() * 0.20 - 0.10),  -- Delhi is larger
  longitude = 77.1025 + (RANDOM() * 0.20 - 0.10)
WHERE city_id = 'delhi' AND latitude IS NULL;

-- Hyderabad areas
UPDATE areas SET 
  latitude = 17.3850 + (RANDOM() * 0.15 - 0.075),
  longitude = 78.4867 + (RANDOM() * 0.15 - 0.075)
WHERE city_id = 'hyderabad' AND latitude IS NULL;

-- Kolkata areas
UPDATE areas SET 
  latitude = 22.5726 + (RANDOM() * 0.15 - 0.075),
  longitude = 88.3639 + (RANDOM() * 0.15 - 0.075)
WHERE city_id = 'kolkata' AND latitude IS NULL;

-- Mumbai areas
UPDATE areas SET 
  latitude = 19.0760 + (RANDOM() * 0.20 - 0.10),  -- Mumbai is large
  longitude = 72.8777 + (RANDOM() * 0.15 - 0.075)
WHERE city_id = 'mumbai' AND latitude IS NULL;

-- Pune areas
UPDATE areas SET 
  latitude = 18.5204 + (RANDOM() * 0.15 - 0.075),
  longitude = 73.8567 + (RANDOM() * 0.15 - 0.075)
WHERE city_id = 'pune' AND latitude IS NULL;

-- Progress message
DO $$
BEGIN
  RAISE NOTICE '✅ Step 1-2: Areas table updated with coordinates';
END $$;

-- STEP 3: Create sub_areas table
CREATE TABLE IF NOT EXISTS sub_areas (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  landmark TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_areas_area_id ON sub_areas(area_id);
CREATE INDEX IF NOT EXISTS idx_sub_areas_coordinates ON sub_areas(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_sub_areas_slug ON sub_areas(slug);

DO $$
BEGIN
  RAISE NOTICE '✅ Step 3: Sub-areas table created';
END $$;

-- STEP 4: Generate sub-areas for all areas
DO $$
DECLARE
  area_record RECORD;
  v_count INTEGER := 0;
  v_offset DECIMAL := 0.008; -- ~800m offset
BEGIN
  FOR area_record IN 
    SELECT 
      a.id as area_id,
      a.name as area_name,
      a.city_id,
      a.latitude,
      a.longitude
    FROM areas a
    WHERE a.latitude IS NOT NULL
  LOOP
    -- Generate 8 directional + key location sub-areas
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      -- North
      (area_record.area_id || '-north', 
       area_record.area_id, 
       area_record.area_name || ' North', 
       area_record.area_id || '-north',
       area_record.latitude + v_offset, 
       area_record.longitude, 
       'North ' || area_record.area_name),
      
      -- South
      (area_record.area_id || '-south', 
       area_record.area_id, 
       area_record.area_name || ' South', 
       area_record.area_id || '-south',
       area_record.latitude - v_offset, 
       area_record.longitude, 
       'South ' || area_record.area_name),
      
      -- East
      (area_record.area_id || '-east', 
       area_record.area_id, 
       area_record.area_name || ' East', 
       area_record.area_id || '-east',
       area_record.latitude, 
       area_record.longitude + v_offset, 
       'East ' || area_record.area_name),
      
      -- West
      (area_record.area_id || '-west', 
       area_record.area_id, 
       area_record.area_name || ' West', 
       area_record.area_id || '-west',
       area_record.latitude, 
       area_record.longitude - v_offset, 
       'West ' || area_record.area_name),
      
      -- Center
      (area_record.area_id || '-center', 
       area_record.area_id, 
       area_record.area_name || ' Center', 
       area_record.area_id || '-center',
       area_record.latitude, 
       area_record.longitude, 
       'Central ' || area_record.area_name),
      
      -- Main Road
      (area_record.area_id || '-main-road', 
       area_record.area_id, 
       area_record.area_name || ' Main Road', 
       area_record.area_id || '-main-road',
       area_record.latitude + v_offset/2, 
       area_record.longitude + v_offset/2, 
       'Main Road'),
      
      -- Market
      (area_record.area_id || '-market', 
       area_record.area_id, 
       area_record.area_name || ' Market', 
       area_record.area_id || '-market',
       area_record.latitude - v_offset/2, 
       area_record.longitude + v_offset/2, 
       'Market Area'),
      
      -- Station/Metro Area
      (area_record.area_id || '-station', 
       area_record.area_id, 
       area_record.area_name || ' Station Area', 
       area_record.area_id || '-station',
       area_record.latitude + v_offset/2, 
       area_record.longitude - v_offset/2, 
       'Station Area')
    ON CONFLICT (id) DO NOTHING;
    
    v_count := v_count + 1;
    
    IF v_count % 100 = 0 THEN
      RAISE NOTICE 'Generated sub-areas for % areas...', v_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Step 4: Generated % sub-areas (% areas × 8)', v_count * 8, v_count;
END $$;

-- STEP 5: Create area_distances table
CREATE TABLE IF NOT EXISTS area_distances (
  id SERIAL PRIMARY KEY,
  from_sub_area_id TEXT NOT NULL REFERENCES sub_areas(id) ON DELETE CASCADE,
  to_sub_area_id TEXT NOT NULL REFERENCES sub_areas(id) ON DELETE CASCADE,
  distance_km DECIMAL(5, 2) NOT NULL,
  travel_time_minutes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_sub_area_id, to_sub_area_id)
);

CREATE INDEX IF NOT EXISTS idx_area_distances_from ON area_distances(from_sub_area_id);
CREATE INDEX IF NOT EXISTS idx_area_distances_to ON area_distances(to_sub_area_id);

DO $$
BEGIN
  RAISE NOTICE '✅ Step 5: Area distances table created';
END $$;

-- STEP 6: Add sub_area_id to content tables
ALTER TABLE listings ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);

CREATE INDEX IF NOT EXISTS idx_listings_sub_area ON listings(sub_area_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sub_area ON tasks(sub_area_id);
CREATE INDEX IF NOT EXISTS idx_wishes_sub_area ON wishes(sub_area_id);
CREATE INDEX IF NOT EXISTS idx_profiles_sub_area ON profiles(sub_area_id);

DO $$
BEGIN
  RAISE NOTICE '✅ Step 6: Sub-area columns added to all content tables';
END $$;

-- FINAL SUCCESS MESSAGE
DO $$
DECLARE
  v_areas_count INTEGER;
  v_subareas_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_areas_count FROM areas;
  SELECT COUNT(*) INTO v_subareas_count FROM sub_areas;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ 3-LEVEL LOCATION SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   • Cities: 7';
  RAISE NOTICE '   • Areas: %', v_areas_count;
  RAISE NOTICE '   • Sub-areas: %', v_subareas_count;
  RAISE NOTICE '';
  RAISE NOTICE '📍 Structure:';
  RAISE NOTICE '   City → Area → Sub-Area';
  RAISE NOTICE '   Example: Bangalore → Jayanagar 3rd Block → Jayanagar 3rd Block North';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Each area now has 8 sub-areas:';
  RAISE NOTICE '   • North, South, East, West (directional)';
  RAISE NOTICE '   • Center, Main Road, Market, Station (key locations)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Next Steps:';
  RAISE NOTICE '   1. Test the location selector in your app';
  RAISE NOTICE '   2. Run: /ADD_DETAILED_SUBAREAS_HIGH_PRIORITY.sql';
  RAISE NOTICE '      (Adds street-level detail for popular areas)';
  RAISE NOTICE '   3. Populate distance matrix (optional)';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
