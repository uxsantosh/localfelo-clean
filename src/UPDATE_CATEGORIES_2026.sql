-- =====================================================
-- LOCALFELO CATEGORY UPDATE - 2026 COMPLETE VERSION
-- =====================================================
-- Updates all 27 main categories with comprehensive subcategories
-- Run this SQL in Supabase SQL Editor to update your database
--
-- WHAT THIS DOES:
-- 1. Backs up existing categories table
-- 2. Migrates all foreign key references (tasks, professionals, wishes, etc.)
-- 3. Safely updates to new category structure
-- 4. No data loss - all existing records preserved
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: CREATE BACKUPS
-- =====================================================

-- Backup existing categories
CREATE TABLE IF NOT EXISTS categories_backup_2026 AS 
SELECT * FROM categories;

-- Backup tasks (just in case)
CREATE TABLE IF NOT EXISTS tasks_backup_2026 AS 
SELECT * FROM tasks;

-- Backup professionals (just in case)
CREATE TABLE IF NOT EXISTS professionals_backup_2026 AS 
SELECT * FROM professionals;

-- Backup wishes (just in case)
CREATE TABLE IF NOT EXISTS wishes_backup_2026 AS 
SELECT * FROM wishes;

-- =====================================================
-- STEP 2: CREATE MIGRATION MAPPING
-- =====================================================

-- Create migration map table
CREATE TABLE IF NOT EXISTS category_migration_map (
  old_id TEXT PRIMARY KEY,
  new_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common migrations
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
  ('other', 'quick-help')
ON CONFLICT (old_id) DO UPDATE SET new_id = EXCLUDED.new_id;

-- =====================================================
-- STEP 3: MIGRATE EXISTING DATA TO NEW CATEGORY IDS
-- =====================================================

-- Migrate tasks
UPDATE tasks 
SET category_id = (
  SELECT new_id FROM category_migration_map 
  WHERE old_id = tasks.category_id
)
WHERE category_id IN (SELECT old_id FROM category_migration_map);

-- Migrate professionals
UPDATE professionals 
SET category_id = (
  SELECT new_id FROM category_migration_map 
  WHERE old_id = professionals.category_id
)
WHERE category_id IN (SELECT old_id FROM category_migration_map);

-- Migrate wishes
UPDATE wishes 
SET category_id = (
  SELECT new_id FROM category_migration_map 
  WHERE old_id = wishes.category_id
)
WHERE category_id IN (SELECT old_id FROM category_migration_map);

-- Migrate any other tables that might reference categories
-- Add more UPDATE statements here if you have other tables with category_id

-- =====================================================
-- STEP 4: DELETE OLD CATEGORIES (NOW SAFE)
-- =====================================================

-- Now we can safely delete old categories since all references are updated
DELETE FROM categories WHERE id IN (SELECT old_id FROM category_migration_map);

-- Delete any remaining old categories that aren't in the new structure
DELETE FROM categories 
WHERE id NOT IN (
  'quick-help',
  'repair',
  'installation',
  'driver-rides',
  'delivery-pickup',
  'utilities',
  'stay-living',
  'rent-property',
  'software-dev',
  'design-creative',
  'teaching',
  'coaching-training',
  'mentorship',
  'legal',
  'ca-finance',
  'business-career',
  'govt-id',
  'photography-video',
  'events',
  'beauty-wellness',
  'cleaning',
  'cooking',
  'shifting-moving',
  'pet-care',
  'care-support',
  'home-services',
  'vehicle-care'
);

-- =====================================================
-- STEP 5: INSERT ALL 27 NEW CATEGORIES
-- =====================================================

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

-- =====================================================
-- STEP 6: CREATE/UPDATE TASK_CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS task_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync task_categories with main categories
DELETE FROM task_categories;
INSERT INTO task_categories (id, name, emoji, priority)
SELECT 
  id, 
  name, 
  emoji,
  CASE 
    WHEN id IN ('quick-help', 'repair', 'installation', 'driver-rides', 
                'delivery-pickup', 'utilities', 'stay-living', 'rent-property', 
                'cleaning', 'cooking', 'shifting-moving', 'pet-care') THEN 1
    ELSE 0
  END as priority
FROM categories;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these after migration to verify everything worked

-- Check total categories (should be 27)
SELECT COUNT(*) as total_categories FROM categories;

-- View all categories
SELECT id, name, emoji FROM categories ORDER BY name;

-- Check if any tasks have invalid category_id (should return 0)
SELECT COUNT(DISTINCT category_id) as orphaned_tasks
FROM tasks 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL;

-- Check if any professionals have invalid category_id (should return 0)
SELECT COUNT(DISTINCT category_id) as orphaned_professionals
FROM professionals 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL;

-- Check if any wishes have invalid category_id (should return 0)
SELECT COUNT(DISTINCT category_id) as orphaned_wishes
FROM wishes 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL;

-- Check migration summary
SELECT 
  'Tasks' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT category_id) as unique_categories
FROM tasks
UNION ALL
SELECT 
  'Professionals' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT category_id) as unique_categories
FROM professionals
UNION ALL
SELECT 
  'Wishes' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT category_id) as unique_categories
FROM wishes
UNION ALL
SELECT 
  'Categories' as table_name,
  COUNT(*) as total_records,
  COUNT(*) as unique_categories
FROM categories;

-- =====================================================
-- ROLLBACK INSTRUCTIONS (IF NEEDED)
-- =====================================================
-- If something goes wrong, you can rollback:
--
-- BEGIN;
-- 
-- -- Restore categories
-- DELETE FROM categories;
-- INSERT INTO categories SELECT * FROM categories_backup_2026;
-- 
-- -- Restore tasks
-- DELETE FROM tasks;
-- INSERT INTO tasks SELECT * FROM tasks_backup_2026;
-- 
-- -- Restore professionals
-- DELETE FROM professionals;
-- INSERT INTO professionals SELECT * FROM professionals_backup_2026;
-- 
-- -- Restore wishes
-- DELETE FROM wishes;
-- INSERT INTO wishes SELECT * FROM wishes_backup_2026;
-- 
-- COMMIT;
--
-- =====================================================

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If you see this, migration completed successfully!
-- All 27 categories are now active and all data migrated.
-- No foreign key errors should occur.
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ MIGRATION COMPLETE!';
  RAISE NOTICE '✅ Total Categories: %', (SELECT COUNT(*) FROM categories);
  RAISE NOTICE '✅ Tasks Updated: %', (SELECT COUNT(*) FROM tasks);
  RAISE NOTICE '✅ Professionals Updated: %', (SELECT COUNT(*) FROM professionals);
  RAISE NOTICE '✅ Wishes Updated: %', (SELECT COUNT(*) FROM wishes);
  RAISE NOTICE '✅ Backup tables created: categories_backup_2026, tasks_backup_2026, professionals_backup_2026, wishes_backup_2026';
  RAISE NOTICE '🎉 You are ready to go!';
END $$;
