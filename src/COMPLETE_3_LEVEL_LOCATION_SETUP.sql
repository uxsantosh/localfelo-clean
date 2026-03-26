-- =====================================================
-- COMPLETE 3-LEVEL LOCATION SYSTEM - CLEAN SETUP
-- =====================================================
-- City → Area → Sub-Area (Road Level)
-- For: Bangalore, Hyderabad, Visakhapatnam, Chennai, Mumbai, Pune, Kolkata, Mysore
-- =====================================================

-- STEP 1: CLEAN UP EXISTING SUB_AREAS TABLE
DROP TABLE IF EXISTS sub_areas CASCADE;

-- STEP 2: CREATE FRESH SUB_AREAS TABLE
CREATE TABLE sub_areas (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  landmark TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(area_id, slug)
);

-- STEP 3: ADD INDEXES FOR PERFORMANCE
CREATE INDEX idx_sub_areas_area_id ON sub_areas(area_id);
CREATE INDEX idx_sub_areas_slug ON sub_areas(slug);

-- STEP 4: ENABLE RLS ON SUB_AREAS
ALTER TABLE sub_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sub_areas_public_read ON sub_areas;
CREATE POLICY sub_areas_public_read ON sub_areas
  FOR SELECT
  USING (true);

-- STEP 5: ADD SLUG TO AREAS TABLE (if not exists)
ALTER TABLE areas ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slug for existing areas
UPDATE areas 
SET slug = LOWER(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(name, ' ', '-'),
        ',', ''
      ),
      '.', ''
    ),
    '(', ''
  )
)
WHERE slug IS NULL OR slug = '';

CREATE INDEX IF NOT EXISTS idx_areas_slug ON areas(slug);

-- STEP 6: ADD SUB_AREA COLUMNS TO PROFILES TABLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_area_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_area TEXT;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_sub_area_id_fkey;
ALTER TABLE profiles 
ADD CONSTRAINT profiles_sub_area_id_fkey 
FOREIGN KEY (sub_area_id) 
REFERENCES sub_areas(id) 
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_sub_area_id ON profiles(sub_area_id);

-- =====================================================
-- STEP 7: INSERT COMPREHENSIVE SUB-AREAS FOR ALL CITIES
-- =====================================================

-- ========== BANGALORE ==========
DO $$
DECLARE
  area_id_var TEXT;
