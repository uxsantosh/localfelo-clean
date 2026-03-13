-- =====================================================
-- JAYANAGAR COMPLETE SUB-AREAS (ALL 9 BLOCKS)
-- =====================================================
-- This is an example of how thorough we need to be
-- Jayanagar has 9 blocks + additional localities
-- =====================================================

-- First, let's see what area_id Jayanagar has
SELECT id, name FROM areas WHERE name ILIKE '%jayanagar%';

-- JAYANAGAR COMPLETE (Assuming area_id from above query)
-- Replace 'AREA_ID_HERE' with actual ID from query above

-- Example for Bangalore Jayanagar (likely '3-4' or similar)
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
-- ALL 9 BLOCKS (not missing any!)
('jayanagar-1', 'AREA_ID_HERE', '1st Block', 'bangalore-jayanagar-1st-block', 12.9250, 77.5900, 'Jayanagar 1st Block'),
('jayanagar-2', 'AREA_ID_HERE', '2nd Block', 'bangalore-jayanagar-2nd-block', 12.9240, 77.5910, 'Jayanagar 2nd Block'),
('jayanagar-3', 'AREA_ID_HERE', '3rd Block', 'bangalore-jayanagar-3rd-block', 12.9230, 77.5920, 'Shopping Complex'),
('jayanagar-4', 'AREA_ID_HERE', '4th Block', 'bangalore-jayanagar-4th-block', 12.9200, 77.5950, '4th Block Complex'),
('jayanagar-5', 'AREA_ID_HERE', '5th Block', 'bangalore-jayanagar-5th-block', 12.9180, 77.5980, 'South End Circle'),
('jayanagar-6', 'AREA_ID_HERE', '6th Block', 'bangalore-jayanagar-6th-block', 12.9150, 77.5880, '6th Block Market'),
('jayanagar-7', 'AREA_ID_HERE', '7th Block', 'bangalore-jayanagar-7th-block', 12.9100, 77.5850, '7th Block Market'),
('jayanagar-8', 'AREA_ID_HERE', '8th Block', 'bangalore-jayanagar-8th-block', 12.9070, 77.5820, '8th Block'),
('jayanagar-9', 'AREA_ID_HERE', '9th Block', 'bangalore-jayanagar-9th-block', 12.9050, 77.5800, '9th Block'),

-- Additional Jayanagar Localities
('jayanagar-10', 'AREA_ID_HERE', 'Jayanagar East', 'bangalore-jayanagar-east', 12.9280, 77.6000, 'Jayanagar East'),
('jayanagar-11', 'AREA_ID_HERE', 'RV Road', 'bangalore-jayanagar-rv-road', 12.9150, 77.5870, 'RV Road Metro'),
('jayanagar-12', 'AREA_ID_HERE', 'JP Nagar Road', 'bangalore-jayanagar-jp-nagar-road', 12.9120, 77.5900, 'JP Nagar Border'),
('jayanagar-13', 'AREA_ID_HERE', 'Byrasandra', 'bangalore-jayanagar-byrasandra', 12.9180, 77.6050, 'Byrasandra'),
('jayanagar-14', 'AREA_ID_HERE', 'Gurappana Palya', 'bangalore-jayanagar-gurappana-palya', 12.9050, 77.5920, 'Gurappana Palya'),
('jayanagar-15', 'AREA_ID_HERE', 'MICO Layout', 'bangalore-jayanagar-mico-layout', 12.9000, 77.5750, 'MICO Layout')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- This shows the level of detail we need for EVERY area
-- =====================================================
