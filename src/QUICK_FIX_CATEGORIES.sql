-- =====================================================
-- QUICK FIX - Handle Foreign Key Constraints
-- =====================================================
-- This is a simpler, step-by-step approach if you want to be extra safe
-- Run each section one at a time and verify results
-- =====================================================

-- =====================================================
-- STEP 1: Check what tables reference categories
-- =====================================================
-- This will show you all foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'categories';

-- Expected output: tasks, professionals, wishes, and possibly others

-- =====================================================
-- STEP 2: Create backups (IMPORTANT!)
-- =====================================================
BEGIN;

CREATE TABLE IF NOT EXISTS categories_backup_2026 AS SELECT * FROM categories;
CREATE TABLE IF NOT EXISTS tasks_backup_2026 AS SELECT * FROM tasks;
CREATE TABLE IF NOT EXISTS professionals_backup_2026 AS SELECT * FROM professionals;
CREATE TABLE IF NOT EXISTS wishes_backup_2026 AS SELECT * FROM wishes;

COMMIT;

-- Verify backups created
SELECT 'categories' as table_name, COUNT(*) as count FROM categories_backup_2026
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks_backup_2026
UNION ALL
SELECT 'professionals', COUNT(*) FROM professionals_backup_2026
UNION ALL
SELECT 'wishes', COUNT(*) FROM wishes_backup_2026;

