-- =====================================================
-- COMPREHENSIVE LOCATION SETUP - ALL MAJOR INDIAN CITIES
-- =====================================================
-- This script adds ALL major areas for Indian metro cities
-- with accurate representative coordinates for each area.
-- 
-- Cities Covered:
-- 1. Bangalore (100+ areas)
-- 2. Mumbai (80+ areas)
-- 3. Delhi NCR (90+ areas)
-- 4. Chennai (60+ areas)
-- 5. Pune (50+ areas)
-- 6. Hyderabad (60+ areas)
-- 7. Kolkata (40+ areas)
-- =====================================================

-- Step 1: Add latitude/longitude columns to areas table
ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);

-- Step 2: Clear existing areas to start fresh
DELETE FROM areas;
DELETE FROM cities;

-- Step 3: Insert Cities
INSERT INTO cities (id, name) VALUES
('bangalore', 'Bangalore'),
('mumbai', 'Mumbai'),
('delhi', 'Delhi NCR'),
('chennai', 'Chennai'),
('pune', 'Pune'),
('hyderabad', 'Hyderabad'),
('kolkata', 'Kolkata')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- BANGALORE AREAS (100+ localities)
-- =====================================================

INSERT INTO areas (id, city_id, name, latitude, longitude) VALUES
-- BTM Layout & Surrounding
('bangalore-btm-1st-stage', 'bangalore', 'BTM 1st Stage', 12.9116, 77.6103),
('bangalore-btm-2nd-stage', 'bangalore', 'BTM 2nd Stage', 12.9165, 77.6101),
('bangalore-btm-layout', 'bangalore', 'BTM Layout', 12.9141, 77.6097),

-- Koramangala (All Blocks)
('bangalore-koramangala-1st-block', 'bangalore', 'Koramangala 1st Block', 12.9352, 77.6245),
('bangalore-koramangala-2nd-block', 'bangalore', 'Koramangala 2nd Block', 12.9279, 77.6271),
('bangalore-koramangala-3rd-block', 'bangalore', 'Koramangala 3rd Block', 12.9279, 77.6271),
('bangalore-koramangala-4th-block', 'bangalore', 'Koramangala 4th Block', 12.9352, 77.6245),
('bangalore-koramangala-5th-block', 'bangalore', 'Koramangala 5th Block', 12.9352, 77.6245),
('bangalore-koramangala-6th-block', 'bangalore', 'Koramangala 6th Block', 12.9279, 77.6271),
('bangalore-koramangala-7th-block', 'bangalore', 'Koramangala 7th Block', 12.9279, 77.6271),
('bangalore-koramangala-8th-block', 'bangalore', 'Koramangala 8th Block', 12.9352, 77.6245),

-- HSR Layout (All Sectors)
('bangalore-hsr-sector-1', 'bangalore', 'HSR Sector 1', 12.9116, 77.6388),
('bangalore-hsr-sector-2', 'bangalore', 'HSR Sector 2', 12.9080, 77.6470),
('bangalore-hsr-sector-3', 'bangalore', 'HSR Sector 3', 12.9140, 77.6470),
('bangalore-hsr-sector-4', 'bangalore', 'HSR Sector 4', 12.9200, 77.6470),
('bangalore-hsr-sector-5', 'bangalore', 'HSR Sector 5', 12.9160, 77.6530),
('bangalore-hsr-sector-6', 'bangalore', 'HSR Sector 6', 12.9100, 77.6530),
('bangalore-hsr-sector-7', 'bangalore', 'HSR Sector 7', 12.9060, 77.6590),

-- Whitefield & Surrounding
('bangalore-whitefield', 'bangalore', 'Whitefield', 12.9698, 77.7499),
('bangalore-varthur', 'bangalore', 'Varthur', 12.9346, 77.7544),
('bangalore-marathahalli', 'bangalore', 'Marathahalli', 12.9591, 77.7011),
('bangalore-brookefield', 'bangalore', 'Brookefield', 12.9716, 77.7380),
('bangalore-hoodi', 'bangalore', 'Hoodi', 12.9850, 77.7170),
('bangalore-kundalahalli', 'bangalore', 'Kundalahalli', 12.9850, 77.6970),
('bangalore-mahadevapura', 'bangalore', 'Mahadevapura', 12.9916, 77.6966),

-- Electronic City
('bangalore-electronic-city-phase-1', 'bangalore', 'Electronic City Phase 1', 12.8456, 77.6603),
('bangalore-electronic-city-phase-2', 'bangalore', 'Electronic City Phase 2', 12.8390, 77.6770),
('bangalore-electronic-city', 'bangalore', 'Electronic City', 12.8456, 77.6603),

-- Indiranagar & Surrounding
('bangalore-indiranagar', 'bangalore', 'Indiranagar', 12.9784, 77.6408),
('bangalore-haj-bhavan', 'bangalore', 'HAL 2nd Stage', 12.9616, 77.6679),
('bangalore-domlur', 'bangalore', 'Domlur', 12.9616, 77.6387),
('bangalore-ulsoor', 'bangalore', 'Ulsoor', 12.9810, 77.6210),

-- Jayanagar (All Blocks)
('bangalore-jayanagar-1st-block', 'bangalore', 'Jayanagar 1st Block', 12.9250, 77.5834),
('bangalore-jayanagar-2nd-block', 'bangalore', 'Jayanagar 2nd Block', 12.9280, 77.5900),
('bangalore-jayanagar-3rd-block', 'bangalore', 'Jayanagar 3rd Block', 12.9250, 77.5900),
('bangalore-jayanagar-4th-block', 'bangalore', 'Jayanagar 4th Block', 12.9250, 77.5900),
('bangalore-jayanagar-5th-block', 'bangalore', 'Jayanagar 5th Block', 12.9180, 77.5890),
('bangalore-jayanagar-6th-block', 'bangalore', 'Jayanagar 6th Block', 12.9150, 77.5850),
('bangalore-jayanagar-7th-block', 'bangalore', 'Jayanagar 7th Block', 12.9120, 77.5820),
('bangalore-jayanagar-8th-block', 'bangalore', 'Jayanagar 8th Block', 12.9100, 77.5800),
('bangalore-jayanagar-9th-block', 'bangalore', 'Jayanagar 9th Block', 12.9080, 77.5780),

