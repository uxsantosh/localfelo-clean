-- Update ALL categories with proper emojis in OldCycle
-- Run this in your Supabase SQL Editor

-- Update existing categories with emojis
UPDATE categories SET emoji = '📱' WHERE slug = 'mobile-phones';
UPDATE categories SET emoji = '🚗' WHERE slug = 'vehicles';
UPDATE categories SET emoji = '🖥️' WHERE slug = 'computers-laptops';
UPDATE categories SET emoji = '🪑' WHERE slug = 'furniture';
UPDATE categories SET emoji = '🏠' WHERE slug = 'home-living';
UPDATE categories SET emoji = '👗' WHERE slug = 'fashion';
UPDATE categories SET emoji = '🧒' WHERE slug = 'kids-baby';
UPDATE categories SET emoji = '🐶' WHERE slug = 'pets';
UPDATE categories SET emoji = '📚' WHERE slug = 'books-education';
UPDATE categories SET emoji = '🎮' WHERE slug = 'gaming';
UPDATE categories SET emoji = '⚙️' WHERE slug = 'tools-equipment';
UPDATE categories SET emoji = '🍽️' WHERE slug = 'kitchen-appliances';

-- Insert new categories (Real Estate and Jobs) if they don't exist
INSERT INTO categories (id, name, slug, emoji)
VALUES ('13', 'Real Estate', 'real-estate', '🏢')
ON CONFLICT (slug) DO UPDATE SET emoji = '🏢';

INSERT INTO categories (id, name, slug, emoji)
VALUES ('14', 'Jobs', 'jobs', '💼')
ON CONFLICT (slug) DO UPDATE SET emoji = '💼';

-- Verify all categories with emojis
SELECT * FROM categories ORDER BY CAST(id AS INTEGER);
