-- Add location fields to profiles table for global location system
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS area TEXT,
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_area ON profiles(area);

COMMENT ON COLUMN profiles.city IS 'User current city (e.g., "Mumbai", "Delhi")';
COMMENT ON COLUMN profiles.area IS 'User current area/locality (e.g., "Andheri West", "Connaught Place")';
COMMENT ON COLUMN profiles.street IS 'Optional street/landmark detail';
COMMENT ON COLUMN profiles.latitude IS 'GPS latitude coordinate (stored but not publicly shown)';
COMMENT ON COLUMN profiles.longitude IS 'GPS longitude coordinate (stored but not publicly shown)';
COMMENT ON COLUMN profiles.location_updated_at IS 'Last time location was updated';