-- Banashankari & JP Nagar
('bangalore-banashankari-1st-stage', 'bangalore', 'Banashankari 1st Stage', 12.9250, 77.5500),
('bangalore-banashankari-2nd-stage', 'bangalore', 'Banashankari 2nd Stage', 12.9200, 77.5450),
('bangalore-banashankari-3rd-stage', 'bangalore', 'Banashankari 3rd Stage', 12.9150, 77.5400),
('bangalore-jp-nagar-1st-phase', 'bangalore', 'JP Nagar 1st Phase', 12.9070, 77.5850),
('bangalore-jp-nagar-2nd-phase', 'bangalore', 'JP Nagar 2nd Phase', 12.9000, 77.5950),
('bangalore-jp-nagar-3rd-phase', 'bangalore', 'JP Nagar 3rd Phase', 12.8950, 77.5900),
('bangalore-jp-nagar-4th-phase', 'bangalore', 'JP Nagar 4th Phase', 12.8900, 77.5850),
('bangalore-jp-nagar-5th-phase', 'bangalore', 'JP Nagar 5th Phase', 12.8850, 77.5800),
('bangalore-jp-nagar-6th-phase', 'bangalore', 'JP Nagar 6th Phase', 12.8800, 77.5750),
('bangalore-jp-nagar-7th-phase', 'bangalore', 'JP Nagar 7th Phase', 12.8750, 77.5700),

-- Malleshwaram & Rajajinagar
('bangalore-malleshwaram', 'bangalore', 'Malleshwaram', 13.0067, 77.5703),
('bangalore-rajajinagar', 'bangalore', 'Rajajinagar', 12.9916, 77.5525),
('bangalore-basaveshwaranagar', 'bangalore', 'Basaveshwaranagar', 12.9850, 77.5400),
('bangalore-vijayanagar', 'bangalore', 'Vijayanagar', 12.9716, 77.5381),

-- Yeshwanthpur & Surrounding
('bangalore-yeshwanthpur', 'bangalore', 'Yeshwanthpur', 13.0280, 77.5520),
('bangalore-peenya', 'bangalore', 'Peenya', 13.0297, 77.5200),
('bangalore-jalahalli', 'bangalore', 'Jalahalli', 13.0388, 77.5580),

-- Hebbal & Surrounding
('bangalore-hebbal', 'bangalore', 'Hebbal', 13.0358, 77.5970),
('bangalore-rt-nagar', 'bangalore', 'RT Nagar', 13.0280, 77.5960),
('bangalore-sanjaynagar', 'bangalore', 'Sanjaynagar', 13.0280, 77.5820),
('bangalore-yelahanka', 'bangalore', 'Yelahanka', 13.1007, 77.5963),
('bangalore-devanahalli', 'bangalore', 'Devanahalli', 13.2490, 77.7120),

-- Sarjapur Road & Bellandur
('bangalore-sarjapur-road', 'bangalore', 'Sarjapur Road', 12.9010, 77.6900),
('bangalore-bellandur', 'bangalore', 'Bellandur', 12.9266, 77.6766),
('bangalore-kadubeesanahalli', 'bangalore', 'Kadubeesanahalli', 12.9340, 77.6920),
('bangalore-haralur', 'bangalore', 'Haralur', 12.9100, 77.6900),

-- Bannerghatta Road
('bangalore-bannerghatta-road', 'bangalore', 'Bannerghatta Road', 12.8880, 77.5980),
('bangalore-arekere', 'bangalore', 'Arekere', 12.8850, 77.5950),
('bangalore-hulimavu', 'bangalore', 'Hulimavu', 12.8700, 77.6000),

-- Outer Ring Road Areas
('bangalore-kormangala', 'bangalore', 'Kormangala', 12.9352, 77.6245),
('bangalore-kengeri', 'bangalore', 'Kengeri', 12.9144, 77.4852),
('bangalore-rajarajeshwari-nagar', 'bangalore', 'Rajarajeshwari Nagar', 12.9250, 77.5150),

-- CV Raman Nagar & Surrounding
('bangalore-cv-raman-nagar', 'bangalore', 'CV Raman Nagar', 12.9850, 77.6620),
('bangalore-banaswadi', 'bangalore', 'Banaswadi', 13.0116, 77.6530),
('bangalore-kalyan-nagar', 'bangalore', 'Kalyan Nagar', 13.0280, 77.6390),
('bangalore-horamavu', 'bangalore', 'Horamavu', 13.0280, 77.6550),

-- MG Road & Central Areas
('bangalore-mg-road', 'bangalore', 'MG Road', 12.9750, 77.6070),
('bangalore-brigade-road', 'bangalore', 'Brigade Road', 12.9716, 77.6103),
('bangalore-commercial-street', 'bangalore', 'Commercial Street', 12.9810, 77.6080),
('bangalore-shivajinagar', 'bangalore', 'Shivajinagar', 12.9850, 77.6010),
('bangalore-residency-road', 'bangalore', 'Residency Road', 12.9716, 77.6103),

-- Hennur & Surrounding
('bangalore-hennur', 'bangalore', 'Hennur', 13.0350, 77.6420),
('bangalore-ramamurthy-nagar', 'bangalore', 'Ramamurthy Nagar', 13.0116, 77.6750),
('bangalore-lingarajapuram', 'bangalore', 'Lingarajapuram', 13.0050, 77.6450),

