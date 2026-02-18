-- =====================================================
-- REORDER WISH CATEGORIES - Logical Flow
-- =====================================================
-- Reorders wish categories to have a more intuitive flow:
-- Help/Service needs first, buying/renting next, Other last
-- =====================================================

-- Step 1: Add "Find Mentor" category if it doesn't exist
INSERT INTO categories (id, name, slug, emoji, type, sort_order) 
VALUES ('210', 'Find Mentor', 'find-mentor', '👨‍🏫', 'wish', 99)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Add "Need Tech Help" category if it doesn't exist
INSERT INTO categories (id, name, slug, emoji, type, sort_order) 
VALUES ('209', 'Need Tech Help', 'need-tech-help', '💻', 'wish', 99)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Update names and reorder all wish categories
-- New logical order: Help -> Services -> Buying -> Renting -> Other

UPDATE categories SET name = 'Find Help', sort_order = 1 
WHERE id = '206' AND type = 'wish';

UPDATE categories SET name = 'Need Tech Help', sort_order = 2 
WHERE id = '209' AND type = 'wish';

UPDATE categories SET name = 'Find Service', sort_order = 3 
WHERE id = '205' AND type = 'wish';

UPDATE categories SET name = 'Find Mentor', sort_order = 4 
WHERE id = '210' AND type = 'wish';

UPDATE categories SET name = 'Want to Buy Something', sort_order = 5 
WHERE id = '201' AND type = 'wish';

UPDATE categories SET name = 'Rent House', sort_order = 6 
WHERE id = '202' AND type = 'wish';

UPDATE categories SET name = 'Rent Item', sort_order = 7 
WHERE id = '203' AND type = 'wish';

UPDATE categories SET name = 'Find Used Item', sort_order = 8 
WHERE id = '204' AND type = 'wish';

UPDATE categories SET name = 'Find Deal', sort_order = 9 
WHERE id = '207' AND type = 'wish';

UPDATE categories SET name = 'Other Wish', sort_order = 10 
WHERE id = '208' AND type = 'wish';

-- Step 4: Verify the new order
SELECT id, name, slug, emoji, type, sort_order 
FROM categories 
WHERE type = 'wish' 
ORDER BY sort_order;

-- =====================================================
-- DONE! ✅
-- =====================================================
-- New wish category order:
-- 1. Find Help 🤝
-- 2. Need Tech Help 💻
-- 3. Find Service 🔧
-- 4. Find Mentor 👨‍🏫
-- 5. Want to Buy Something 🛒
-- 6. Rent House 🏘️
-- 7. Rent Item 🔑
-- 8. Find Used Item ♻️
-- 9. Find Deal 💰
-- 10. Other Wish ✨ (always last)
-- =====================================================
