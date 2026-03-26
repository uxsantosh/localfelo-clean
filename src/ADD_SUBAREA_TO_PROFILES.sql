-- =====================================================
-- ADD SUB-AREA COLUMNS TO PROFILES TABLE
-- =====================================================
-- This adds support for 3-level location in user profiles
-- =====================================================

-- 1. Add sub_area_id column (references sub_areas table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_area_id TEXT;

-- 2. Add sub_area column (stores sub-area name for display)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_area TEXT;

-- 3. Add foreign key constraint (optional - helps maintain data integrity)
-- Note: This uses ON DELETE SET NULL so if a sub-area is deleted, 
-- the user's profile won't be deleted, just the sub_area_id will be cleared
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_sub_area_id_fkey;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_sub_area_id_fkey 
FOREIGN KEY (sub_area_id) 
REFERENCES sub_areas(id) 
ON DELETE SET NULL;

-- 4. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_sub_area_id ON profiles(sub_area_id);

-- =====================================================
-- VERIFY THE CHANGES
-- =====================================================

-- Check if columns were added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('sub_area_id', 'sub_area')
ORDER BY column_name;

-- Expected output:
-- column_name  | data_type | is_nullable | column_default
-- -------------|-----------|-------------|---------------
-- sub_area     | text      | YES         | NULL
-- sub_area_id  | text      | YES         | NULL

-- =====================================================
-- TEST UPDATE (Optional - verify it works)
-- =====================================================

-- You can test if the columns work by updating your own profile:
/*
UPDATE profiles
SET 
  sub_area_id = 'sub-btm-3',
  sub_area = '29th Main'
WHERE id = auth.uid();
*/

-- Then verify:
/*
SELECT 
  id,
  name,
  city,
  area,
  sub_area,
  latitude,
  longitude
FROM profiles
WHERE id = auth.uid();
*/

-- =====================================================
-- ✅ ALL DONE!
-- =====================================================
-- After running this SQL:
-- 1. Refresh your browser
-- 2. Try setting location again
-- 3. Error should be gone! ✅
