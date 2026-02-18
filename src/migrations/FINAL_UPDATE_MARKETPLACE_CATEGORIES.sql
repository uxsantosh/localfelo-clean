-- =====================================================
-- FINAL MIGRATION: Update Marketplace Categories
-- =====================================================
-- This updates the categories table to match /constants/categories.ts
-- These are PRODUCT categories for the Marketplace (selling items)
-- This is SEPARATE from Wish/Task categories which are hardcoded in taskCategories.ts
--
-- Run this in your Supabase SQL Editor
-- =====================================================

-- First, clear existing categories (safe because of ON CONFLICT handling below)
TRUNCATE TABLE categories CASCADE;

-- Insert all 17 marketplace categories
INSERT INTO categories (id, name, slug, emoji) VALUES
  -- Top Priority - Most Popular
  ('1', 'Mobile Phones', 'mobile-phones', '📱'),
  ('2', 'Laptops & Computers', 'laptops-computers', '💻'),
  ('3', 'Bikes & Scooters', 'bikes-scooters', '🏍️'),
  ('4', 'Cars', 'cars', '🚗'),
  ('5', 'Rental', 'rental', '🔑'),
  
  -- Home & Living
  ('6', 'Furniture', 'furniture', '🪑'),
  ('7', 'Home & Living', 'home-living', '🏠'),
  ('8', 'Kitchen & Dining', 'kitchen-dining', '🍽️'),
  ('9', 'Electronics & Appliances', 'electronics-appliances', '📺'),
  
  -- Fashion & Lifestyle
  ('10', 'Fashion', 'fashion', '👗'),
  ('11', 'Kids & Baby', 'kids-baby', '🧒'),
  ('12', 'Books & Sports', 'books-sports', '📚'),
  
  -- Others
  ('13', 'Pets', 'pets', '🐶'),
  ('14', 'Real Estate', 'real-estate', '🏢'),
  ('15', 'Jobs', 'jobs', '💼'),
  ('16', 'Services', 'services', '🔧'),
  ('17', 'Other', 'other', '📦')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  emoji = EXCLUDED.emoji;

-- Verify categories
SELECT id, name, slug, emoji FROM categories ORDER BY CAST(id AS INTEGER);

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. These are MARKETPLACE categories (for selling products)
-- 2. Wishes use categories from WISH_CATEGORIES in /constants/taskCategories.ts
-- 3. Tasks use categories from TASK_CATEGORIES in /constants/taskCategories.ts
-- 4. Wishes/Tasks store category_id as INTEGER (matching the constants)
-- 5. Marketplace listings should reference these categories by ID
-- =====================================================
