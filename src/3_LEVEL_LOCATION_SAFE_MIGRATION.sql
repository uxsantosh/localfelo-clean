-- =====================================================
-- 3-LEVEL LOCATION SYSTEM - SAFE MIGRATION
-- =====================================================
-- This version checks existing data and adapts accordingly
-- =====================================================

-- =====================================================
-- STEP 1: Add Latitude/Longitude to Areas Table
-- =====================================================
ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

CREATE INDEX IF NOT EXISTS idx_areas_coordinates ON areas(latitude, longitude);

-- =====================================================
-- STEP 2: Update Existing Areas with Coordinates
-- =====================================================

-- Update areas by NAME (not ID, safer!)
UPDATE areas SET latitude = 12.9784, longitude = 77.6408 WHERE LOWER(name) = 'indiranagar';
UPDATE areas SET latitude = 12.9279, longitude = 77.6271 WHERE LOWER(name) = 'koramangala';
UPDATE areas SET latitude = 12.9698, longitude = 77.7499 WHERE LOWER(name) = 'whitefield';
UPDATE areas SET latitude = 12.9250, longitude = 77.5900 WHERE LOWER(name) = 'jayanagar';
UPDATE areas SET latitude = 12.8456, longitude = 77.6603 WHERE LOWER(name) LIKE '%electronic%city%';
UPDATE areas SET latitude = 12.9116, longitude = 77.6388 WHERE LOWER(name) LIKE '%hsr%layout%';

-- Mumbai areas
UPDATE areas SET latitude = 19.1136, longitude = 72.8697 WHERE LOWER(name) = 'andheri';
UPDATE areas SET latitude = 19.0596, longitude = 72.8295 WHERE LOWER(name) = 'bandra';
UPDATE areas SET latitude = 19.2307, longitude = 72.8567 WHERE LOWER(name) = 'borivali';
UPDATE areas SET latitude = 19.0178, longitude = 72.8478 WHERE LOWER(name) = 'dadar';
UPDATE areas SET latitude = 19.1653, longitude = 72.8490 WHERE LOWER(name) = 'goregaon';
UPDATE areas SET latitude = 19.1870, longitude = 72.8480 WHERE LOWER(name) = 'malad';
UPDATE areas SET latitude = 19.1176, longitude = 72.9060 WHERE LOWER(name) = 'powai';
UPDATE areas SET latitude = 19.2183, longitude = 72.9781 WHERE LOWER(name) = 'thane';

-- Delhi areas
UPDATE areas SET latitude = 28.6315, longitude = 77.2167 WHERE LOWER(name) LIKE '%connaught%place%';
UPDATE areas SET latitude = 28.5921, longitude = 77.0460 WHERE LOWER(name) = 'dwarka';
UPDATE areas SET latitude = 28.5678, longitude = 77.2432 WHERE LOWER(name) LIKE '%lajpat%nagar%';
UPDATE areas SET latitude = 28.5494, longitude = 77.2500 WHERE LOWER(name) LIKE '%nehru%place%';
UPDATE areas SET latitude = 28.7468, longitude = 77.0688 WHERE LOWER(name) = 'rohini';
UPDATE areas SET latitude = 28.5244, longitude = 77.2066 WHERE LOWER(name) = 'saket';

-- Hyderabad areas
UPDATE areas SET latitude = 17.4239, longitude = 78.4482 WHERE LOWER(name) LIKE '%banjara%hills%';
UPDATE areas SET latitude = 17.4399, longitude = 78.3483 WHERE LOWER(name) = 'gachibowli';
UPDATE areas SET latitude = 17.4483, longitude = 78.3808 WHERE LOWER(name) LIKE '%hitech%city%';
UPDATE areas SET latitude = 17.4239, longitude = 78.4090 WHERE LOWER(name) LIKE '%jubilee%hills%';
UPDATE areas SET latitude = 17.4483, longitude = 78.3915 WHERE LOWER(name) = 'madhapur';

