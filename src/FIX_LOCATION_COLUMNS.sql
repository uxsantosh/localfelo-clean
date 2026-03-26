-- =====================================================
-- FIX: Add Location Columns to Profiles Table
-- =====================================================
-- This adds the missing location columns needed by useLocation hook

-- Add location columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add city column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'city'
    ) THEN
        ALTER TABLE profiles ADD COLUMN city TEXT;
    END IF;

    -- Add area column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'area'
    ) THEN
        ALTER TABLE profiles ADD COLUMN area TEXT;
    END IF;

    -- Add street column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'street'
    ) THEN
        ALTER TABLE profiles ADD COLUMN street TEXT;
    END IF;

    -- Add latitude column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE profiles ADD COLUMN latitude NUMERIC;
    END IF;

    -- Add longitude column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE profiles ADD COLUMN longitude NUMERIC;
    END IF;

    -- Add location_updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'location_updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN location_updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_area ON profiles(area);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);

-- ✅ Done! Location columns added to profiles table
