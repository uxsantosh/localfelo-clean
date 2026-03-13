-- =====================================================
-- SMART SUB-AREA GENERATION FOR ALL CITIES
-- =====================================================
-- This creates logical sub-areas for ALL 397 areas using
-- common patterns: North/South/East/West, Main Road, etc.
-- You can add more specific sub-areas later as needed
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

-- Create area_distances table
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

-- Add sub_area_id columns to main tables
ALTER TABLE listings ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_area_id TEXT REFERENCES sub_areas(id);

-- =====================================================
-- FUNCTION TO GENERATE SUB-AREAS FOR ANY AREA
-- =====================================================
-- This function creates 8 logical sub-areas for each area:
-- North, South, East, West, Central, Main Road, Market, Station

CREATE OR REPLACE FUNCTION generate_sub_areas_for_area(
  p_area_id TEXT,
  p_area_name TEXT,
  p_city_id TEXT,
  p_base_lat DECIMAL,
  p_base_lng DECIMAL
) RETURNS VOID AS $$
DECLARE
  v_slug_base TEXT;
  v_offset DECIMAL := 0.01; -- ~1km offset for sub-areas
BEGIN
  -- Create slug base
  v_slug_base := LOWER(REPLACE(REPLACE(p_area_id, '_', '-'), ' ', '-'));
  
  -- Generate 8 sub-areas with slightly offset coordinates
  INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
    -- Cardinal directions
    (p_area_id || '-north', p_area_id, p_area_name || ' North', v_slug_base || '-north', p_base_lat + v_offset, p_base_lng, 'North ' || p_area_name),
    (p_area_id || '-south', p_area_id, p_area_name || ' South', v_slug_base || '-south', p_base_lat - v_offset, p_base_lng, 'South ' || p_area_name),
    (p_area_id || '-east', p_area_id, p_area_name || ' East', v_slug_base || '-east', p_base_lat, p_base_lng + v_offset, 'East ' || p_area_name),
    (p_area_id || '-west', p_area_id, p_area_name || ' West', v_slug_base || '-west', p_base_lat, p_base_lng - v_offset, 'West ' || p_area_name),
    
    -- Key locations
    (p_area_id || '-center', p_area_id, p_area_name || ' Center', v_slug_base || '-center', p_base_lat, p_base_lng, 'Central ' || p_area_name),
    (p_area_id || '-main-road', p_area_id, p_area_name || ' Main Road', v_slug_base || '-main-road', p_base_lat + v_offset/2, p_base_lng + v_offset/2, 'Main Road'),
    (p_area_id || '-market', p_area_id, p_area_name || ' Market', v_slug_base || '-market', p_base_lat - v_offset/2, p_base_lng + v_offset/2, 'Market Area'),
    (p_area_id || '-station', p_area_id, p_area_name || ' Station Area', v_slug_base || '-station', p_base_lat + v_offset/2, p_base_lng - v_offset/2, 'Station Area')
  ON CONFLICT (id) DO NOTHING;
  
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GENERATE SUB-AREAS FOR ALL EXISTING AREAS
-- =====================================================
-- This will create ~3,200 sub-areas (397 areas × 8 each)

DO $$
DECLARE
  area_record RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Loop through all areas and generate sub-areas
  FOR area_record IN 
    SELECT 
      a.id as area_id,
      a.name as area_name,
      a.city_id,
      COALESCE(a.latitude, 0) as lat,
      COALESCE(a.longitude, 0) as lng
    FROM areas a
  LOOP
    -- Generate sub-areas
    PERFORM generate_sub_areas_for_area(
      area_record.area_id,
      area_record.area_name,
      area_record.city_id,
      area_record.lat,
      area_record.lng
    );
    
    v_count := v_count + 1;
    
    -- Progress notification every 50 areas
    IF v_count % 50 = 0 THEN
      RAISE NOTICE 'Processed % areas...', v_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ COMPLETED: Generated sub-areas for % areas', v_count;
  RAISE NOTICE '📍 Total sub-areas created: ~%', v_count * 8;
  RAISE NOTICE '';
  RAISE NOTICE '💡 TIP: You can now add MORE SPECIFIC sub-areas for important areas';
  RAISE NOTICE '   Example: Add "Jayanagar 3rd Block 11th Cross" manually';
END $$;

-- Clean up function
DROP FUNCTION IF EXISTS generate_sub_areas_for_area(TEXT, TEXT, TEXT, DECIMAL, DECIMAL);