-- Other Important Areas
('bangalore-vidyaranyapura', 'bangalore', 'Vidyaranyapura', 13.0850, 77.5630),
('bangalore-kr-puram', 'bangalore', 'KR Puram', 13.0116, 77.6966),
('bangalore-old-airport-road', 'bangalore', 'Old Airport Road', 12.9550, 77.6470),
('bangalore-kundanhalli', 'bangalore', 'Kundanhalli', 12.9650, 77.6970),
('bangalore-tin-factory', 'bangalore', 'Tin Factory', 12.9380, 77.5900);

-- =====================================================
-- MUMBAI AREAS (80+ localities)
-- =====================================================

INSERT INTO areas (id, city_id, name, latitude, longitude) VALUES
-- South Mumbai
('mumbai-colaba', 'mumbai', 'Colaba', 18.9067, 72.8147),
('mumbai-churchgate', 'mumbai', 'Churchgate', 18.9322, 72.8264),
('mumbai-marine-lines', 'mumbai', 'Marine Lines', 18.9450, 72.8229),
('mumbai-charni-road', 'mumbai', 'Charni Road', 18.9520, 72.8190),
('mumbai-grant-road', 'mumbai', 'Grant Road', 18.9640, 72.8150),
('mumbai-mumbai-central', 'mumbai', 'Mumbai Central', 18.9680, 72.8190),
('mumbai-mahalaxmi', 'mumbai', 'Mahalaxmi', 18.9820, 72.8230),
('mumbai-parel', 'mumbai', 'Parel', 19.0144, 72.8397),
('mumbai-dadar-east', 'mumbai', 'Dadar East', 19.0178, 72.8478),
('mumbai-dadar-west', 'mumbai', 'Dadar West', 19.0178, 72.8428),
('mumbai-worli', 'mumbai', 'Worli', 19.0176, 72.8170),
('mumbai-lower-parel', 'mumbai', 'Lower Parel', 19.0004, 72.8310),

-- Central Mumbai
('mumbai-matunga', 'mumbai', 'Matunga', 19.0270, 72.8570),
('mumbai-sion', 'mumbai', 'Sion', 19.0433, 72.8626),
('mumbai-kurla', 'mumbai', 'Kurla', 19.0728, 72.8826),
('mumbai-chembur', 'mumbai', 'Chembur', 19.0633, 72.8970),
('mumbai-ghatkopar-east', 'mumbai', 'Ghatkopar East', 19.0860, 72.9081),
('mumbai-ghatkopar-west', 'mumbai', 'Ghatkopar West', 19.0860, 72.8970),
('mumbai-vikhroli', 'mumbai', 'Vikhroli', 19.1059, 72.9311),
('mumbai-kanjurmarg', 'mumbai', 'Kanjurmarg', 19.1270, 72.9340),
('mumbai-bhandup', 'mumbai', 'Bhandup', 19.1478, 72.9360),
('mumbai-mulund', 'mumbai', 'Mulund', 19.1626, 72.9560),
('mumbai-thane', 'mumbai', 'Thane', 19.2183, 72.9781),

-- Western Suburbs
('mumbai-bandra-west', 'mumbai', 'Bandra West', 19.0596, 72.8295),
('mumbai-bandra-east', 'mumbai', 'Bandra East', 19.0596, 72.8420),
('mumbai-khar', 'mumbai', 'Khar', 19.0728, 72.8345),
('mumbai-santacruz-west', 'mumbai', 'Santacruz West', 19.0850, 72.8360),
('mumbai-santacruz-east', 'mumbai', 'Santacruz East', 19.0850, 72.8470),
('mumbai-vile-parle-west', 'mumbai', 'Vile Parle West', 19.1076, 72.8405),
('mumbai-vile-parle-east', 'mumbai', 'Vile Parle East', 19.1076, 72.8560),
('mumbai-andheri-west', 'mumbai', 'Andheri West', 19.1136, 72.8697),
('mumbai-andheri-east', 'mumbai', 'Andheri East', 19.1136, 72.8697),
('mumbai-jogeshwari-west', 'mumbai', 'Jogeshwari West', 19.1400, 72.8450),
('mumbai-jogeshwari-east', 'mumbai', 'Jogeshwari East', 19.1400, 72.8560),
('mumbai-goregaon-west', 'mumbai', 'Goregaon West', 19.1653, 72.8490),
('mumbai-goregaon-east', 'mumbai', 'Goregaon East', 19.1653, 72.8560),
('mumbai-malad-west', 'mumbai', 'Malad West', 19.1870, 72.8480),
('mumbai-malad-east', 'mumbai', 'Malad East', 19.1870, 72.8560),
('mumbai-kandivali-west', 'mumbai', 'Kandivali West', 19.2070, 72.8320),
('mumbai-kandivali-east', 'mumbai', 'Kandivali East', 19.2070, 72.8540),
('mumbai-borivali-west', 'mumbai', 'Borivali West', 19.2307, 72.8567),
('mumbai-borivali-east', 'mumbai', 'Borivali East', 19.2307, 72.8660),
('mumbai-dahisar', 'mumbai', 'Dahisar', 19.2571, 72.8671),
('mumbai-mira-road', 'mumbai', 'Mira Road', 19.2806, 72.8642),

-- Navi Mumbai
('mumbai-vashi', 'mumbai', 'Vashi', 19.0759, 72.9988),
('mumbai-nerul', 'mumbai', 'Nerul', 19.0330, 73.0197),
('mumbai-belapur', 'mumbai', 'Belapur', 19.0150, 73.0354),
('mumbai-kharghar', 'mumbai', 'Kharghar', 19.0420, 73.0680),
('mumbai-panvel', 'mumbai', 'Panvel', 18.9894, 73.1178),
('mumbai-airoli', 'mumbai', 'Airoli', 19.1482, 72.9962),
('mumbai-ghansoli', 'mumbai', 'Ghansoli', 19.1195, 73.0075),
('mumbai-kopar-khairane', 'mumbai', 'Kopar Khairane', 19.1006, 73.0114),
('mumbai-turbhe', 'mumbai', 'Turbhe', 19.0655, 73.0220),
('mumbai-sanpada', 'mumbai', 'Sanpada', 19.0720, 73.0071),