BEGIN
  -- BTM Layout
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%btm%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'bangalore') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('blr-btm-1st-stage', area_id_var, '1st Stage', '1st-stage', 12.9165, 77.6101, 'Near Udupi Garden'),
      ('blr-btm-2nd-stage', area_id_var, '2nd Stage', '2nd-stage', 12.9121, 77.6089, 'Forum Mall Area'),
      ('blr-btm-29th-main', area_id_var, '29th Main Road', '29th-main-road', 12.9156, 77.6112, 'Silk Board Junction'),
      ('blr-btm-30th-main', area_id_var, '30th Main Road', '30th-main-road', 12.9134, 77.6098, 'BTM Water Tank'),
      ('blr-btm-6th-main', area_id_var, '6th Main Road', '6th-main-road', 12.9189, 77.6078, 'Madiwala Market')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Koramangala
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%koramangala%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'bangalore') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('blr-kmg-1st-block', area_id_var, '1st Block', '1st-block', 12.9279, 77.6271, 'Sony World Junction'),
      ('blr-kmg-3rd-block', area_id_var, '3rd Block', '3rd-block', 12.9352, 77.6245, 'Jyoti Nivas College'),
      ('blr-kmg-4th-block', area_id_var, '4th Block', '4th-block', 12.9350, 77.6289, 'Forum Mall'),
      ('blr-kmg-5th-block', area_id_var, '5th Block', '5th-block', 12.9320, 77.6195, 'Koramangala Indoor Stadium'),
      ('blr-kmg-6th-block', area_id_var, '6th Block', '6th-block', 12.9293, 77.6270, 'BDA Complex'),
      ('blr-kmg-7th-block', area_id_var, '7th Block', '7th-block', 12.9367, 77.6143, 'Koramangala Police Station'),
      ('blr-kmg-8th-block', area_id_var, '8th Block', '8th-block', 12.9410, 77.6210, 'Jyothi Theatre')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Indiranagar
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%indiranagar%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'bangalore') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('blr-ind-12th-main', area_id_var, '12th Main Road', '12th-main-road', 12.9784, 77.6408, 'CMH Road'),
      ('blr-ind-100ft-road', area_id_var, '100 Feet Road', '100-feet-road', 12.9716, 77.6412, 'Indiranagar Metro'),
      ('blr-ind-double-road', area_id_var, 'Double Road', 'double-road', 12.9762, 77.6382, 'Chinmaya Mission Hospital')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Whitefield
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%whitefield%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'bangalore') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('blr-wf-itpl-main', area_id_var, 'ITPL Main Road', 'itpl-main-road', 12.9859, 77.7313, 'International Tech Park'),
      ('blr-wf-varthur-road', area_id_var, 'Varthur Main Road', 'varthur-main-road', 12.9556, 77.7497, 'Graphite India'),
      ('blr-wf-hopefarm', area_id_var, 'Hope Farm Junction', 'hope-farm-junction', 12.9698, 77.7499, 'Phoenix Marketcity')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- HSR Layout
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%hsr%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'bangalore') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('blr-hsr-sector1', area_id_var, 'Sector 1', 'sector-1', 12.9121, 77.6446, 'HSR BDA Complex'),
      ('blr-hsr-sector2', area_id_var, 'Sector 2', 'sector-2', 12.9167, 77.6387, 'Agara Lake'),
      ('blr-hsr-sector3', area_id_var, 'Sector 3', 'sector-3', 12.9089, 77.6378, 'Souk Apartment'),
      ('blr-hsr-sector4', area_id_var, 'Sector 4', 'sector-4', 12.9037, 77.6422, 'HSR Layout Club'),
      ('blr-hsr-sector6', area_id_var, 'Sector 6', 'sector-6', 12.9095, 77.6503, '27th Main Road')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Jayanagar
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%jayanagar%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'bangalore') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('blr-jnr-4th-block', area_id_var, '4th Block', '4th-block', 12.9250, 77.5936, 'Jayanagar Shopping Complex'),
      ('blr-jnr-5th-block', area_id_var, '5th Block', '5th-block', 12.9180, 77.5912, 'Jayanagar 5th Block'),
      ('blr-jnr-9th-block', area_id_var, '9th Block', '9th-block', 12.9098, 77.5870, 'Ragigudda Temple')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Marathahalli
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%marathahalli%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'bangalore') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('blr-mrt-outer-ring', area_id_var, 'Outer Ring Road', 'outer-ring-road', 12.9591, 77.7016, 'Marathahalli Bridge'),
      ('blr-mrt-spice-garden', area_id_var, 'Spice Garden', 'spice-garden', 12.9530, 77.6980, 'HAL Old Airport Road'),
      ('blr-mrt-kadubeesanahalli', area_id_var, 'Kadubeesanahalli', 'kadubeesanahalli', 12.9352, 77.6971, 'Innovative Multiplex')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Electronic City
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%electronic city%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'bangalore') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('blr-ec-phase1', area_id_var, 'Phase 1', 'phase-1', 12.8456, 77.6603, 'Infosys Campus'),
      ('blr-ec-phase2', area_id_var, 'Phase 2', 'phase-2', 12.8389, 77.6771, 'Electronic City Metro'),
      ('blr-ec-phase3', area_id_var, 'Phase 3', 'phase-3', 12.8275, 77.6842, 'Wipro Corporate Office')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Banashankari
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%banashankari%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'bangalore') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('blr-bnk-1st-stage', area_id_var, '1st Stage', '1st-stage', 12.9298, 77.5464, 'Banashankari Temple'),
      ('blr-bnk-2nd-stage', area_id_var, '2nd Stage', '2nd-stage', 12.9248, 77.5389, 'Banashankari BDA Complex'),
      ('blr-bnk-3rd-stage', area_id_var, '3rd Stage', '3rd-stage', 12.9194, 77.5512, 'Banashankari Metro')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Malleshwaram
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%malleshwaram%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'bangalore') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('blr-mlr-8th-main', area_id_var, '8th Main Road', '8th-main-road', 13.0067, 77.5703, 'Mantri Square Mall'),
      ('blr-mlr-sampige-road', area_id_var, 'Sampige Road', 'sampige-road', 13.0000, 77.5750, 'Malleshwaram Circle'),
      ('blr-mlr-margosa-road', area_id_var, 'Margosa Road', 'margosa-road', 12.9982, 77.5681, 'Malleshwaram Market')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;
END $$;

-- ========== HYDERABAD ==========
DO $$
DECLARE
  area_id_var TEXT;
