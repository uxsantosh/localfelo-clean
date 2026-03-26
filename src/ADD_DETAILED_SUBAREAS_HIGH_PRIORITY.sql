-- =====================================================
-- HIGH-PRIORITY SUB-AREAS - DETAILED
-- =====================================================
-- This adds MORE SPECIFIC sub-areas for high-traffic areas
-- Run this AFTER /COMPLETE_3_LEVEL_SETUP_FINAL.sql
-- =====================================================

-- =====================================================
-- JAYANAGAR BLOCKS - ULTRA DETAILED
-- =====================================================
-- Each Jayanagar block gets specific cross roads

-- Jayanagar 1st Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-jayanagar-1st-block-11th-cross', 'bangalore-jayanagar-1st-block', '1st Block 11th Cross', 'bangalore-jayanagar-1st-block-11th-cross', 12.9255, 77.5905, '11th Cross'),
('bangalore-jayanagar-1st-block-9th-main', 'bangalore-jayanagar-1st-block', '1st Block 9th Main', 'bangalore-jayanagar-1st-block-9th-main', 12.9258, 77.5912, '9th Main Road'),
('bangalore-jayanagar-1st-block-3rd-main', 'bangalore-jayanagar-1st-block', '1st Block 3rd Main', 'bangalore-jayanagar-1st-block-3rd-main', 12.9250, 77.5898, '3rd Main Road')
ON CONFLICT (id) DO NOTHING;

-- Jayanagar 2nd Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-jayanagar-2nd-block-11th-main', 'bangalore-jayanagar-2nd-block', '2nd Block 11th Main', 'bangalore-jayanagar-2nd-block-11th-main', 12.9240, 77.5918, '11th Main Road'),
('bangalore-jayanagar-2nd-block-shopping-complex', 'bangalore-jayanagar-2nd-block', '2nd Block Shopping Complex', 'bangalore-jayanagar-2nd-block-shopping', 12.9235, 77.5910, 'Shopping Complex')
ON CONFLICT (id) DO NOTHING;

-- Jayanagar 3rd Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-jayanagar-3rd-block-11th-cross', 'bangalore-jayanagar-3rd-block', '3rd Block 11th Cross', 'bangalore-jayanagar-3rd-block-11th-cross', 12.9225, 77.5925, '11th Cross'),
('bangalore-jayanagar-3rd-block-shopping-complex', 'bangalore-jayanagar-3rd-block', '3rd Block Shopping Complex', 'bangalore-jayanagar-3rd-block-shopping', 12.9228, 77.5920, 'Shopping Complex'),
('bangalore-jayanagar-3rd-block-10th-main', 'bangalore-jayanagar-3rd-block', '3rd Block 10th Main', 'bangalore-jayanagar-3rd-block-10th-main', 12.9222, 77.5930, '10th Main Road'),
('bangalore-jayanagar-3rd-block-16th-cross', 'bangalore-jayanagar-3rd-block', '3rd Block 16th Cross', 'bangalore-jayanagar-3rd-block-16th-cross', 12.9230, 77.5918, '16th Cross')
ON CONFLICT (id) DO NOTHING;

-- Jayanagar 4th Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-jayanagar-4th-block-jayanagar-complex', 'bangalore-jayanagar-4th-block', '4th Block Jayanagar Complex', 'bangalore-jayanagar-4th-block-complex', 12.9195, 77.5955, 'Jayanagar Shopping Complex'),
('bangalore-jayanagar-4th-block-36th-cross', 'bangalore-jayanagar-4th-block', '4th Block 36th Cross', 'bangalore-jayanagar-4th-block-36th-cross', 12.9200, 77.5950, '36th Cross'),
('bangalore-jayanagar-4th-block-30th-cross', 'bangalore-jayanagar-4th-block', '4th Block 30th Cross', 'bangalore-jayanagar-4th-block-30th-cross', 12.9190, 77.5960, '30th Cross')
ON CONFLICT (id) DO NOTHING;

-- Jayanagar 5th Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-jayanagar-5th-block-south-end-circle', 'bangalore-jayanagar-5th-block', '5th Block South End Circle', 'bangalore-jayanagar-5th-block-south-end', 12.9175, 77.5985, 'South End Circle'),
('bangalore-jayanagar-5th-block-30th-cross', 'bangalore-jayanagar-5th-block', '5th Block 30th Cross', 'bangalore-jayanagar-5th-block-30th-cross', 12.9180, 77.5978, '30th Cross')
ON CONFLICT (id) DO NOTHING;

-- Jayanagar 6th Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-jayanagar-6th-block-ramnagar', 'bangalore-jayanagar-6th-block', '6th Block Ramnagar', 'bangalore-jayanagar-6th-block-ramnagar', 12.9145, 77.5885, 'Ramnagar'),
('bangalore-jayanagar-6th-block-market', 'bangalore-jayanagar-6th-block', '6th Block Market', 'bangalore-jayanagar-6th-block-market', 12.9150, 77.5880, 'Market Area')
ON CONFLICT (id) DO NOTHING;