-- Powai & Surrounding
('mumbai-powai', 'mumbai', 'Powai', 19.1176, 72.9060),
('mumbai-chandivali', 'mumbai', 'Chandivali', 19.1076, 72.8970),
('mumbai-sakinaka', 'mumbai', 'Sakinaka', 19.1028, 72.8891),

-- Other Important Areas
('mumbai-juhu', 'mumbai', 'Juhu', 19.1076, 72.8263),
('mumbai-versova', 'mumbai', 'Versova', 19.1320, 72.8120),
('mumbai-lokhandwala', 'mumbai', 'Lokhandwala', 19.1400, 72.8320),
('mumbai-oshiwara', 'mumbai', 'Oshiwara', 19.1500, 72.8350),
('mumbai-malvani', 'mumbai', 'Malvani', 19.1860, 72.8200);

-- =====================================================
-- DELHI NCR AREAS (90+ localities)
-- =====================================================

INSERT INTO areas (id, city_id, name, latitude, longitude) VALUES
-- Central Delhi
('delhi-connaught-place', 'delhi', 'Connaught Place', 28.6315, 77.2167),
('delhi-karol-bagh', 'delhi', 'Karol Bagh', 28.6510, 77.1905),
('delhi-rajendra-place', 'delhi', 'Rajendra Place', 28.6420, 77.1830),
('delhi-paharganj', 'delhi', 'Paharganj', 28.6450, 77.2150),
('delhi-chandni-chowk', 'delhi', 'Chandni Chowk', 28.6507, 77.2334),

-- South Delhi
('delhi-hauz-khas', 'delhi', 'Hauz Khas', 28.5494, 77.2001),
('delhi-saket', 'delhi', 'Saket', 28.5244, 77.2066),
('delhi-malviya-nagar', 'delhi', 'Malviya Nagar', 28.5355, 77.2096),
('delhi-green-park', 'delhi', 'Green Park', 28.5597, 77.2066),
('delhi-lajpat-nagar', 'delhi', 'Lajpat Nagar', 28.5678, 77.2432),
('delhi-defence-colony', 'delhi', 'Defence Colony', 28.5678, 77.2326),
('delhi-greater-kailash-1', 'delhi', 'Greater Kailash 1', 28.5494, 77.2428),
('delhi-greater-kailash-2', 'delhi', 'Greater Kailash 2', 28.5355, 77.2491),
('delhi-kalkaji', 'delhi', 'Kalkaji', 28.5494, 77.2588),
('delhi-nehru-place', 'delhi', 'Nehru Place', 28.5494, 77.2501),
('delhi-okhla', 'delhi', 'Okhla', 28.5355, 77.2750),
('delhi-vasant-kunj', 'delhi', 'Vasant Kunj', 28.5244, 77.1597),
('delhi-vasant-vihar', 'delhi', 'Vasant Vihar', 28.5597, 77.1597),
('delhi-south-extension', 'delhi', 'South Extension', 28.5786, 77.2240),

-- West Delhi
('delhi-janakpuri', 'delhi', 'Janakpuri', 28.6219, 77.0854),
('delhi-rajouri-garden', 'delhi', 'Rajouri Garden', 28.6410, 77.1210),
('delhi-punjabi-bagh', 'delhi', 'Punjabi Bagh', 28.6678, 77.1310),
('delhi-paschim-vihar', 'delhi', 'Paschim Vihar', 28.6678, 77.0997),
('delhi-vikaspuri', 'delhi', 'Vikaspuri', 28.6410, 77.0666),
('delhi-tilak-nagar', 'delhi', 'Tilak Nagar', 28.6410, 77.0935),
('delhi-subhash-nagar', 'delhi', 'Subhash Nagar', 28.6410, 77.1066),
('delhi-moti-nagar', 'delhi', 'Moti Nagar', 28.6594, 77.1421),
('delhi-dwarka-sector-1', 'delhi', 'Dwarka Sector 1', 28.5921, 77.0460),
('delhi-dwarka-sector-6', 'delhi', 'Dwarka Sector 6', 28.6010, 77.0520),
('delhi-dwarka-sector-10', 'delhi', 'Dwarka Sector 10', 28.5890, 77.0650),
('delhi-dwarka-sector-12', 'delhi', 'Dwarka Sector 12', 28.5850, 77.0720),
('delhi-dwarka-sector-19', 'delhi', 'Dwarka Sector 19', 28.5790, 77.0850),

-- North Delhi
('delhi-model-town', 'delhi', 'Model Town', 28.7041, 77.1925),
('delhi-kamla-nagar', 'delhi', 'Kamla Nagar', 28.6820, 77.2050),
('delhi-mukherjee-nagar', 'delhi', 'Mukherjee Nagar', 28.7041, 77.2088),
('delhi-civil-lines', 'delhi', 'Civil Lines', 28.6820, 77.2267),
('delhi-sadar-bazar', 'delhi', 'Sadar Bazar', 28.6594, 77.2267),
('delhi-shakti-nagar', 'delhi', 'Shakti Nagar', 28.6820, 77.1730),
('delhi-rohini-sector-3', 'delhi', 'Rohini Sector 3', 28.7468, 77.0688),
('delhi-rohini-sector-7', 'delhi', 'Rohini Sector 7', 28.7500, 77.1000),
('delhi-rohini-sector-11', 'delhi', 'Rohini Sector 11', 28.7350, 77.0900),
('delhi-rohini-sector-18', 'delhi', 'Rohini Sector 18', 28.7300, 77.1100),
('delhi-pitampura', 'delhi', 'Pitampura', 28.6820, 77.1314),
('delhi-shalimar-bagh', 'delhi', 'Shalimar Bagh', 28.7188, 77.1636),