BEGIN
  -- Hitech City
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%hitech%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'hyderabad') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('hyd-htc-cyber-towers', area_id_var, 'Cyber Towers', 'cyber-towers', 17.4483, 78.3798, 'HITEC City Main Road'),
      ('hyd-htc-mindspace', area_id_var, 'Mindspace', 'mindspace', 17.4402, 78.3821, 'Mindspace IT Park'),
      ('hyd-htc-raheja', area_id_var, 'Raheja Mindspace', 'raheja-mindspace', 17.4371, 78.3856, 'Inorbit Mall')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Banjara Hills
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%banjara%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'hyderabad') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('hyd-bnh-road-no-1', area_id_var, 'Road No 1', 'road-no-1', 17.4239, 78.4483, 'KBR Park'),
      ('hyd-bnh-road-no-2', area_id_var, 'Road No 2', 'road-no-2', 17.4189, 78.4456, 'Film Nagar'),
      ('hyd-bnh-road-no-12', area_id_var, 'Road No 12', 'road-no-12', 17.4126, 78.4465, 'GVK One Mall')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Gachibowli
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%gachibowli%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'hyderabad') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('hyd-gcb-wipro-circle', area_id_var, 'Wipro Circle', 'wipro-circle', 17.4435, 78.3482, 'Wipro Campus'),
      ('hyd-gcb-nanakramguda', area_id_var, 'Nanakramguda', 'nanakramguda', 17.4241, 78.3541, 'Financial District'),
      ('hyd-gcb-kothaguda', area_id_var, 'Kothaguda', 'kothaguda', 17.4567, 78.3623, 'DLF Cyber City')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Kukatpally
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%kukatpally%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'hyderabad') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('hyd-kkt-kphb', area_id_var, 'KPHB Colony', 'kphb-colony', 17.4924, 78.3915, 'KPHB Metro'),
      ('hyd-kkt-jntu', area_id_var, 'JNTU', 'jntu', 17.4948, 78.3917, 'JNTU College'),
      ('hyd-kkt-miyapur', area_id_var, 'Miyapur', 'miyapur', 17.4968, 78.3585, 'Miyapur Metro')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Secunderabad
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%secunderabad%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'hyderabad') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('hyd-sec-maredpally', area_id_var, 'Maredpally', 'maredpally', 17.4502, 78.5029, 'Secunderabad Railway Station'),
      ('hyd-sec-paradise', area_id_var, 'Paradise Circle', 'paradise-circle', 17.4432, 78.4969, 'Paradise Hotel'),
      ('hyd-sec-trimulgherry', area_id_var, 'Trimulgherry', 'trimulgherry', 17.4628, 78.5006, 'AOC Centre')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Madhapur
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%madhapur%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'hyderabad') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('hyd-mdp-ayyappa-society', area_id_var, 'Ayyappa Society', 'ayyappa-society', 17.4485, 78.3908, 'Madhapur Metro'),
      ('hyd-mdp-botanical-garden', area_id_var, 'Botanical Garden', 'botanical-garden', 17.4598, 78.3831, 'BHEL Colony'),
      ('hyd-mdp-image-garden', area_id_var, 'Image Garden Road', 'image-garden-road', 17.4534, 78.3912, 'Madhapur PS')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;
END $$;

-- ========== VISAKHAPATNAM ==========
DO $$
DECLARE
  area_id_var TEXT;
BEGIN
  -- MVP Colony
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%mvp%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) LIKE '%visak%') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('vsk-mvp-sector1', area_id_var, 'Sector 1', 'sector-1', 17.7533, 83.3026, 'MVP Colony Main Road'),
      ('hyd-mvp-sector9', area_id_var, 'Sector 9', 'sector-9', 17.7598, 83.3102, 'Siripuram Junction')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Dwaraka Nagar
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%dwaraka%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) LIKE '%visak%') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('vsk-dwk-main-road', area_id_var, 'Dwaraka Nagar Main Road', 'main-road', 17.7231, 83.3145, 'Dwaraka Bus Stand'),
      ('vsk-dwk-sai-nagar', area_id_var, 'Sai Nagar', 'sai-nagar', 17.7189, 83.3201, 'CMR Central')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Gajuwaka
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%gajuwaka%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) LIKE '%visak%') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('vsk-gjw-steel-plant', area_id_var, 'Steel Plant Road', 'steel-plant-road', 17.7011, 83.2210, 'Vizag Steel'),
      ('vsk-gjw-ukkunagaram', area_id_var, 'Ukkunagaram', 'ukkunagaram', 17.7156, 83.2345, 'Ukkunagaram Market')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;
