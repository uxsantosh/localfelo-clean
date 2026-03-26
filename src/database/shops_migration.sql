-- =====================================================
-- SHOPS MODULE - DATABASE MIGRATION
-- =====================================================
-- Complete database setup for LocalFelo Shops module

-- =====================================================
-- 1. SHOPS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  logo_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  whatsapp_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. SHOP CATEGORIES TABLE (Many-to-Many)
-- =====================================================

CREATE TABLE IF NOT EXISTS shop_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  subcategory_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id, category_id, subcategory_id)
);

-- =====================================================
-- 3. SHOP PRODUCTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Shops indexes
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_is_active ON shops(is_active);
CREATE INDEX IF NOT EXISTS idx_shops_created_at ON shops(created_at DESC);

-- Location-based search (PostGIS extension required for better performance)
-- If you have PostGIS enabled, you can use spatial indexes
-- CREATE INDEX IF NOT EXISTS idx_shops_location ON shops USING gist(ll_to_earth(latitude, longitude));

-- Alternative: Simple lat/lng indexes for basic distance queries
CREATE INDEX IF NOT EXISTS idx_shops_latitude ON shops(latitude);
CREATE INDEX IF NOT EXISTS idx_shops_longitude ON shops(longitude);

-- Shop categories indexes
CREATE INDEX IF NOT EXISTS idx_shop_categories_shop_id ON shop_categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_categories_category_id ON shop_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_categories_subcategory_id ON shop_categories(subcategory_id);

-- Shop products indexes
CREATE INDEX IF NOT EXISTS idx_shop_products_shop_id ON shop_products(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_is_active ON shop_products(is_active);
CREATE INDEX IF NOT EXISTS idx_shop_products_created_at ON shop_products(created_at DESC);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SHOPS TABLE POLICIES
-- =====================================================

-- Public can view active shops
CREATE POLICY "Public can view active shops"
  ON shops FOR SELECT
  USING (is_active = true);

-- Authenticated users can create shops
CREATE POLICY "Users can create shops"
  ON shops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own shops
CREATE POLICY "Users can update own shops"
  ON shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can soft-delete their own shops (set is_active = false)
CREATE POLICY "Users can deactivate own shops"
  ON shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SHOP CATEGORIES TABLE POLICIES
-- =====================================================

-- Public can view categories of active shops
CREATE POLICY "Public can view shop categories"
  ON shop_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_categories.shop_id 
      AND shops.is_active = true
    )
  );

-- Shop owners can manage their shop categories
CREATE POLICY "Shop owners can insert categories"
  ON shop_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_categories.shop_id 
      AND shops.user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can update categories"
  ON shop_categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_categories.shop_id 
      AND shops.user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can delete categories"
  ON shop_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_categories.shop_id 
      AND shops.user_id = auth.uid()
    )
  );

-- =====================================================
-- SHOP PRODUCTS TABLE POLICIES
-- =====================================================

-- Public can view active products of active shops
CREATE POLICY "Public can view active products"
  ON shop_products FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_products.shop_id 
      AND shops.is_active = true
    )
  );

-- Shop owners can manage their products
CREATE POLICY "Shop owners can insert products"
  ON shop_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_products.shop_id 
      AND shops.user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can update products"
  ON shop_products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_products.shop_id 
      AND shops.user_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can delete products"
  ON shop_products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_products.shop_id 
      AND shops.user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. CUSTOM TOKEN AUTHENTICATION (LocalFelo Style)
-- =====================================================

-- For x-client-token based auth, modify policies if needed
-- Example: If using custom header instead of auth.uid()

-- Drop existing policies if switching to custom token auth
-- DROP POLICY IF EXISTS "Users can create shops" ON shops;

-- Create new policy for custom token auth
-- CREATE POLICY "Users can create shops (custom token)"
--   ON shops FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     current_setting('request.jwt.claims', true)::json->>'sub' = user_id::text
--   );

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R DECIMAL := 6371; -- Earth's radius in km
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat / 2) * sin(dLat / 2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon / 2) * sin(dLon / 2);
  
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  
  RETURN ROUND((R * c)::NUMERIC, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 8. TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for shops table
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for shop_products table
CREATE TRIGGER update_shop_products_updated_at
  BEFORE UPDATE ON shop_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Uncomment to insert sample shops for testing

-- INSERT INTO shops (user_id, shop_name, address, latitude, longitude, logo_url, whatsapp_number, is_active)
-- VALUES 
--   (
--     (SELECT id FROM auth.users LIMIT 1), 
--     'Ram Mobile Shop', 
--     'Shop No 12, MG Road, Bangalore, Karnataka 560001', 
--     12.9716, 
--     77.5946, 
--     'https://example.com/logo1.jpg',
--     '919876543210',
--     true
--   ),
--   (
--     (SELECT id FROM auth.users LIMIT 1), 
--     'Shyam Electronics', 
--     'Near City Center, Koramangala, Bangalore, Karnataka 560034', 
--     12.9352, 
--     77.6245, 
--     'https://example.com/logo2.jpg',
--     '919876543211',
--     true
--   );

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Check if tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'shop%';

-- Check if indexes exist
-- SELECT indexname FROM pg_indexes 
-- WHERE tablename LIKE 'shop%';

-- Check if RLS is enabled
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename LIKE 'shop%';

-- Check policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename LIKE 'shop%';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Notes:
-- 1. Make sure to run this with a superuser or database owner role
-- 2. Test RLS policies thoroughly before production
-- 3. Consider adding PostGIS for better location-based queries
-- 4. Monitor query performance and add indexes as needed
-- 5. Set up proper backup and recovery procedures
