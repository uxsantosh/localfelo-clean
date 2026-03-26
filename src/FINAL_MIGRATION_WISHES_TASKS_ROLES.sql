-- =====================================================
-- FINAL MIGRATION: Add Role Support to Wishes & Tasks
-- Matches Professionals Module Schema
-- =====================================================
-- This migration adds role-based categorization to Wishes and Tasks
-- to match the Professionals module's simplified role system.
--
-- SAFE TO RUN MULTIPLE TIMES (idempotent)
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: Add Role Support to WISHES Table
-- =====================================================

-- Add role_id column (UUID, references roles table)
ALTER TABLE wishes 
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- Add subcategory_ids array (TEXT[], stores multiple subcategory IDs)
ALTER TABLE wishes 
  ADD COLUMN IF NOT EXISTS subcategory_ids TEXT[];

-- Add single subcategory_id for backward compatibility
ALTER TABLE wishes 
  ADD COLUMN IF NOT EXISTS subcategory_id TEXT;

-- Add helper_category (TEXT, for AI categorization)
-- This already exists based on code, but add if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishes' AND column_name = 'helper_category'
  ) THEN
    ALTER TABLE wishes ADD COLUMN helper_category TEXT;
  END IF;
END $$;

-- Add intent_type (TEXT, for AI categorization)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishes' AND column_name = 'intent_type'
  ) THEN
    ALTER TABLE wishes ADD COLUMN intent_type TEXT;
  END IF;
END $$;

-- =====================================================
-- PART 2: Add Role Support to TASKS Table
-- =====================================================

-- Add role_id column (UUID, references roles table)
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- Add subcategory_ids array (TEXT[], stores multiple subcategory IDs)
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS subcategory_ids TEXT[];

-- Add subcategory_id for backward compatibility (already exists as TEXT)
-- No need to add, already exists

-- Add helper_category if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'helper_category'
  ) THEN
    ALTER TABLE tasks ADD COLUMN helper_category TEXT;
  END IF;
END $$;

-- Add intent_type if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'intent_type'
  ) THEN
    ALTER TABLE tasks ADD COLUMN intent_type TEXT;
  END IF;
END $$;

-- =====================================================
-- PART 3: Create Indexes for Performance
-- =====================================================

-- Wishes indexes
CREATE INDEX IF NOT EXISTS idx_wishes_role_id ON wishes(role_id) WHERE role_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wishes_category_id ON wishes(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wishes_subcategory_id ON wishes(subcategory_id) WHERE subcategory_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wishes_helper_category ON wishes(helper_category) WHERE helper_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wishes_intent_type ON wishes(intent_type) WHERE intent_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status);
CREATE INDEX IF NOT EXISTS idx_wishes_user_id ON wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_city_area ON wishes(city_id, area_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_role_id ON tasks(role_id) WHERE role_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_subcategory ON tasks(subcategory) WHERE subcategory IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_helper_category ON tasks(helper_category) WHERE helper_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_city_area ON tasks(city_id, area_id);

-- Notifications indexes (for faster lookups)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_related_type_id ON notifications(related_type, related_id);

-- =====================================================
-- PART 4: Add Comments for Documentation
-- =====================================================

COMMENT ON COLUMN wishes.role_id IS 'Simplified role (e.g., Electrician, Plumber) - maps to backend categories via role_subcategories table';
COMMENT ON COLUMN wishes.category_id IS 'Original wish category (201-210 range) - kept for backward compatibility';
COMMENT ON COLUMN wishes.subcategory_id IS 'Single subcategory ID - for simple wish categorization';
COMMENT ON COLUMN wishes.subcategory_ids IS 'Array of subcategory IDs - for multi-service wishes (matches professionals)';
COMMENT ON COLUMN wishes.helper_category IS 'AI-detected helper category from wish text analysis';
COMMENT ON COLUMN wishes.intent_type IS 'AI-detected intent type (buy, rent, service, etc.)';

COMMENT ON COLUMN tasks.role_id IS 'Simplified role (e.g., Electrician, Plumber) - maps to backend categories via role_subcategories table';
COMMENT ON COLUMN tasks.category_id IS 'Original task category (301-309 range) - kept for backward compatibility';
COMMENT ON COLUMN tasks.subcategory IS 'Legacy subcategory field - kept for backward compatibility';
COMMENT ON COLUMN tasks.subcategory_ids IS 'Array of subcategory IDs - for multi-service tasks (matches professionals)';
COMMENT ON COLUMN tasks.helper_category IS 'AI-detected helper category from task text analysis';
COMMENT ON COLUMN tasks.intent_type IS 'AI-detected intent type from task analysis';

-- =====================================================
-- PART 5: Verify the Migration
-- =====================================================

-- Show wishes table structure
SELECT 
  '✅ WISHES TABLE - NEW COLUMNS' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'wishes'
  AND column_name IN ('role_id', 'category_id', 'subcategory_id', 'subcategory_ids', 'helper_category', 'intent_type')
ORDER BY column_name;

-- Show tasks table structure
SELECT 
  '✅ TASKS TABLE - NEW COLUMNS' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'tasks'
  AND column_name IN ('role_id', 'category_id', 'subcategory', 'subcategory_ids', 'helper_category', 'intent_type')
ORDER BY column_name;

-- Show professionals table for comparison
SELECT 
  '✅ PROFESSIONALS TABLE - EXISTING COLUMNS' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'professionals'
  AND column_name IN ('role_id', 'category_id', 'subcategory_id', 'subcategory_ids')
ORDER BY column_name;

-- Count roles
SELECT '✅ TOTAL ROLES' as info, COUNT(*) as count FROM roles WHERE is_active = true;

-- Count role-subcategory mappings
SELECT '✅ TOTAL ROLE-SUBCATEGORY MAPPINGS' as info, COUNT(*) as count FROM role_subcategories;

COMMIT;

-- =====================================================
-- SUCCESS! ✅
-- =====================================================
-- Your wishes and tasks tables now have:
-- ✓ role_id (UUID) for simplified role selection
-- ✓ subcategory_id (TEXT) for single subcategory
-- ✓ subcategory_ids (TEXT[]) for multiple subcategories
-- ✓ helper_category (TEXT) for AI categorization
-- ✓ intent_type (TEXT) for AI intent detection
-- ✓ All necessary indexes for fast queries
-- ✓ Matches professionals table structure
-- =====================================================
