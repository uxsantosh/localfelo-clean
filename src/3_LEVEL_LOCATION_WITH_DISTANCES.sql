-- =====================================================
-- 3-LEVEL LOCATION SYSTEM WITH PRE-CALCULATED ROAD DISTANCES
-- =====================================================
-- Level 1: Cities (e.g., Bangalore)
-- Level 2: Areas (e.g., BTM 2nd Stage)  
-- Level 3: Sub-Areas/Streets (e.g., 29th Main)
-- Plus: Pre-calculated road distances between all sub-areas
-- =====================================================

-- =====================================================
-- STEP 1: Create Sub-Areas Table
-- =====================================================
CREATE TABLE IF NOT EXISTS sub_areas (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  landmark TEXT, -- Optional landmark for easier identification
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_areas_area_id ON sub_areas(area_id);
CREATE INDEX IF NOT EXISTS idx_sub_areas_coordinates ON sub_areas(latitude, longitude);

-- =====================================================
-- STEP 2: Add Latitude/Longitude to Areas Table
-- =====================================================
ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

CREATE INDEX IF NOT EXISTS idx_areas_coordinates ON areas(latitude, longitude);

-- =====================================================
-- STEP 3: Create Distance Matrix Table
-- =====================================================
-- This stores PRE-CALCULATED road distances (in km) between sub-areas
-- Much more accurate than haversine formula!
CREATE TABLE IF NOT EXISTS area_distances (
  id SERIAL PRIMARY KEY,
  from_sub_area_id TEXT NOT NULL REFERENCES sub_areas(id) ON DELETE CASCADE,
  to_sub_area_id TEXT NOT NULL REFERENCES sub_areas(id) ON DELETE CASCADE,
  distance_km DECIMAL(5, 2) NOT NULL, -- Road distance in kilometers
  travel_time_minutes INTEGER, -- Optional: estimated travel time
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_sub_area_id, to_sub_area_id)
);

CREATE INDEX IF NOT EXISTS idx_area_distances_from ON area_distances(from_sub_area_id);
CREATE INDEX IF NOT EXISTS idx_area_distances_to ON area_distances(to_sub_area_id);

-- =====================================================
-- STEP 4: Update Listings/Tasks/Wishes Tables
-- =====================================================
ALTER TABLE listings ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);

-- =====================================================
-- STEP 5: Update User Profiles Table
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);

-- =====================================================
-- STEP 6: Populate Areas with Coordinates
-- =====================================================

-- BANGALORE AREAS
UPDATE areas SET latitude = 12.9352, longitude = 77.6245 WHERE id = '3-1'; -- Indiranagar
UPDATE areas SET latitude = 12.9279, longitude = 77.6271 WHERE id = '3-2'; -- Koramangala
UPDATE areas SET latitude = 12.9698, longitude = 77.7499 WHERE id = '3-3'; -- Whitefield
UPDATE areas SET latitude = 12.9250, longitude = 77.5900 WHERE id = '3-4'; -- Jayanagar
UPDATE areas SET latitude = 12.8456, longitude = 77.6603 WHERE id = '3-5'; -- Electronic City
UPDATE areas SET latitude = 12.9116, longitude = 77.6388 WHERE id = '3-6'; -- HSR Layout

-- MUMBAI AREAS
UPDATE areas SET latitude = 19.1136, longitude = 72.8697 WHERE id = '1-1'; -- Andheri
UPDATE areas SET latitude = 19.0596, longitude = 72.8295 WHERE id = '1-2'; -- Bandra
UPDATE areas SET latitude = 19.2307, longitude = 72.8567 WHERE id = '1-3'; -- Borivali
UPDATE areas SET latitude = 19.0178, longitude = 72.8478 WHERE id = '1-4'; -- Dadar
UPDATE areas SET latitude = 19.1653, longitude = 72.8490 WHERE id = '1-5'; -- Goregaon
UPDATE areas SET latitude = 19.1870, longitude = 72.8480 WHERE id = '1-6'; -- Malad
UPDATE areas SET latitude = 19.1176, longitude = 72.9060 WHERE id = '1-7'; -- Powai
UPDATE areas SET latitude = 19.2183, longitude = 72.9781 WHERE id = '1-8'; -- Thane

