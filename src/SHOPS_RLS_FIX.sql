-- =====================================================
-- SHOPS MODULE RLS POLICY FIX
-- =====================================================
-- Fix RLS policies for shops table to work with x-client-token auth
-- LocalFelo uses custom x-client-token instead of Supabase Auth

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all shops" ON shops;
DROP POLICY IF EXISTS "Users can create their own shops" ON shops;
DROP POLICY IF EXISTS "Users can update their own shops" ON shops;
DROP POLICY IF EXISTS "Users can delete their own shops" ON shops;

DROP POLICY IF EXISTS "Anyone can view shop categories" ON shop_categories;
DROP POLICY IF EXISTS "Shop owners can manage their shop categories" ON shop_categories;

DROP POLICY IF EXISTS "Anyone can view shop products" ON shop_products;
DROP POLICY IF EXISTS "Shop owners can manage their shop products" ON shop_products;

-- ===================================================== 
-- SHOPS TABLE POLICIES (with x-client-token support)
-- =====================================================

-- Allow anyone to view all active shops
CREATE POLICY "Anyone can view all shops"
  ON shops
  FOR SELECT
  USING (true);

-- Allow authenticated users to create shops (supports both Supabase Auth and x-client-token)
CREATE POLICY "Authenticated users can create shops"
  ON shops
  FOR INSERT
  WITH CHECK (
    -- Supabase Auth user
    (auth.uid() IS NOT NULL AND user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
    OR
    -- x-client-token user
    (user_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'))
  );

-- Allow users to update their own shops
CREATE POLICY "Users can update their own shops"
  ON shops
  FOR UPDATE
  USING (
    -- Supabase Auth user
    (auth.uid() IS NOT NULL AND user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
    OR
    -- x-client-token user
    (user_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'))
  );

-- Allow users to delete their own shops
CREATE POLICY "Users can delete their own shops"
  ON shops
  FOR DELETE
  USING (
    -- Supabase Auth user
    (auth.uid() IS NOT NULL AND user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
    OR
    -- x-client-token user
    (user_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token'))
  );

-- =====================================================
-- SHOP_CATEGORIES TABLE POLICIES
-- =====================================================

-- Anyone can view shop categories
CREATE POLICY "Anyone can view shop categories"
  ON shop_categories
  FOR SELECT
  USING (true);

-- Shop owners can manage their shop categories
CREATE POLICY "Shop owners can manage shop categories"
  ON shop_categories
  FOR ALL
  USING (
    shop_id IN (
      SELECT id FROM shops 
      WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR user_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
    )
  );

-- =====================================================
-- SHOP_PRODUCTS TABLE POLICIES
-- =====================================================

-- Anyone can view shop products
CREATE POLICY "Anyone can view shop products"
  ON shop_products
  FOR SELECT
  USING (true);

-- Shop owners can manage their shop products
CREATE POLICY "Shop owners can manage shop products"
  ON shop_products
  FOR ALL
  USING (
    shop_id IN (
      SELECT id FROM shops 
      WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
         OR user_id = (SELECT id FROM profiles WHERE client_token = current_setting('request.headers', true)::json->>'x-client-token')
    )
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify policies are active
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('shops', 'shop_categories', 'shop_products')
ORDER BY tablename, policyname;