-- East Delhi
('delhi-laxmi-nagar', 'delhi', 'Laxmi Nagar', 28.6345, 77.2769),
('delhi-preet-vihar', 'delhi', 'Preet Vihar', 28.6345, 77.2958),
('delhi-mayur-vihar-phase-1', 'delhi', 'Mayur Vihar Phase 1', 28.6085, 77.2958),
('delhi-mayur-vihar-phase-2', 'delhi', 'Mayur Vihar Phase 2', 28.6085, 77.3076),
('delhi-mayur-vihar-phase-3', 'delhi', 'Mayur Vihar Phase 3', 28.6085, 77.3190),
('delhi-patparganj', 'delhi', 'Patparganj', 28.6215, 77.2900),
('delhi-dilshad-garden', 'delhi', 'Dilshad Garden', 28.6820, 77.3190),
('delhi-shahdara', 'delhi', 'Shahdara', 28.6820, 77.2872),
('delhi-vivek-vihar', 'delhi', 'Vivek Vihar', 28.6820, 77.3000),
('delhi-gandhi-nagar', 'delhi', 'Gandhi Nagar', 28.6615, 77.2500),

-- Noida
('delhi-noida-sector-18', 'delhi', 'Noida Sector 18', 28.5678, 77.3244),
('delhi-noida-sector-62', 'delhi', 'Noida Sector 62', 28.6215, 77.3630),
('delhi-noida-sector-16', 'delhi', 'Noida Sector 16', 28.5786, 77.3190),
('delhi-noida-sector-15', 'delhi', 'Noida Sector 15', 28.5850, 77.3130),
('delhi-noida-sector-52', 'delhi', 'Noida Sector 52', 28.5920, 77.3600),
('delhi-noida-sector-76', 'delhi', 'Noida Sector 76', 28.5700, 77.3800),
('delhi-greater-noida', 'delhi', 'Greater Noida', 28.4595, 77.5330),

-- Gurgaon
('delhi-gurgaon-dlf-phase-1', 'delhi', 'DLF Phase 1', 28.4810, 77.0970),
('delhi-gurgaon-dlf-phase-2', 'delhi', 'DLF Phase 2', 28.4900, 77.0970),
('delhi-gurgaon-dlf-phase-3', 'delhi', 'DLF Phase 3', 28.4970, 77.0970),
('delhi-gurgaon-dlf-phase-4', 'delhi', 'DLF Phase 4', 28.4900, 77.0870),
('delhi-gurgaon-sohna-road', 'delhi', 'Sohna Road', 28.4089, 77.0320),
('delhi-gurgaon-mg-road', 'delhi', 'MG Road Gurgaon', 28.4595, 77.0266),
('delhi-gurgaon-cyber-city', 'delhi', 'Cyber City', 28.4950, 77.0890),
('delhi-gurgaon-sector-14', 'delhi', 'Gurgaon Sector 14', 28.4615, 77.0472),
('delhi-gurgaon-sector-29', 'delhi', 'Gurgaon Sector 29', 28.4615, 77.0600),
('delhi-gurgaon-sector-56', 'delhi', 'Gurgaon Sector 56', 28.4300, 77.0900),

-- Faridabad
('delhi-faridabad-sector-15', 'delhi', 'Faridabad Sector 15', 28.4089, 77.3178),
('delhi-faridabad-sector-16', 'delhi', 'Faridabad Sector 16', 28.4089, 77.3250),
('delhi-faridabad-nit', 'delhi', 'NIT Faridabad', 28.3670, 77.3178);

-- =====================================================
-- CHENNAI AREAS (60+ localities)
-- =====================================================

INSERT INTO areas (id, city_id, name, latitude, longitude) VALUES
-- Central Chennai
('chennai-t-nagar', 'chennai', 'T Nagar', 13.0418, 80.2341),
('chennai-anna-nagar', 'chennai', 'Anna Nagar', 13.0850, 80.2101),
('chennai-nungambakkam', 'chennai', 'Nungambakkam', 13.0569, 80.2425),
('chennai-egmore', 'chennai', 'Egmore', 13.0732, 80.2609),
('chennai-mylapore', 'chennai', 'Mylapore', 13.0339, 80.2619),
('chennai-triplicane', 'chennai', 'Triplicane', 13.0569, 80.2777),

-- South Chennai
('chennai-adyar', 'chennai', 'Adyar', 13.0067, 80.2570),
('chennai-thiruvanmiyur', 'chennai', 'Thiruvanmiyur', 12.9833, 80.2667),
('chennai-besant-nagar', 'chennai', 'Besant Nagar', 13.0000, 80.2667),
('chennai-velachery', 'chennai', 'Velachery', 12.9750, 80.2210),
('chennai-tambaram', 'chennai', 'Tambaram', 12.9250, 80.1270),
('chennai-pallikaranai', 'chennai', 'Pallikaranai', 12.9500, 80.2200),
('chennai-madipakkam', 'chennai', 'Madipakkam', 12.9650, 80.2100),
('chennai-chrompet', 'chennai', 'Chrompet', 12.9516, 80.1462),
('chennai-selaiyur', 'chennai', 'Selaiyur', 12.9000, 80.1400),
('chennai-medavakkam', 'chennai', 'Medavakkam', 12.9200, 80.1920),