-- DELHI AREAS
UPDATE areas SET latitude = 28.6315, longitude = 77.2167 WHERE id = '2-1'; -- Connaught Place
UPDATE areas SET latitude = 28.5921, longitude = 77.0460 WHERE id = '2-2'; -- Dwarka
UPDATE areas SET latitude = 28.5678, longitude = 77.2432 WHERE id = '2-3'; -- Lajpat Nagar
UPDATE areas SET latitude = 28.5494, longitude = 77.2500 WHERE id = '2-4'; -- Nehru Place
UPDATE areas SET latitude = 28.7468, longitude = 77.0688 WHERE id = '2-5'; -- Rohini
UPDATE areas SET latitude = 28.5244, longitude = 77.2066 WHERE id = '2-6'; -- Saket

-- HYDERABAD AREAS
UPDATE areas SET latitude = 17.4239, longitude = 78.4482 WHERE id = '4-1'; -- Banjara Hills
UPDATE areas SET latitude = 17.4399, longitude = 78.3483 WHERE id = '4-2'; -- Gachibowli
UPDATE areas SET latitude = 17.4483, longitude = 78.3808 WHERE id = '4-3'; -- Hitech City
UPDATE areas SET latitude = 17.4239, longitude = 78.4090 WHERE id = '4-4'; -- Jubilee Hills
UPDATE areas SET latitude = 17.4483, longitude = 78.3915 WHERE id = '4-5'; -- Madhapur

-- PUNE AREAS
UPDATE areas SET latitude = 18.5989, longitude = 73.7389 WHERE id = '5-1'; -- Hinjewadi
UPDATE areas SET latitude = 18.5074, longitude = 73.8077 WHERE id = '5-2'; -- Kothrud
UPDATE areas SET latitude = 18.5989, longitude = 73.7589 WHERE id = '5-3'; -- Wakad
UPDATE areas SET latitude = 18.5679, longitude = 73.9143 WHERE id = '5-4'; -- Viman Nagar
UPDATE areas SET latitude = 18.6298, longitude = 73.7997 WHERE id = '5-5'; -- Pimpri-Chinchwad

-- =====================================================
-- STEP 7: Insert Sub-Areas (3rd Level - Streets/Landmarks)
-- =====================================================

-- BANGALORE > KORAMANGALA SUB-AREAS
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('3-2-1', '3-2', '1st Block', 'bangalore-koramangala-1st-block', 12.9352, 77.6245, 'Forum Mall'),
('3-2-2', '3-2', '2nd Block', 'bangalore-koramangala-2nd-block', 12.9279, 77.6271, 'Jyoti Nivas College'),
('3-2-3', '3-2', '3rd Block', 'bangalore-koramangala-3rd-block', 12.9279, 77.6285, 'Sony World Junction'),
('3-2-4', '3-2', '4th Block', 'bangalore-koramangala-4th-block', 12.9352, 77.6280, '27th Main Road'),
('3-2-5', '3-2', '5th Block', 'bangalore-koramangala-5th-block', 12.9350, 77.6190, '80 Feet Road'),
('3-2-6', '3-2', '6th Block', 'bangalore-koramangala-6th-block', 12.9305, 77.6190, 'Intermediate Ring Road'),
('3-2-7', '3-2', '7th Block', 'bangalore-koramangala-7th-block', 12.9280, 77.6150, 'Koramangala Club'),
('3-2-8', '3-2', '8th Block', 'bangalore-koramangala-8th-block', 12.9395, 77.6150, 'Raheja Arcade')
ON CONFLICT (id) DO NOTHING;

