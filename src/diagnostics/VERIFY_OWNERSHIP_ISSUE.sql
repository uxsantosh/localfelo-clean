-- =====================================================
-- TEST: Are all 3 listings from the same owner?
-- =====================================================

-- Check if all listings belong to same owner
SELECT 
    owner_token,
    owner_name,
    COUNT(*) as count
FROM listings
WHERE is_active = true
GROUP BY owner_token, owner_name;

-- If result shows only 1 row, all listings are from same user
-- This explains why the marketplace is empty for that user!

-- The marketplace filters out your own listings with this query:
-- SELECT * FROM listings 
-- WHERE is_active = true 
-- AND owner_token != 'current_user_id';

-- SOLUTION OPTIONS:
-- 1. Create listings from different test accounts
-- 2. Temporarily disable the owner filter for testing
-- 3. View marketplace while logged out