-- Pune areas
UPDATE areas SET latitude = 18.5989, longitude = 73.7389 WHERE LOWER(name) = 'hinjewadi';
UPDATE areas SET latitude = 18.5074, longitude = 73.8077 WHERE LOWER(name) = 'kothrud';
UPDATE areas SET latitude = 18.5989, longitude = 73.7589 WHERE LOWER(name) = 'wakad';
UPDATE areas SET latitude = 18.5679, longitude = 73.9143 WHERE LOWER(name) LIKE '%viman%nagar%';
UPDATE areas SET latitude = 18.6298, longitude = 73.7997 WHERE LOWER(name) LIKE '%pimpri%chinchwad%';

-- =====================================================
-- STEP 3: Verify Areas Have Coordinates
-- =====================================================
-- Check if any areas are missing coordinates
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count FROM areas WHERE latitude IS NULL;
  IF missing_count > 0 THEN
    RAISE NOTICE 'WARNING: % areas still missing coordinates', missing_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All areas have coordinates!';
  END IF;
END $$;

-- =====================================================
-- STEP 4: Create Sub-Areas Table
-- =====================================================
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

-- =====================================================
-- STEP 5: Create Distance Matrix Table
-- =====================================================
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

-- =====================================================
-- STEP 6: Update Listings/Tasks/Wishes/Profiles Tables
-- =====================================================
ALTER TABLE listings ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);

-- =====================================================
-- STEP 7: Insert Sub-Areas (Using Dynamic Area IDs)
-- =====================================================

-- BANGALORE SUB-AREAS
-- We'll use a function to safely insert based on area name

-- Koramangala Sub-Areas
DO $$
DECLARE
  koramangala_id TEXT;
BEGIN
  SELECT id INTO koramangala_id FROM areas WHERE LOWER(name) = 'koramangala' LIMIT 1;
  
  IF koramangala_id IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
    (koramangala_id || '-1', koramangala_id, '1st Block', 'koramangala-1st-block', 12.9352, 77.6245, 'Forum Mall'),
    (koramangala_id || '-2', koramangala_id, '2nd Block', 'koramangala-2nd-block', 12.9279, 77.6271, 'Jyoti Nivas College'),
    (koramangala_id || '-3', koramangala_id, '3rd Block', 'koramangala-3rd-block', 12.9279, 77.6285, 'Sony World Junction'),
    (koramangala_id || '-4', koramangala_id, '4th Block', 'koramangala-4th-block', 12.9352, 77.6280, '27th Main Road'),
    (koramangala_id || '-5', koramangala_id, '5th Block', 'koramangala-5th-block', 12.9350, 77.6190, '80 Feet Road'),
    (koramangala_id || '-6', koramangala_id, '6th Block', 'koramangala-6th-block', 12.9305, 77.6190, 'Intermediate Ring Road'),
    (koramangala_id || '-7', koramangala_id, '7th Block', 'koramangala-7th-block', 12.9280, 77.6150, 'Koramangala Club'),
    (koramangala_id || '-8', koramangala_id, '8th Block', 'koramangala-8th-block', 12.9395, 77.6150, 'Raheja Arcade')
    ON CONFLICT (slug) DO NOTHING;
    
    RAISE NOTICE 'Inserted Koramangala sub-areas';
  ELSE
    RAISE NOTICE 'Koramangala area not found, skipping sub-areas';
  END IF;
END $$;

-- HSR Layout Sub-Areas
DO $$
DECLARE
  hsr_id TEXT;
