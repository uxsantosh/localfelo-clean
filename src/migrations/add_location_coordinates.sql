-- =====================================================
-- Add Location Coordinates & Address to All Tables
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add latitude, longitude, and address to listings table
ALTER TABLE listings 
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Add latitude, longitude, and address to wishes table
ALTER TABLE wishes 
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Add latitude, longitude, and address to tasks table
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Create indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wishes_location ON wishes(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks(latitude, longitude) WHERE latitude IS NOT NULL;

-- Note: existing city_id and area_id are kept for backward compatibility
-- New listings should populate both old fields (city_id, area_id) and new fields (latitude, longitude, address)
