-- =====================================================
-- DATA MIGRATION: Populate role_id for existing wishes and tasks
-- =====================================================
-- This script maps existing category/subcategory combinations to role_id
-- Run this AFTER the schema migration is complete

-- =====================================================
-- SECTION 1: Analyze Existing Data
-- =====================================================

-- Check what categories/subcategories exist in wishes
SELECT 
  '1️⃣ EXISTING WISH CATEGORIES' as info,
  category,
  subcategory,
  COUNT(*) as count
FROM wishes
WHERE role_id IS NULL
GROUP BY category, subcategory
ORDER BY count DESC;

-- Check what categories/subcategories exist in tasks
SELECT 
  '2️⃣ EXISTING TASK CATEGORIES' as info,
  category,
  subcategory,
  COUNT(*) as count
FROM tasks
WHERE role_id IS NULL
GROUP BY category, subcategory
ORDER BY count DESC;

-- =====================================================
-- SECTION 2: Map Wishes to Roles
-- =====================================================

-- Update wishes with role_id based on category/subcategory mapping
DO $$
DECLARE
  updated_count INT := 0;
BEGIN
  -- Map each category/subcategory combination to the appropriate role_id
  
  -- HOME SERVICES
  UPDATE wishes w
  SET role_id = r.id
  FROM roles r
  WHERE w.role_id IS NULL
    AND w.category = 'home_services'
    AND (
      (w.subcategory = 'plumbing' AND r.name = 'Plumber') OR
      (w.subcategory = 'electrical' AND r.name = 'Electrician') OR
      (w.subcategory = 'carpentry' AND r.name = 'Carpenter') OR
      (w.subcategory = 'painting' AND r.name = 'Painter') OR
      (w.subcategory = 'cleaning' AND r.name = 'House Cleaner') OR
      (w.subcategory = 'pest_control' AND r.name = 'Pest Control') OR
      (w.subcategory = 'ac_repair' AND r.name = 'AC Technician') OR
      (w.subcategory = 'appliance_repair' AND r.name = 'Appliance Repair')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % wishes with HOME SERVICES roles', updated_count;
  
  -- CONSTRUCTION
  updated_count := 0;
  UPDATE wishes w
  SET role_id = r.id
  FROM roles r
  WHERE w.role_id IS NULL
    AND w.category = 'construction'
    AND (
      (w.subcategory = 'mason' AND r.name = 'Mason') OR
      (w.subcategory = 'contractor' AND r.name = 'Contractor') OR
      (w.subcategory = 'architect' AND r.name = 'Architect') OR
      (w.subcategory = 'interior_designer' AND r.name = 'Interior Designer')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % wishes with CONSTRUCTION roles', updated_count;
  
  -- BEAUTY & WELLNESS
  updated_count := 0;
  UPDATE wishes w
  SET role_id = r.id
  FROM roles r
  WHERE w.role_id IS NULL
    AND w.category = 'beauty_wellness'
    AND (
      (w.subcategory = 'salon' AND r.name = 'Beautician') OR
      (w.subcategory = 'spa' AND r.name = 'Spa Therapist') OR
      (w.subcategory = 'massage' AND r.name = 'Massage Therapist') OR
      (w.subcategory = 'yoga' AND r.name = 'Yoga Instructor') OR
      (w.subcategory = 'gym_trainer' AND r.name = 'Fitness Trainer')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % wishes with BEAUTY & WELLNESS roles', updated_count;
  
  -- EDUCATION & TRAINING
  updated_count := 0;
  UPDATE wishes w
  SET role_id = r.id
  FROM roles r
  WHERE w.role_id IS NULL
    AND w.category = 'education'
    AND (
      (w.subcategory = 'tutor' AND r.name = 'Tutor') OR
      (w.subcategory = 'music_teacher' AND r.name = 'Music Teacher') OR
      (w.subcategory = 'dance_teacher' AND r.name = 'Dance Teacher') OR
      (w.subcategory = 'language_teacher' AND r.name = 'Language Tutor') OR
      (w.subcategory = 'art_teacher' AND r.name = 'Art Teacher')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % wishes with EDUCATION roles', updated_count;
  
  -- EVENTS & ENTERTAINMENT
  updated_count := 0;
  UPDATE wishes w
  SET role_id = r.id
  FROM roles r
  WHERE w.role_id IS NULL
    AND w.category = 'events'
    AND (
      (w.subcategory = 'photographer' AND r.name = 'Photographer') OR
      (w.subcategory = 'videographer' AND r.name = 'Videographer') OR
      (w.subcategory = 'caterer' AND r.name = 'Caterer') OR
      (w.subcategory = 'event_planner' AND r.name = 'Event Planner') OR
      (w.subcategory = 'dj' AND r.name = 'DJ') OR
      (w.subcategory = 'decorator' AND r.name = 'Decorator') OR
      (w.subcategory = 'musician' AND r.name = 'Musician')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % wishes with EVENTS roles', updated_count;
  
  -- VEHICLE SERVICES
  updated_count := 0;
  UPDATE wishes w
  SET role_id = r.id
  FROM roles r
  WHERE w.role_id IS NULL
    AND w.category = 'vehicle_services'
    AND (
      (w.subcategory = 'mechanic' AND r.name = 'Mechanic') OR
      (w.subcategory = 'car_wash' AND r.name = 'Car Washer') OR
      (w.subcategory = 'driver' AND r.name = 'Driver')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % wishes with VEHICLE SERVICES roles', updated_count;
  
  -- BUSINESS SERVICES
  updated_count := 0;
  UPDATE wishes w
  SET role_id = r.id
  FROM roles r
  WHERE w.role_id IS NULL
    AND w.category = 'business_services'
    AND (
      (w.subcategory = 'accountant' AND r.name = 'Accountant') OR
      (w.subcategory = 'lawyer' AND r.name = 'Lawyer') OR
      (w.subcategory = 'web_developer' AND r.name = 'Web Developer') OR
      (w.subcategory = 'graphic_designer' AND r.name = 'Graphic Designer') OR
      (w.subcategory = 'content_writer' AND r.name = 'Content Writer')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % wishes with BUSINESS SERVICES roles', updated_count;
  
  -- DELIVERY & LOGISTICS
  updated_count := 0;
  UPDATE wishes w
  SET role_id = r.id
  FROM roles r
  WHERE w.role_id IS NULL
    AND w.category = 'delivery'
    AND (
      (w.subcategory = 'delivery_person' AND r.name = 'Delivery Person') OR
      (w.subcategory = 'packers_movers' AND r.name = 'Packers & Movers')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % wishes with DELIVERY roles', updated_count;
  
  -- HEALTHCARE
  updated_count := 0;
  UPDATE wishes w
  SET role_id = r.id
  FROM roles r
  WHERE w.role_id IS NULL
    AND w.category = 'healthcare'
    AND (
      (w.subcategory = 'doctor' AND r.name = 'Doctor') OR
      (w.subcategory = 'nurse' AND r.name = 'Nurse') OR
      (w.subcategory = 'physiotherapist' AND r.name = 'Physiotherapist') OR
      (w.subcategory = 'dietitian' AND r.name = 'Dietitian')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % wishes with HEALTHCARE roles', updated_count;
  
  -- PET SERVICES
  updated_count := 0;
  UPDATE wishes w
  SET role_id = r.id
  FROM roles r
  WHERE w.role_id IS NULL
    AND w.category = 'pet_services'
    AND (
      (w.subcategory = 'veterinarian' AND r.name = 'Veterinarian') OR
      (w.subcategory = 'pet_groomer' AND r.name = 'Pet Groomer') OR
      (w.subcategory = 'pet_trainer' AND r.name = 'Pet Trainer')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % wishes with PET SERVICES roles', updated_count;
  
END $$;

-- =====================================================
-- SECTION 3: Map Tasks to Roles
-- =====================================================

-- Update tasks with role_id based on category/subcategory mapping
DO $$
DECLARE
  updated_count INT := 0;
BEGIN
  -- Map each category/subcategory combination to the appropriate role_id
  
  -- HOME SERVICES
  UPDATE tasks t
  SET role_id = r.id
  FROM roles r
  WHERE t.role_id IS NULL
    AND t.category = 'home_services'
    AND (
      (t.subcategory = 'plumbing' AND r.name = 'Plumber') OR
      (t.subcategory = 'electrical' AND r.name = 'Electrician') OR
      (t.subcategory = 'carpentry' AND r.name = 'Carpenter') OR
      (t.subcategory = 'painting' AND r.name = 'Painter') OR
      (t.subcategory = 'cleaning' AND r.name = 'House Cleaner') OR
      (t.subcategory = 'pest_control' AND r.name = 'Pest Control') OR
      (t.subcategory = 'ac_repair' AND r.name = 'AC Technician') OR
      (t.subcategory = 'appliance_repair' AND r.name = 'Appliance Repair')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % tasks with HOME SERVICES roles', updated_count;
  
  -- CONSTRUCTION
  updated_count := 0;
  UPDATE tasks t
  SET role_id = r.id
  FROM roles r
  WHERE t.role_id IS NULL
    AND t.category = 'construction'
    AND (
      (t.subcategory = 'mason' AND r.name = 'Mason') OR
      (t.subcategory = 'contractor' AND r.name = 'Contractor') OR
      (t.subcategory = 'architect' AND r.name = 'Architect') OR
      (t.subcategory = 'interior_designer' AND r.name = 'Interior Designer')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % tasks with CONSTRUCTION roles', updated_count;
  
  -- BEAUTY & WELLNESS
  updated_count := 0;
  UPDATE tasks t
  SET role_id = r.id
  FROM roles r
  WHERE t.role_id IS NULL
    AND t.category = 'beauty_wellness'
    AND (
      (t.subcategory = 'salon' AND r.name = 'Beautician') OR
      (t.subcategory = 'spa' AND r.name = 'Spa Therapist') OR
      (t.subcategory = 'massage' AND r.name = 'Massage Therapist') OR
      (t.subcategory = 'yoga' AND r.name = 'Yoga Instructor') OR
      (t.subcategory = 'gym_trainer' AND r.name = 'Fitness Trainer')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % tasks with BEAUTY & WELLNESS roles', updated_count;
  
  -- EDUCATION & TRAINING
  updated_count := 0;
  UPDATE tasks t
  SET role_id = r.id
  FROM roles r
  WHERE t.role_id IS NULL
    AND t.category = 'education'
    AND (
      (t.subcategory = 'tutor' AND r.name = 'Tutor') OR
      (t.subcategory = 'music_teacher' AND r.name = 'Music Teacher') OR
      (t.subcategory = 'dance_teacher' AND r.name = 'Dance Teacher') OR
      (t.subcategory = 'language_teacher' AND r.name = 'Language Tutor') OR
      (t.subcategory = 'art_teacher' AND r.name = 'Art Teacher')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % tasks with EDUCATION roles', updated_count;
  
  -- EVENTS & ENTERTAINMENT
  updated_count := 0;
  UPDATE tasks t
  SET role_id = r.id
  FROM roles r
  WHERE t.role_id IS NULL
    AND t.category = 'events'
    AND (
      (t.subcategory = 'photographer' AND r.name = 'Photographer') OR
      (t.subcategory = 'videographer' AND r.name = 'Videographer') OR
      (t.subcategory = 'caterer' AND r.name = 'Caterer') OR
      (t.subcategory = 'event_planner' AND r.name = 'Event Planner') OR
      (t.subcategory = 'dj' AND r.name = 'DJ') OR
      (t.subcategory = 'decorator' AND r.name = 'Decorator') OR
      (t.subcategory = 'musician' AND r.name = 'Musician')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % tasks with EVENTS roles', updated_count;
  
  -- VEHICLE SERVICES
  updated_count := 0;
  UPDATE tasks t
  SET role_id = r.id
  FROM roles r
  WHERE t.role_id IS NULL
    AND t.category = 'vehicle_services'
    AND (
      (t.subcategory = 'mechanic' AND r.name = 'Mechanic') OR
      (t.subcategory = 'car_wash' AND r.name = 'Car Washer') OR
      (t.subcategory = 'driver' AND r.name = 'Driver')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % tasks with VEHICLE SERVICES roles', updated_count;
  
  -- BUSINESS SERVICES
  updated_count := 0;
  UPDATE tasks t
  SET role_id = r.id
  FROM roles r
  WHERE t.role_id IS NULL
    AND t.category = 'business_services'
    AND (
      (t.subcategory = 'accountant' AND r.name = 'Accountant') OR
      (t.subcategory = 'lawyer' AND r.name = 'Lawyer') OR
      (t.subcategory = 'web_developer' AND r.name = 'Web Developer') OR
      (t.subcategory = 'graphic_designer' AND r.name = 'Graphic Designer') OR
      (t.subcategory = 'content_writer' AND r.name = 'Content Writer')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % tasks with BUSINESS SERVICES roles', updated_count;
  
  -- DELIVERY & LOGISTICS
  updated_count := 0;
  UPDATE tasks t
  SET role_id = r.id
  FROM roles r
  WHERE t.role_id IS NULL
    AND t.category = 'delivery'
    AND (
      (t.subcategory = 'delivery_person' AND r.name = 'Delivery Person') OR
      (t.subcategory = 'packers_movers' AND r.name = 'Packers & Movers')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % tasks with DELIVERY roles', updated_count;
  
  -- HEALTHCARE
  updated_count := 0;
  UPDATE tasks t
  SET role_id = r.id
  FROM roles r
  WHERE t.role_id IS NULL
    AND t.category = 'healthcare'
    AND (
      (t.subcategory = 'doctor' AND r.name = 'Doctor') OR
      (t.subcategory = 'nurse' AND r.name = 'Nurse') OR
      (t.subcategory = 'physiotherapist' AND r.name = 'Physiotherapist') OR
      (t.subcategory = 'dietitian' AND r.name = 'Dietitian')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % tasks with HEALTHCARE roles', updated_count;
  
  -- PET SERVICES
  updated_count := 0;
  UPDATE tasks t
  SET role_id = r.id
  FROM roles r
  WHERE t.role_id IS NULL
    AND t.category = 'pet_services'
    AND (
      (t.subcategory = 'veterinarian' AND r.name = 'Veterinarian') OR
      (t.subcategory = 'pet_groomer' AND r.name = 'Pet Groomer') OR
      (t.subcategory = 'pet_trainer' AND r.name = 'Pet Trainer')
    );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % tasks with PET SERVICES roles', updated_count;
  
END $$;

-- =====================================================
-- SECTION 4: Verify Data Migration Results
-- =====================================================

-- Show final counts for wishes
SELECT 
  '3️⃣ WISHES AFTER MIGRATION' as info,
  COUNT(*) as total_wishes,
  COUNT(role_id) as wishes_with_role,
  COUNT(*) - COUNT(role_id) as wishes_without_role
FROM wishes;

-- Show final counts for tasks
SELECT 
  '4️⃣ TASKS AFTER MIGRATION' as info,
  COUNT(*) as total_tasks,
  COUNT(role_id) as tasks_with_role,
  COUNT(*) - COUNT(role_id) as tasks_without_role
FROM tasks;

-- Show unmapped wishes (if any)
SELECT 
  '5️⃣ UNMAPPED WISHES (need manual review)' as info,
  id,
  title,
  category,
  subcategory
FROM wishes
WHERE role_id IS NULL
ORDER BY created_at DESC;

-- Show unmapped tasks (if any)
SELECT 
  '6️⃣ UNMAPPED TASKS (need manual review)' as info,
  id,
  title,
  category,
  subcategory
FROM tasks
WHERE role_id IS NULL
ORDER BY created_at DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ ✅ ✅ DATA MIGRATION COMPLETE! ✅ ✅ ✅';
  RAISE NOTICE 'ℹ️ Wishes and Tasks have been mapped to roles';
  RAISE NOTICE 'ℹ️ Check sections 5️⃣ and 6️⃣ for any unmapped records';
  RAISE NOTICE 'ℹ️ Unmapped records need manual role assignment';
END $$;