BEGIN
  SELECT id INTO hsr_id FROM areas WHERE LOWER(name) LIKE '%hsr%layout%' LIMIT 1;
  
  IF hsr_id IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
    (hsr_id || '-1', hsr_id, 'Sector 1', 'hsr-sector-1', 12.9116, 77.6388, '27th Main Road'),
    (hsr_id || '-2', hsr_id, 'Sector 2', 'hsr-sector-2', 12.9080, 77.6470, 'Agara Lake'),
    (hsr_id || '-3', hsr_id, 'Sector 3', 'hsr-sector-3', 12.9140, 77.6470, 'BDA Complex'),
    (hsr_id || '-4', hsr_id, 'Sector 4', 'hsr-sector-4', 12.9200, 77.6470, 'Parangi Palya'),
    (hsr_id || '-5', hsr_id, 'Sector 5', 'hsr-sector-5', 12.9160, 77.6530, 'Somasundarapalya'),
    (hsr_id || '-6', hsr_id, 'Sector 6', 'hsr-sector-6', 12.9100, 77.6530, 'Kudlu Gate'),
    (hsr_id || '-7', hsr_id, 'Sector 7', 'hsr-sector-7', 12.9060, 77.6590, 'Haralur Road')
    ON CONFLICT (slug) DO NOTHING;
    
    RAISE NOTICE 'Inserted HSR Layout sub-areas';
  ELSE
    RAISE NOTICE 'HSR Layout area not found, skipping sub-areas';
  END IF;
END $$;

-- Add BTM Layout area if it doesn't exist, then add sub-areas
DO $$
DECLARE
  btm_id TEXT;
  bangalore_id TEXT;
BEGIN
  -- Get Bangalore city ID
  SELECT id INTO bangalore_id FROM cities WHERE LOWER(name) = 'bangalore' LIMIT 1;
  
  -- Check if BTM Layout exists
  SELECT id INTO btm_id FROM areas WHERE LOWER(name) LIKE '%btm%layout%' LIMIT 1;
  
  -- If BTM doesn't exist, create it
  IF btm_id IS NULL AND bangalore_id IS NOT NULL THEN
    INSERT INTO areas (id, city_id, name, latitude, longitude)
    VALUES (bangalore_id || '-btm', bangalore_id, 'BTM Layout', 12.9116, 77.6103)
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO btm_id;
    
    RAISE NOTICE 'Created BTM Layout area';
  END IF;
  
  -- Insert BTM sub-areas
  IF btm_id IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
    (btm_id || '-1', btm_id, '1st Stage', 'btm-1st-stage', 12.9116, 77.6103, 'Udupi Garden'),
    (btm_id || '-2', btm_id, '2nd Stage', 'btm-2nd-stage', 12.9165, 77.6101, 'Madiwala Market'),
    (btm_id || '-3', btm_id, '29th Main', 'btm-29th-main', 12.9140, 77.6095, 'Bangalore Central Mall'),
    (btm_id || '-4', btm_id, '30th Main', 'btm-30th-main', 12.9125, 77.6080, 'BTM Bus Stand'),
    (btm_id || '-5', btm_id, '16th Main', 'btm-16th-main', 12.9150, 77.6120, 'Lifestyle Store')
    ON CONFLICT (slug) DO NOTHING;
    
    RAISE NOTICE 'Inserted BTM Layout sub-areas';
  ELSE
    RAISE NOTICE 'Could not create/find BTM Layout area';
  END IF;
END $$;

-- Indiranagar Sub-Areas
DO $$
DECLARE
  indiranagar_id TEXT;
BEGIN
  SELECT id INTO indiranagar_id FROM areas WHERE LOWER(name) = 'indiranagar' LIMIT 1;
  
  IF indiranagar_id IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
    (indiranagar_id || '-1', indiranagar_id, '1st Stage', 'indiranagar-1st-stage', 12.9784, 77.6408, '100 Feet Road'),
    (indiranagar_id || '-2', indiranagar_id, '2nd Stage', 'indiranagar-2nd-stage', 12.9716, 77.6408, 'CMH Road'),
    (indiranagar_id || '-3', indiranagar_id, '12th Main Road', 'indiranagar-12th-main', 12.9750, 77.6380, 'Indiranagar Metro'),
    (indiranagar_id || '-4', indiranagar_id, 'Defence Colony', 'indiranagar-defence-colony', 12.9800, 77.6450, 'HAL 2nd Stage')
    ON CONFLICT (slug) DO NOTHING;
    
    RAISE NOTICE 'Inserted Indiranagar sub-areas';
  END IF;
END $$;

-- Whitefield Sub-Areas
DO $$
DECLARE
  whitefield_id TEXT;
