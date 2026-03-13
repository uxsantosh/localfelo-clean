-- Add Real Estate and Jobs categories to OldCycle
-- Run this in your Supabase SQL Editor

-- Insert Real Estate category
INSERT INTO categories (id, name, slug, emoji)
VALUES (13, 'Real Estate', 'real-estate', '🏢')
ON CONFLICT (id) DO NOTHING;

-- Insert Jobs category
INSERT INTO categories (id, name, slug, emoji)
VALUES (14, 'Jobs', 'jobs', '💼')
ON CONFLICT (id) DO NOTHING;

-- Verify the new categories
SELECT * FROM categories WHERE id IN (13, 14);
