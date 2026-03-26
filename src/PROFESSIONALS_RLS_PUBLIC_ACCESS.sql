-- =====================================================
-- PROFESSIONALS MODULE: PUBLIC ACCESS RLS FIX
-- =====================================================
-- This script allows public (non-authenticated) users to view active professionals
-- Run this in your Supabase SQL Editor

-- Drop existing SELECT policies for professionals table
DROP POLICY IF EXISTS "Anyone can view active professionals" ON professionals;
DROP POLICY IF EXISTS "allow_select_active_professionals" ON professionals;
DROP POLICY IF EXISTS "Admins can view all professionals" ON professionals;

-- Create new public SELECT policy for active professionals
-- This allows ANYONE (authenticated or not) to view active professionals
CREATE POLICY "public_can_view_active_professionals"
  ON professionals FOR SELECT
  TO public  -- ✅ This allows both authenticated AND anonymous users
  USING (is_active = true);

-- Create admin policy to view ALL professionals (including inactive)
CREATE POLICY "admins_can_view_all_professionals"
  ON professionals FOR SELECT
  TO authenticated  -- Only authenticated users can use this policy
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = get_user_id_from_token()
        AND profiles.is_admin = true
    )
  );

-- =====================================================
-- PROFESSIONAL SERVICES TABLE
-- =====================================================

-- Drop existing SELECT policies for professional_services table
DROP POLICY IF EXISTS "Anyone can view services for active professionals" ON professional_services;

-- Allow public to view services for active professionals
CREATE POLICY "public_can_view_services"
  ON professional_services FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_services.professional_id
        AND professionals.is_active = true
    )
  );

-- =====================================================
-- PROFESSIONAL IMAGES TABLE
-- =====================================================

-- Drop existing SELECT policies for professional_images table
DROP POLICY IF EXISTS "Anyone can view images for active professionals" ON professional_images;

-- Allow public to view images for active professionals
CREATE POLICY "public_can_view_images"
  ON professional_images FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_images.professional_id
        AND professionals.is_active = true
    )
  );

-- =====================================================
-- PROFESSIONAL CATEGORIES IMAGES TABLE
-- =====================================================

-- Drop existing SELECT policies for professional_categories_images table
DROP POLICY IF EXISTS "Anyone can view category images" ON professional_categories_images;

-- Allow public to view all category images (these are public references)
CREATE POLICY "public_can_view_category_images"
  ON professional_categories_images FOR SELECT
  TO public
  USING (true);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify the policies are created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('professionals', 'professional_services', 'professional_images', 'professional_categories_images')
ORDER BY tablename, policyname;

-- Test query (this should work without authentication):
-- SELECT id, name, slug, role_name, category_name, whatsapp, latitude, longitude
-- FROM professionals
-- WHERE is_active = true
-- LIMIT 5;
