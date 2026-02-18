-- Check current categories and fix emoji issues
-- Run this in your Supabase SQL Editor

-- First, let's see what categories you currently have
SELECT id, name, slug, emoji, 
       CASE WHEN emoji IS NULL THEN '❌ MISSING' ELSE '✅ OK' END as emoji_status
FROM categories 
ORDER BY CAST(id AS INTEGER);

-- Update all existing categories with emojis (if missing)
UPDATE categories SET emoji = '📱' WHERE slug = 'mobile-phones' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '🚗' WHERE slug = 'vehicles' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '🖥️' WHERE slug = 'computers-laptops' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '🪑' WHERE slug = 'furniture' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '🏠' WHERE slug = 'home-living' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '👗' WHERE slug = 'fashion' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '🧒' WHERE slug = 'kids-baby' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '🐶' WHERE slug = 'pets' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '📚' WHERE slug = 'books-education' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '🎮' WHERE slug = 'gaming' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '⚙️' WHERE slug = 'tools-equipment' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '🍽️' WHERE slug = 'kitchen-appliances' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '🏢' WHERE slug = 'real-estate' AND (emoji IS NULL OR emoji = '');
UPDATE categories SET emoji = '💼' WHERE slug = 'jobs' AND (emoji IS NULL OR emoji = '');

-- Add commonly missing categories with proper emojis
INSERT INTO categories (id, name, slug, emoji)
VALUES ('15', 'Sports & Fitness', 'sports-fitness', '⚽')
ON CONFLICT (slug) DO UPDATE SET emoji = '⚽';

INSERT INTO categories (id, name, slug, emoji)
VALUES ('16', 'Bikes & Scooters', 'bikes-scooters', '🛵')
ON CONFLICT (slug) DO UPDATE SET emoji = '🛵';

INSERT INTO categories (id, name, slug, emoji)
VALUES ('17', 'Electronics', 'electronics', '🔌')
ON CONFLICT (slug) DO UPDATE SET emoji = '🔌';

INSERT INTO categories (id, name, slug, emoji)
VALUES ('99', 'Other', 'other', '📦')
ON CONFLICT (slug) DO UPDATE SET emoji = '📦';

-- Verify all categories now have emojis
SELECT id, name, slug, emoji,
       CASE WHEN emoji IS NULL OR emoji = '' THEN '❌ MISSING' ELSE '✅ OK' END as emoji_status
FROM categories 
ORDER BY 
  CASE WHEN slug = 'other' THEN 999 ELSE CAST(id AS INTEGER) END;