BEGIN
  SELECT id INTO whitefield_id FROM areas WHERE LOWER(name) = 'whitefield' LIMIT 1;
  
  IF whitefield_id IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
    (whitefield_id || '-1', whitefield_id, 'ITPL Main Road', 'whitefield-itpl', 12.9855, 77.7290, 'ITPL'),
    (whitefield_id || '-2', whitefield_id, 'Varthur Road', 'whitefield-varthur', 12.9698, 77.7499, 'Forum Value Mall'),
    (whitefield_id || '-3', whitefield_id, 'Whitefield Main Road', 'whitefield-main', 12.9700, 77.7500, 'Phoenix Marketcity'),
    (whitefield_id || '-4', whitefield_id, 'Hoodi', 'whitefield-hoodi', 12.9900, 77.7100, 'Hoodi Circle')
    ON CONFLICT (slug) DO NOTHING;
    
    RAISE NOTICE 'Inserted Whitefield sub-areas';
  END IF;
END $$;

-- MUMBAI SUB-AREAS

-- Andheri Sub-Areas
DO $$
DECLARE
  andheri_id TEXT;
BEGIN
  SELECT id INTO andheri_id FROM areas WHERE LOWER(name) = 'andheri' LIMIT 1;
  
  IF andheri_id IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
    (andheri_id || '-1', andheri_id, 'Andheri West', 'andheri-west', 19.1136, 72.8697, 'Lokhandwala Complex'),
    (andheri_id || '-2', andheri_id, 'Andheri East', 'andheri-east', 19.1197, 72.8697, 'Metro Station'),
    (andheri_id || '-3', andheri_id, 'Versova', 'versova', 19.1305, 72.8114, 'Versova Beach'),
    (andheri_id || '-4', andheri_id, 'Oshiwara', 'oshiwara', 19.1500, 72.8350, 'Link Road')
    ON CONFLICT (slug) DO NOTHING;
    
    RAISE NOTICE 'Inserted Andheri sub-areas';
  END IF;
END $$;

-- Bandra Sub-Areas
DO $$
DECLARE
  bandra_id TEXT;
BEGIN
  SELECT id INTO bandra_id FROM areas WHERE LOWER(name) = 'bandra' LIMIT 1;
  
  IF bandra_id IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
    (bandra_id || '-1', bandra_id, 'Bandra West', 'bandra-west', 19.0596, 72.8295, 'Bandstand'),
    (bandra_id || '-2', bandra_id, 'Bandra East', 'bandra-east', 19.0596, 72.8420, 'BKC'),
    (bandra_id || '-3', bandra_id, 'Pali Hill', 'pali-hill', 19.0550, 72.8250, 'Mount Mary Church'),
    (bandra_id || '-4', bandra_id, 'Linking Road', 'linking-road', 19.0580, 72.8300, 'Shopping Street')
    ON CONFLICT (slug) DO NOTHING;
    
    RAISE NOTICE 'Inserted Bandra sub-areas';
  END IF;
END $$;

-- =====================================================
-- STEP 8: Insert Distance Matrix (Pre-Calculated Road Distances)
-- =====================================================

-- Get sub-area IDs dynamically and insert distances
DO $$
DECLARE
  btm_2nd TEXT;
  btm_29th TEXT;
  hsr_sec1 TEXT;
  krmg_5th TEXT;
