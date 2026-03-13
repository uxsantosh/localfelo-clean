-- OldCycle Admin Panel Database Setup
-- Run this SQL in your Supabase SQL Editor to prepare the database for the Admin Panel

-- 1. Add is_active column to profiles table (for user activation/deactivation)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Add is_hidden column to listings table (for hiding/showing listings)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- 3. Add admin_notes column to listings table (for admin comments)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 4. Set all existing users to active
UPDATE profiles
SET is_active = true
WHERE is_active IS NULL;

-- 5. Set all existing listings to visible
UPDATE listings
SET is_hidden = false
WHERE is_hidden IS NULL;

-- 6. Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_listings_is_hidden ON listings(is_hidden);
CREATE INDEX IF NOT EXISTS idx_listings_owner_token ON listings(owner_token);

-- 7. Verify the setup
SELECT 
  'profiles' as table_name,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_active = true) as active_users,
  COUNT(*) FILTER (WHERE is_admin = true) as admin_users
FROM profiles;

SELECT 
  'listings' as table_name,
  COUNT(*) as total_listings,
  COUNT(*) FILTER (WHERE is_hidden = true) as hidden_listings,
  COUNT(*) FILTER (WHERE is_hidden = false) as visible_listings
FROM listings;

-- Success message
SELECT '✅ Admin Panel database setup complete!' as status;
