-- Fix listing_images table structure
-- CORRECTED VERSION - PostgreSQL compatible

-- Create listing_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);

-- Enable Row Level Security
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Anyone can view listing images" ON listing_images;
DROP POLICY IF EXISTS "Users can insert images for own listings" ON listing_images;
DROP POLICY IF EXISTS "Users can delete images for own listings" ON listing_images;

-- Policy: Anyone can read listing images
CREATE POLICY "Anyone can view listing images"
  ON listing_images FOR SELECT
  USING (true);

-- Policy: Users can insert images
CREATE POLICY "Users can insert images for own listings"
  ON listing_images FOR INSERT
  WITH CHECK (true);

-- Policy: Users can delete images
CREATE POLICY "Users can delete images for own listings"
  ON listing_images FOR DELETE
  USING (true);
