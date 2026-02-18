-- =====================================================
-- SIMPLE FIX: Show all listings (including your own) in marketplace
-- This is for TESTING ONLY
-- =====================================================

-- TO SEE YOUR OWN LISTINGS IN MARKETPLACE:
-- Option 1: LOG OUT (become a guest) - guests see ALL listings
-- Option 2: Open browser in Incognito/Private mode - you'll be a guest
-- Option 3: Create a second test account and create listings there

-- TO VERIFY THE ISSUE:
-- Run this query to check if all listings belong to you:

SELECT 
    COUNT(*) as total_listings,
    COUNT(DISTINCT owner_token) as unique_owners,
    owner_name,
    owner_token
FROM listings
WHERE is_active = true
GROUP BY owner_name, owner_token;

-- If unique_owners = 1 and it's YOUR profile ID:
-- ↓ You're seeing NOTHING because all listings are yours!

-- TEMPORARY WORKAROUND:
-- Comment out the owner filter in /services/listings.js
-- Find line ~217-223 and comment it out:

/*
if (currentUser?.id) {
  query = query.neq('owner_token', currentUser.id);
  console.log('🔍 [Service] Filtering out current user\'s own listings:', currentUser.id);
}
*/

-- But this breaks the correct UX (users shouldn't see their own listings in feed)
-- BEST SOLUTION: Create listings from multiple test accounts