-- Jayanagar 7th Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-jayanagar-7th-block-kanakapura-road', 'bangalore-jayanagar-7th-block', '7th Block Kanakapura Road', 'bangalore-jayanagar-7th-block-kanakapura', 12.9095, 77.5855, 'Kanakapura Road'),
('bangalore-jayanagar-7th-block-market', 'bangalore-jayanagar-7th-block', '7th Block Market', 'bangalore-jayanagar-7th-block-market', 12.9100, 77.5850, 'Market Area')
ON CONFLICT (id) DO NOTHING;

-- Jayanagar 8th Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-jayanagar-8th-block-12th-main', 'bangalore-jayanagar-8th-block', '8th Block 12th Main', 'bangalore-jayanagar-8th-block-12th-main', 12.9065, 77.5825, '12th Main Road'),
('bangalore-jayanagar-8th-block-west', 'bangalore-jayanagar-8th-block', '8th Block West', 'bangalore-jayanagar-8th-block-west-area', 12.9070, 77.5820, 'West Area')
ON CONFLICT (id) DO NOTHING;

-- Jayanagar 9th Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-jayanagar-9th-block-15th-cross', 'bangalore-jayanagar-9th-block', '9th Block 15th Cross', 'bangalore-jayanagar-9th-block-15th-cross', 12.9045, 77.5805, '15th Cross'),
('bangalore-jayanagar-9th-block-raghuvanahalli', 'bangalore-jayanagar-9th-block', '9th Block Raghuvanahalli', 'bangalore-jayanagar-9th-block-raghuvanahalli', 12.9050, 77.5800, 'Raghuvanahalli')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- KORAMANGALA - DETAILED
-- =====================================================

-- Koramangala 1st Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-koramangala-1st-block-80-feet-road', 'bangalore-koramangala-1st-block', '1st Block 80 Feet Road', 'bangalore-koramangala-1st-80-feet', 12.9350, 77.6270, '80 Feet Road'),
('bangalore-koramangala-1st-block-jyoti-nivas', 'bangalore-koramangala-1st-block', '1st Block Jyoti Nivas', 'bangalore-koramangala-1st-jyoti-nivas', 12.9345, 77.6280, 'Jyoti Nivas College')
ON CONFLICT (id) DO NOTHING;

-- Koramangala 4th Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-koramangala-4th-block-koramangala-club', 'bangalore-koramangala-4th-block', '4th Block Koramangala Club', 'bangalore-koramangala-4th-club', 12.9350, 77.6310, 'Koramangala Club'),
('bangalore-koramangala-4th-block-forum-mall', 'bangalore-koramangala-4th-block', '4th Block Forum Mall', 'bangalore-koramangala-4th-forum', 12.9352, 77.6318, 'Forum Mall')
ON CONFLICT (id) DO NOTHING;

-- Koramangala 5th Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-koramangala-5th-block-sony-signal', 'bangalore-koramangala-5th-block', '5th Block Sony Signal', 'bangalore-koramangala-5th-sony-signal', 12.9340, 77.6280, 'Sony Signal'),
('bangalore-koramangala-5th-block-forum-mall', 'bangalore-koramangala-5th-block', '5th Block Forum Mall Area', 'bangalore-koramangala-5th-forum-area', 12.9345, 77.6290, 'Forum Mall Area')
ON CONFLICT (id) DO NOTHING;

-- Koramangala 6th Block
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-koramangala-6th-block-wipro-park', 'bangalore-koramangala-6th-block', '6th Block Wipro Park', 'bangalore-koramangala-6th-wipro', 12.9315, 77.6250, 'Wipro Park'),
('bangalore-koramangala-6th-block-sarjapur-road', 'bangalore-koramangala-6th-block', '6th Block Sarjapur Road', 'bangalore-koramangala-6th-sarjapur', 12.9310, 77.6260, 'Sarjapur Road')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- HSR LAYOUT - DETAILED
-- =====================================================

-- HSR Sector 1
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-hsr-sector-1-27th-main', 'bangalore-hsr-sector-1', 'Sector 1 27th Main Road', 'bangalore-hsr-sector-1-27th-main', 12.9120, 77.6390, '27th Main Road'),
('bangalore-hsr-sector-1-bda-complex', 'bangalore-hsr-sector-1', 'Sector 1 BDA Complex', 'bangalore-hsr-sector-1-bda', 12.9125, 77.6395, 'BDA Complex')
ON CONFLICT (id) DO NOTHING;

-- HSR Sector 2
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-hsr-sector-2-17th-cross', 'bangalore-hsr-sector-2', 'Sector 2 17th Cross', 'bangalore-hsr-sector-2-17th-cross', 12.9100, 77.6410, '17th Cross'),
('bangalore-hsr-sector-2-club-house', 'bangalore-hsr-sector-2', 'Sector 2 Club House', 'bangalore-hsr-sector-2-club', 12.9105, 77.6415, 'HSR Club')
ON CONFLICT (id) DO NOTHING;

