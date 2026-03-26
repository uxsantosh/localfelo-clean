-- =====================================================
-- MIGRATE EXISTING PROFESSIONALS TO ROLE-BASED SYSTEM
-- =====================================================
-- This script updates existing professionals to work with the new role-based system
-- by populating subcategory_ids array from subcategory_id field

-- Step 1: Populate subcategory_ids array from existing subcategory_id
UPDATE professionals
SET subcategory_ids = ARRAY[subcategory_id]
WHERE subcategory_id IS NOT NULL
  AND (subcategory_ids IS NULL OR subcategory_ids = '{}');

-- Step 2: Try to auto-assign role_id based on subcategory_id
-- Find matching role for each professional based on their subcategory
UPDATE professionals p
SET role_id = rs.role_id
FROM (
  SELECT DISTINCT ON (prof.id) 
    prof.id as prof_id, 
    rs.role_id
  FROM professionals prof
  JOIN role_subcategories rs 
    ON rs.subcategory_id = prof.subcategory_id
  WHERE prof.role_id IS NULL
    AND prof.subcategory_id IS NOT NULL
) rs
WHERE p.id = rs.prof_id
  AND p.role_id IS NULL;

-- Step 3: For professionals without a role, assign to "Other" role
UPDATE professionals
SET role_id = (SELECT id FROM roles WHERE name = 'Other' LIMIT 1)
WHERE role_id IS NULL;

-- Log migration results
DO $$
DECLARE
  total_count INTEGER;
  with_role_count INTEGER;
  with_subcategories_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM professionals;
  SELECT COUNT(*) INTO with_role_count FROM professionals WHERE role_id IS NOT NULL;
  SELECT COUNT(*) INTO with_subcategories_count FROM professionals WHERE subcategory_ids IS NOT NULL AND array_length(subcategory_ids, 1) > 0;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PROFESSIONALS MIGRATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total professionals: %', total_count;
  RAISE NOTICE 'With role assigned: %', with_role_count;
  RAISE NOTICE 'With subcategories array: %', with_subcategories_count;
  RAISE NOTICE '========================================';
END $$;
