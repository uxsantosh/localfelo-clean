-- ============================================
-- AUTOMATED MOCK DATA GENERATOR FOR OLDCYCLE
-- ============================================
-- This script generates 4+ items per category across all cities
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: First get your user ID
-- Run this and copy your user ID:
SELECT id, email, phone FROM auth.users WHERE id IN (SELECT user_id FROM profiles WHERE is_admin = true) LIMIT 1;

-- ============================================
-- STEP 2: CREATE TEMPORARY DATA GENERATION FUNCTION
-- ============================================

-- This will auto-generate realistic mock data
DO $$
DECLARE
  admin_user_id UUID;
  city_record RECORD;
  area_record RECORD;
  category_record RECORD;
  counter INTEGER;
  
  -- Indian names pool
  names TEXT[] := ARRAY[
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
    'Anjali Mehta', 'Karthik Iyer', 'Deepa Rao', 'Varun Malhotra', 'Pooja Desai',
    'Arjun Nair', 'Divya Shah', 'Sanjay Kumar', 'Meera Pillai', 'Rohan Joshi',
    'Kavita Kulkarni', 'Suresh Patel', 'Lakshmi Iyer', 'Manish Gupta', 'Neha Kapoor',
    'Akash Rane', 'Swati Menon', 'Rahul Verma', 'Siddharth Jain', 'Tanvi Deshmukh',
    'Vishal Pandey', 'Rekha Agarwal', 'Ganesh Gowda', 'Pallavi Nambiar', 'Harsha Reddy',
    'Nisha Shah', 'Aditya Singh', 'Simran Kaur', 'Karan Malhotra', 'Shruti Joshi'
  ];
  
  random_name TEXT;
  random_price INTEGER;
  random_hours INTERVAL;
  
