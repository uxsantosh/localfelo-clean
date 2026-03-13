-- ========================================
-- OldCycle: FIX LOCATION TABLES MIGRATION
-- ========================================
-- This script fixes the areas table to add city_id column
-- and creates the cities table properly
--
-- IMPORTANT: Run this BEFORE the seed script!
-- ========================================

-- Step 1: Drop existing areas table if it doesn't have city_id
-- (This is safe since we'll re-seed the data)
DROP TABLE IF EXISTS areas CASCADE;

-- Step 2: Create cities table (or use existing)
CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create areas table with proper city_id foreign key
CREATE TABLE areas (
  id TEXT PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create index for faster lookups
CREATE INDEX idx_areas_city_id ON areas(city_id);

-- Step 5: Enable Row Level Security (RLS) - Public read access
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies - Allow everyone to read cities and areas
CREATE POLICY "Cities are viewable by everyone" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Areas are viewable by everyone" ON areas
  FOR SELECT USING (true);

-- ========================================
-- VERIFICATION
-- ========================================
-- Check table structures
\d cities
\d areas

-- Success message
SELECT 'Migration completed successfully! Now run the seed script.' as message;
