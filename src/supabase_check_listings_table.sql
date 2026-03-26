-- Check and fix listings table structure
-- Run this to see what columns exist first:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'listings';

-- Make sure all required columns exist
ALTER TABLE listings ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_token TEXT NOT NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS title TEXT NOT NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS category_slug TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS area_slug TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE listings ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS exact_location TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_owner_token ON listings(owner_token);
CREATE INDEX IF NOT EXISTS idx_listings_category_slug ON listings(category_slug);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

-- Policy: Anyone can view active listings
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  USING (is_active = true OR is_active IS NULL);

-- Policy: Anyone can insert listings (we verify ownership via owner_token)
CREATE POLICY "Users can insert their own listings"
  ON listings FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update listings (we verify ownership in the application layer)
CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  USING (true);

-- Policy: Anyone can delete listings (we verify ownership in the application layer)
CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  USING (true);

-- Note: We use permissive RLS policies because ownership is verified in the application
-- layer using owner_token matching. This is a soft-auth pattern.
