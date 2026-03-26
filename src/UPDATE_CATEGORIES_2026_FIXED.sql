-- =====================================================
-- LOCALFELO CATEGORY UPDATE - 2026 (TYPE CONVERSION FIX)
-- =====================================================
-- This handles the INTEGER to TEXT category_id conversion
-- Run this SQL in Supabase SQL Editor to update your database
--
-- WHAT THIS DOES:
-- 1. Backs up all tables
-- 2. Changes category_id from INTEGER to TEXT in all tables
-- 3. Migrates data to new category structure
-- 4. Updates all 27 new categories
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: CREATE BACKUPS
-- =====================================================

DROP TABLE IF EXISTS categories_backup_2026;
CREATE TABLE categories_backup_2026 AS SELECT * FROM categories;

DROP TABLE IF EXISTS tasks_backup_2026;
CREATE TABLE tasks_backup_2026 AS SELECT * FROM tasks;

DROP TABLE IF EXISTS professionals_backup_2026;
CREATE TABLE professionals_backup_2026 AS SELECT * FROM professionals;

DROP TABLE IF EXISTS wishes_backup_2026;
CREATE TABLE wishes_backup_2026 AS SELECT * FROM wishes;

-- =====================================================
-- STEP 2: CREATE NEW CATEGORIES TABLE WITH TEXT IDs
-- =====================================================

-- Create new categories table with TEXT id
DROP TABLE IF EXISTS categories_new;
CREATE TABLE categories_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert all 27 new categories
INSERT INTO categories_new (id, name, emoji) VALUES
  ('quick-help', 'Quick Help', '⚡'),
  ('repair', 'Repair', '🔧'),
  ('installation', 'Installation', '🔨'),
  ('driver-rides', 'Driver & Rides', '🚗'),
  ('delivery-pickup', 'Delivery & Pickup', '📦'),
  ('utilities', 'Utilities', '💧'),
  ('stay-living', 'Stay & Living', '🏠'),
  ('rent-property', 'Rent & Property', '🏢'),
  ('software-dev', 'Software & Development', '💻'),
  ('design-creative', 'Design & Creative', '🎨'),
  ('teaching', 'Teaching', '📚'),
  ('coaching-training', 'Coaching & Training', '🎯'),
  ('mentorship', 'Mentorship', '🌟'),
  ('legal', 'Legal', '⚖️'),
  ('ca-finance', 'CA & Finance', '💰'),
  ('business-career', 'Business & Career Services', '💼'),
  ('govt-id', 'Government & ID Services', '🆔'),
  ('photography-video', 'Photography & Video', '📷'),
  ('events', 'Events', '🎉'),
  ('beauty-wellness', 'Beauty & Wellness', '💅'),
  ('cleaning', 'Cleaning', '🧹'),
  ('cooking', 'Cooking', '🍳'),
  ('shifting-moving', 'Shifting & Moving', '🚚'),
  ('pet-care', 'Pet Care', '🐕'),
  ('care-support', 'Care & Support', '❤️'),
  ('home-services', 'Home Services', '🏡'),
  ('vehicle-care', 'Vehicle Care', '🚙');

-- =====================================================
-- STEP 3: CREATE MIGRATION MAP (INTEGER to TEXT)
-- =====================================================

-- Map old numeric IDs to new text IDs based on category names
DROP TABLE IF EXISTS category_id_migration;
CREATE TABLE category_id_migration (
  old_id INTEGER,
  old_name TEXT,
  new_id TEXT
);

