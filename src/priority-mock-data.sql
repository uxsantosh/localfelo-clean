-- ============================================
-- OLDCYCLE PRIORITY MOCK DATA
-- Focus: Mobiles, Laptops, Bikes, Cars
-- ============================================

-- ============================================
-- STEP 1: GET YOUR USER ID
-- ============================================
-- Run this first to get your user ID:
SELECT id, email, phone FROM profiles LIMIT 5;

-- Copy your user ID and replace 'YOUR_USER_ID_HERE' below

-- ============================================
-- STEP 2: GENERATE PRIORITY MOCK DATA
-- ============================================

-- Replace YOUR_USER_ID_HERE with your actual UUID from above query
-- Example: 'df9040a9-212f-47c3-b5bb-773cb971e3d4'

DO $$
DECLARE
  my_user_id UUID := 'df9040a9-212f-47c3-b5bb-773cb971e3d4'; -- REPLACE THIS!
  
  city_record RECORD;
  area_record RECORD;
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
  
  -- Mobile phone models
  mobile_models TEXT[] := ARRAY[
    'iPhone 14 Pro Max 256GB Deep Purple',
    'iPhone 13 128GB Midnight Black',
    'iPhone 12 64GB Blue',
    'Samsung Galaxy S23 Ultra 256GB',
    'Samsung Galaxy S22 5G 128GB',
    'OnePlus 11R 5G 256GB',
    'OnePlus Nord CE 3 128GB',
    'Google Pixel 7 Pro 128GB',
    'Vivo V27 Pro 256GB',
    'Oppo Reno 10 Pro 5G',
    'Xiaomi 13 Pro 256GB',
    'Realme GT Neo 3 150W',
    'Nothing Phone 2 256GB',
    'Motorola Edge 40 5G'
  ];
  
  -- Laptop models
  laptop_models TEXT[] := ARRAY[
    'MacBook Pro M2 14" 512GB Space Grey',
    'MacBook Air M1 256GB Silver',
    'Dell XPS 13 i7 11th Gen 16GB',
    'HP Pavilion Gaming RTX 3050',
    'Lenovo Legion 5 RTX 3060 16GB',
    'Asus ROG Strix Ryzen 7 RTX 3060',
    'Acer Predator Helios 300',
    'MSI GF63 Thin i5 GTX 1650',
    'ThinkPad X1 Carbon i7 10th Gen',
    'Surface Laptop 5 i5 16GB'
  ];
  
  -- Bike models
  bike_models TEXT[] := ARRAY[
    'Royal Enfield Classic 350 2022',
    'Royal Enfield Himalayan 2021',
    'Honda Activa 6G 2023',
    'Honda CB Shine 2022',
    'Hero Splendor Plus 2021',
    'Hero Xtreme 160R 2022',
    'Yamaha FZ Version 3.0 2021',
    'Yamaha R15 V4 2023',
    'Bajaj Pulsar NS200 2022',
    'Bajaj Dominar 400 2021',
    'TVS Apache RTR 160 4V',
    'Suzuki Gixxer SF 250 2022',
    'KTM Duke 200 2021',
    'Kawasaki Ninja 300 2020'
  ];
  
  -- Car models
  car_models TEXT[] := ARRAY[
    'Maruti Swift VXI 2020',
    'Maruti Baleno Delta 2021',
    'Hyundai i20 Sportz 2022',
    'Hyundai Creta SX 2021',
    'Honda City VX 2020',
    'Honda Amaze VX 2021',
    'Tata Nexon XZ Plus 2022',
    'Tata Punch Creative 2023',
    'Mahindra XUV700 AX5 2022',
    'Kia Seltos HTX 2021',
    'Toyota Innova Crysta 2020',
    'Volkswagen Polo Highline 2019'
  ];
  