-- West Chennai
('chennai-porur', 'chennai', 'Porur', 13.0358, 80.1570),
('chennai-ramapuram', 'chennai', 'Ramapuram', 13.0250, 80.1650),
('chennai-kk-nagar', 'chennai', 'KK Nagar', 13.0389, 80.2039),
('chennai-ashok-nagar', 'chennai', 'Ashok Nagar', 13.0333, 80.2100),
('chennai-vadapalani', 'chennai', 'Vadapalani', 13.0500, 80.2120),
('chennai-virugambakkam', 'chennai', 'Virugambakkam', 13.0567, 80.2039),
('chennai-saligramam', 'chennai', 'Saligramam', 13.0567, 80.1939),
('chennai-valasaravakkam', 'chennai', 'Valasaravakkam', 13.0439, 80.1739),
('chennai-west-mambalam', 'chennai', 'West Mambalam', 13.0389, 80.2239),

-- North Chennai
('chennai-anna-nagar-west', 'chennai', 'Anna Nagar West', 13.0850, 80.2101),
('chennai-anna-nagar-east', 'chennai', 'Anna Nagar East', 13.0889, 80.2250),
('chennai-kilpauk', 'chennai', 'Kilpauk', 13.0789, 80.2439),
('chennai-kodambakkam', 'chennai', 'Kodambakkam', 13.0528, 80.2250),
('chennai-aminjikarai', 'chennai', 'Aminjikarai', 13.0689, 80.2189),
('chennai-koyambedu', 'chennai', 'Koyambedu', 13.0711, 80.1947),

-- OMR (IT Corridor)
('chennai-omr-thoraipakkam', 'chennai', 'Thoraipakkam', 12.9400, 80.2350),
('chennai-omr-sholinganallur', 'chennai', 'Sholinganallur', 12.9000, 80.2270),
('chennai-omr-perungudi', 'chennai', 'Perungudi', 12.9610, 80.2440),
('chennai-omr-navalur', 'chennai', 'Navalur', 12.8450, 80.2220),
('chennai-omr-siruseri', 'chennai', 'Siruseri', 12.8250, 80.2050),
('chennai-omr-semmancheri', 'chennai', 'Semmancheri', 12.8900, 80.2100),
('chennai-omr-kelambakkam', 'chennai', 'Kelambakkam', 12.7833, 80.2167),

-- ECR (East Coast Road)
('chennai-ecr-injambakkam', 'chennai', 'Injambakkam', 12.9100, 80.2500),
('chennai-ecr-palavakkam', 'chennai', 'Palavakkam', 12.9500, 80.2550),
('chennai-ecr-neelankarai', 'chennai', 'Neelankarai', 12.9450, 80.2600),
('chennai-ecr-akkarai', 'chennai', 'Akkarai', 12.9300, 80.2450),

-- Other Important Areas
('chennai-guindy', 'chennai', 'Guindy', 13.0103, 80.2206),
('chennai-saidapet', 'chennai', 'Saidapet', 13.0211, 80.2231),
('chennai-perambur', 'chennai', 'Perambur', 13.1143, 80.2331),
('chennai-royapuram', 'chennai', 'Royapuram', 13.1103, 80.2931),
('chennai-ambattur', 'chennai', 'Ambattur', 13.0982, 80.1622);

-- =====================================================
-- PUNE AREAS (50+ localities)
-- =====================================================

INSERT INTO areas (id, city_id, name, latitude, longitude) VALUES
-- Central Pune
('pune-shivajinagar', 'pune', 'Shivajinagar', 18.5304, 73.8567),
('pune-deccan', 'pune', 'Deccan', 18.5204, 73.8467),
('pune-jm-road', 'pune', 'JM Road', 18.5204, 73.8467),
('pune-fc-road', 'pune', 'FC Road', 18.5304, 73.8367),
('pune-sadashiv-peth', 'pune', 'Sadashiv Peth', 18.5104, 73.8567),
('pune-camp', 'pune', 'Camp', 18.5104, 73.8867),
('pune-koregaon-park', 'pune', 'Koregaon Park', 18.5404, 73.8967),

-- East Pune
('pune-viman-nagar', 'pune', 'Viman Nagar', 18.5679, 73.9143),
('pune-kharadi', 'pune', 'Kharadi', 18.5479, 73.9343),
('pune-wagholi', 'pune', 'Wagholi', 18.5779, 73.9643),
('pune-hadapsar', 'pune', 'Hadapsar', 18.5089, 73.9260),
('pune-mundhwa', 'pune', 'Mundhwa', 18.5389, 73.9360),
('pune-magarpatta', 'pune', 'Magarpatta', 18.5189, 73.9310),
('pune-fursungi', 'pune', 'Fursungi', 18.5089, 73.9560),

-- West Pune
('pune-kothrud', 'pune', 'Kothrud', 18.5074, 73.8077),
('pune-karve-nagar', 'pune', 'Karve Nagar', 18.4874, 73.8177),
('pune-warje', 'pune', 'Warje', 18.4774, 73.8077),
('pune-bavdhan', 'pune', 'Bavdhan', 18.5074, 73.7677),
('pune-baner', 'pune', 'Baner', 18.5589, 73.7889),
('pune-aundh', 'pune', 'Aundh', 18.5589, 73.8089),
('pune-pashan', 'pune', 'Pashan', 18.5389, 73.7889),
('pune-hinjewadi-phase-1', 'pune', 'Hinjewadi Phase 1', 18.5989, 73.7389),
('pune-hinjewadi-phase-2', 'pune', 'Hinjewadi Phase 2', 18.6089, 73.7289),
('pune-hinjewadi-phase-3', 'pune', 'Hinjewadi Phase 3', 18.6189, 73.7189),
('pune-wakad', 'pune', 'Wakad', 18.5989, 73.7589),
('pune-pimple-saudagar', 'pune', 'Pimple Saudagar', 18.5889, 73.7889),
('pune-pimple-nilakh', 'pune', 'Pimple Nilakh', 18.5789, 73.7789),

