-- =====================================================
-- POPULATE ROLES TABLE & MAP WISHES/TASKS
-- =====================================================
-- This migration:
-- 1. Populates the roles table with all professional roles
-- 2. Maps existing wishes/tasks to roles based on helper_category
-- 3. Sets up the role-based system for Wishes and Tasks modules
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Populate Roles Table
-- =====================================================

-- Clear existing roles if any
TRUNCATE TABLE roles CASCADE;

-- Insert all professional roles
INSERT INTO roles (name, display_order, is_active) VALUES
  -- Quick Help & General (display_order 1-10)
  ('Helper', 1, true),
  ('Errand Runner', 2, true),
  ('Packer & Mover', 3, true),
  ('Event Helper', 4, true),
  
  -- Repair & Maintenance (display_order 11-30)
  ('Electrician', 11, true),
  ('Plumber', 12, true),
  ('Carpenter', 13, true),
  ('AC Technician', 14, true),
  ('Appliance Repair', 15, true),
  ('Phone Repair', 16, true),
  ('Computer Repair', 17, true),
  ('TV Repair', 18, true),
  ('Washing Machine Repair', 19, true),
  ('Refrigerator Repair', 20, true),
  ('Microwave Repair', 21, true),
  ('Vehicle Mechanic', 22, true),
  
  -- Installation (display_order 31-40)
  ('AC Installation', 31, true),
  ('Appliance Installation', 32, true),
  ('TV Installation', 33, true),
  ('Furniture Assembly', 34, true),
  
  -- Home Services (display_order 41-50)
  ('Cleaner', 41, true),
  ('Pest Control', 42, true),
  ('Painter', 43, true),
  ('Gardener', 44, true),
  ('Security Guard', 45, true),
  ('Cook', 46, true),
  ('Maid', 47, true),
  
  -- Professional Services (display_order 51-70)
  ('Tutor', 51, true),
  ('Photographer', 52, true),
  ('Videographer', 53, true),
  ('Graphic Designer', 54, true),
  ('Web Developer', 55, true),
  ('Content Writer', 56, true),
  ('Consultant', 57, true),
  ('Accountant', 58, true),
  ('Lawyer', 59, true),
  ('Doctor', 60, true),
  ('Nurse', 61, true),
  ('Beautician', 62, true),
  ('Salon Professional', 63, true),
  ('Fitness Trainer', 64, true),
  ('Yoga Instructor', 65, true),
  
  -- Construction & Heavy Work (display_order 71-80)
  ('Mason', 71, true),
  ('Welder', 72, true),
  ('Fabricator', 73, true),
  ('Interior Designer', 74, true),
  ('Architect', 75, true),
  
  -- Transportation (display_order 81-90)
  ('Driver', 81, true),
  ('Delivery Person', 82, true),
  ('Courier', 83, true),
  
  -- Other Professionals (display_order 91-100)
  ('Tailor', 91, true),
  ('Barber', 92, true),
  ('DJ', 93, true),
  ('Caterer', 94, true),
  ('Musician', 95, true),
  ('Dancer', 96, true),
  ('Other Professional', 97, true);

-- =====================================================
-- STEP 2: Create Helper Category to Role Mapping
-- =====================================================

-- Create a temporary mapping table
CREATE TEMP TABLE helper_category_role_map AS
WITH role_lookup AS (
  SELECT id, name FROM roles
)
SELECT 
  'Quick Help' as helper_category,
  (SELECT id FROM role_lookup WHERE name = 'Helper') as role_id
UNION ALL
SELECT 'Repair', (SELECT id FROM role_lookup WHERE name = 'Electrician')
UNION ALL
SELECT 'Installation', (SELECT id FROM role_lookup WHERE name = 'AC Installation')
UNION ALL
SELECT 'Driver & Rides', (SELECT id FROM role_lookup WHERE name = 'Driver')
UNION ALL
SELECT 'Cleaning', (SELECT id FROM role_lookup WHERE name = 'Cleaner')
UNION ALL
SELECT 'Pest Control', (SELECT id FROM role_lookup WHERE name = 'Pest Control')
UNION ALL
SELECT 'Tutoring', (SELECT id FROM role_lookup WHERE name = 'Tutor')
UNION ALL
SELECT 'Beauty & Wellness', (SELECT id FROM role_lookup WHERE name = 'Beautician')
UNION ALL
SELECT 'Events & Entertainment', (SELECT id FROM role_lookup WHERE name = 'Event Helper')
UNION ALL
SELECT 'Professional Services', (SELECT id FROM role_lookup WHERE name = 'Consultant')
UNION ALL
SELECT 'Home Services', (SELECT id FROM role_lookup WHERE name = 'Cook')
UNION ALL
SELECT 'Photography & Video', (SELECT id FROM role_lookup WHERE name = 'Photographer')
UNION ALL
SELECT 'Moving & Packing', (SELECT id FROM role_lookup WHERE name = 'Packer & Mover')
UNION ALL
SELECT 'Painting', (SELECT id FROM role_lookup WHERE name = 'Painter')
UNION ALL
SELECT 'Construction', (SELECT id FROM role_lookup WHERE name = 'Mason')
UNION ALL
SELECT 'Other', (SELECT id FROM role_lookup WHERE name = 'Other Professional');

