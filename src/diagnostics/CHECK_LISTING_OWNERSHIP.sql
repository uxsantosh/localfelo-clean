-- =====================================================
-- CHECK WHO OWNS THE 3 LISTINGS
-- =====================================================

-- Step 1: Check all listings with owner info
SELECT 
    id,
    title,
    owner_token,
    owner_name,
    is_active,
    created_at
FROM listings
ORDER BY created_at DESC;

-- Step 2: Count listings by owner
SELECT 
    owner_token,
    owner_name,
    COUNT(*) as listing_count
FROM listings
WHERE is_active = true
GROUP BY owner_token, owner_name
ORDER BY listing_count DESC;

-- Step 3: Check how many unique owners exist
SELECT 
    COUNT(DISTINCT owner_token) as unique_owners,
    COUNT(*) as total_listings
FROM listings
WHERE is_active = true;