END $$;

-- ========== CHENNAI ==========
DO $$
DECLARE
  area_id_var TEXT;
BEGIN
  -- Anna Nagar
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%anna nagar%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'chennai') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('che-ann-round-tana', area_id_var, 'Anna Nagar Round Tana', 'round-tana', 13.0878, 80.2087, 'Anna Nagar Tower'),
      ('che-ann-2nd-avenue', area_id_var, '2nd Avenue', '2nd-avenue', 13.0850, 80.2098, 'Shanthi Colony'),
      ('che-ann-6th-avenue', area_id_var, '6th Avenue', '6th-avenue', 13.0902, 80.2156, 'Anna Nagar West')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- T Nagar
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%t nagar%' OR LOWER(name) LIKE '%t.nagar%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'chennai') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('che-tnr-ranganathan-street', area_id_var, 'Ranganathan Street', 'ranganathan-street', 13.0431, 80.2338, 'Panagal Park'),
      ('che-tnr-usman-road', area_id_var, 'Usman Road', 'usman-road', 13.0456, 80.2389, 'T Nagar Bus Terminus'),
      ('che-tnr-pondy-bazaar', area_id_var, 'Pondy Bazaar', 'pondy-bazaar', 13.0521, 80.2412, 'GRT Jewellers')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Velachery
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%velachery%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'chennai') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('che-vel-vijayanagar', area_id_var, 'Vijayanagar', 'vijayanagar', 12.9756, 80.2231, 'Velachery Main Road'),
      ('che-vel-100ft-road', area_id_var, '100 Feet Road', '100-feet-road', 12.9812, 80.2198, 'Phoenix Marketcity')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Adyar
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%adyar%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'chennai') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('che-ady-gandhi-nagar', area_id_var, 'Gandhi Nagar', 'gandhi-nagar', 13.0067, 80.2578, 'Adyar Signal'),
      ('che-ady-indira-nagar', area_id_var, 'Indira Nagar', 'indira-nagar', 13.0123, 80.2601, 'Adyar Gate'),
      ('che-ady-kasturba-nagar', area_id_var, 'Kasturba Nagar', 'kasturba-nagar', 13.0201, 80.2489, 'Adyar Depot')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- OMR (Old Mahabalipuram Road)
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%omr%' OR LOWER(name) LIKE '%mahabalipuram%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'chennai') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('che-omr-thoraipakkam', area_id_var, 'Thoraipakkam', 'thoraipakkam', 12.9396, 80.2341, 'OMR Signal'),
      ('che-omr-sholinganallur', area_id_var, 'Sholinganallur', 'sholinganallur', 12.9010, 80.2279, 'Sholinganallur Metro'),
      ('che-omr-perungudi', area_id_var, 'Perungudi', 'perungudi', 12.9612, 80.2398, 'TIDEL Park')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;
END $$;

-- ========== MUMBAI ==========
DO $$
DECLARE
  area_id_var TEXT;