-- =====================================================
-- STEP 3: Update Wishes Table
-- =====================================================

-- Map wishes to roles based on helper_category
UPDATE wishes w
SET role_id = m.role_id
FROM helper_category_role_map m
WHERE w.helper_category = m.helper_category
  AND w.role_id IS NULL;

-- For wishes without helper_category, try to infer from title/description
-- (This is optional - you can skip if all wishes have helper_category)
UPDATE wishes w
SET role_id = (SELECT id FROM roles WHERE name = 'Other Professional')
WHERE w.role_id IS NULL
  AND w.helper_category IS NULL;

-- =====================================================
-- STEP 4: Update Tasks Table
-- =====================================================

-- Map tasks to roles based on helper_category
UPDATE tasks t
SET role_id = m.role_id
FROM helper_category_role_map m
WHERE t.helper_category = m.helper_category
  AND t.role_id IS NULL;

-- For tasks without helper_category, try to infer from title/description
UPDATE tasks t
SET role_id = (SELECT id FROM roles WHERE name = 'Other Professional')
WHERE t.role_id IS NULL
  AND t.helper_category IS NULL;

-- =====================================================
-- STEP 5: Verification & Statistics
-- =====================================================

DO $$
DECLARE
  role_count INT;
  wish_count INT;
  wish_mapped INT;
  wish_unmapped INT;
  task_count INT;
  task_mapped INT;
  task_unmapped INT;
BEGIN
  -- Count records
  SELECT COUNT(*) INTO role_count FROM roles;
  SELECT COUNT(*) INTO wish_count FROM wishes;
  SELECT COUNT(*) INTO wish_mapped FROM wishes WHERE role_id IS NOT NULL;
  SELECT COUNT(*) INTO wish_unmapped FROM wishes WHERE role_id IS NULL;
  SELECT COUNT(*) INTO task_count FROM tasks;
  SELECT COUNT(*) INTO task_mapped FROM tasks WHERE role_id IS NOT NULL;
  SELECT COUNT(*) INTO task_unmapped FROM tasks WHERE role_id IS NULL;
  
  -- Display results
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 ROLES TABLE:';
  RAISE NOTICE '  Total roles created: %', role_count;
  RAISE NOTICE '';
  RAISE NOTICE '📊 WISHES TABLE:';
  RAISE NOTICE '  Total wishes: %', wish_count;
  RAISE NOTICE '  Mapped to roles: %', wish_mapped;
  RAISE NOTICE '  Unmapped: %', wish_unmapped;
  RAISE NOTICE '';
  RAISE NOTICE '📊 TASKS TABLE:';
  RAISE NOTICE '  Total tasks: %', task_count;
  RAISE NOTICE '  Mapped to roles: %', task_mapped;
  RAISE NOTICE '  Unmapped: %', task_unmapped;
  RAISE NOTICE '';
  
  IF wish_unmapped > 0 OR task_unmapped > 0 THEN
    RAISE NOTICE '⚠️  WARNING: Some records could not be mapped to roles';
    RAISE NOTICE '   These have been assigned to "Other Professional"';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- Show sample roles
SELECT 
  'Sample Roles (first 10):' as section,
  name,
  display_order,
  is_active
FROM roles
ORDER BY display_order
LIMIT 10;

-- Show role distribution in wishes
SELECT 
  'Wishes by Role:' as section,
  r.name as role_name,
  COUNT(w.id) as count
FROM roles r
LEFT JOIN wishes w ON w.role_id = r.id
GROUP BY r.id, r.name
HAVING COUNT(w.id) > 0
ORDER BY COUNT(w.id) DESC
LIMIT 10;

-- Show role distribution in tasks
SELECT 
  'Tasks by Role:' as section,
  r.name as role_name,
  COUNT(t.id) as count
FROM roles r
LEFT JOIN tasks t ON t.role_id = r.id
GROUP BY r.id, r.name
HAVING COUNT(t.id) > 0
ORDER BY COUNT(t.id) DESC
LIMIT 10;

COMMIT;

-- =====================================================
-- 🎉 MIGRATION COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Verify the roles table is populated
-- 2. Check that wishes/tasks are mapped to roles
-- 3. Update frontend to use role-based filtering
-- 4. Test the Wishes and Tasks modules
-- =====================================================