BEGIN
  -- Get the first admin user ID
  SELECT user_id INTO admin_user_id FROM profiles WHERE is_admin = true LIMIT 1;
  
  -- If no admin user, exit
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'No admin user found. Please create an admin user first.';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Using admin user ID: %', admin_user_id;
  
  -- ============================================
  -- GENERATE MARKETPLACE LISTINGS
  -- ============================================
  
  RAISE NOTICE 'Generating marketplace listings...';
  
  -- Electronics Category
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 10 LOOP
    FOR counter IN 1..4 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_price := 15000 + floor(random() * 50000);
      random_hours := (floor(random() * 72) || ' hours')::INTERVAL;
      
      -- Get a random area in this city
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'iPhone 13 128GB - Excellent Condition'
            WHEN 2 THEN 'Samsung Galaxy S21 FE 5G 128GB'
            WHEN 3 THEN 'MacBook Air M1 256GB Space Grey'
            ELSE 'OnePlus 11R 5G 256GB'
          END,
          'Selling in excellent condition. All accessories included. Original box available. Well maintained. Reason for selling: upgrade.',
          'Electronics',
          random_price,
          CASE WHEN random() > 0.5 THEN 'Excellent' ELSE 'Good' END,
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'available',
          'sell',
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Furniture Category
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 10 LOOP
    FOR counter IN 1..4 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_price := 5000 + floor(random() * 30000);
      random_hours := (floor(random() * 72) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN '5 Seater L-Shape Sofa - Grey Fabric'
            WHEN 2 THEN 'Queen Size Bed with Storage Drawers'
            WHEN 3 THEN '6 Seater Dining Table with Chairs'
            ELSE 'Study Table with Bookshelves'
          END,
          'Solid construction, well maintained. Selling due to relocation. No major defects. Pickup from location preferred.',
          'Furniture',
          random_price,
          CASE WHEN random() > 0.5 THEN 'Excellent' ELSE 'Good' END,
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'available',
          'sell',
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Home Appliances Category
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 10 LOOP
    FOR counter IN 1..4 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_price := 8000 + floor(random() * 25000);
      random_hours := (floor(random() * 72) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'LG Double Door Refrigerator 260L'
            WHEN 2 THEN 'IFB Front Load Washing Machine 6kg'
            WHEN 3 THEN 'Voltas Split AC 1.5 Ton'
            ELSE 'Samsung Microwave Oven 28L'
          END,
          'Working perfectly. Regular maintenance done. All functions operational. Good condition for the age. Genuine reason for selling.',
          'Home Appliances',
          random_price,
          'Good',
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'available',
          'sell',
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Vehicles Category
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 10 LOOP
    FOR counter IN 1..4 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_price := 35000 + floor(random() * 80000);
      random_hours := (floor(random() * 120) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'Honda Activa 6G 2021 Model'
            WHEN 2 THEN 'Hero Splendor Plus 2020'
            WHEN 3 THEN 'Yamaha FZ Version 3.0 2019'
            ELSE 'Royal Enfield Classic 350 2020'
          END,
          'Well maintained bike. Regular servicing done. All documents clear. Single/Second owner. New tyres. Good mileage. Test drive available.',
          'Vehicles',
          random_price,
          'Excellent',
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'available',
          'sell',
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Sports & Fitness Category
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 8 LOOP
    FOR counter IN 1..4 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_price := 3000 + floor(random() * 20000);
      random_hours := (floor(random() * 72) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'Treadmill Motorized with Incline'
            WHEN 2 THEN 'Gym Equipment Set - Dumbbells & Bench'
            WHEN 3 THEN 'Kids Bicycle 6-10 Years - Hero'
            ELSE 'Badminton Rackets Set - Yonex'
          END,
          'Good quality sports equipment. Rarely used, almost new condition. Perfect for fitness enthusiasts. Space issue, hence selling.',
          'Sports',
          random_price,
          CASE WHEN random() > 0.5 THEN 'Excellent' ELSE 'Good' END,
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'available',
          'sell',
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Fashion Category
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 8 LOOP
    FOR counter IN 1..4 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_price := 500 + floor(random() * 5000);
      random_hours := (floor(random() * 48) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'Designer Saree Collection - 5 Pieces'
            WHEN 2 THEN 'Branded Shirts - Formal & Casual'
            WHEN 3 THEN 'Ladies Handbag - Genuine Leather'
            ELSE 'Sports Shoes - Nike/Adidas'
          END,
          'Branded items in excellent condition. Barely used. Original purchase bills available. Genuine products. No defects or damage.',
          'Fashion',
          random_price,
          'Excellent',
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'available',
          'sell',
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Books Category
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 8 LOOP
    FOR counter IN 1..4 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_price := 200 + floor(random() * 2000);
      random_hours := (floor(random() * 96) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'Engineering Textbooks - 3rd Sem'
            WHEN 2 THEN 'UPSC Preparation Books Set'
            WHEN 3 THEN 'Fiction Novels Collection - 10 Books'
            ELSE 'Class 12 NCERT Complete Set'
          END,
          'Books in good condition. No torn pages. Clean and well maintained. Perfect for students. Reasonable price.',
          'Books',
          random_price,
          'Good',
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'available',
          'sell',
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- ============================================
  -- GENERATE WISHES
  -- ============================================
  
  RAISE NOTICE 'Generating wishes...';
  
  -- Electronics Wishes
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 10 LOOP
    FOR counter IN 1..3 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_hours := (floor(random() * 48) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO wishes (user_id, user_name, title, description, category, budget_min, budget_max, location, latitude, longitude, city, area, status, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'Looking for iPhone 13 or 14'
            WHEN 2 THEN 'Need Gaming Laptop RTX 3050+'
            ELSE 'Want MacBook Air M1/M2'
          END,
          'Need in good condition. Budget flexible for excellent quality. Prefer ' || city_record.city || ' areas. Ready to buy immediately if price is right.',
          'Electronics',
          CASE counter WHEN 1 THEN 45000 WHEN 2 THEN 55000 ELSE 70000 END,
          CASE counter WHEN 1 THEN 65000 WHEN 2 THEN 85000 ELSE 100000 END,
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'open',
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Furniture Wishes
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 10 LOOP
    FOR counter IN 1..3 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_hours := (floor(random() * 72) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO wishes (user_id, user_name, title, description, category, budget_min, budget_max, location, latitude, longitude, city, area, status, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'Need Sofa Set 3+2 for Living Room'
            WHEN 2 THEN 'Looking for Queen Size Bed'
            ELSE 'Want Dining Table 6 Seater'
          END,
          'Looking for good quality furniture. Should be in good condition. For new apartment. Can pickup from your location.',
          'Furniture',
          CASE counter WHEN 1 THEN 15000 WHEN 2 THEN 12000 ELSE 10000 END,
          CASE counter WHEN 1 THEN 30000 WHEN 2 THEN 25000 ELSE 20000 END,
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'open',
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Vehicles Wishes
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 8 LOOP
    FOR counter IN 1..3 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_hours := (floor(random() * 96) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO wishes (user_id, user_name, title, description, category, budget_min, budget_max, location, latitude, longitude, city, area, status, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'Want Honda Activa or Similar Scooter'
            WHEN 2 THEN 'Looking for Royal Enfield Classic'
            ELSE 'Need Second-hand Bicycle'
          END,
          'Looking for well maintained vehicle. All documents should be clear. Ready to pay good price for quality. ' || city_record.city || ' location preferred.',
          'Vehicles',
          CASE counter WHEN 1 THEN 35000 WHEN 2 THEN 100000 ELSE 2000 END,
          CASE counter WHEN 1 THEN 50000 WHEN 2 THEN 140000 ELSE 5000 END,
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'open',
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- ============================================
  -- GENERATE TASKS
  -- ============================================
  
  RAISE NOTICE 'Generating tasks...';
  
  -- Home Services Tasks
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 10 LOOP
    FOR counter IN 1..3 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_hours := (floor(random() * 24) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO tasks (user_id, user_name, title, description, category, price, location, latitude, longitude, city, area, status, deadline, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'House Deep Cleaning Required'
            WHEN 2 THEN 'Plumber Needed for Kitchen Work'
            ELSE 'Electrician for Fan Installation'
          END,
          CASE counter
            WHEN 1 THEN 'Need professional cleaning for 3BHK apartment. Deep cleaning including kitchen and bathrooms. Should bring own supplies.'
            WHEN 2 THEN 'Kitchen sink and tap replacement work. Materials ready, just installation needed. Should complete in one day.'
            ELSE 'Need to install 3 ceiling fans. Wiring is ready, just installation and testing required.'
          END,
          'Home Services',
          CASE counter WHEN 1 THEN 2500 WHEN 2 THEN 1500 ELSE 1000 END,
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'open',
          NOW() + ((3 + floor(random() * 7)) || ' days')::INTERVAL,
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Repair Services Tasks
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 8 LOOP
    FOR counter IN 1..3 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_hours := (floor(random() * 12) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO tasks (user_id, user_name, title, description, category, price, location, latitude, longitude, city, area, status, deadline, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'AC Repair - Not Cooling'
            WHEN 2 THEN 'Washing Machine Repair Needed'
            ELSE 'Laptop Screen Replacement'
          END,
          CASE counter
            WHEN 1 THEN 'My 1.5 ton AC is not cooling properly. Need experienced technician to check and repair. Gas filling if required.'
            WHEN 2 THEN 'Front load washing machine not draining water. Need repair person urgently. Will pay well for quick service.'
            ELSE 'Need laptop screen replacement. Screen is cracked. Have spare screen, just need installation work.'
          END,
          'Repair Services',
          CASE counter WHEN 1 THEN 1200 WHEN 2 THEN 800 ELSE 1000 END,
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'open',
          NOW() + ((1 + floor(random() * 4)) || ' days')::INTERVAL,
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Education Tasks
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 6 LOOP
    FOR counter IN 1..3 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_hours := (floor(random() * 48) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO tasks (user_id, user_name, title, description, category, price, location, latitude, longitude, city, area, status, deadline, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'Home Tutor for Class 10 Maths'
            WHEN 2 THEN 'English Speaking Classes Needed'
            ELSE 'Guitar Classes for Beginner'
          END,
          CASE counter
            WHEN 1 THEN 'Need experienced tutor for 10th CBSE mathematics. 5 days a week, 1 hour per day. Good pay for quality teaching.'
            WHEN 2 THEN 'Looking for English speaking trainer. Beginner level. 3 days a week. Prefer home visit or online classes.'
            ELSE 'Want guitar teacher for myself. Complete beginner. Acoustic guitar. Weekend classes preferred.'
          END,
          'Education',
          CASE counter WHEN 1 THEN 10000 WHEN 2 THEN 5000 ELSE 4000 END,
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'open',
          NOW() + ((10 + floor(random() * 20)) || ' days')::INTERVAL,
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Digital Services Tasks
  FOR city_record IN SELECT DISTINCT city FROM areas LIMIT 6 LOOP
    FOR counter IN 1..3 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_hours := (floor(random() * 96) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas WHERE city = city_record.city ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO tasks (user_id, user_name, title, description, category, price, location, latitude, longitude, city, area, status, deadline, created_at)
        VALUES (
          admin_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'Website Design for Small Business'
            WHEN 2 THEN 'Logo Design for Startup'
            ELSE 'Content Writing for Blog'
          END,
          CASE counter
            WHEN 1 THEN 'Need simple 5-page website for my boutique. Mobile responsive. WordPress or similar platform ok. Include contact form.'
            WHEN 2 THEN 'Need creative logo design for food delivery startup. Modern and colorful. 3-4 concepts required. Final files in all formats.'
            ELSE 'Need content writer for technology blog. 10 articles, 1000 words each. SEO optimized content required. Good research needed.'
          END,
          'Digital Services',
          CASE counter WHEN 1 THEN 15000 WHEN 2 THEN 8000 ELSE 12000 END,
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'open',
          NOW() + ((15 + floor(random() * 25)) || ' days')::INTERVAL,
          NOW() - random_hours
        );
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Mock data generation completed!';
  RAISE NOTICE 'Check the counts with: SELECT COUNT(*) FROM listings; SELECT COUNT(*) FROM wishes; SELECT COUNT(*) FROM tasks;';
  
END $$;


-- ============================================
-- STEP 3: VERIFY GENERATED DATA
-- ============================================

-- Count total entries
SELECT 
  (SELECT COUNT(*) FROM listings) as total_listings,
  (SELECT COUNT(*) FROM wishes) as total_wishes,
  (SELECT COUNT(*) FROM tasks) as total_tasks;

-- Count by category
SELECT category, COUNT(*) as count FROM listings GROUP BY category ORDER BY count DESC;
SELECT category, COUNT(*) as count FROM wishes GROUP BY category ORDER BY count DESC;
SELECT category, COUNT(*) as count FROM tasks GROUP BY category ORDER BY count DESC;

-- Count by city
SELECT city, COUNT(*) as count FROM listings GROUP BY city ORDER BY count DESC LIMIT 10;
SELECT city, COUNT(*) as count FROM wishes GROUP BY city ORDER BY count DESC LIMIT 10;
SELECT city, COUNT(*) as count FROM tasks GROUP BY city ORDER BY count DESC LIMIT 10;

-- View sample data
SELECT id, title, category, city, area, price, created_at FROM listings ORDER BY created_at DESC LIMIT 10;
SELECT id, title, category, city, area, budget_max, created_at FROM wishes ORDER BY created_at DESC LIMIT 10;
SELECT id, title, category, city, area, price, created_at FROM tasks ORDER BY created_at DESC LIMIT 10;