BEGIN
  
  RAISE NOTICE 'Starting mock data generation...';
  RAISE NOTICE 'Using user ID: %', my_user_id;
  
  -- ============================================
  -- PRIORITY 1: MOBILE PHONES
  -- ============================================
  
  RAISE NOTICE 'Generating mobile phone listings...';
  
  -- Generate 6 mobile phones per city
  FOR city_record IN SELECT DISTINCT city FROM areas ORDER BY city LIMIT 10 LOOP
    
    FOR counter IN 1..6 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_price := 15000 + floor(random() * 70000);
      random_hours := (floor(random() * 120) || ' hours')::INTERVAL;
      
      -- Get random area in this city
      SELECT * INTO area_record FROM areas 
      WHERE city = city_record.city 
      ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO listings (
          user_id, user_name, title, description, 
          category, price, condition, 
          location, latitude, longitude, city, area, 
          status, listing_type, created_at
        )
        VALUES (
          my_user_id,
          random_name,
          mobile_models[1 + floor(random() * array_length(mobile_models, 1))],
          'Excellent condition phone. ' || 
          CASE 
            WHEN random() > 0.7 THEN 'Battery health 90%+. ' 
            WHEN random() > 0.4 THEN 'Battery health 85%+. '
            ELSE 'Battery health 80%+. '
          END ||
          'All original accessories included. ' ||
          CASE 
            WHEN random() > 0.5 THEN 'Box available. '
            ELSE 'No box. '
          END ||
          'No scratches on screen. ' ||
          CASE
            WHEN random() > 0.6 THEN 'Under warranty. '
            ELSE 'Out of warranty. '
          END ||
          'Genuine reason for selling.',
          'Electronics',
          random_price,
          CASE WHEN random() > 0.6 THEN 'Excellent' ELSE 'Good' END,
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
  -- PRIORITY 2: LAPTOPS
  -- ============================================
  
  RAISE NOTICE 'Generating laptop listings...';
  
  -- Generate 5 laptops per city
  FOR city_record IN SELECT DISTINCT city FROM areas ORDER BY city LIMIT 10 LOOP
    
    FOR counter IN 1..5 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_price := 25000 + floor(random() * 100000);
      random_hours := (floor(random() * 150) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas 
      WHERE city = city_record.city 
      ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO listings (
          user_id, user_name, title, description,
          category, price, condition,
          location, latitude, longitude, city, area,
          status, listing_type, created_at
        )
        VALUES (
          my_user_id,
          random_name,
          laptop_models[1 + floor(random() * array_length(laptop_models, 1))],
          CASE
            WHEN random() > 0.7 THEN 'Like new laptop, barely used for 6 months. '
            WHEN random() > 0.4 THEN 'Good condition laptop, well maintained. '
            ELSE 'Laptop in working condition. '
          END ||
          'Perfect for ' ||
          CASE
            WHEN random() > 0.5 THEN 'office work and coding. '
            ELSE 'gaming and video editing. '
          END ||
          CASE
            WHEN random() > 0.6 THEN 'Original charger and box included. '
            ELSE 'Original charger included. '
          END ||
          CASE
            WHEN random() > 0.5 THEN 'No physical damage. '
            ELSE 'Minor scratches on body. '
          END ||
          'Genuine reason for selling.',
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
  
  -- ============================================
  -- PRIORITY 3: BIKES
  -- ============================================
  
  RAISE NOTICE 'Generating bike listings...';
  
  -- Generate 5 bikes per city
  FOR city_record IN SELECT DISTINCT city FROM areas ORDER BY city LIMIT 10 LOOP
    
    FOR counter IN 1..5 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_price := 30000 + floor(random() * 120000);
      random_hours := (floor(random() * 200) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas 
      WHERE city = city_record.city 
      ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO listings (
          user_id, user_name, title, description,
          category, price, condition,
          location, latitude, longitude, city, area,
          status, listing_type, created_at
        )
        VALUES (
          my_user_id,
          random_name,
          bike_models[1 + floor(random() * array_length(bike_models, 1))],
          CASE
            WHEN random() > 0.6 THEN 'Single owner, well maintained bike. '
            ELSE 'Second owner, excellent condition. '
          END ||
          'Regular servicing done from authorized service center. ' ||
          'All documents clear - RC, Insurance, PUC. ' ||
          CASE
            WHEN random() > 0.5 THEN 'New tyres fitted recently. '
            ELSE 'Good tyre condition. '
          END ||
          CASE
            WHEN random() > 0.6 THEN 'New battery installed. '
            ELSE ''
          END ||
          'Average mileage ' || (35 + floor(random() * 25)) || ' kmpl. ' ||
          'Test ride available. ' ||
          'Genuine reason for selling.',
          'Vehicles',
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
  
  -- ============================================
  -- PRIORITY 4: CARS
  -- ============================================
  
  RAISE NOTICE 'Generating car listings...';
  
  -- Generate 4 cars per city
  FOR city_record IN SELECT DISTINCT city FROM areas ORDER BY city LIMIT 10 LOOP
    
    FOR counter IN 1..4 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      random_price := 250000 + floor(random() * 600000);
      random_hours := (floor(random() * 240) || ' hours')::INTERVAL;
      
      SELECT * INTO area_record FROM areas 
      WHERE city = city_record.city 
      ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO listings (
          user_id, user_name, title, description,
          category, price, condition,
          location, latitude, longitude, city, area,
          status, listing_type, created_at
        )
        VALUES (
          my_user_id,
          random_name,
          car_models[1 + floor(random() * array_length(car_models, 1))],
          CASE
            WHEN random() > 0.6 THEN 'Single owner car, very well maintained. '
            ELSE 'Second owner, excellent running condition. '
          END ||
          'Driven ' || (25000 + floor(random() * 50000)) || ' km. ' ||
          'Full service history available. ' ||
          'All documents clear - RC, Insurance valid. ' ||
          CASE
            WHEN random() > 0.5 THEN 'Petrol variant. '
            ELSE 'Diesel variant. '
          END ||
          'Average mileage ' || (12 + floor(random() * 8)) || ' kmpl. ' ||
          CASE
            WHEN random() > 0.6 THEN 'Never met with accident. '
            ELSE 'Minor scratches on body. '
          END ||
          'AC cooling excellent. ' ||
          'Test drive available. ' ||
          'Serious buyers only.',
          'Vehicles',
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
  
  -- ============================================
  -- BONUS: WISHES for priority items
  -- ============================================
  
  RAISE NOTICE 'Generating wishes...';
  
  -- Mobile wishes
  FOR city_record IN SELECT DISTINCT city FROM areas ORDER BY city LIMIT 8 LOOP
    FOR counter IN 1..2 LOOP
      random_name := names[1 + floor(random() * array_length(names, 1))];
      
      SELECT * INTO area_record FROM areas 
      WHERE city = city_record.city 
      ORDER BY RANDOM() LIMIT 1;
      
      IF area_record.id IS NOT NULL THEN
        INSERT INTO wishes (
          user_id, user_name, title, description,
          category, budget_min, budget_max,
          location, latitude, longitude, city, area,
          status, created_at
        )
        VALUES (
          my_user_id,
          random_name,
          CASE counter
            WHEN 1 THEN 'Looking for iPhone 13 or 14'
            ELSE 'Need Samsung Galaxy S22 or S23'
          END,
          'Need phone in excellent condition. Battery health should be good. Budget flexible for genuine product. ' || city_record.city || ' location preferred. Ready to buy immediately.',
          'Electronics',
          CASE counter WHEN 1 THEN 40000 ELSE 35000 END,
          CASE counter WHEN 1 THEN 65000 ELSE 55000 END,
          area_record.name || ', ' || city_record.city,
          area_record.latitude,
          area_record.longitude,
          city_record.city,
          area_record.name,
          'open',
          NOW() - ((floor(random() * 48)) || ' hours')::INTERVAL
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Laptop wishes
  FOR city_record IN SELECT DISTINCT city FROM areas ORDER BY city LIMIT 8 LOOP
    random_name := names[1 + floor(random() * array_length(names, 1))];
    
    SELECT * INTO area_record FROM areas 
    WHERE city = city_record.city 
    ORDER BY RANDOM() LIMIT 1;
    
    IF area_record.id IS NOT NULL THEN
      INSERT INTO wishes (
        user_id, user_name, title, description,
        category, budget_min, budget_max,
        location, latitude, longitude, city, area,
        status, created_at
      )
      VALUES (
        my_user_id,
        random_name,
        'Looking for Gaming Laptop RTX 3050 or Higher',
        'Need powerful laptop for video editing and gaming. RTX 3050 minimum required. Good condition only. Budget around 60-80k. ' || city_record.city || ' areas preferred.',
        'Electronics',
        55000,
        85000,
        area_record.name || ', ' || city_record.city,
        area_record.latitude,
        area_record.longitude,
        city_record.city,
        area_record.name,
        'open',
        NOW() - ((floor(random() * 72)) || ' hours')::INTERVAL
      );
    END IF;
  END LOOP;
  
  -- Bike wishes
  FOR city_record IN SELECT DISTINCT city FROM areas ORDER BY city LIMIT 6 LOOP
    random_name := names[1 + floor(random() * array_length(names, 1))];
    
    SELECT * INTO area_record FROM areas 
    WHERE city = city_record.city 
    ORDER BY RANDOM() LIMIT 1;
    
    IF area_record.id IS NOT NULL THEN
      INSERT INTO wishes (
        user_id, user_name, title, description,
        category, budget_min, budget_max,
        location, latitude, longitude, city, area,
        status, created_at
      )
      VALUES (
        my_user_id,
        random_name,
        'Want Royal Enfield or Similar Bike',
        'Looking for Royal Enfield Classic/Himalayan or similar cruiser bike. Should be well maintained with clear documents. Ready to pay good price for quality bike.',
        'Vehicles',
        90000,
        150000,
        area_record.name || ', ' || city_record.city,
        area_record.latitude,
        area_record.longitude,
        city_record.city,
        area_record.name,
        'open',
        NOW() - ((floor(random() * 96)) || ' hours')::INTERVAL
      );
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Mock data generation completed successfully!';
  RAISE NOTICE 'Run verification queries below to check the data.';
  
END $$;


-- ============================================
-- STEP 3: VERIFY DATA
-- ============================================

-- Total counts
SELECT 
  (SELECT COUNT(*) FROM listings WHERE category = 'Electronics') as mobiles_laptops,
  (SELECT COUNT(*) FROM listings WHERE category = 'Vehicles') as bikes_cars,
  (SELECT COUNT(*) FROM wishes) as total_wishes,
  (SELECT COUNT(*) FROM tasks) as total_tasks;

-- Listings by city
SELECT city, COUNT(*) as count 
FROM listings 
GROUP BY city 
ORDER BY count DESC 
LIMIT 10;

-- Recent listings
SELECT title, category, city, area, price, created_at 
FROM listings 
ORDER BY created_at DESC 
LIMIT 20;

-- Recent wishes
SELECT title, category, city, budget_max, created_at 
FROM wishes 
ORDER BY created_at DESC 
LIMIT 10;
