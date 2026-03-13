-- ============================================
-- STEP 1: CHECK REFERENCE DATA
-- ============================================

-- Check categories
SELECT id, name FROM categories ORDER BY id;

-- Check cities
SELECT id, name FROM cities ORDER BY name LIMIT 20;

-- Check areas for Mumbai
SELECT id, name, city_id FROM areas WHERE city_id LIKE '%Mumbai%' OR city_id LIKE '%mumbai%' LIMIT 10;

-- Check areas for Bangalore
SELECT id, name, city_id FROM areas WHERE city_id LIKE '%Bangalore%' OR city_id LIKE '%bangalore%' LIMIT 10;


-- ============================================
-- STEP 2: INSERT MOCK DATA (SIMPLIFIED)
-- ============================================
-- This assumes:
-- - Electronics category_id = 1 (adjust after checking above)
-- - Vehicles category_id = 2 (adjust after checking above)
-- ============================================

-- SAMPLE LISTINGS - Adjust category_id, city_id, area_id based on your data

-- iPhone listings
INSERT INTO listings (
  user_id, title, description, price, category_id, 
  latitude, longitude, status, created_at
)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 
   'iPhone 14 Pro Max 256GB Deep Purple', 
   'Excellent condition iPhone. Battery health 92%. All original accessories included with box. No scratches on screen or body. Genuine reason for selling - upgrading to iPhone 15.',
   95000, 
   1,  -- Electronics category (CHANGE THIS if different)
   19.1358, 
   72.8264,
   'active',
   NOW() - INTERVAL '2 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'iPhone 13 128GB Midnight Black',
   'iPhone 13 in great condition. Battery health 87%. All accessories included. Original box available. Very well maintained phone.',
   52000,
   1,  -- Electronics category
   19.2304,
   72.8562,
   'active',
   NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'iPhone 14 128GB Blue',
   'Latest iPhone 14 in blue color. Battery health 95%. Under Apple warranty. All original accessories. Mint condition.',
   68000,
   1,
   12.9352,
   77.6245,
   'active',
   NOW() - INTERVAL '3 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Samsung Galaxy S23 Ultra 256GB',
   'Flagship Samsung phone in mint condition. 12GB RAM, 256GB storage. Camera quality is exceptional. Under warranty till next year. With original charger and case.',
   85000,
   1,
   19.0596,
   72.8295,
   'active',
   NOW() - INTERVAL '5 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Samsung Galaxy S22 5G 128GB',
   'Samsung flagship phone. Excellent camera and display. 8GB RAM. Good battery backup. With charger and original case.',
   42000,
   1,
   12.9716,
   77.6412,
   'active',
   NOW() - INTERVAL '6 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'OnePlus 11R 5G 256GB Galactic Silver',
   'OnePlus flagship with 16GB RAM. Lightning fast performance. 100W fast charging. Galactic Silver color. 5 months old only.',
   35000,
   1,
   19.1176,
   72.9060,
   'active',
   NOW() - INTERVAL '8 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Nothing Phone 2 256GB White',
   'Unique Nothing Phone with glyph interface. 12GB RAM, 256GB storage. White color. Tech enthusiasts will love it.',
   42000,
   1,
   12.9698,
   77.7500,
   'active',
   NOW() - INTERVAL '10 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Google Pixel 7 Pro 128GB Obsidian',
   'Best camera phone. Google Pixel 7 Pro in obsidian black. Clean Android experience. Regular updates guaranteed. Excellent condition.',
   48000,
   1,
   19.2183,
   72.9781,
   'active',
   NOW() - INTERVAL '12 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Xiaomi 13 Pro 256GB Ceramic White',
   'Xiaomi flagship with Leica camera. Stunning camera quality. 12GB RAM. Ceramic white color. Like new condition.',
   55000,
   1,
   12.9121,
   77.6446,
   'active',
   NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Vivo V27 Pro 256GB Color Changing',
   'Vivo flagship with color changing back. Amazing camera with night mode. 12GB RAM. With original accessories and box.',
   32000,
   1,
   19.1871,
   72.8489,
   'active',
   NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'OnePlus Nord CE 3 128GB Aqua Surge',
   'Mid-range OnePlus with 5G. Good performance for daily use. 8GB RAM. Aqua surge color. 6 months old.',
   22000,
   1,
   12.9591,
   77.6974,
   'active',
   NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Realme GT Neo 3 150W Fast Charging',
   'Fastest charging phone - 150W. 12GB RAM, 256GB storage. Perfect for heavy users. Sprint white color.',
   28000,
   1,
   12.9250,
   77.5838,
   'active',
   NOW() - INTERVAL '1 day');


