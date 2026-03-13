-- =====================================================
-- FIX LOCATION COLUMN TYPES - Diagnostic & Fix
-- =====================================================
-- Problem: wishes/tasks might have UUID type for city_id/area_id/sub_area_id
-- But location tables use TEXT slugs
-- =====================================================

-- STEP 1: Check current column types
SELECT 
  '🔍 CHECKING WISHES TABLE LOCATION COLUMNS' as info;

SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'wishes'
  AND column_name IN ('city_id', 'area_id', 'sub_area_id')
ORDER BY column_name;

SELECT 
  '🔍 CHECKING TASKS TABLE LOCATION COLUMNS' as info;

SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'tasks'
  AND column_name IN ('city_id', 'area_id', 'sub_area_id')
ORDER BY column_name;

-- STEP 2: Check location tables column types
SELECT 
  '🔍 CHECKING LOCATION TABLES ID COLUMNS' as info;

SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name IN ('cities', 'areas', 'sub_areas')
  AND column_name = 'id'
ORDER BY table_name;

-- STEP 3: Fix if needed - Drop and recreate with correct type
-- First, drop the foreign key constraints
ALTER TABLE wishes DROP CONSTRAINT IF EXISTS wishes_city_id_fkey;
ALTER TABLE wishes DROP CONSTRAINT IF EXISTS wishes_area_id_fkey;
ALTER TABLE wishes DROP CONSTRAINT IF EXISTS wishes_sub_area_id_fkey;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_city_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_area_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_sub_area_id_fkey;

-- Convert wishes columns to TEXT if they are UUID
DO $$
BEGIN
  -- Check and convert wishes.city_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishes' 
    AND column_name = 'city_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE wishes ALTER COLUMN city_id TYPE TEXT USING city_id::TEXT;
    RAISE NOTICE '✅ Converted wishes.city_id from UUID to TEXT';
  ELSE
    RAISE NOTICE '✓ wishes.city_id is already TEXT';
  END IF;

  -- Check and convert wishes.area_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishes' 
    AND column_name = 'area_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE wishes ALTER COLUMN area_id TYPE TEXT USING area_id::TEXT;
    RAISE NOTICE '✅ Converted wishes.area_id from UUID to TEXT';
  ELSE
    RAISE NOTICE '✓ wishes.area_id is already TEXT';
  END IF;

  -- Check and convert wishes.sub_area_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishes' 
    AND column_name = 'sub_area_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE wishes ALTER COLUMN sub_area_id TYPE TEXT USING sub_area_id::TEXT;
    RAISE NOTICE '✅ Converted wishes.sub_area_id from UUID to TEXT';
  ELSE
    RAISE NOTICE '✓ wishes.sub_area_id is already TEXT';
  END IF;

  -- Check and convert tasks.city_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'city_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE tasks ALTER COLUMN city_id TYPE TEXT USING city_id::TEXT;
    RAISE NOTICE '✅ Converted tasks.city_id from UUID to TEXT';
  ELSE
    RAISE NOTICE '✓ tasks.city_id is already TEXT';
  END IF;

  -- Check and convert tasks.area_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'area_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE tasks ALTER COLUMN area_id TYPE TEXT USING area_id::TEXT;
    RAISE NOTICE '✅ Converted tasks.area_id from UUID to TEXT';
  ELSE
    RAISE NOTICE '✓ tasks.area_id is already TEXT';
  END IF;

  -- Check and convert tasks.sub_area_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'sub_area_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE tasks ALTER COLUMN sub_area_id TYPE TEXT USING sub_area_id::TEXT;
    RAISE NOTICE '✅ Converted tasks.sub_area_id from UUID to TEXT';
  ELSE
    RAISE NOTICE '✓ tasks.sub_area_id is already TEXT';
  END IF;
END $$;

-- STEP 4: Re-add foreign key constraints
ALTER TABLE wishes 
  ADD CONSTRAINT wishes_city_id_fkey 
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE;

ALTER TABLE wishes 
  ADD CONSTRAINT wishes_area_id_fkey 
  FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE;

ALTER TABLE wishes 
  ADD CONSTRAINT wishes_sub_area_id_fkey 
  FOREIGN KEY (sub_area_id) REFERENCES sub_areas(id) ON DELETE SET NULL;

ALTER TABLE tasks 
  ADD CONSTRAINT tasks_city_id_fkey 
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE;

ALTER TABLE tasks 
  ADD CONSTRAINT tasks_area_id_fkey 
  FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE;

ALTER TABLE tasks 
  ADD CONSTRAINT tasks_sub_area_id_fkey 
  FOREIGN KEY (sub_area_id) REFERENCES sub_areas(id) ON DELETE SET NULL;

-- STEP 5: Verify the fix
SELECT 
  '✅ VERIFICATION - ALL COLUMNS SHOULD BE TEXT NOW' as info;

SELECT 
  'wishes' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'wishes'
  AND column_name IN ('city_id', 'area_id', 'sub_area_id')
UNION ALL
SELECT 
  'tasks' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'tasks'
  AND column_name IN ('city_id', 'area_id', 'sub_area_id')
ORDER BY table_name, column_name;

SELECT 
  '🎉 DONE! Now you can run the seed script successfully.' as message;