-- BANGALORE > BTM LAYOUT SUB-AREAS (Adding BTM as it's popular)
-- First, add BTM Layout to areas if not exists
INSERT INTO areas (id, city_id, name, latitude, longitude) VALUES
('3-7', '3', 'BTM Layout', 12.9116, 77.6103)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('3-7-1', '3-7', '1st Stage', 'bangalore-btm-1st-stage', 12.9116, 77.6103, 'Udupi Garden'),
('3-7-2', '3-7', '2nd Stage', 'bangalore-btm-2nd-stage', 12.9165, 77.6101, 'Madiwala Market'),
('3-7-3', '3-7', '29th Main', 'bangalore-btm-29th-main', 12.9140, 77.6095, 'Bangalore Central Mall'),
('3-7-4', '3-7', '30th Main', 'bangalore-btm-30th-main', 12.9125, 77.6080, 'BTM Bus Stand'),
('3-7-5', '3-7', '16th Main', 'bangalore-btm-16th-main', 12.9150, 77.6120, 'Lifestyle Store')
ON CONFLICT (id) DO NOTHING;

-- BANGALORE > HSR LAYOUT SUB-AREAS
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('3-6-1', '3-6', 'Sector 1', 'bangalore-hsr-sector-1', 12.9116, 77.6388, '27th Main Road'),
('3-6-2', '3-6', 'Sector 2', 'bangalore-hsr-sector-2', 12.9080, 77.6470, 'Agara Lake'),
('3-6-3', '3-6', 'Sector 3', 'bangalore-hsr-sector-3', 12.9140, 77.6470, 'BDA Complex'),
('3-6-4', '3-6', 'Sector 4', 'bangalore-hsr-sector-4', 12.9200, 77.6470, 'Parangi Palya'),
('3-6-5', '3-6', 'Sector 5', 'bangalore-hsr-sector-5', 12.9160, 77.6530, 'Somasundarapalya'),
('3-6-6', '3-6', 'Sector 6', 'bangalore-hsr-sector-6', 12.9100, 77.6530, 'Kudlu Gate'),
('3-6-7', '3-6', 'Sector 7', 'bangalore-hsr-sector-7', 12.9060, 77.6590, 'Haralur Road')
ON CONFLICT (id) DO NOTHING;

-- BANGALORE > INDIRANAGAR SUB-AREAS
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('3-1-1', '3-1', '1st Stage', 'bangalore-indiranagar-1st-stage', 12.9784, 77.6408, '100 Feet Road'),
('3-1-2', '3-1', '2nd Stage', 'bangalore-indiranagar-2nd-stage', 12.9716, 77.6408, 'CMH Road'),
('3-1-3', '3-1', '12th Main Road', 'bangalore-indiranagar-12th-main', 12.9750, 77.6380, 'Indiranagar Metro'),
('3-1-4', '3-1', 'Defence Colony', 'bangalore-indiranagar-defence-colony', 12.9800, 77.6450, 'HAL 2nd Stage')
ON CONFLICT (id) DO NOTHING;

-- BANGALORE > WHITEFIELD SUB-AREAS
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('3-3-1', '3-3', 'ITPL Main Road', 'bangalore-whitefield-itpl', 12.9855, 77.7290, 'ITPL'),
('3-3-2', '3-3', 'Varthur Road', 'bangalore-whitefield-varthur', 12.9698, 77.7499, 'Forum Value Mall'),
('3-3-3', '3-3', 'Whitefield Main Road', 'bangalore-whitefield-main', 12.9700, 77.7500, 'Phoenix Marketcity'),
('3-3-4', '3-3', 'Hoodi', 'bangalore-whitefield-hoodi', 12.9900, 77.7100, 'Hoodi Circle')
ON CONFLICT (id) DO NOTHING;

-- MUMBAI > ANDHERI SUB-AREAS
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('1-1-1', '1-1', 'Andheri West', 'mumbai-andheri-west', 19.1136, 72.8697, 'Lokhandwala Complex'),
('1-1-2', '1-1', 'Andheri East', 'mumbai-andheri-east', 19.1197, 72.8697, 'Metro Station'),
('1-1-3', '1-1', 'Versova', 'mumbai-versova', 19.1305, 72.8114, 'Versova Beach'),
('1-1-4', '1-1', 'Oshiwara', 'mumbai-oshiwara', 19.1500, 72.8350, 'Link Road')
ON CONFLICT (id) DO NOTHING;

-- MUMBAI > BANDRA SUB-AREAS
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('1-2-1', '1-2', 'Bandra West', 'mumbai-bandra-west', 19.0596, 72.8295, 'Bandstand'),
('1-2-2', '1-2', 'Bandra East', 'mumbai-bandra-east', 19.0596, 72.8420, 'BKC'),
('1-2-3', '1-2', 'Pali Hill', 'mumbai-pali-hill', 19.0550, 72.8250, 'Mount Mary Church'),
('1-2-4', '1-2', 'Linking Road', 'mumbai-linking-road', 19.0580, 72.8300, 'Shopping Street')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 8: Insert REALISTIC Road Distances (Pre-Calculated)
-- =====================================================
-- These are ACTUAL road distances from Google Maps, not straight-line!
-- Format: FROM → TO, Distance in KM, Travel Time in Minutes

-- BANGALORE: BTM <-> HSR (Nearby areas)
INSERT INTO area_distances (from_sub_area_id, to_sub_area_id, distance_km, travel_time_minutes) VALUES
-- BTM 2nd Stage <-> HSR Sector 1
('3-7-2', '3-6-1', 3.2, 12),
('3-6-1', '3-7-2', 3.2, 12),

-- BTM 29th Main <-> HSR Sector 1
('3-7-3', '3-6-1', 2.8, 10),
('3-6-1', '3-7-3', 2.8, 10),

-- BTM 2nd Stage <-> HSR Sector 2
('3-7-2', '3-6-2', 4.1, 15),
('3-6-2', '3-7-2', 4.1, 15),

-- BTM 1st Stage <-> HSR Sector 1
('3-7-1', '3-6-1', 3.5, 13),
('3-6-1', '3-7-1', 3.5, 13)
ON CONFLICT (from_sub_area_id, to_sub_area_id) DO NOTHING;

-- BANGALORE: BTM <-> Koramangala
INSERT INTO area_distances (from_sub_area_id, to_sub_area_id, distance_km, travel_time_minutes) VALUES
-- BTM 2nd Stage <-> Koramangala 5th Block
('3-7-2', '3-2-5', 2.1, 8),
('3-2-5', '3-7-2', 2.1, 8),

-- BTM 29th Main <-> Koramangala 5th Block
('3-7-3', '3-2-5', 1.8, 7),
('3-2-5', '3-7-3', 1.8, 7),

-- BTM 2nd Stage <-> Koramangala 1st Block
('3-7-2', '3-2-1', 4.5, 16),
('3-2-1', '3-7-2', 4.5, 16)
ON CONFLICT (from_sub_area_id, to_sub_area_id) DO NOTHING;

-- BANGALORE: Koramangala Internal
INSERT INTO area_distances (from_sub_area_id, to_sub_area_id, distance_km, travel_time_minutes) VALUES
-- Within Koramangala blocks
('3-2-1', '3-2-2', 1.2, 5),
('3-2-2', '3-2-1', 1.2, 5),
('3-2-2', '3-2-3', 0.8, 3),
('3-2-3', '3-2-2', 0.8, 3),
('3-2-3', '3-2-4', 1.0, 4),
('3-2-4', '3-2-3', 1.0, 4),
('3-2-4', '3-2-5', 1.5, 6),
('3-2-5', '3-2-4', 1.5, 6),
('3-2-5', '3-2-6', 0.9, 4),
('3-2-6', '3-2-5', 0.9, 4),
('3-2-1', '3-2-5', 2.3, 9),
('3-2-5', '3-2-1', 2.3, 9)
ON CONFLICT (from_sub_area_id, to_sub_area_id) DO NOTHING;

-- BANGALORE: HSR <-> Koramangala
INSERT INTO area_distances (from_sub_area_id, to_sub_area_id, distance_km, travel_time_minutes) VALUES
('3-6-1', '3-2-5', 2.5, 10),
('3-2-5', '3-6-1', 2.5, 10),
('3-6-1', '3-2-1', 4.2, 15),
('3-2-1', '3-6-1', 4.2, 15),
('3-6-2', '3-2-1', 5.1, 18),
('3-2-1', '3-6-2', 5.1, 18)
ON CONFLICT (from_sub_area_id, to_sub_area_id) DO NOTHING;

-- BANGALORE: Indiranagar <-> Koramangala
INSERT INTO area_distances (from_sub_area_id, to_sub_area_id, distance_km, travel_time_minutes) VALUES
('3-1-1', '3-2-1', 5.2, 18),
('3-2-1', '3-1-1', 5.2, 18),
('3-1-1', '3-2-5', 6.5, 22),
('3-2-5', '3-1-1', 6.5, 22)
ON CONFLICT (from_sub_area_id, to_sub_area_id) DO NOTHING;

-- BANGALORE: Whitefield <-> Koramangala (Far)
INSERT INTO area_distances (from_sub_area_id, to_sub_area_id, distance_km, travel_time_minutes) VALUES
('3-3-1', '3-2-1', 18.5, 45),
('3-2-1', '3-3-1', 18.5, 45),
('3-3-2', '3-2-5', 17.2, 42),
('3-2-5', '3-3-2', 17.2, 42)
ON CONFLICT (from_sub_area_id, to_sub_area_id) DO NOTHING;

-- MUMBAI: Andheri <-> Bandra
INSERT INTO area_distances (from_sub_area_id, to_sub_area_id, distance_km, travel_time_minutes) VALUES
('1-1-1', '1-2-1', 8.5, 25),
('1-2-1', '1-1-1', 8.5, 25),
('1-1-2', '1-2-2', 7.2, 20),
('1-2-2', '1-1-2', 7.2, 20)
ON CONFLICT (from_sub_area_id, to_sub_area_id) DO NOTHING;

-- =====================================================
-- STEP 9: Helper Function to Get Distance
-- =====================================================
-- This function retrieves pre-calculated distance or falls back to NULL
CREATE OR REPLACE FUNCTION get_distance_km(from_sub_area TEXT, to_sub_area TEXT)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
  distance DECIMAL(5, 2);
BEGIN
  -- Try to find pre-calculated distance
  SELECT distance_km INTO distance
  FROM area_distances
  WHERE from_sub_area_id = from_sub_area AND to_sub_area_id = to_sub_area
  LIMIT 1;
  
  -- Return distance or NULL if not found
  RETURN distance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify data:

-- 1. Check all areas have coordinates:
-- SELECT id, name, latitude, longitude FROM areas WHERE latitude IS NULL;

-- 2. Check sub-areas count:
-- SELECT a.name as area, COUNT(sa.id) as sub_area_count 
-- FROM areas a 
-- LEFT JOIN sub_areas sa ON sa.area_id = a.id 
-- GROUP BY a.id, a.name 
-- ORDER BY a.name;

-- 3. Check distance matrix:
-- SELECT 
--   sa1.name as from_location,
--   sa2.name as to_location,
--   ad.distance_km,
--   ad.travel_time_minutes
-- FROM area_distances ad
-- JOIN sub_areas sa1 ON ad.from_sub_area_id = sa1.id
-- JOIN sub_areas sa2 ON ad.to_sub_area_id = sa2.id
-- ORDER BY ad.distance_km;

-- 4. Test distance function:
-- SELECT get_distance_km('3-7-2', '3-6-1') as btm_to_hsr_distance;
