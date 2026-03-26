-- =====================================================
-- ACCURATE LOCATION COORDINATES UPDATE
-- =====================================================
-- This migration adds latitude and longitude columns to areas table
-- and populates them with accurate, pre-researched coordinates
-- for all major Indian city areas
-- =====================================================

-- Step 1: Add latitude and longitude columns to areas table
ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Step 2: Create index for faster coordinate lookups
CREATE INDEX IF NOT EXISTS idx_areas_coordinates ON areas(latitude, longitude);

-- =====================================================
-- BANGALORE AREAS - Accurate Coordinates
-- =====================================================

-- Indiranagar (12.9784, 77.6408)
UPDATE areas SET latitude = 12.9784, longitude = 77.6408 WHERE id = '3-1';

-- Koramangala (12.9352, 77.6245) - Central Koramangala
UPDATE areas SET latitude = 12.9352, longitude = 77.6245 WHERE id = '3-2';

-- Whitefield (12.9698, 77.7499)
UPDATE areas SET latitude = 12.9698, longitude = 77.7499 WHERE id = '3-3';

-- Jayanagar (12.9250, 77.5900)
UPDATE areas SET latitude = 12.9250, longitude = 77.5900 WHERE id = '3-4';

-- Electronic City (12.8456, 77.6603)
UPDATE areas SET latitude = 12.8456, longitude = 77.6603 WHERE id = '3-5';

-- HSR Layout (12.9116, 77.6388)
UPDATE areas SET latitude = 12.9116, longitude = 77.6388 WHERE id = '3-6';

-- =====================================================
-- MUMBAI AREAS - Accurate Coordinates
-- =====================================================

-- Andheri (19.1136, 72.8697)
UPDATE areas SET latitude = 19.1136, longitude = 72.8697 WHERE id = '1-1';

-- Bandra (19.0596, 72.8295)
UPDATE areas SET latitude = 19.0596, longitude = 72.8295 WHERE id = '1-2';

-- Borivali (19.2307, 72.8567)
UPDATE areas SET latitude = 19.2307, longitude = 72.8567 WHERE id = '1-3';

-- Dadar (19.0178, 72.8478)
UPDATE areas SET latitude = 19.0178, longitude = 72.8478 WHERE id = '1-4';

-- Goregaon (19.1653, 72.8490)
UPDATE areas SET latitude = 19.1653, longitude = 72.8490 WHERE id = '1-5';

-- Malad (19.1870, 72.8480)
UPDATE areas SET latitude = 19.1870, longitude = 72.8480 WHERE id = '1-6';

-- Powai (19.1176, 72.9060)
UPDATE areas SET latitude = 19.1176, longitude = 72.9060 WHERE id = '1-7';

-- Thane (19.2183, 72.9781)
UPDATE areas SET latitude = 19.2183, longitude = 72.9781 WHERE id = '1-8';

-- =====================================================
-- DELHI AREAS - Accurate Coordinates
-- =====================================================

-- Connaught Place (28.6315, 77.2167)
UPDATE areas SET latitude = 28.6315, longitude = 77.2167 WHERE id = '2-1';

-- Dwarka (28.5921, 77.0460)
UPDATE areas SET latitude = 28.5921, longitude = 77.0460 WHERE id = '2-2';

-- Lajpat Nagar (28.5678, 77.2432)
UPDATE areas SET latitude = 28.5678, longitude = 77.2432 WHERE id = '2-3';

-- Nehru Place (28.5494, 77.2500)
UPDATE areas SET latitude = 28.5494, longitude = 77.2500 WHERE id = '2-4';

-- Rohini (28.7468, 77.0688)
UPDATE areas SET latitude = 28.7468, longitude = 77.0688 WHERE id = '2-5';

-- Saket (28.5244, 77.2066)
UPDATE areas SET latitude = 28.5244, longitude = 77.2066 WHERE id = '2-6';

-- =====================================================
-- HYDERABAD AREAS - Accurate Coordinates
-- =====================================================

-- Banjara Hills (17.4239, 78.4482)
UPDATE areas SET latitude = 17.4239, longitude = 78.4482 WHERE id = '4-1';

-- Gachibowli (17.4399, 78.3483)
UPDATE areas SET latitude = 17.4399, longitude = 78.3483 WHERE id = '4-2';

-- Hitech City (17.4483, 78.3808)
UPDATE areas SET latitude = 17.4483, longitude = 78.3808 WHERE id = '4-3';

-- Jubilee Hills (17.4239, 78.4090)
UPDATE areas SET latitude = 17.4239, longitude = 78.4090 WHERE id = '4-4';

-- Madhapur (17.4483, 78.3915)
UPDATE areas SET latitude = 17.4483, longitude = 78.3915 WHERE id = '4-5';

-- =====================================================
-- PUNE AREAS - Accurate Coordinates
-- =====================================================

-- Hinjewadi (18.5989, 73.7389)
UPDATE areas SET latitude = 18.5989, longitude = 73.7389 WHERE id = '5-1';

-- Kothrud (18.5074, 73.8077)
UPDATE areas SET latitude = 18.5074, longitude = 73.8077 WHERE id = '5-2';

-- Wakad (18.5989, 73.7589)
UPDATE areas SET latitude = 18.5989, longitude = 73.7589 WHERE id = '5-3';

-- Viman Nagar (18.5679, 73.9143)
UPDATE areas SET latitude = 18.5679, longitude = 73.9143 WHERE id = '5-4';

-- Pimpri-Chinchwad (18.6298, 73.7997)
UPDATE areas SET latitude = 18.6298, longitude = 73.7997 WHERE id = '5-5';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify all areas have coordinates:
-- SELECT id, city_id, name, latitude, longitude FROM areas ORDER BY city_id, name;
