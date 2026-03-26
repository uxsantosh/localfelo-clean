-- =====================================================
-- PROFESSIONALS MODULE - CLEAN DATABASE MIGRATION
-- LocalFelo - Professional Services Directory
-- =====================================================
-- This version drops existing tables first for clean installation
-- Run this SQL in your Supabase SQL Editor

-- =====================================================
-- 0. DROP EXISTING TABLES (IF ANY)
-- =====================================================
-- Drop in reverse order to handle foreign key constraints
DROP TABLE IF EXISTS professional_images CASCADE;
DROP TABLE IF EXISTS professional_services CASCADE;
DROP TABLE IF EXISTS professional_categories_images CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;

-- =====================================================
-- 1. PROFESSIONALS TABLE
-- =====================================================
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id TEXT NOT NULL,
  subcategory_id TEXT,
  description TEXT,
  whatsapp TEXT NOT NULL,
  profile_image_url TEXT,
  city TEXT NOT NULL,
  area TEXT,
  subarea TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_professionals_category_id ON professionals(category_id);
CREATE INDEX idx_professionals_city ON professionals(city);
CREATE INDEX idx_professionals_is_active ON professionals(is_active);
CREATE INDEX idx_professionals_slug ON professionals(slug);
CREATE INDEX idx_professionals_created_at ON professionals(created_at DESC);

-- =====================================================
-- 2. PROFESSIONAL_SERVICES TABLE
-- =====================================================
CREATE TABLE professional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster professional lookups
CREATE INDEX idx_professional_services_professional_id ON professional_services(professional_id);

-- =====================================================
-- 3. PROFESSIONAL_IMAGES TABLE
-- =====================================================
CREATE TABLE professional_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_professional_images_professional_id ON professional_images(professional_id);
CREATE INDEX idx_professional_images_order ON professional_images(professional_id, display_order);

-- =====================================================
-- 4. PROFESSIONAL_CATEGORIES_IMAGES TABLE
-- =====================================================
CREATE TABLE professional_categories_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster category lookups
CREATE INDEX idx_professional_categories_images_category_id ON professional_categories_images(category_id);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_categories_images ENABLE ROW LEVEL SECURITY;

-- Professionals table policies
-- Anyone can view active professionals
CREATE POLICY "Anyone can view active professionals"
  ON professionals FOR SELECT
  USING (is_active = true);

-- Users can create their own professional profile
CREATE POLICY "Users can create their own professional profile"
  ON professionals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own professional profile
CREATE POLICY "Users can update their own professional profile"
  ON professionals FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own professional profile
CREATE POLICY "Users can delete their own professional profile"
  ON professionals FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all professionals
CREATE POLICY "Admins can view all professionals"
  ON professionals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update any professional
CREATE POLICY "Admins can update any professional"
  ON professionals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can delete any professional
CREATE POLICY "Admins can delete any professional"
  ON professionals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Professional services table policies
-- Anyone can view services for active professionals
CREATE POLICY "Anyone can view services for active professionals"
  ON professional_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_services.professional_id
      AND professionals.is_active = true
    )
  );

-- Professional owners can manage their services
CREATE POLICY "Professional owners can insert services"
  ON professional_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_services.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Professional owners can update services"
  ON professional_services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_services.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Professional owners can delete services"
  ON professional_services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_services.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

-- Professional images table policies
-- Anyone can view images for active professionals
CREATE POLICY "Anyone can view images for active professionals"
  ON professional_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_images.professional_id
      AND professionals.is_active = true
    )
  );

-- Professional owners can manage their images
CREATE POLICY "Professional owners can insert images"
  ON professional_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_images.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Professional owners can update images"
  ON professional_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_images.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Professional owners can delete images"
  ON professional_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE professionals.id = professional_images.professional_id
      AND professionals.user_id = auth.uid()
    )
  );

-- Professional categories images policies
-- Anyone can view category images
CREATE POLICY "Anyone can view category images"
  ON professional_categories_images FOR SELECT
  USING (true);

-- Only admins can manage category images
CREATE POLICY "Admins can insert category images"
  ON professional_categories_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update category images"
  ON professional_categories_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete category images"
  ON professional_categories_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for professionals table
DROP TRIGGER IF EXISTS update_professionals_updated_at ON professionals;
CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for professional_categories_images table
DROP TRIGGER IF EXISTS update_professional_categories_images_updated_at ON professional_categories_images;
CREATE TRIGGER update_professional_categories_images_updated_at
  BEFORE UPDATE ON professional_categories_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. STORAGE BUCKET FOR PROFESSIONAL IMAGES
-- =====================================================
-- Create the bucket programmatically
INSERT INTO storage.buckets (id, name, public)
VALUES ('professional-images', 'professional-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for professional images
DROP POLICY IF EXISTS "Anyone can view professional images" ON storage.objects;
CREATE POLICY "Anyone can view professional images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'professional-images');

DROP POLICY IF EXISTS "Authenticated users can upload professional images" ON storage.objects;
CREATE POLICY "Authenticated users can upload professional images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'professional-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update their own professional images" ON storage.objects;
CREATE POLICY "Users can update their own professional images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'professional-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own professional images" ON storage.objects;
CREATE POLICY "Users can delete their own professional images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'professional-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- All tables created successfully with clean state.
-- Next step: Run /PROFESSIONALS_RLS_FIX.sql to fix authentication
-- =====================================================