-- =====================================================
-- STEP 3: Create migration mapping
-- =====================================================
CREATE TABLE IF NOT EXISTS category_migration_map (
  old_id TEXT PRIMARY KEY,
  new_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clear existing mappings
TRUNCATE category_migration_map;

-- Insert all old → new mappings
INSERT INTO category_migration_map (old_id, new_id) VALUES
  ('carry-luggage', 'quick-help'),
  ('bring-something', 'quick-help'),
  ('ride-transport', 'driver-rides'),
  ('delivery', 'delivery-pickup'),
  ('stay-accommodation', 'stay-living'),
  ('moving-packing', 'shifting-moving'),
  ('teaching-learning', 'teaching'),
  ('accounting-tax', 'ca-finance'),
  ('medical-help', 'care-support'),
  ('tech-help', 'software-dev'),
  ('laundry', 'cleaning'),
  ('vehicle-help', 'vehicle-care'),
  ('document-help', 'govt-id'),
  ('photography-videography', 'photography-video'),
  ('event-help', 'events'),
  ('professional-help', 'business-career'),
  ('partner-needed', 'quick-help'),
  ('other', 'quick-help');

-- Verify mappings
SELECT * FROM category_migration_map ORDER BY old_id;

-- =====================================================
-- STEP 4: Check which categories need migration
-- =====================================================

-- Check tasks
SELECT 
  t.category_id,
  c.name as old_category_name,
  COUNT(*) as task_count,
  cm.new_id as will_migrate_to
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN category_migration_map cm ON t.category_id = cm.old_id
WHERE t.category_id IS NOT NULL
GROUP BY t.category_id, c.name, cm.new_id
ORDER BY task_count DESC;

-- Check professionals
SELECT 
  p.category_id,
  c.name as old_category_name,
  COUNT(*) as professional_count,
  cm.new_id as will_migrate_to
FROM professionals p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN category_migration_map cm ON p.category_id = cm.old_id
WHERE p.category_id IS NOT NULL
GROUP BY p.category_id, c.name, cm.new_id
ORDER BY professional_count DESC;

-- Check wishes
SELECT 
  w.category_id,
  c.name as old_category_name,
  COUNT(*) as wish_count,
  cm.new_id as will_migrate_to
FROM wishes w
LEFT JOIN categories c ON w.category_id = c.id
LEFT JOIN category_migration_map cm ON w.category_id = cm.old_id
WHERE w.category_id IS NOT NULL
GROUP BY w.category_id, c.name, cm.new_id
ORDER BY wish_count DESC;

-- =====================================================
-- STEP 5: First, insert NEW categories (before deleting old ones)
-- =====================================================

BEGIN;

-- Insert new categories
INSERT INTO categories (id, name, emoji, created_at, updated_at) VALUES
  ('quick-help', 'Quick Help', '⚡', NOW(), NOW()),
  ('repair', 'Repair', '🔧', NOW(), NOW()),
  ('installation', 'Installation', '🔨', NOW(), NOW()),
  ('driver-rides', 'Driver & Rides', '🚗', NOW(), NOW()),
  ('delivery-pickup', 'Delivery & Pickup', '📦', NOW(), NOW()),
  ('utilities', 'Utilities', '💧', NOW(), NOW()),
  ('stay-living', 'Stay & Living', '🏠', NOW(), NOW()),
  ('rent-property', 'Rent & Property', '🏢', NOW(), NOW()),
  ('software-dev', 'Software & Development', '💻', NOW(), NOW()),
  ('design-creative', 'Design & Creative', '🎨', NOW(), NOW()),
  ('teaching', 'Teaching', '📚', NOW(), NOW()),
  ('coaching-training', 'Coaching & Training', '🎯', NOW(), NOW()),
  ('mentorship', 'Mentorship', '🌟', NOW(), NOW()),
  ('legal', 'Legal', '⚖️', NOW(), NOW()),
  ('ca-finance', 'CA & Finance', '💰', NOW(), NOW()),
  ('business-career', 'Business & Career Services', '💼', NOW(), NOW()),
  ('govt-id', 'Government & ID Services', '🆔', NOW(), NOW()),
  ('photography-video', 'Photography & Video', '📷', NOW(), NOW()),
  ('events', 'Events', '🎉', NOW(), NOW()),
  ('beauty-wellness', 'Beauty & Wellness', '💅', NOW(), NOW()),
  ('cleaning', 'Cleaning', '🧹', NOW(), NOW()),
  ('cooking', 'Cooking', '🍳', NOW(), NOW()),
  ('shifting-moving', 'Shifting & Moving', '🚚', NOW(), NOW()),
  ('pet-care', 'Pet Care', '🐕', NOW(), NOW()),
  ('care-support', 'Care & Support', '❤️', NOW(), NOW()),
  ('home-services', 'Home Services', '🏡', NOW(), NOW()),
  ('vehicle-care', 'Vehicle Care', '🚙', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  updated_at = NOW();

COMMIT;

-- Verify new categories exist
SELECT COUNT(*) as total_categories FROM categories;
-- Should show more than 27 (old + new categories together for now)

-- =====================================================
-- STEP 6: Migrate all foreign key references
-- =====================================================

BEGIN;

-- Migrate tasks to new category IDs
UPDATE tasks 
SET category_id = (
  SELECT new_id FROM category_migration_map 
  WHERE old_id = tasks.category_id
)
WHERE category_id IN (SELECT old_id FROM category_migration_map);

-- Migrate professionals to new category IDs
UPDATE professionals 
SET category_id = (
  SELECT new_id FROM category_migration_map 
  WHERE old_id = professionals.category_id
)
WHERE category_id IN (SELECT old_id FROM category_migration_map);

-- Migrate wishes to new category IDs
UPDATE wishes 
SET category_id = (
  SELECT new_id FROM category_migration_map 
  WHERE old_id = wishes.category_id
)
WHERE category_id IN (SELECT old_id FROM category_migration_map);

COMMIT;

-- =====================================================
-- STEP 7: Verify migration worked
-- =====================================================

-- Check orphaned records (should return 0 for all)
SELECT 
  'Tasks with invalid categories' as check_name,
  COUNT(*) as count
FROM tasks 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL
UNION ALL
SELECT 
  'Professionals with invalid categories',
  COUNT(*)
FROM professionals 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL
UNION ALL
SELECT 
  'Wishes with invalid categories',
  COUNT(*)
FROM wishes 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL;

-- All counts should be 0. If not, DON'T proceed to Step 8!

-- =====================================================
-- STEP 8: Delete old categories (ONLY if Step 7 shows 0 orphans)
-- =====================================================

BEGIN;

-- Delete only the old categories that were migrated
DELETE FROM categories 
WHERE id IN (SELECT old_id FROM category_migration_map);

-- Delete any other old categories not in the new structure
DELETE FROM categories 
WHERE id NOT IN (
  'quick-help', 'repair', 'installation', 'driver-rides',
  'delivery-pickup', 'utilities', 'stay-living', 'rent-property',
  'software-dev', 'design-creative', 'teaching', 'coaching-training',
  'mentorship', 'legal', 'ca-finance', 'business-career',
  'govt-id', 'photography-video', 'events', 'beauty-wellness',
  'cleaning', 'cooking', 'shifting-moving', 'pet-care',
  'care-support', 'home-services', 'vehicle-care'
);

COMMIT;

-- =====================================================
-- STEP 9: Final verification
-- =====================================================

-- Should return exactly 27
SELECT COUNT(*) as final_category_count FROM categories;

-- Should show all 27 categories
SELECT id, name, emoji FROM categories ORDER BY name;

-- Should return 0 for all
SELECT 
  'Orphaned Tasks' as issue,
  COUNT(DISTINCT category_id) as count
FROM tasks 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL
UNION ALL
SELECT 
  'Orphaned Professionals',
  COUNT(DISTINCT category_id)
FROM professionals 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL
UNION ALL
SELECT 
  'Orphaned Wishes',
  COUNT(DISTINCT category_id)
FROM wishes 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL;

-- Distribution check
SELECT 
  'Tasks' as table_name,
  COUNT(*) as total,
  COUNT(DISTINCT category_id) as unique_categories
FROM tasks
UNION ALL
SELECT 'Professionals', COUNT(*), COUNT(DISTINCT category_id) FROM professionals
UNION ALL
SELECT 'Wishes', COUNT(*), COUNT(DISTINCT category_id) FROM wishes
UNION ALL
SELECT 'Categories', COUNT(*), COUNT(*) FROM categories;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- If all verifications pass:
-- ✅ 27 categories exist
-- ✅ 0 orphaned records
-- ✅ All data migrated successfully
-- 
-- You can now safely delete the backup tables (optional):
-- DROP TABLE categories_backup_2026;
-- DROP TABLE tasks_backup_2026;
-- DROP TABLE professionals_backup_2026;
-- DROP TABLE wishes_backup_2026;
-- 
-- But it's recommended to keep them for a few days just in case!
-- =====================================================
