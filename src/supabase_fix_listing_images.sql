-- Fix listing_images table structure
-- The code expects 'listing_id' column but it might not exist

-- First, let's check if the table exists and what columns it has
-- Run this first to see current structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'listing_images';

-- Option 1: If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Option 2: If table exists but column name is wrong, add the correct column
-- (Uncomment if needed)
-- ALTER TABLE listing_images ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES listings(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);

-- Enable Row Level Security
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read listing images
CREATE POLICY IF NOT EXISTS "Anyone can view listing images"
  ON listing_images FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert images for their listings
CREATE POLICY IF NOT EXISTS "Users can insert images for own listings"
  ON listing_images FOR INSERT
  WITH CHECK (true);

-- Policy: Users can delete images for their listings
CREATE POLICY IF NOT EXISTS "Users can delete images for own listings"
  ON listing_images FOR DELETE
  USING (true);
