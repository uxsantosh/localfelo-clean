-- =====================================================
-- COMPREHENSIVE SEED DATA - WISHES & TASKS
-- =====================================================
-- Creates at least 1 wish and 1 task for EVERY city and EVERY area
-- So the entire platform looks populated across all locations
-- =====================================================

DO $$
DECLARE
  v_admin_owner_token TEXT;
  v_city_id TEXT;
  v_city_name TEXT;
  v_area_id TEXT;
  v_area_name TEXT;
  v_subarea_id TEXT;
  v_wishes_created INTEGER := 0;
  v_tasks_created INTEGER := 0;
  v_wish_titles TEXT[] := ARRAY[
    'iPhone 15', 'MacBook Air', 'Gaming Laptop', 'iPad Pro', 'Samsung Galaxy S24',
    'OnePlus 12', 'Sony PS5', 'Xbox Series X', 'Nintendo Switch', 'AirPods Pro',
    'Looking for bike', 'Scooty needed', 'Royal Enfield', 'Activa on rent', 'Bicycle',
    'Study table', 'Office chair', 'Sofa set 3+2', 'Dining table', 'Double bed',
    'Bookshelf', 'Wardrobe', 'TV stand', 'Computer desk', 'Bean bag',
    'Refrigerator', 'Washing machine', 'AC 1.5 ton', 'Microwave oven', 'Air cooler',
    'Water purifier', 'Ceiling fan', 'Mixer grinder', 'Rice cooker', 'Induction cooker',
    'DSLR camera', 'GoPro', 'Drone', 'Tripod stand', 'Ring light',
    'Treadmill', 'Dumbbells set', 'Yoga mat', 'Cycle', 'Cricket bat',
    'Guitar', 'Keyboard', 'Drums', 'Tabla', 'Flute',
    '1 BHK apartment', '2 BHK house', 'PG accommodation', 'Shop space', 'Office space'
  ];
  v_wish_categories TEXT[] := ARRAY[
    'electronics', 'electronics', 'electronics', 'electronics', 'electronics',
    'electronics', 'electronics', 'electronics', 'electronics', 'electronics',
    'vehicles', 'vehicles', 'vehicles', 'vehicles', 'vehicles',
    'furniture', 'furniture', 'furniture', 'furniture', 'furniture',
    'furniture', 'furniture', 'furniture', 'furniture', 'furniture',
    'home_appliances', 'home_appliances', 'home_appliances', 'home_appliances', 'home_appliances',
    'home_appliances', 'home_appliances', 'home_appliances', 'home_appliances', 'home_appliances',
    'electronics', 'electronics', 'electronics', 'electronics', 'electronics',
    'sports', 'sports', 'sports', 'sports', 'sports',
    'hobbies', 'hobbies', 'hobbies', 'hobbies', 'hobbies',
    'real_estate', 'real_estate', 'real_estate', 'real_estate', 'real_estate'
  ];
  v_wish_descriptions TEXT[] := ARRAY[
    'Looking for in good condition with original accessories.',
    'Need urgently for college/office work.',
    'Prefer recent model in working condition.',
    'Should be well maintained with proper service history.',
    'Looking for at reasonable price. Negotiable.',
    'Need for personal use. Can pickup from your location.',
    'Searching for genuine seller in nearby area.',
    'Want to buy or rent. Contact if available.',
    'Looking for original with bill and warranty.',
    'Interested in buying. Please share details and price.'
  ];
  
  v_task_titles TEXT[] := ARRAY[
    'Plumber needed urgently', 'Electrician for wiring work', 'Carpenter for furniture repair',
    'AC repair and servicing', 'Washing machine repair', 'Refrigerator service',
    'House cleaning service', 'Bathroom deep cleaning', 'Kitchen chimney cleaning',
    'Painting work - 2BHK', 'Wall putty and painting', 'Exterior painting needed',
    'Home shifting help', 'Office relocation', 'Furniture moving service',
    'Laptop repair', 'Mobile screen replacement', 'Computer formatting',
    'Guitar trainer needed', 'Piano classes', 'Vocal music teacher',
    'Math tuition for 10th', 'English spoken classes', 'Science tutor needed',
    'Yoga instructor', 'Gym trainer at home', 'Zumba classes',
    'Web developer needed', 'Graphic designer', 'Content writer',
    'CA for ITR filing', 'Legal consultation', 'Business registration help',
    'Event photographer', 'Birthday party decoration', 'Wedding photography',
    'Driver for office', 'Cook/Maid needed', 'Security guard required',
    'Gardening service', 'Pest control needed', 'Water tank cleaning'
  ];
  v_task_categories TEXT[] := ARRAY[
    'repair', 'repair', 'repair',
    'repair', 'repair', 'repair',
    'home_services', 'home_services', 'home_services',
    'home_services', 'home_services', 'home_services',
    'home_services', 'home_services', 'home_services',
    'repair', 'repair', 'repair',
    'education', 'education', 'education',
    'education', 'education', 'education',
    'fitness', 'fitness', 'fitness',
    'professional', 'professional', 'professional',
    'professional', 'professional', 'professional',
    'events', 'events', 'events',
    'professional', 'home_services', 'home_services',
    'home_services', 'home_services', 'home_services'
  ];
  v_task_descriptions TEXT[] := ARRAY[
    'Need experienced professional for this work. Should complete on time.',
    'Looking for reliable service provider in nearby area.',
    'Urgent requirement. Contact immediately if available.',
    'Need someone skilled and trustworthy. Fair payment assured.',
    'Regular work opportunity. Long term if work is good.',
    'Should have own tools and materials.',
    'Flexible timings. Can discuss and finalize.',
    'Quality work expected. References appreciated.',
    'Please quote your charges before starting work.',
    'Immediate requirement. Contact with your rates.'
  ];
  
  v_random_wish_idx INTEGER;
  v_random_task_idx INTEGER;
  v_random_desc_idx INTEGER;
  v_urgency TEXT[] := ARRAY['today', 'asap', 'this_week', 'flexible'];
  v_budget_ranges INTEGER[][] := ARRAY[
    ARRAY[1000, 3000], ARRAY[3000, 5000], ARRAY[5000, 10000],
    ARRAY[10000, 20000], ARRAY[20000, 50000], ARRAY[50000, 100000]
  ];
  v_task_budgets INTEGER[] := ARRAY[500, 800, 1000, 1500, 2000, 3000, 4000, 5000, 8000, 10000, 15000, 20000];
  
  city_cursor CURSOR FOR SELECT id, name FROM cities ORDER BY name;
  area_cursor CURSOR (p_city_id TEXT) FOR SELECT id, name FROM areas WHERE city_id = p_city_id ORDER BY name;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🌱 SEEDING COMPREHENSIVE DATA FOR ALL CITIES & AREAS...';
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
  RAISE NOTICE '🔄 Starting data generation...';
  RAISE NOTICE '';
  
  -- Loop through all cities
  FOR city_rec IN city_cursor LOOP
    v_city_id := city_rec.id;
    v_city_name := city_rec.name;
    RAISE NOTICE '📍 Processing: %', v_city_name;
    
    -- Loop through all areas in this city
    FOR area_rec IN area_cursor(v_city_id) LOOP
      v_area_id := area_rec.id;
      v_area_name := area_rec.name;
      
      -- Get first subarea for this area (if exists)
      v_subarea_id := NULL;
      SELECT id INTO v_subarea_id 
      FROM sub_areas 
      WHERE area_id = v_area_id 
      LIMIT 1;
      
      -- ===== CREATE WISH =====
      v_random_wish_idx := 1 + floor(random() * array_length(v_wish_titles, 1))::integer;
      v_random_desc_idx := 1 + floor(random() * array_length(v_wish_descriptions, 1))::integer;
      
      INSERT INTO wishes (
        title, 
        description, 
        budget_min, 
        budget_max, 
        urgency, 
        category, 
        city_id, 
        area_id, 
        sub_area_id,
        owner_token, 
        status, 
        created_at
      )
      VALUES (
        v_wish_titles[v_random_wish_idx],
        v_wish_titles[v_random_wish_idx] || ' - ' || v_wish_descriptions[v_random_desc_idx],
        v_budget_ranges[1 + floor(random() * 6)::integer][1],
        v_budget_ranges[1 + floor(random() * 6)::integer][2],
        v_urgency[1 + floor(random() * 4)::integer],
        v_wish_categories[v_random_wish_idx],
        v_city_id,
        v_area_id,
        v_subarea_id,
        v_admin_owner_token,
        'active',
        NOW() - (random() * INTERVAL '48 hours')
      );
      v_wishes_created := v_wishes_created + 1;
      
      -- ===== CREATE TASK =====
      v_random_task_idx := 1 + floor(random() * array_length(v_task_titles, 1))::integer;
      v_random_desc_idx := 1 + floor(random() * array_length(v_task_descriptions, 1))::integer;
      
      INSERT INTO tasks (
        title, 
        description, 
        budget, 
        category, 
        status, 
        city_id, 
        area_id, 
        sub_area_id,
        owner_token, 
        created_at
      )
      VALUES (
        v_task_titles[v_random_task_idx],
        v_task_titles[v_random_task_idx] || '. ' || v_task_descriptions[v_random_desc_idx],
        v_task_budgets[1 + floor(random() * array_length(v_task_budgets, 1))::integer],
        v_task_categories[v_random_task_idx],
        'open',
        v_city_id,
        v_area_id,
        v_subarea_id,
        v_admin_owner_token,
        NOW() - (random() * INTERVAL '72 hours')
      );
      v_tasks_created := v_tasks_created + 1;
      
    END LOOP;
    
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ COMPREHENSIVE DATA CREATED!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   • Wishes created: %', v_wishes_created;
  RAISE NOTICE '   • Tasks created: %', v_tasks_created;
  RAISE NOTICE '   • Total items: %', v_wishes_created + v_tasks_created;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Every city and every area now has sample data!';
  RAISE NOTICE '🚀 Your platform is fully populated and ready!';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  
