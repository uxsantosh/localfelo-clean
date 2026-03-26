-- =====================================================
-- Add Missing Columns to Tasks and Wishes Tables
-- =====================================================
-- This adds ONLY the columns that are missing from the database
-- but are used in the TypeScript code

-- =====================================================
-- PART 1: FIX TASKS TABLE
-- =====================================================
-- Tasks should have: price (already exists), status, latitude, longitude, etc.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_window TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS helper_id UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS accepted_by UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS accepted_price NUMERIC;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add constraints for status
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('open', 'negotiating', 'accepted', 'in_progress', 'completed', 'cancelled', 'closed'));

-- Add constraints for time_window
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_time_window_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_time_window_check 
  CHECK (time_window IN ('asap', 'today', 'tomorrow') OR time_window IS NULL);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_time_window ON tasks(time_window);
CREATE INDEX IF NOT EXISTS idx_tasks_latitude ON tasks(latitude);
CREATE INDEX IF NOT EXISTS idx_tasks_longitude ON tasks(longitude);
CREATE INDEX IF NOT EXISTS idx_tasks_helper_id ON tasks(helper_id);
CREATE INDEX IF NOT EXISTS idx_tasks_accepted_by ON tasks(accepted_by);

-- =====================================================
-- PART 2: FIX WISHES TABLE  
-- =====================================================
-- Wishes should have: budget_min, budget_max (already exist), status, urgency, latitude, longitude, etc.

ALTER TABLE wishes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'flexible';
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS helper_category TEXT;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS intent_type TEXT;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS accepted_by UUID;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS accepted_price NUMERIC;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS category_emoji TEXT;

-- Add constraints for status
ALTER TABLE wishes DROP CONSTRAINT IF EXISTS wishes_status_check;
ALTER TABLE wishes ADD CONSTRAINT wishes_status_check 
  CHECK (status IN ('open', 'negotiating', 'accepted', 'in_progress', 'completed', 'fulfilled', 'expired', 'cancelled'));

-- Add constraints for urgency
ALTER TABLE wishes DROP CONSTRAINT IF EXISTS wishes_urgency_check;
ALTER TABLE wishes ADD CONSTRAINT wishes_urgency_check 
  CHECK (urgency IN ('asap', 'today', 'flexible'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status);
CREATE INDEX IF NOT EXISTS idx_wishes_urgency ON wishes(urgency);
CREATE INDEX IF NOT EXISTS idx_wishes_latitude ON wishes(latitude);
CREATE INDEX IF NOT EXISTS idx_wishes_longitude ON wishes(longitude);
CREATE INDEX IF NOT EXISTS idx_wishes_accepted_by ON wishes(accepted_by);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tasks table columns
SELECT 'TASKS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name IN ('price', 'status', 'latitude', 'longitude', 'helper_id')
ORDER BY column_name;

-- Check wishes table columns
SELECT 'WISHES TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'wishes' 
  AND column_name IN ('budget_min', 'budget_max', 'status', 'urgency', 'latitude', 'longitude')
ORDER BY column_name;

-- Check sample tasks (should show price, status, coordinates)
SELECT 'SAMPLE TASKS:' as info;
SELECT id, title, price, status, latitude, longitude
FROM tasks 
ORDER BY created_at DESC 
LIMIT 3;

-- Check sample wishes (should show budget range, status, urgency, coordinates)
SELECT 'SAMPLE WISHES:' as info;
SELECT id, title, budget_min, budget_max, status, urgency, latitude, longitude
FROM wishes 
ORDER BY created_at DESC 
LIMIT 3;