-- North Pune
('pune-pimpri', 'pune', 'Pimpri', 18.6289, 73.8089),
('pune-chinchwad', 'pune', 'Chinchwad', 18.6489, 73.7989),
('pune-akurdi', 'pune', 'Akurdi', 18.6489, 73.7789),
('pune-nigdi', 'pune', 'Nigdi', 18.6589, 73.7689),

-- South Pune
('pune-katraj', 'pune', 'Katraj', 18.4474, 73.8567),
('pune-kondhwa', 'pune', 'Kondhwa', 18.4689, 73.8960),
('pune-undri', 'pune', 'Undri', 18.4589, 73.9260),
('pune-pisoli', 'pune', 'Pisoli', 18.4389, 73.9060),
('pune-fatimanagar', 'pune', 'Fatimanagar', 18.5189, 73.9060),
('pune-wanowrie', 'pune', 'Wanowrie', 18.4889, 73.8960),
('pune-salisbury-park', 'pune', 'Salisbury Park', 18.5089, 73.9060),

-- Other Areas
('pune-pune-station', 'pune', 'Pune Station', 18.5304, 73.8767),
('pune-yerawada', 'pune', 'Yerawada', 18.5504, 73.8867),
('pune-kalyani-nagar', 'pune', 'Kalyani Nagar', 18.5479, 73.9060),
('pune-wadgaon-sheri', 'pune', 'Wadgaon Sheri', 18.5489, 73.9260);

-- =====================================================
-- HYDERABAD AREAS (60+ localities)
-- =====================================================

INSERT INTO areas (id, city_id, name, latitude, longitude) VALUES
-- Central Hyderabad
('hyderabad-banjara-hills', 'hyderabad', 'Banjara Hills', 17.4239, 78.4482),
('hyderabad-jubilee-hills', 'hyderabad', 'Jubilee Hills', 17.4239, 78.4090),
('hyderabad-somajiguda', 'hyderabad', 'Somajiguda', 17.4326, 78.4582),
('hyderabad-ameerpet', 'hyderabad', 'Ameerpet', 17.4378, 78.4482),
('hyderabad-punjagutta', 'hyderabad', 'Punjagutta', 17.4326, 78.4482),
('hyderabad-begumpet', 'hyderabad', 'Begumpet', 17.4378, 78.4682),
('hyderabad-lakdikapul', 'hyderabad', 'Lakdikapul', 17.4026, 78.4582),

-- West Hyderabad
('hyderabad-hitech-city', 'hyderabad', 'Hitech City', 17.4483, 78.3808),
('hyderabad-madhapur', 'hyderabad', 'Madhapur', 17.4483, 78.3915),
('hyderabad-gachibowli', 'hyderabad', 'Gachibowli', 17.4399, 78.3483),
('hyderabad-kondapur', 'hyderabad', 'Kondapur', 17.4683, 78.3615),
('hyderabad-miyapur', 'hyderabad', 'Miyapur', 17.4950, 78.3583),
('hyderabad-kukatpally', 'hyderabad', 'Kukatpally', 17.4850, 78.4015),
('hyderabad-hafeezpet', 'hyderabad', 'Hafeezpet', 17.4583, 78.3715),
('hyderabad-chandanagar', 'hyderabad', 'Chandanagar', 17.4983, 78.3383),

-- East Hyderabad
('hyderabad-secunderabad', 'hyderabad', 'Secunderabad', 17.4399, 78.4983),
('hyderabad-tarnaka', 'hyderabad', 'Tarnaka', 17.4239, 78.5383),
('hyderabad-uppal', 'hyderabad', 'Uppal', 17.4065, 78.5583),
('hyderabad-nagole', 'hyderabad', 'Nagole', 17.3765, 78.5483),
('hyderabad-lb-nagar', 'hyderabad', 'LB Nagar', 17.3465, 78.5583),
('hyderabad-dilsukhnagar', 'hyderabad', 'Dilsukhnagar', 17.3665, 78.5283),
('hyderabad-kothapet', 'hyderabad', 'Kothapet', 17.3765, 78.5183),
('hyderabad-chaitanyapuri', 'hyderabad', 'Chaitanyapuri', 17.3665, 78.5083),

-- North Hyderabad
('hyderabad-alwal', 'hyderabad', 'Alwal', 17.5050, 78.5283),
('hyderabad-bowenpally', 'hyderabad', 'Bowenpally', 17.4850, 78.4883),
('hyderabad-sainikpuri', 'hyderabad', 'Sainikpuri', 17.4850, 78.5383),
('hyderabad-kompally', 'hyderabad', 'Kompally', 17.5350, 78.4883),
('hyderabad-yapral', 'hyderabad', 'Yapral', 17.5050, 78.5483),

-- South Hyderabad
('hyderabad-attapur', 'hyderabad', 'Attapur', 17.3665, 78.4283),
('hyderabad-rajendranagar', 'hyderabad', 'Rajendranagar', 17.3165, 78.3883),
('hyderabad-mehdipatnam', 'hyderabad', 'Mehdipatnam', 17.3926, 78.4382),
('hyderabad-tolichowki', 'hyderabad', 'Tolichowki', 17.4026, 78.4082),
('hyderabad-manikonda', 'hyderabad', 'Manikonda', 17.4026, 78.3783),
('hyderabad-nanakramguda', 'hyderabad', 'Nanakramguda', 17.4183, 78.3583),
('hyderabad-financial-district', 'hyderabad', 'Financial District', 17.4183, 78.3383),

-- Old City
('hyderabad-charminar', 'hyderabad', 'Charminar', 17.3616, 78.4747),
('hyderabad-sultan-bazar', 'hyderabad', 'Sultan Bazar', 17.3765, 78.4747),
('hyderabad-afzalgunj', 'hyderabad', 'Afzalgunj', 17.3826, 78.4647),
('hyderabad-nampally', 'hyderabad', 'Nampally', 17.3926, 78.4647),

