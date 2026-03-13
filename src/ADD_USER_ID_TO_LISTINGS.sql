-- =====================================================
-- Add user_id column to listings table for consistency
-- =====================================================
-- This allows getMyListings to use user_id like getUserTasks and getUserWishes

-- Add user_id column (references profiles.id)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Migrate existing data: Set user_id = owner_token for all existing listings
UPDATE listings 
SET user_id = owner_token 
WHERE user_id IS NULL AND owner_token IS NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);

-- Verify the changes
SELECT 
  'listings' as table_name,
  COUNT(*) as total_listings,
  COUNT(user_id) as with_user_id,
  COUNT(owner_token) as with_owner_token
FROM listings;