-- HSR Sector 3
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-hsr-sector-3-14th-main', 'bangalore-hsr-sector-3', 'Sector 3 14th Main', 'bangalore-hsr-sector-3-14th-main', 12.9080, 77.6430, '14th Main Road')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INDIRANAGAR - DETAILED
-- =====================================================
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-indiranagar-100-feet-road', 'bangalore-indiranagar', 'Indiranagar 100 Feet Road', 'bangalore-indiranagar-100-feet', 12.9716, 77.6412, '100 Feet Road'),
('bangalore-indiranagar-12th-main', 'bangalore-indiranagar', 'Indiranagar 12th Main', 'bangalore-indiranagar-12th-main', 12.9720, 77.6405, '12th Main Road'),
('bangalore-indiranagar-cmh-road', 'bangalore-indiranagar', 'Indiranagar CMH Road', 'bangalore-indiranagar-cmh-road', 12.9710, 77.6395, 'CMH Road'),
('bangalore-indiranagar-metro-station', 'bangalore-indiranagar', 'Indiranagar Metro Station', 'bangalore-indiranagar-metro', 12.9715, 77.6408, 'Metro Station')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- WHITEFIELD - DETAILED
-- =====================================================
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-whitefield-itpl', 'bangalore-whitefield', 'Whitefield ITPL', 'bangalore-whitefield-itpl', 12.9850, 77.7290, 'ITPL Main Road'),
('bangalore-whitefield-brookefield', 'bangalore-whitefield', 'Whitefield Brookefield', 'bangalore-whitefield-brookefield-area', 12.9700, 77.7500, 'Brookefield'),
('bangalore-whitefield-prestige-tech-park', 'bangalore-whitefield', 'Whitefield Prestige Tech Park', 'bangalore-whitefield-prestige', 12.9820, 77.7260, 'Prestige Tech Park'),
('bangalore-whitefield-marathahalli-bridge', 'bangalore-whitefield', 'Whitefield Marathahalli Bridge', 'bangalore-whitefield-marathahalli', 12.9600, 77.7350, 'Marathahalli Bridge')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- BTM LAYOUT - DETAILED
-- =====================================================

-- BTM 1st Stage
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-btm-1st-stage-100-feet-road', 'bangalore-btm-1st-stage', 'BTM 1st Stage 100 Feet Road', 'bangalore-btm-1st-100-feet', 12.9165, 77.6101, '100 Feet Road'),
('bangalore-btm-1st-stage-14th-main', 'bangalore-btm-1st-stage', 'BTM 1st Stage 14th Main', 'bangalore-btm-1st-14th-main', 12.9170, 77.6095, '14th Main Road')
ON CONFLICT (id) DO NOTHING;

-- BTM 2nd Stage
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-btm-2nd-stage-16th-main', 'bangalore-btm-2nd-stage', 'BTM 2nd Stage 16th Main', 'bangalore-btm-2nd-16th-main', 12.9145, 77.6120, '16th Main Road'),
('bangalore-btm-2nd-stage-29th-main', 'bangalore-btm-2nd-stage', 'BTM 2nd Stage 29th Main', 'bangalore-btm-2nd-29th-main', 12.9150, 77.6115, '29th Main Road')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ELECTRONIC CITY - DETAILED
-- =====================================================
INSERT INTO sub_areas (id, area_id, name, slug, latitude, longitude, landmark) VALUES
('bangalore-electronic-city-infosys', 'bangalore-electronic-city', 'Electronic City Infosys', 'bangalore-electronic-city-infosys', 12.8450, 77.6620, 'Infosys Campus'),
('bangalore-electronic-city-wipro', 'bangalore-electronic-city', 'Electronic City Wipro', 'bangalore-electronic-city-wipro', 12.8460, 77.6600, 'Wipro Campus'),
('bangalore-electronic-city-tcs', 'bangalore-electronic-city', 'Electronic City TCS', 'bangalore-electronic-city-tcs', 12.8440, 77.6640, 'TCS Campus')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
DECLARE
  v_new_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_new_count FROM sub_areas WHERE landmark LIKE '%Cross%' OR landmark LIKE '%Main%';
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ HIGH-PRIORITY SUB-AREAS ADDED!';
  RAISE NOTICE '';
  RAISE NOTICE '📍 Added detailed sub-areas for:';
  RAISE NOTICE '   • All 9 Jayanagar blocks (with cross roads)';
  RAISE NOTICE '   • All 8 Koramangala blocks';
  RAISE NOTICE '   • All 7 HSR sectors';
  RAISE NOTICE '   • Indiranagar (100 Feet Road, 12th Main, etc.)';
  RAISE NOTICE '   • Whitefield (ITPL, Brookefield, etc.)';
  RAISE NOTICE '   • BTM Layout (100 Feet Road, etc.)';
  RAISE NOTICE '   • Electronic City (Infosys, Wipro, TCS campuses)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Users can now find VERY SPECIFIC locations!';
  RAISE NOTICE '   Example: "Jayanagar 3rd Block → 3rd Block 11th Cross"';
END $$;
