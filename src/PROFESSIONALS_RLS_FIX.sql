-- =====================================================
-- FIX FOR RLS POLICY ERROR
-- LocalFelo uses x-client-token authentication, not Supabase Auth
-- =====================================================
-- Run this SQL to fix the "row violates row-level security policy" error

-- =====================================================
-- 1. CREATE FUNCTION TO GET USER ID FROM CLIENT TOKEN
-- =====================================================
-- This function extracts the user_id from the x-client-token header
-- and validates it against the profiles table
CREATE OR REPLACE FUNCTION get_user_id_from_token()
RETURNS uuid AS $$
DECLARE
  client_token text;
  found_user_id uuid;
BEGIN
  -- Get the x-client-token from request headers
  client_token := current_setting('request.headers', true)::json->>'x-client-token';
  
  -- If no token, return NULL
  IF client_token IS NULL OR client_token = '' THEN
    RETURN NULL;
  END IF;
  
  -- Look up user_id from profiles table using client_token
  SELECT id INTO found_user_id
  FROM profiles
  WHERE client_token = get_user_id_from_token.client_token
  LIMIT 1;
  
  RETURN found_user_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. DROP OLD RLS POLICIES (that use auth.uid())
-- =====================================================
DROP POLICY IF EXISTS "Users can create their own professional profile" ON professionals;
DROP POLICY IF EXISTS "Users can update their own professional profile" ON professionals;
DROP POLICY IF EXISTS "Users can delete their own professional profile" ON professionals;
DROP POLICY IF EXISTS "Admins can view all professionals" ON professionals;
DROP POLICY IF EXISTS "Admins can update any professional" ON professionals;
DROP POLICY IF EXISTS "Admins can delete any professional" ON professionals;

DROP POLICY IF EXISTS "Professional owners can insert services" ON professional_services;
DROP POLICY IF EXISTS "Professional owners can update services" ON professional_services;
DROP POLICY IF EXISTS "Professional owners can delete services" ON professional_services;

DROP POLICY IF EXISTS "Professional owners can insert images" ON professional_images;
DROP POLICY IF EXISTS "Professional owners can update images" ON professional_images;
DROP POLICY IF EXISTS "Professional owners can delete images" ON professional_images;

DROP POLICY IF EXISTS "Admins can insert category images" ON professional_categories_images;
DROP POLICY IF EXISTS "Admins can update category images" ON professional_categories_images;
DROP POLICY IF EXISTS "Admins can delete category images" ON professional_categories_images;

-- =====================================================
-- 3. CREATE NEW RLS POLICIES (using x-client-token)
-- =====================================================

-- Professionals table policies
-- Users can create their own professional profile
CREATE POLICY "Users can create their own professional profile"
  ON professionals FOR INSERT
  WITH CHECK (get_user_id_from_token() = user_id);

-- Users can update their own professional profile
CREATE POLICY "Users can update their own professional profile"
  ON professionals FOR UPDATE
  USING (get_user_id_from_token() = user_id);

-- Users can delete their own professional profile
CREATE POLICY "Users can delete their own professional profile"
  ON professionals FOR DELETE
  USING (get_user_id_from_token() = user_id);

-- Admins can view all professionals
CREATE POLICY "Admins can view all professionals"
  ON professionals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = get_user_id_from_token()
      AND profiles.is_admin = true
    )
  );

-- Admins can update any professional
CREATE POLICY "Admins can update any professional"
  ON professionals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = get_user_id_from_token()
      AND profiles.is_admin = true
    )
  );

-- Admins can delete any professional
CREATE POLICY "Admins can delete any professional"
  ON professionals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = get_user_id_from_token()
      AND profiles.is_admin = true
    )
  );

-- Professional services table policies
-- Professional owners can manage their services
CREATE POLICY "Professional owners can insert services"
  ON professional_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_services.professional_id
      AND professionals.user_id = get_user_id_from_token()
    )
  );

CREATE POLICY "Professional owners can update services"
  ON professional_services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_services.professional_id
      AND professionals.user_id = get_user_id_from_token()
    )
  );

CREATE POLICY "Professional owners can delete services"
  ON professional_services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_services.professional_id
      AND professionals.user_id = get_user_id_from_token()
    )
  );

-- Professional images table policies
-- Professional owners can manage their images
CREATE POLICY "Professional owners can insert images"
  ON professional_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_images.professional_id
      AND professionals.user_id = get_user_id_from_token()
    )
  );

CREATE POLICY "Professional owners can update images"
  ON professional_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_images.professional_id
      AND professionals.user_id = get_user_id_from_token()
    )
  );

CREATE POLICY "Professional owners can delete images"
  ON professional_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_images.professional_id
      AND professionals.user_id = get_user_id_from_token()
    )
  );

-- Professional categories images policies
-- Only admins can manage category images
CREATE POLICY "Admins can insert category images"
  ON professional_categories_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = get_user_id_from_token()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update category images"
  ON professional_categories_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = get_user_id_from_token()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete category images"
  ON professional_categories_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = get_user_id_from_token()
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- TESTING QUERY
-- =====================================================
-- Run this to verify the function works:
-- SELECT get_user_id_from_token();
-- This should return your user_id if you're authenticated

-- =====================================================
-- FIX COMPLETE!
-- =====================================================
-- The RLS policies now work with LocalFelo's x-client-token authentication
-- Try creating a professional profile again - it should work now!