-- LAPTOP LISTINGS
INSERT INTO listings (
  user_id, title, description, price, category_id,
  latitude, longitude, status, created_at
)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'MacBook Pro M2 14" 512GB Space Grey',
   'Latest MacBook Pro with M2 chip. 16GB RAM, 512GB SSD. Perfect for developers and creators. Like new, barely used for 4 months. All accessories and box included.',
   165000,
   1,
   19.0596,
   72.8295,
   'active',
   NOW() - INTERVAL '6 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'MacBook Air M1 256GB Silver',
   'MacBook Air M1 chip. 8GB RAM, 256GB SSD. Excellent battery life. Perfect for students and office work. 1 year old, pristine condition.',
   72000,
   1,
   19.1358,
   72.8264,
   'active',
   NOW() - INTERVAL '12 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'MacBook Air M2 256GB Midnight Blue',
   'Latest MacBook Air with M2 chip. 8GB RAM, 256GB SSD. Midnight blue color. Barely used for 3 months. Perfect condition.',
   95000,
   1,
   12.9716,
   77.6412,
   'active',
   NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'HP Pavilion Gaming RTX 3050 4GB',
   'HP Pavilion gaming laptop. i5 12th gen, 16GB RAM, 512GB SSD, RTX 3050 4GB graphics. Perfect for gaming and video editing. 8 months old.',
   62000,
   1,
   19.1176,
   72.9060,
   'active',
   NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Lenovo Legion 5 RTX 3060 6GB',
   'Beast gaming laptop. Ryzen 7, 16GB RAM, 1TB SSD, RTX 3060 6GB. Perfect for AAA gaming. RGB keyboard, excellent cooling.',
   95000,
   1,
   19.2304,
   72.8562,
   'active',
   NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Asus ROG Strix Ryzen 7 RTX 3060',
   'Asus ROG gaming laptop. Ryzen 7 5800H, 16GB RAM, 512GB SSD, RTX 3060 6GB. Perfect for gaming and development. Under warranty.',
   98000,
   1,
   12.9352,
   77.6245,
   'active',
   NOW() - INTERVAL '8 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Acer Predator Helios 300 RTX 3050Ti',
   'Acer Predator gaming laptop. i7 11th gen, 16GB RAM, 512GB SSD, RTX 3050Ti. Great for gaming and coding. Good condition.',
   72000,
   1,
   12.9698,
   77.7500,
   'active',
   NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Dell XPS 13 i7 11th Gen 16GB RAM',
   'Premium Dell XPS ultrabook. i7 11th gen, 16GB RAM, 512GB SSD. Stunning display. Perfect for professionals. Excellent condition.',
   85000,
   1,
   19.2183,
   72.9781,
   'active',
   NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'ThinkPad X1 Carbon i7 10th Gen',
   'Business class ThinkPad. i7 10th gen, 16GB RAM, 512GB SSD. Lightweight and durable. Perfect for corporate professionals.',
   78000,
   1,
   12.9121,
   77.6446,
   'active',
   NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'MSI GF63 Thin i5 GTX 1650 4GB',
   'MSI gaming laptop. i5 10th gen, 8GB RAM, 512GB SSD, GTX 1650 4GB. Good entry-level gaming laptop. Well maintained.',
   45000,
   1,
   12.8456,
   77.6603,
   'active',
   NOW() - INTERVAL '4 days');


