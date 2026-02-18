-- =====================================================
-- ADD TECH HELP CATEGORY TO WISHES
-- =====================================================
-- This adds "Need Tech Help" as a wish category so users can
-- post wishes like "Need help setting up my laptop" or
-- "Looking for someone to fix my phone"
-- =====================================================

-- Insert Need Tech Help wish category (ID: 209)
-- Using "Need Tech Help" to avoid conflict with existing "Tech Help" task category
INSERT INTO categories (id, name, slug, emoji, type, sort_order) 
VALUES ('209', 'Need Tech Help', 'need-tech-help', '💻', 'wish', 9)
ON CONFLICT (id) DO NOTHING;

-- Verify the insertion
SELECT id, name, slug, emoji, type, sort_order 
FROM categories 
WHERE type = 'wish' 
ORDER BY sort_order;

-- =====================================================
-- DONE! ✅
-- =====================================================
-- You now have "Need Tech Help" as a wish category
-- Users can select it when posting wishes in CreateWishScreen
-- It will appear in the category filter pills in WishesScreen
-- =====================================================