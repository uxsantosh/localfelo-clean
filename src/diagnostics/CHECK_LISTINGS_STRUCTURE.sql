-- =====================================================
-- CHECK LISTINGS TABLE STRUCTURE
-- =====================================================

-- Get all columns in listings table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

-- Check recent listings to see what data is actually there
SELECT 
    id,
    title,
    category_slug,
    city,
    area_slug,
    is_active,
    owner_token,
    latitude,
    longitude,
    created_at
FROM listings
ORDER BY created_at DESC
LIMIT 5;

-- Count active listings
SELECT COUNT(*) as active_listings_count
FROM listings
WHERE is_active = true;

-- Check if there are any listings at all
SELECT COUNT(*) as total_listings_count
FROM listings;