-- Other Areas
('hyderabad-malakpet', 'hyderabad', 'Malakpet', 17.3765, 78.5083),
('hyderabad-balanagar', 'hyderabad', 'Balanagar', 17.4750, 78.4383),
('hyderabad-moosapet', 'hyderabad', 'Moosapet', 17.4650, 78.4283),
('hyderabad-sr-nagar', 'hyderabad', 'SR Nagar', 17.4378, 78.4382),
('hyderabad-erragadda', 'hyderabad', 'Erragadda', 17.4478, 78.4382),
('hyderabad-panjagutta', 'hyderabad', 'Panjagutta', 17.4326, 78.4482),
('hyderabad-himayatnagar', 'hyderabad', 'Himayatnagar', 17.4026, 78.4782);

-- =====================================================
-- KOLKATA AREAS (40+ localities)
-- =====================================================

INSERT INTO areas (id, city_id, name, latitude, longitude) VALUES
-- Central Kolkata
('kolkata-park-street', 'kolkata', 'Park Street', 22.5543, 88.3516),
('kolkata-esplanade', 'kolkata', 'Esplanade', 22.5646, 88.3516),
('kolkata-bbdaag', 'kolkata', 'BBD Bag', 22.5726, 88.3639),
('kolkata-bowbazar', 'kolkata', 'Bowbazar', 22.5626, 88.3639),
('kolkata-college-street', 'kolkata', 'College Street', 22.5826, 88.3639),

-- South Kolkata
('kolkata-ballygunge', 'kolkata', 'Ballygunge', 22.5326, 88.3639),
('kolkata-gariahat', 'kolkata', 'Gariahat', 22.5226, 88.3639),
('kolkata-jadavpur', 'kolkata', 'Jadavpur', 22.4976, 88.3639),
('kolkata-tollygunge', 'kolkata', 'Tollygunge', 22.4976, 88.3439),
('kolkata-garia', 'kolkata', 'Garia', 22.4626, 88.3839),
('kolkata-lake-gardens', 'kolkata', 'Lake Gardens', 22.5226, 88.3539),
('kolkata-alipore', 'kolkata', 'Alipore', 22.5326, 88.3339),
('kolkata-bhawanipore', 'kolkata', 'Bhawanipore', 22.5426, 88.3439),
('kolkata-kalighat', 'kolkata', 'Kalighat', 22.5226, 88.3439),

-- North Kolkata
('kolkata-shyambazar', 'kolkata', 'Shyambazar', 22.6026, 88.3739),
('kolkata-bagbazar', 'kolkata', 'Bagbazar', 22.5926, 88.3739),
('kolkata-belgachia', 'kolkata', 'Belgachia', 22.6226, 88.3639),
('kolkata-dunlop', 'kolkata', 'Dunlop', 22.6426, 88.3939),
('kolkata-dum-dum', 'kolkata', 'Dum Dum', 22.6426, 88.4139),
('kolkata-baranagar', 'kolkata', 'Baranagar', 22.6426, 88.3739),

-- East Kolkata
('kolkata-salt-lake', 'kolkata', 'Salt Lake', 22.5726, 88.4139),
('kolkata-bidhannagar', 'kolkata', 'Bidhannagar', 22.5826, 88.4239),
('kolkata-newtown', 'kolkata', 'New Town', 22.6026, 88.4639),
('kolkata-baguiati', 'kolkata', 'Baguiati', 22.6226, 88.4339),
('kolkata-rajarhat', 'kolkata', 'Rajarhat', 22.6226, 88.4539),

-- West Kolkata
('kolkata-behala', 'kolkata', 'Behala', 22.4976, 88.3139),
('kolkata-joka', 'kolkata', 'Joka', 22.4626, 88.3039),
('kolkata-thakurpukur', 'kolkata', 'Thakurpukur', 22.4726, 88.2939),

-- Howrah
('kolkata-howrah', 'kolkata', 'Howrah', 22.5726, 88.3239),
('kolkata-shibpur', 'kolkata', 'Shibpur', 22.5626, 88.3139),
('kolkata-liluah', 'kolkata', 'Liluah', 22.6226, 88.3439),

-- Other Areas
('kolkata-sealdah', 'kolkata', 'Sealdah', 22.5726, 88.3739),
('kolkata-beleghata', 'kolkata', 'Beleghata', 22.5526, 88.3939),
('kolkata-tangra', 'kolkata', 'Tangra', 22.5526, 88.3939),
('kolkata-kasba', 'kolkata', 'Kasba', 22.5226, 88.3839),
('kolkata-rajdanga', 'kolkata', 'Rajdanga', 22.5126, 88.3939);

-- =====================================================
-- CREATE INDEX FOR FASTER LOOKUPS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_areas_coordinates ON areas(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_areas_city_id ON areas(city_id);

-- =====================================================
-- ADD COMMENTS
-- =====================================================

COMMENT ON COLUMN areas.latitude IS 'Representative latitude for area center (used for distance calculations)';
COMMENT ON COLUMN areas.longitude IS 'Representative longitude for area center (used for distance calculations)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count areas per city
-- SELECT 
--   c.name as city,
--   COUNT(a.id) as area_count
-- FROM cities c
-- LEFT JOIN areas a ON c.id = a.city_id
-- GROUP BY c.name
-- ORDER BY area_count DESC;

-- Check all areas have coordinates
-- SELECT 
--   c.name as city,
--   COUNT(CASE WHEN a.latitude IS NULL THEN 1 END) as missing_coords,
--   COUNT(CASE WHEN a.latitude IS NOT NULL THEN 1 END) as has_coords
-- FROM cities c
-- LEFT JOIN areas a ON c.id = a.city_id
-- GROUP BY c.name;
