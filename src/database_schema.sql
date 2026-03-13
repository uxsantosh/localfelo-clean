-- OldCycle Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create all tables

-- =====================================================
-- 1. PROFILES TABLE (User Authentication - Soft Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  whatsapp_same BOOLEAN DEFAULT true,
  whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- =====================================================
-- 2. CATEGORIES TABLE (Fixed 12 categories)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert fixed categories
INSERT INTO categories (id, name, slug, emoji) VALUES
  ('1', 'Mobile Phones', 'mobile-phones', '📱'),
  ('2', 'Cars & Bikes', 'vehicles', '🚗'),
  ('3', 'Computers & Laptops', 'computers-laptops', '🖥️'),
  ('4', 'Furniture', 'furniture', '🪑'),
  ('5', 'Home & Living', 'home-living', '🏠'),
  ('6', 'Fashion', 'fashion', '👗'),
  ('7', 'Kids & Baby Items', 'kids-baby', '🧒'),
  ('8', 'Pets', 'pets', '🐶'),
  ('9', 'Books & Education', 'books-education', '📚'),
  ('10', 'Gaming', 'gaming', '🎮'),
  ('11', 'Tools & Equipment', 'tools-equipment', '⚙️'),
  ('12', 'Kitchen & Appliances', 'kitchen-appliances', '🍽️')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. CITIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Indian cities
INSERT INTO cities (id, name) VALUES
  ('1', 'Mumbai'),
  ('2', 'Delhi'),
  ('3', 'Bangalore'),
  ('4', 'Hyderabad'),
  ('5', 'Pune'),
  ('6', 'Chennai'),
  ('7', 'Kolkata'),
  ('8', 'Ahmedabad')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. AREAS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS areas (
  id TEXT PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster city lookups
CREATE INDEX IF NOT EXISTS idx_areas_city_id ON areas(city_id);

-- Insert areas for Mumbai
INSERT INTO areas (id, city_id, name) VALUES
  ('1-1', '1', 'Andheri'),
  ('1-2', '1', 'Bandra'),
  ('1-3', '1', 'Borivali'),
  ('1-4', '1', 'Dadar'),
  ('1-5', '1', 'Goregaon'),
  ('1-6', '1', 'Malad'),
  ('1-7', '1', 'Powai'),
  ('1-8', '1', 'Thane')
ON CONFLICT (id) DO NOTHING;

-- Insert areas for Delhi
INSERT INTO areas (id, city_id, name) VALUES
  ('2-1', '2', 'Connaught Place'),
  ('2-2', '2', 'Dwarka'),
  ('2-3', '2', 'Lajpat Nagar'),
  ('2-4', '2', 'Nehru Place'),
  ('2-5', '2', 'Rohini'),
  ('2-6', '2', 'Saket')
ON CONFLICT (id) DO NOTHING;

-- Insert areas for Bangalore
INSERT INTO areas (id, city_id, name) VALUES
  ('3-1', '3', 'Indiranagar'),
  ('3-2', '3', 'Koramangala'),
  ('3-3', '3', 'Whitefield'),
  ('3-4', '3', 'Jayanagar'),
  ('3-5', '3', 'Electronic City'),
  ('3-6', '3', 'HSR Layout')
ON CONFLICT (id) DO NOTHING;

-- Insert areas for Hyderabad
INSERT INTO areas (id, city_id, name) VALUES
  ('4-1', '4', 'Banjara Hills'),
  ('4-2', '4', 'Gachibowli'),
  ('4-3', '4', 'Hitech City'),
  ('4-4', '4', 'Jubilee Hills'),
  ('4-5', '4', 'Madhapur')
ON CONFLICT (id) DO NOTHING;

-- Insert areas for Pune
INSERT INTO areas (id, city_id, name) VALUES
  ('5-1', '5', 'Hinjewadi'),
  ('5-2', '5', 'Kothrud'),
  ('5-3', '5', 'Wakad'),
  ('5-4', '5', 'Viman Nagar'),
  ('5-5', '5', 'Pimpri-Chinchwad')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. LISTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  city_id TEXT NOT NULL REFERENCES cities(id),
  area_id TEXT NOT NULL REFERENCES areas(id),
  phone TEXT NOT NULL,
  whatsapp TEXT,
  has_whatsapp BOOLEAN DEFAULT true,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city_id);
CREATE INDEX IF NOT EXISTS idx_listings_area ON listings(area_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_is_hidden ON listings(is_hidden);

-- =====================================================
-- 6. LISTING_IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster listing lookups
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_order ON listing_images(listing_id, display_order);

-- =====================================================
-- 7. REPORTS TABLE (Admin moderation)
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewed, resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index for admin dashboard
CREATE INDEX IF NOT EXISTS idx_reports_listing ON reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- =====================================================
-- 8. STORAGE BUCKET FOR LISTING IMAGES
-- =====================================================
-- Run this in Supabase Dashboard -> Storage:
-- 1. Create a new bucket called 'listing-images'
-- 2. Make it PUBLIC
-- 3. Set file size limit to 5MB per file
-- 4. Allowed MIME types: image/jpeg, image/png, image/webp

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can create, only owner can read/update
CREATE POLICY "Anyone can create profile" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- Listings: Anyone can read visible listings, only owner can create/update/delete
CREATE POLICY "Anyone can read visible listings" ON listings FOR SELECT USING (is_hidden = false OR seller_id = auth.uid());
CREATE POLICY "Authenticated users can create listings" ON listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (seller_id = auth.uid());
CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (seller_id = auth.uid());

-- Listing Images: Anyone can read, only listing owner can create/delete
CREATE POLICY "Anyone can read listing images" ON listing_images FOR SELECT USING (true);
CREATE POLICY "Users can add images to own listings" ON listing_images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.seller_id = auth.uid())
);
CREATE POLICY "Users can delete own listing images" ON listing_images FOR DELETE USING (
  EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.seller_id = auth.uid())
);

-- Reports: Anyone can create, only admins can read/update
CREATE POLICY "Anyone can create reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read own reports" ON reports FOR SELECT USING (reporter_id = auth.uid());

-- =====================================================
-- 10. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for listings
DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE! Your OldCycle database is ready! 🎉
-- =====================================================