BEGIN
  -- Andheri
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%andheri%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'mumbai') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('mum-and-west-lokhandwala', area_id_var, 'Lokhandwala', 'lokhandwala', 19.1419, 72.8346, 'Lokhandwala Complex'),
      ('mum-and-west-versova', area_id_var, 'Versova', 'versova', 19.1297, 72.8112, 'Versova Metro'),
      ('mum-and-east-jb-nagar', area_id_var, 'JB Nagar', 'jb-nagar', 19.1136, 72.8697, 'Andheri East Metro'),
      ('mum-and-east-chakala', area_id_var, 'Chakala', 'chakala', 19.1089, 72.8678, 'Marol Naka')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Bandra
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%bandra%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'mumbai') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('mum-bnd-west-linking-road', area_id_var, 'Linking Road', 'linking-road', 19.0596, 72.8295, 'Bandra Linking Road'),
      ('mum-bnd-west-hill-road', area_id_var, 'Hill Road', 'hill-road', 19.0526, 72.8289, 'Mount Mary Church'),
      ('mum-bnd-east-bkc', area_id_var, 'BKC', 'bkc', 19.0625, 72.8689, 'Bandra Kurla Complex')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Powai
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%powai%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'mumbai') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('mum-pow-hiranandani', area_id_var, 'Hiranandani Gardens', 'hiranandani-gardens', 19.1176, 72.9060, 'Galleria Mall'),
      ('mum-pow-iit-area', area_id_var, 'IIT Powai', 'iit-powai', 19.1342, 72.9156, 'IIT Bombay'),
      ('mum-pow-chandivali', area_id_var, 'Chandivali', 'chandivali', 19.1089, 72.8989, 'Chandivali Studio')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Thane
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%thane%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'mumbai') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('mum-thane-ghodbunder', area_id_var, 'Ghodbunder Road', 'ghodbunder-road', 19.2389, 72.9745, 'Korum Mall'),
      ('mum-thane-majiwada', area_id_var, 'Majiwada', 'majiwada', 19.2183, 72.9781, 'Viviana Mall'),
      ('mum-thane-kapur-bawdi', area_id_var, 'Kapurbawdi', 'kapurbawdi', 19.2156, 72.9623, 'Thane Station')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Navi Mumbai
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%navi mumbai%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'mumbai') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('mum-navi-vashi', area_id_var, 'Vashi', 'vashi', 19.0769, 72.9989, 'Vashi Railway Station'),
      ('mum-navi-kharghar', area_id_var, 'Kharghar', 'kharghar', 19.0423, 73.0678, 'Central Park'),
      ('mum-navi-cbd-belapur', area_id_var, 'CBD Belapur', 'cbd-belapur', 19.0156, 73.0345, 'CBD Belapur Station')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;
END $$;

-- ========== PUNE ==========
DO $$
DECLARE
  area_id_var TEXT;
BEGIN
  -- Hinjewadi
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%hinjewadi%' OR LOWER(name) LIKE '%hinjawadi%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'pune') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('pun-hnj-phase1', area_id_var, 'Phase 1', 'phase-1', 18.5912, 73.7389, 'Rajiv Gandhi Infotech Park'),
      ('pun-hnj-phase2', area_id_var, 'Phase 2', 'phase-2', 18.5879, 73.7245, 'Blue Ridge Township'),
      ('pun-hnj-phase3', area_id_var, 'Phase 3', 'phase-3', 18.6012, 73.7198, 'Megapolis')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Koregaon Park
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%koregaon%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'pune') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('pun-krg-north-main', area_id_var, 'North Main Road', 'north-main-road', 18.5456, 73.8967, 'Osho Ashram'),
      ('pun-krg-lane5', area_id_var, 'Lane 5', 'lane-5', 18.5389, 73.8912, 'ABC Farms'),
      ('pun-krg-lane7', area_id_var, 'Lane 7', 'lane-7', 18.5423, 73.8945, 'German Bakery')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Baner
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%baner%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'pune') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('pun-bnr-main-road', area_id_var, 'Baner Main Road', 'main-road', 18.5590, 73.7880, 'Baner Gaon'),
      ('pun-bnr-pashan-road', area_id_var, 'Baner-Pashan Link Road', 'pashan-link-road', 18.5467, 73.7812, 'Cummins College'),
      ('pun-bnr-aundh-road', area_id_var, 'Baner-Aundh Road', 'aundh-road', 18.5623, 73.7945, 'Mayur Colony')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Kothrud
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%kothrud%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'pune') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('pun-kth-dprd', area_id_var, 'DP Road', 'dp-road', 18.5089, 73.8223, 'Kothrud Depot'),
      ('pun-kth-paud-road', area_id_var, 'Paud Road', 'paud-road', 18.5012, 73.8156, 'Karve Nagar'),
      ('pun-kth-karve-road', area_id_var, 'Karve Road', 'karve-road', 18.5156, 73.8267, 'Deccan')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Viman Nagar
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%viman%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'pune') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('pun-vmn-phoenix', area_id_var, 'Phoenix Marketcity', 'phoenix', 18.5679, 73.9156, 'Phoenix Mall'),
      ('pun-vmn-datta-mandir', area_id_var, 'Datta Mandir Road', 'datta-mandir', 18.5623, 73.9189, 'Wadgaon Sheri'),
      ('pun-vmn-nagar-road', area_id_var, 'Nagar Road', 'nagar-road', 18.5712, 73.9234, 'EON IT Park')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;
END $$;

-- ========== KOLKATA ==========
DO $$
DECLARE
  area_id_var TEXT;
