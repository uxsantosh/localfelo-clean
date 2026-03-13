-- Migration: Add Helper Ready Mode columns to profiles table
-- Date: 2025-01-03
-- Description: Adds columns to track user availability as a helper for tasks

-- Add helper availability columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS helper_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS helper_available_since TIMESTAMP WITH TIME ZONE;

-- Add index for efficient querying of available helpers
CREATE INDEX IF NOT EXISTS idx_profiles_helper_available 
ON profiles(helper_available) 
WHERE helper_available = TRUE;

-- Add helpful comments
COMMENT ON COLUMN profiles.helper_available IS 'Whether user is currently available as a helper for tasks';
COMMENT ON COLUMN profiles.helper_available_since IS 'Timestamp when helper mode was last activated';

-- Verify columns were added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'helper_available'
  ) THEN
    RAISE NOTICE '✅ helper_available column added successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to add helper_available column';
  END IF;
  
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'helper_available_since'
  ) THEN
    RAISE NOTICE '✅ helper_available_since column added successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to add helper_available_since column';
  END IF;
END $$;