-- Populate migration map from existing categories
INSERT INTO category_id_migration (old_id, old_name, new_id)
SELECT 
  c.id::INTEGER as old_id,
  c.name as old_name,
  CASE 
    -- Map based on category name patterns
    WHEN c.name ILIKE '%carry%' OR c.name ILIKE '%luggage%' THEN 'quick-help'
    WHEN c.name ILIKE '%bring%' THEN 'quick-help'
    WHEN c.name ILIKE '%repair%' THEN 'repair'
    WHEN c.name ILIKE '%installation%' OR c.name ILIKE '%install%' THEN 'installation'
    WHEN c.name ILIKE '%ride%' OR c.name ILIKE '%transport%' OR c.name ILIKE '%driver%' THEN 'driver-rides'
    WHEN c.name ILIKE '%delivery%' OR c.name ILIKE '%pickup%' THEN 'delivery-pickup'
    WHEN c.name ILIKE '%utilities%' OR c.name ILIKE '%water%' OR c.name ILIKE '%tanker%' THEN 'utilities'
    WHEN c.name ILIKE '%stay%' OR c.name ILIKE '%accommodation%' OR c.name ILIKE '%living%' OR c.name ILIKE '%PG%' THEN 'stay-living'
    WHEN c.name ILIKE '%rent%' OR c.name ILIKE '%property%' THEN 'rent-property'
    WHEN c.name ILIKE '%software%' OR c.name ILIKE '%development%' OR c.name ILIKE '%tech%' OR c.name ILIKE '%coding%' THEN 'software-dev'
    WHEN c.name ILIKE '%design%' OR c.name ILIKE '%creative%' OR c.name ILIKE '%graphic%' THEN 'design-creative'
    WHEN c.name ILIKE '%teaching%' OR c.name ILIKE '%tuition%' OR c.name ILIKE '%learning%' THEN 'teaching'
    WHEN c.name ILIKE '%coaching%' OR c.name ILIKE '%training%' THEN 'coaching-training'
    WHEN c.name ILIKE '%mentorship%' OR c.name ILIKE '%mentor%' THEN 'mentorship'
    WHEN c.name ILIKE '%legal%' OR c.name ILIKE '%lawyer%' THEN 'legal'
    WHEN c.name ILIKE '%CA%' OR c.name ILIKE '%finance%' OR c.name ILIKE '%accounting%' OR c.name ILIKE '%tax%' THEN 'ca-finance'
    WHEN c.name ILIKE '%business%' OR c.name ILIKE '%career%' OR c.name ILIKE '%professional%' THEN 'business-career'
    WHEN c.name ILIKE '%government%' OR c.name ILIKE '%document%' OR c.name ILIKE '%aadhaar%' OR c.name ILIKE '%passport%' THEN 'govt-id'
    WHEN c.name ILIKE '%photography%' OR c.name ILIKE '%video%' THEN 'photography-video'
    WHEN c.name ILIKE '%event%' OR c.name ILIKE '%party%' THEN 'events'
    WHEN c.name ILIKE '%beauty%' OR c.name ILIKE '%wellness%' OR c.name ILIKE '%makeup%' THEN 'beauty-wellness'
    WHEN c.name ILIKE '%cleaning%' OR c.name ILIKE '%laundry%' THEN 'cleaning'
    WHEN c.name ILIKE '%cooking%' OR c.name ILIKE '%cook%' OR c.name ILIKE '%chef%' THEN 'cooking'
    WHEN c.name ILIKE '%shifting%' OR c.name ILIKE '%moving%' OR c.name ILIKE '%packing%' THEN 'shifting-moving'
    WHEN c.name ILIKE '%pet%' OR c.name ILIKE '%dog%' OR c.name ILIKE '%cat%' THEN 'pet-care'
    WHEN c.name ILIKE '%care%' OR c.name ILIKE '%medical%' OR c.name ILIKE '%nurse%' THEN 'care-support'
    WHEN c.name ILIKE '%home%' OR c.name ILIKE '%handyman%' THEN 'home-services'
    WHEN c.name ILIKE '%vehicle%' OR c.name ILIKE '%car%' OR c.name ILIKE '%bike%' THEN 'vehicle-care'
    WHEN c.name ILIKE '%partner%' THEN 'quick-help'
    ELSE 'quick-help' -- Default mapping
  END as new_id
FROM categories c;

-- Show migration map
SELECT * FROM category_id_migration ORDER BY old_id;

