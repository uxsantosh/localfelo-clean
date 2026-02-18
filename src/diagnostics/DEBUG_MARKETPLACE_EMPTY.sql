-- =====================================================
-- DEBUG: Check listing ownership and current user mismatch
-- =====================================================

-- Step 1: Check all listings with their owners
SELECT 
    id,
    title,
    owner_token,
    owner_name,
    is_active,
    created_at
FROM listings
WHERE is_active = true
ORDER BY created_at DESC;

-- Step 2: Check current user's profile
-- You need to replace 'YOUR_CLIENT_TOKEN' with the actual client_token from localStorage
-- Run this in browser console: localStorage.getItem('oldcycle_token')
SELECT 
    id,
    name,
    client_token
FROM profiles
WHERE client_token = 'YOUR_CLIENT_TOKEN_HERE';

-- Step 3: Compare - If listing.owner_token matches profile.id, those listings will be filtered out
-- SOLUTION: To see listings in marketplace while logged in:
--   Option 1: Log out (become a guest)
--   Option 2: Create listings from different accounts  
--   Option 3: Test with another user's credentials

-- Step 4: Count how many unique owners exist
SELECT 
    COUNT(DISTINCT owner_token) as unique_owners,
    COUNT(*) as total_listings
FROM listings
WHERE is_active = true;

-- If unique_owners = 1, all listings belong to same user
-- When that user logs in, they see NOTHING (all filtered out)
