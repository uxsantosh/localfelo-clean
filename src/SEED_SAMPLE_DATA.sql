-- =====================================================
-- SEED SAMPLE DATA - WISHES & TASKS
-- =====================================================
-- Creates realistic sample wishes and tasks across all cities
-- So the platform doesn't look empty at launch
-- =====================================================

DO $$
DECLARE
  v_admin_owner_token TEXT;
  v_city_bangalore UUID;
  v_city_mumbai UUID;
  v_city_delhi UUID;
  v_city_pune UUID;
  v_city_chennai UUID;
  v_city_hyderabad UUID;
  v_city_kolkata UUID;
  
  v_wishes_created INTEGER := 0;
  v_tasks_created INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🌱 SEEDING SAMPLE DATA...';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Get admin owner token
  SELECT owner_token INTO v_admin_owner_token
  FROM profiles 
  WHERE email = 'uxdesigner@gmail.com' AND is_admin = true;
  
  IF v_admin_owner_token IS NULL THEN
    RAISE EXCEPTION '❌ Admin user not found! Please create admin user first.';
  END IF;
  
  RAISE NOTICE '✅ Found admin user';
  RAISE NOTICE '';
  
  -- Get city IDs
  SELECT id INTO v_city_bangalore FROM cities WHERE name = 'Bangalore';
  SELECT id INTO v_city_mumbai FROM cities WHERE name = 'Mumbai';
  SELECT id INTO v_city_delhi FROM cities WHERE name = 'Delhi';
  SELECT id INTO v_city_pune FROM cities WHERE name = 'Pune';
  SELECT id INTO v_city_chennai FROM cities WHERE name = 'Chennai';
  SELECT id INTO v_city_hyderabad FROM cities WHERE name = 'Hyderabad';
  SELECT id INTO v_city_kolkata FROM cities WHERE name = 'Kolkata';
  
  -- =====================================================
  -- WISHES - BANGALORE
  -- =====================================================
  
  -- iPhone 15
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'iPhone 15',
    'Looking for iPhone 15 in good condition. Prefer blue or black color. Original box and accessories required.',
    35000, 45000,
    'flexible',
    'electronics',
    v_city_bangalore,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '6 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_bangalore AND a.name = 'BTM Layout'
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  -- Looking for laptop
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'Looking for laptop',
    'Need a laptop for college work. Preferably Dell or HP. Must have 8GB RAM minimum and good battery backup.',
    8000, 10997,
    'asap',
    'electronics',
    v_city_bangalore,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '22 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_bangalore AND a.name = 'HSR Layout'
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  -- Bike on rent
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'Bike on rent',
    'Need a bike on rent for 1 month. Prefer Activa or similar scooter. Must be in working condition.',
    500, 700,
    'today',
    'vehicles',
    v_city_bangalore,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '10 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_bangalore AND a.name = 'Indiranagar'
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  -- Study table
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'Study table with chair',
    'Looking for a study table with comfortable chair for my son. Should be sturdy and in good condition.',
    1500, 2500,
    'this_week',
    'furniture',
    v_city_bangalore,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '45 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_bangalore AND a.name = 'Koramangala'
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  -- =====================================================
  -- WISHES - MUMBAI
  -- =====================================================
  
  -- Hyundai i20
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'Hyundai i20 sport car',
    'Looking for Hyundai i20 sports variant 2020-2022 model. Prefer white or grey color. Must have good service history.',
    450000, 500000,
    'flexible',
    'vehicles',
    v_city_mumbai,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '3 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_mumbai
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  -- Sofa set
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'Sofa set 3+2',
    'Need a good quality sofa set (3 seater + 2 seater) for new home. Prefer brown or grey color.',
    15000, 25000,
    'asap',
    'furniture',
    v_city_mumbai,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '1 hour'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_mumbai
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  -- =====================================================
  -- WISHES - DELHI
  -- =====================================================
  
  -- Gaming console
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'PS5 or Xbox Series X',
    'Looking for gaming console - PS5 or Xbox Series X. Should include controllers and original box.',
    35000, 45000,
    'this_week',
    'electronics',
    v_city_delhi,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '2 hours'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_delhi
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  -- Washing machine
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'Washing machine',
    'Need automatic washing machine 6-7 kg capacity. Prefer Samsung or LG. Should be in working condition.',
    8000, 12000,
    'asap',
    'home_appliances',
    v_city_delhi,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '30 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_delhi
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  -- =====================================================
  -- WISHES - OTHER CITIES
  -- =====================================================
  
  -- Pune - Refrigerator
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'Double door fridge',
    'Looking for double door refrigerator 250L+ capacity. Prefer LG or Samsung. Should be working perfectly.',
    10000, 15000,
    'this_week',
    'home_appliances',
    v_city_pune,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '4 hours'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_pune
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  -- Chennai - Office desk
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'Office desk for WFH',
    'Need a large office desk for work from home setup. Should have drawers and cable management.',
    3000, 5000,
    'flexible',
    'furniture',
    v_city_chennai,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '1 hour'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_chennai
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  -- Hyderabad - Treadmill
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'Treadmill for home',
    'Looking for motorized treadmill for home gym. Should be in good working condition with warranty if possible.',
    15000, 25000,
    'asap',
    'sports',
    v_city_hyderabad,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '2 hours'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_hyderabad
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  -- Kolkata - Bookshelf
  INSERT INTO wishes (title, description, budget_min, budget_max, urgency, category, city_id, area_id, sub_area_id, owner_token, status, created_at)
  SELECT 
    'Wooden bookshelf',
    'Need a sturdy wooden bookshelf with 4-5 shelves. Should be able to hold heavy books.',
    2000, 4000,
    'this_week',
    'furniture',
    v_city_kolkata,
    a.id,
    s.id,
    v_admin_owner_token,
    'active',
    NOW() - INTERVAL '3 hours'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_kolkata
  LIMIT 1;
  v_wishes_created := v_wishes_created + 1;
  
  RAISE NOTICE '✅ Created % wishes', v_wishes_created;
  RAISE NOTICE '';
  
  -- =====================================================
  -- TASKS - BANGALORE
  -- =====================================================
  
  -- Guitar Trainer
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'Guitar Trainer',
    'Need guitar trainer for beginner level. 3 days a week, 1 hour per session. Can come to my place or I can come to yours.',
    3000,
    'education',
    'open',
    v_city_bangalore,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '18 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_bangalore AND a.name = 'BTM Layout'
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- Maths teacher
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'Maths teacher for PUC',
    'Need experienced maths teacher for PUC 2nd year student. Should cover complete syllabus. Home tuition preferred.',
    4000,
    'education',
    'open',
    v_city_bangalore,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '17 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_bangalore AND a.name = 'Jayanagar'
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- Home shifting
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'Shifting home - need to shift luggage from JP Nagar to Whitefield',
    'Need help with home shifting. 2 BHK apartment. Need packers and movers. Approximate distance 20 km.',
    1000,
    'home_services',
    'open',
    v_city_bangalore,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '14 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_bangalore AND a.name = 'JP Nagar'
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- House Painter
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'House Painter - need to paint 1000 sqft house',
    'Need experienced house painter for 2 BHK apartment (1000 sqft). Should complete in 3-4 days. Paint materials will be provided.',
    10000,
    'home_services',
    'open',
    v_city_bangalore,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '13 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_bangalore AND a.name = 'Banashankari'
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- AC repair
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'AC repair and servicing',
    'Need AC technician for split AC repair. Not cooling properly. Also need general servicing of 2 ACs.',
    1500,
    'repair',
    'open',
    v_city_bangalore,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '40 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_bangalore AND a.name = 'Whitefield'
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- =====================================================
  -- TASKS - MUMBAI
  -- =====================================================
  
  -- Plumber
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'Plumber needed urgently',
    'Need plumber for bathroom tap leak and kitchen sink blockage. Should be available today or tomorrow.',
    800,
    'repair',
    'open',
    v_city_mumbai,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '25 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_mumbai
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- Web developer
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'Website development for small business',
    'Need freelance web developer to create a simple website for my business. Should include contact form and gallery.',
    8000,
    'professional',
    'open',
    v_city_mumbai,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '2 hours'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_mumbai
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- =====================================================
  -- TASKS - DELHI
  -- =====================================================
  
  -- Electrician
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'Electrician for wiring work',
    'Need electrician for additional wiring in 2 rooms and installing new switchboards. Should provide materials.',
    3500,
    'repair',
    'open',
    v_city_delhi,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '1 hour'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_delhi
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- Yoga instructor
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'Yoga instructor for morning sessions',
    'Looking for yoga instructor for morning sessions (6:30-7:30 AM). Need someone experienced. Can be group or personal.',
    2500,
    'fitness',
    'open',
    v_city_delhi,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '3 hours'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_delhi
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- =====================================================
  -- TASKS - OTHER CITIES
  -- =====================================================
  
  -- Pune - Carpenter
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'Carpenter for furniture repair',
    'Need carpenter to repair bed, wardrobe door, and dining table. Should be experienced with wood work.',
    2000,
    'repair',
    'open',
    v_city_pune,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '50 minutes'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_pune
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- Chennai - English tutor
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'English spoken classes',
    'Need English tutor for improving spoken English and grammar. For working professional. Weekend batches preferred.',
    3000,
    'education',
    'open',
    v_city_chennai,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '4 hours'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_chennai
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- Hyderabad - Driver
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'Driver needed for office pickup-drop',
    'Looking for experienced driver for daily office pickup and drop. Morning 9 AM and evening 6 PM. Should know city well.',
    8000,
    'professional',
    'open',
    v_city_hyderabad,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '5 hours'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_hyderabad
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  -- Kolkata - Event photographer
  INSERT INTO tasks (title, description, budget, category, status, city_id, area_id, sub_area_id, owner_token, created_at)
  SELECT 
    'Photographer for birthday party',
    'Need photographer for kid''s birthday party on Saturday. Should provide edited photos within 3 days.',
    5000,
    'events',
    'open',
    v_city_kolkata,
    a.id,
    s.id,
    v_admin_owner_token,
    NOW() - INTERVAL '6 hours'
  FROM areas a
  LEFT JOIN sub_areas s ON s.area_id = a.id
  WHERE a.city_id = v_city_kolkata
  LIMIT 1;
  v_tasks_created := v_tasks_created + 1;
  
  RAISE NOTICE '✅ Created % tasks', v_tasks_created;
  RAISE NOTICE '';
  
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ SAMPLE DATA CREATED!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   • Wishes created: %', v_wishes_created;
  RAISE NOTICE '   • Tasks created: %', v_tasks_created;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Data spread across all 7 cities';
  RAISE NOTICE '🏷️  Multiple categories covered';
  RAISE NOTICE '⏰ Recent timestamps for realistic feel';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your platform is ready to launch!';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  
END $$;

-- Verify sample data
SELECT 
  '📊 Sample Data Verification' as section,
  (SELECT COUNT(*) FROM wishes WHERE owner_token IN (SELECT owner_token FROM profiles WHERE is_admin = true)) as wishes_created,
  (SELECT COUNT(*) FROM tasks WHERE owner_token IN (SELECT owner_token FROM profiles WHERE is_admin = true)) as tasks_created;

-- Show wishes by city
SELECT 
  '💫 Wishes by City' as section,
  c.name as city,
  COUNT(*) as wish_count,
  STRING_AGG(DISTINCT w.category, ', ') as categories
FROM wishes w
JOIN cities c ON w.city_id = c.id
WHERE w.owner_token IN (SELECT owner_token FROM profiles WHERE is_admin = true)
GROUP BY c.name
ORDER BY c.name;

-- Show tasks by city
SELECT 
  '⚡ Tasks by City' as section,
  c.name as city,
  COUNT(*) as task_count,
  STRING_AGG(DISTINCT t.category, ', ') as categories
FROM tasks t
JOIN cities c ON t.city_id = c.id
WHERE t.owner_token IN (SELECT owner_token FROM profiles WHERE is_admin = true)
GROUP BY c.name
ORDER BY c.name;
