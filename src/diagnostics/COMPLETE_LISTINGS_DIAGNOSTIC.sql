-- =====================================================
-- COMPLETE DIAGNOSTIC: Find Why Listings Not Showing
-- =====================================================

-- Step 1: Check what columns exist in listings table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- Step 2: Check if any listings exist
SELECT COUNT(*) as total_listings FROM listings;

-- Step 3: Check active vs inactive listings
SELECT 
    is_active,
    COUNT(*) as count
FROM listings
GROUP BY is_active;

-- Step 4: Check recent listings (last 10)
SELECT 
    id,
    title,
    category_slug,
    city,
    area_slug,
    is_active,
    owner_token,
    created_at
FROM listings
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Check if there are any NULL values in critical fields
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN category_slug IS NULL THEN 1 END) as null_category,
    COUNT(CASE WHEN city IS NULL THEN 1 END) as null_city,
    COUNT(CASE WHEN latitude IS NULL THEN 1 END) as null_latitude,
    COUNT(CASE WHEN longitude IS NULL THEN 1 END) as null_longitude
FROM listings
WHERE is_active = true;

-- Step 6: Try creating a test listing manually (see if this works)
-- INSERT INTO listings (
--   owner_token, owner_name, owner_phone,
--   title, description, price,
--   category_slug, city, area_slug,
--   latitude, longitude,
--   is_active
-- ) VALUES (
--   (SELECT id FROM profiles LIMIT 1),
--   'Test User',
--   '9999999999',
--   'Test Listing',
--   'This is a test listing',
--   1000,
--   'electronics',
--   'Mumbai',
--   'Andheri',
--   19.1136,
--   72.8697,
--   true
-- );