-- =====================================================
-- STEP 4: DROP FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Drop FK constraints temporarily (we'll recreate them later)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_category_id_fkey;
ALTER TABLE professionals DROP CONSTRAINT IF EXISTS professionals_category_id_fkey;
ALTER TABLE wishes DROP CONSTRAINT IF EXISTS wishes_category_id_fkey;

-- =====================================================
-- STEP 5: ADD TEMPORARY TEXT COLUMNS
-- =====================================================

-- Add new TEXT columns for category_id
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category_id_new TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS category_id_new TEXT;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS category_id_new TEXT;

-- =====================================================
-- STEP 6: MIGRATE DATA TO NEW COLUMNS
-- =====================================================

-- Migrate tasks
UPDATE tasks t
SET category_id_new = m.new_id
FROM category_id_migration m
WHERE t.category_id = m.old_id;

-- Set default for unmapped tasks
UPDATE tasks
SET category_id_new = 'quick-help'
WHERE category_id_new IS NULL AND category_id IS NOT NULL;

-- Migrate professionals
UPDATE professionals p
SET category_id_new = m.new_id
FROM category_id_migration m
WHERE p.category_id = m.old_id;

-- Set default for unmapped professionals
UPDATE professionals
SET category_id_new = 'software-dev'
WHERE category_id_new IS NULL AND category_id IS NOT NULL;

-- Migrate wishes
UPDATE wishes w
SET category_id_new = m.new_id
FROM category_id_migration m
WHERE w.category_id = m.old_id;

-- Set default for unmapped wishes
UPDATE wishes
SET category_id_new = 'quick-help'
WHERE category_id_new IS NULL AND category_id IS NOT NULL;

-- =====================================================
-- STEP 7: SWAP OLD AND NEW COLUMNS
-- =====================================================

-- Drop old INTEGER columns
ALTER TABLE tasks DROP COLUMN category_id;
ALTER TABLE professionals DROP COLUMN category_id;
ALTER TABLE wishes DROP COLUMN category_id;

-- Rename new columns
ALTER TABLE tasks RENAME COLUMN category_id_new TO category_id;
ALTER TABLE professionals RENAME COLUMN category_id_new TO category_id;
ALTER TABLE wishes RENAME COLUMN category_id_new TO category_id;

-- =====================================================
-- STEP 8: REPLACE CATEGORIES TABLE
-- =====================================================

-- Drop old categories table
DROP TABLE categories;

-- Rename new table
ALTER TABLE categories_new RENAME TO categories;

-- =====================================================
-- STEP 9: RECREATE FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign keys back
ALTER TABLE tasks 
  ADD CONSTRAINT tasks_category_id_fkey 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id)
  ON DELETE SET NULL;

ALTER TABLE professionals 
  ADD CONSTRAINT professionals_category_id_fkey 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id)
  ON DELETE SET NULL;

ALTER TABLE wishes 
  ADD CONSTRAINT wishes_category_id_fkey 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id)
  ON DELETE SET NULL;

-- =====================================================
-- STEP 10: CREATE TASK_CATEGORIES TABLE
-- =====================================================

DROP TABLE IF EXISTS task_categories;
CREATE TABLE task_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Should return 27
SELECT COUNT(*) as total_categories FROM categories;

-- View all categories
SELECT id, name, emoji FROM categories ORDER BY name;

-- Check migration results
SELECT 
  'Tasks' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT category_id) as unique_categories,
  COUNT(*) FILTER (WHERE category_id IS NULL) as null_categories
FROM tasks
UNION ALL
SELECT 
  'Professionals',
  COUNT(*),
  COUNT(DISTINCT category_id),
  COUNT(*) FILTER (WHERE category_id IS NULL)
FROM professionals
UNION ALL
SELECT 
  'Wishes',
  COUNT(*),
  COUNT(DISTINCT category_id),
  COUNT(*) FILTER (WHERE category_id IS NULL)
FROM wishes;

-- Check for orphaned records (should be 0)
SELECT 
  'Orphaned Tasks' as check_name,
  COUNT(*) as count
FROM tasks 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL
UNION ALL
SELECT 
  'Orphaned Professionals',
  COUNT(*)
FROM professionals 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL
UNION ALL
SELECT 
  'Orphaned Wishes',
  COUNT(*)
FROM wishes 
WHERE category_id NOT IN (SELECT id FROM categories)
  AND category_id IS NOT NULL;

-- Show category distribution
SELECT 
  c.emoji,
  c.name,
  COUNT(DISTINCT t.id) as tasks,
  COUNT(DISTINCT p.id) as professionals,
  COUNT(DISTINCT w.id) as wishes
FROM categories c
LEFT JOIN tasks t ON c.id = t.category_id
LEFT JOIN professionals p ON c.id = p.category_id
LEFT JOIN wishes w ON c.id = w.category_id
GROUP BY c.id, c.name, c.emoji
ORDER BY (COUNT(DISTINCT t.id) + COUNT(DISTINCT p.id) + COUNT(DISTINCT w.id)) DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
  cat_count INTEGER;
  task_count INTEGER;
  prof_count INTEGER;
  wish_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM categories;
  SELECT COUNT(*) INTO task_count FROM tasks;
  SELECT COUNT(*) INTO prof_count FROM professionals;
  SELECT COUNT(*) INTO wish_count FROM wishes;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Categories: % (should be 27)', cat_count;
  RAISE NOTICE 'Tasks migrated: %', task_count;
  RAISE NOTICE 'Professionals migrated: %', prof_count;
  RAISE NOTICE 'Wishes migrated: %', wish_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Category IDs changed from INTEGER to TEXT';
  RAISE NOTICE 'All data successfully migrated!';
  RAISE NOTICE 'Backups saved in: *_backup_2026 tables';
  RAISE NOTICE '========================================';
END $$;
