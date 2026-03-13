-- Migration: Add Helper Ready Mode columns to profiles table
-- Description: Adds helper availability tracking to enable users to become helpers

-- Add helper_available column (boolean, default false)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS helper_available BOOLEAN DEFAULT false;

-- Add helper_available_since column (timestamp, nullable)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS helper_available_since TIMESTAMPTZ DEFAULT NULL;

-- Create index on helper_available for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_helper_available 
ON profiles(helper_available) 
WHERE helper_available = true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.helper_available IS 'Whether the user is currently available as a helper';
COMMENT ON COLUMN profiles.helper_available_since IS 'Timestamp when user became available as helper';