-- BIKE LISTINGS (Adjust category_id for Vehicles)
INSERT INTO listings (
  user_id, title, description, price, category_id,
  latitude, longitude, status, created_at
)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Royal Enfield Classic 350 2022 Black',
   'Royal Enfield Classic 350 in stealth black. Single owner. Only 8,000 km driven. Regular servicing from authorized center. All documents clear. Excellent condition.',
   145000,
   2,  -- Vehicles category (CHANGE THIS if different)
   19.1358,
   72.8264,
   'active',
   NOW() - INTERVAL '5 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Royal Enfield Himalayan 2021 White',
   'Royal Enfield Himalayan adventure bike. Perfect for long rides. Second owner. 18,000 km. Well maintained. New tyres. All accessories included.',
   165000,
   2,
   12.9352,
   77.6245,
   'active',
   NOW() - INTERVAL '8 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Honda Activa 6G 2023 Red',
   'Brand new condition Honda Activa. Bought 6 months ago. Only 2,500 km driven. Under warranty. All papers clear. First owner.',
   68000,
   2,
   19.0596,
   72.8295,
   'active',
   NOW() - INTERVAL '10 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Honda CB Shine 2022 Grey',
   'Honda CB Shine commuter bike. Excellent mileage - 55 kmpl. First owner. Only 8,000 km. Under warranty. Perfect condition.',
   62000,
   2,
   12.9716,
   77.6412,
   'active',
   NOW() - INTERVAL '12 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Yamaha FZ Version 3.0 2021 Blue',
   'Yamaha FZ V3 in racing blue. Well maintained bike. Second owner. 15,000 km driven. New tyres fitted. Average 45 kmpl. Test ride available.',
   82000,
   2,
   19.1176,
   72.9060,
   'active',
   NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Yamaha R15 V4 2023 Racing Blue',
   'Yamaha R15 V4 racing bike. Metallic blue color. Only 5,000 km. Under warranty. Perfect sports bike. Like new condition.',
   145000,
   2,
   12.9121,
   77.6446,
   'active',
   NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Hero Splendor Plus 2022 Black',
   'Hero Splendor Plus in excellent condition. Single owner. 12,000 km. Average mileage 60 kmpl. Perfect commuter bike. All documents ready.',
   58000,
   2,
   19.2183,
   72.9781,
   'active',
   NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Hero Xtreme 160R 2022 Red',
   'Hero Xtreme sporty bike. Single owner. 10,000 km. Good mileage - 48 kmpl. LED lights, digital console. Excellent running condition.',
   88000,
   2,
   12.9591,
   77.6974,
   'active',
   NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Bajaj Pulsar NS200 2022 Red',
   'Bajaj Pulsar NS200 in red. Sporty bike in great condition. First owner. 10,000 km driven. New battery installed. Serviced regularly.',
   98000,
   2,
   19.2304,
   72.8562,
   'active',
   NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'TVS Apache RTR 160 4V 2022',
   'TVS Apache sporty bike. First owner. 12,000 km driven. Race edition with ABS. Excellent condition. Serviced regularly from authorized center.',
   95000,
   2,
   12.9698,
   77.7500,
   'active',
   NOW() - INTERVAL '1 day');


-- CAR LISTINGS
INSERT INTO listings (
  user_id, title, description, price, category_id,
  latitude, longitude, status, created_at
)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Maruti Swift VXI 2020 Red Petrol',
   'Maruti Swift petrol variant. Single owner. Driven 28,000 km. Full service history. AC cooling excellent. Never met with accident. All documents clear.',
   520000,
   2,
   19.0596,
   72.8295,
   'active',
   NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Maruti Baleno Delta 2021 Grey',
   'Maruti Baleno premium hatchback. First owner. 24,000 km. Petrol automatic. Smart hybrid technology. Excellent mileage. Well maintained.',
   720000,
   2,
   12.9352,
   77.6245,
   'active',
   NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Hyundai i20 Sportz 2021 White',
   'Hyundai i20 top model. First owner. 22,000 km driven. Petrol automatic. Insurance valid. Perfect family car. Showroom maintained.',
   780000,
   2,
   19.1358,
   72.8264,
   'active',
   NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Hyundai Creta SX 2021 Red Diesel',
   'Hyundai Creta SUV. Diesel manual. Second owner. 32,000 km driven. Full service records. Perfect family SUV. Good condition.',
   1280000,
   2,
   12.9716,
   77.6412,
   'active',
   NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Honda City VX 2020 Silver Petrol',
   'Honda City top variant. Petrol manual. Second owner. 35,000 km. Average 16 kmpl. All features working. Well maintained car.',
   950000,
   2,
   19.1176,
   72.9060,
   'active',
   NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Honda Amaze VX 2021 White Petrol',
   'Honda Amaze sedan. Petrol automatic. First owner. 20,000 km. Under extended warranty. AC excellent. Perfect compact sedan.',
   680000,
   2,
   12.9698,
   77.7500,
   'active',
   NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Tata Nexon XZ Plus 2022 Blue Diesel',
   'Tata Nexon diesel variant. First owner. Only 18,000 km. Under warranty. 5-star safety rating. Excellent condition. Sunroof model.',
   980000,
   2,
   19.2183,
   72.9781,
   'active',
   NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4',
   'Kia Seltos HTX 2021 Black Petrol',
   'Kia Seltos premium SUV. Petrol automatic. First owner. 28,000 km. Loaded with features. Sunroof, ventilated seats. Excellent condition.',
   1350000,
   2,
   12.9121,
   77.6446,
   'active',
   NOW() - INTERVAL '2 days');


-- ============================================
-- VERIFY DATA
-- ============================================

-- Count totals
SELECT COUNT(*) as total_listings FROM listings WHERE user_id = 'df9040a9-212f-47c3-b5bb-773cb971e3d4';

-- View recent listings
SELECT id, title, price, category_id, created_at 
FROM listings 
WHERE user_id = 'df9040a9-212f-47c3-b5bb-773cb971e3d4'
ORDER BY created_at DESC 
LIMIT 20;