BEGIN
  -- Salt Lake
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%salt lake%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'kolkata') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('kol-salt-sector5', area_id_var, 'Sector 5', 'sector-5', 22.5726, 88.4167, 'Salt Lake Stadium'),
      ('kol-salt-sector1', area_id_var, 'Sector 1', 'sector-1', 22.5856, 88.4289, 'Karunamoyee'),
      ('kol-salt-city-centre', area_id_var, 'City Centre', 'city-centre', 22.5745, 88.4234, 'City Centre Mall')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Park Street
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%park street%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'kolkata') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('kol-park-central-avenue', area_id_var, 'Central Avenue', 'central-avenue', 22.5645, 88.3523, 'Park Street Metro'),
      ('kol-park-free-school', area_id_var, 'Free School Street', 'free-school-street', 22.5567, 88.3534, 'South City Mall Area'),
      ('kol-park-camac-street', area_id_var, 'Camac Street', 'camac-street', 22.5523, 88.3489, 'Elgin Road')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- New Town
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%new town%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) = 'kolkata') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('kol-newt-action-area1', area_id_var, 'Action Area 1', 'action-area-1', 22.6012, 88.4734, 'Eco Park'),
      ('kol-newt-action-area2', area_id_var, 'Action Area 2', 'action-area-2', 22.5923, 88.4812, 'Nazrul Tirtha'),
      ('kol-newt-rajarhat', area_id_var, 'Rajarhat', 'rajarhat', 22.6156, 88.4489, 'Rajarhat Chowmatha')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;
END $$;

-- ========== MYSORE ==========
DO $$
DECLARE
  area_id_var TEXT;
BEGIN
  -- Vijayanagar
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%vijayanagar%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) LIKE '%mysore%' OR LOWER(name) LIKE '%mysuru%') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('mys-vjn-1st-stage', area_id_var, '1st Stage', '1st-stage', 12.3289, 76.6234, 'Vijayanagar 1st Stage'),
      ('mys-vjn-2nd-stage', area_id_var, '2nd Stage', '2nd-stage', 12.3312, 76.6189, 'Vijayanagar 2nd Stage'),
      ('mys-vjn-3rd-stage', area_id_var, '3rd Stage', '3rd-stage', 12.3245, 76.6156, 'Vijayanagar 3rd Stage')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Saraswathipuram
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%saraswathi%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) LIKE '%mysore%' OR LOWER(name) LIKE '%mysuru%') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('mys-srw-main-road', area_id_var, 'Saraswathipuram Main Road', 'main-road', 12.2958, 76.6389, 'Saraswathipuram Circle'),
      ('mys-srw-chamundi-hill-road', area_id_var, 'Chamundi Hill Road', 'chamundi-hill-road', 12.2912, 76.6423, 'Chamundi Hill Base')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;

  -- Kuvempunagar
  SELECT id INTO area_id_var FROM areas WHERE LOWER(name) LIKE '%kuvempu%' AND city_id IN (SELECT id FROM cities WHERE LOWER(name) LIKE '%mysore%' OR LOWER(name) LIKE '%mysuru%') LIMIT 1;
  IF area_id_var IS NOT NULL THEN
    INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
      ('mys-kvp-north', area_id_var, 'Kuvempunagar North', 'north', 12.3489, 76.6312, 'Kuvempunagar Bus Stand'),
      ('mys-kvp-south', area_id_var, 'Kuvempunagar South', 'south', 12.3423, 76.6289, 'Kuvempunagar Market')
    ON CONFLICT (area_id, slug) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 8: VERIFY SETUP
-- =====================================================
SELECT 
  c.name as city,
  a.name as area,
  COUNT(sa.id) as sub_area_count
FROM cities c
LEFT JOIN areas a ON a.city_id = c.id
LEFT JOIN sub_areas sa ON sa.area_id = a.id
WHERE c.name IN ('Bangalore', 'Hyderabad', 'Visakhapatnam', 'Chennai', 'Mumbai', 'Pune', 'Kolkata', 'Mysore')
GROUP BY c.name, a.name
HAVING COUNT(sa.id) > 0
ORDER BY c.name, a.name;

-- Final Count
SELECT 
  'Total Sub-Areas Created' as metric,
  COUNT(*) as count
FROM sub_areas;

-- =====================================================
-- ✅ DONE! You should see sub-areas for all major cities
-- =====================================================
-- NOTE: Distance calculation uses road_distances table
-- which stores distances between AREA_IDs (not sub-areas)
-- Sub-areas are for precise user location only
-- =====================================================