BEGIN
  -- Get sub-area IDs
  SELECT id INTO btm_2nd FROM sub_areas WHERE slug = 'btm-2nd-stage' LIMIT 1;
  SELECT id INTO btm_29th FROM sub_areas WHERE slug = 'btm-29th-main' LIMIT 1;
  SELECT id INTO hsr_sec1 FROM sub_areas WHERE slug = 'hsr-sector-1' LIMIT 1;
  SELECT id INTO krmg_5th FROM sub_areas WHERE slug = 'koramangala-5th-block' LIMIT 1;
  
  -- Insert distances if sub-areas exist
  IF btm_2nd IS NOT NULL AND hsr_sec1 IS NOT NULL THEN
    INSERT INTO area_distances (from_sub_area_id, to_sub_area_id, distance_km, travel_time_minutes) VALUES
    (btm_2nd, hsr_sec1, 3.2, 12),
    (hsr_sec1, btm_2nd, 3.2, 12)
    ON CONFLICT (from_sub_area_id, to_sub_area_id) DO NOTHING;
    
    RAISE NOTICE 'Inserted BTM 2nd Stage <-> HSR Sector 1 distance: 3.2 km';
  END IF;
  
  IF btm_29th IS NOT NULL AND hsr_sec1 IS NOT NULL THEN
    INSERT INTO area_distances (from_sub_area_id, to_sub_area_id, distance_km, travel_time_minutes) VALUES
    (btm_29th, hsr_sec1, 2.8, 10),
    (hsr_sec1, btm_29th, 2.8, 10)
    ON CONFLICT (from_sub_area_id, to_sub_area_id) DO NOTHING;
    
    RAISE NOTICE 'Inserted BTM 29th Main <-> HSR Sector 1 distance: 2.8 km';
  END IF;
  
  IF btm_2nd IS NOT NULL AND krmg_5th IS NOT NULL THEN
    INSERT INTO area_distances (from_sub_area_id, to_sub_area_id, distance_km, travel_time_minutes) VALUES
    (btm_2nd, krmg_5th, 2.1, 8),
    (krmg_5th, btm_2nd, 2.1, 8)
    ON CONFLICT (from_sub_area_id, to_sub_area_id) DO NOTHING;
    
    RAISE NOTICE 'Inserted BTM 2nd Stage <-> Koramangala 5th Block distance: 2.1 km';
  END IF;
  
  IF btm_29th IS NOT NULL AND krmg_5th IS NOT NULL THEN
    INSERT INTO area_distances (from_sub_area_id, to_sub_area_id, distance_km, travel_time_minutes) VALUES
    (btm_29th, krmg_5th, 1.8, 7),
    (krmg_5th, btm_29th, 1.8, 7)
    ON CONFLICT (from_sub_area_id, to_sub_area_id) DO NOTHING;
    
    RAISE NOTICE 'Inserted BTM 29th Main <-> Koramangala 5th Block distance: 1.8 km';
  END IF;
END $$;

-- =====================================================
-- STEP 9: Create Helper Function
-- =====================================================
CREATE OR REPLACE FUNCTION get_distance_km(from_sub_area TEXT, to_sub_area TEXT)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
  distance DECIMAL(5, 2);
BEGIN
  SELECT distance_km INTO distance
  FROM area_distances
  WHERE from_sub_area_id = from_sub_area AND to_sub_area_id = to_sub_area
  LIMIT 1;
  
  RETURN distance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 10: Verification
-- =====================================================
DO $$
DECLARE
  area_count INTEGER;
  sub_area_count INTEGER;
  distance_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO area_count FROM areas WHERE latitude IS NOT NULL;
  SELECT COUNT(*) INTO sub_area_count FROM sub_areas;
  SELECT COUNT(*) INTO distance_count FROM area_distances;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Areas with coordinates: %', area_count;
  RAISE NOTICE 'Sub-areas created: %', sub_area_count;
  RAISE NOTICE 'Distance entries: %', distance_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test the distance function:';
  RAISE NOTICE 'SELECT get_distance_km(''<from_sub_area_id>'', ''<to_sub_area_id>'');';
  RAISE NOTICE '========================================';
END $$;

-- Show sample data
SELECT 'Sample Areas:' as info;
SELECT id, name, latitude, longitude FROM areas WHERE latitude IS NOT NULL LIMIT 5;

SELECT 'Sample Sub-Areas:' as info;
SELECT id, area_id, name, landmark, latitude, longitude FROM sub_areas LIMIT 5;

SELECT 'Sample Distances:' as info;
SELECT 
  sa1.name || ' (' || sa1.landmark || ')' as from_location,
  sa2.name || ' (' || sa2.landmark || ')' as to_location,
  ad.distance_km,
  ad.travel_time_minutes
FROM area_distances ad
JOIN sub_areas sa1 ON ad.from_sub_area_id = sa1.id
JOIN sub_areas sa2 ON ad.to_sub_area_id = sa2.id
LIMIT 5;