END $$;

-- Verification queries
SELECT 
  '📊 Total Wishes Created' as section,
  COUNT(*) as total_wishes
FROM wishes 
WHERE owner_token IN (SELECT owner_token FROM profiles WHERE is_admin = true);

SELECT 
  '📊 Total Tasks Created' as section,
  COUNT(*) as total_tasks
FROM tasks 
WHERE owner_token IN (SELECT owner_token FROM profiles WHERE is_admin = true);

-- Show wishes distribution by city
SELECT 
  '💫 Wishes Distribution by City' as section,
  c.name as city,
  COUNT(w.id) as wish_count
FROM cities c
LEFT JOIN wishes w ON w.city_id = c.id AND w.owner_token IN (SELECT owner_token FROM profiles WHERE is_admin = true)
GROUP BY c.name
ORDER BY c.name;

-- Show tasks distribution by city
SELECT 
  '⚡ Tasks Distribution by City' as section,
  c.name as city,
  COUNT(t.id) as task_count
FROM cities c
LEFT JOIN tasks t ON t.city_id = c.id AND t.owner_token IN (SELECT owner_token FROM profiles WHERE is_admin = true)
GROUP BY c.name
ORDER BY c.name;

-- Show sample wishes by area (first 20)
SELECT 
  '💫 Sample Wishes by Area' as section,
  c.name as city,
  a.name as area,
  w.title,
  w.category,
  w.budget_min || ' - ' || w.budget_max as budget_range,
  w.urgency
FROM wishes w
JOIN cities c ON w.city_id = c.id
JOIN areas a ON w.area_id = a.id
WHERE w.owner_token IN (SELECT owner_token FROM profiles WHERE is_admin = true)
ORDER BY c.name, a.name
LIMIT 20;

-- Show sample tasks by area (first 20)
SELECT 
  '⚡ Sample Tasks by Area' as section,
  c.name as city,
  a.name as area,
  t.title,
  t.category,
  t.budget,
  t.status
FROM tasks t
JOIN cities c ON t.city_id = c.id
JOIN areas a ON t.area_id = a.id
WHERE t.owner_token IN (SELECT owner_token FROM profiles WHERE is_admin = true)
ORDER BY c.name, a.name
LIMIT 20;
