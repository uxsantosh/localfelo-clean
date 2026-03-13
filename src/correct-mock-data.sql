-- ============================================
-- OLDCYCLE MOCK DATA - CORRECT VERSION
-- User ID: df9040a9-212f-47c3-b5bb-773cb971e3d4
-- ============================================

-- ============================================
-- STEP 1: CHECK YOUR SLUGS FIRST
-- ============================================

-- Check available category slugs
SELECT DISTINCT category_slug FROM listings WHERE category_slug IS NOT NULL;

-- Check available area slugs
SELECT DISTINCT area_slug FROM listings WHERE area_slug IS NOT NULL LIMIT 20;

-- Check available cities
SELECT DISTINCT city FROM listings WHERE city IS NOT NULL;


-- ============================================
-- STEP 2: INSERT MOCK LISTINGS
-- ============================================
-- Adjust category_slug and area_slug based on your data above

-- MOBILE PHONES (12 listings)
INSERT INTO listings (
  owner_token, owner_name, owner_phone, title, description, 
  price, category_slug, area_slug, city, condition,
  whatsapp_enabled, whatsapp_number, is_active, views_count,
  latitude, longitude, created_at, updated_at
)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Rajesh Kumar', '9876543210',
   'iPhone 14 Pro Max 256GB Deep Purple', 
   'Excellent condition iPhone. Battery health 92%. All original accessories included with box. No scratches on screen or body. Genuine reason for selling - upgrading to iPhone 15.',
   95000, 'electronics', 'andheri-west', 'Mumbai', 'like_new',
   true, '9876543210', true, 0,
   19.1358, 72.8264, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Priya Sharma', '9876543211',
   'Samsung Galaxy S23 Ultra 256GB',
   'Flagship Samsung phone in mint condition. 12GB RAM, 256GB storage. Camera quality is exceptional. Under warranty till next year. With original charger and case.',
   85000, 'electronics', 'bandra-west', 'Mumbai', 'like_new',
   true, '9876543211', true, 0,
   19.0596, 72.8295, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Amit Patel', '9876543212',
   'iPhone 13 128GB Midnight Black',
   'iPhone 13 in great condition. Battery health 87%. All accessories included. Original box available. Very well maintained phone.',
   52000, 'electronics', 'borivali-west', 'Mumbai', 'good',
   true, '9876543212', true, 0,
   19.2304, 72.8562, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Sneha Desai', '9876543213',
   'OnePlus 11R 5G 256GB Galactic Silver',
   'OnePlus flagship with 16GB RAM. Lightning fast performance. 100W fast charging. Galactic Silver color. 5 months old only.',
   35000, 'electronics', 'powai', 'Mumbai', 'like_new',
   true, '9876543213', true, 0,
   19.1176, 72.9060, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Karthik Iyer', '8765432101',
   'iPhone 14 128GB Blue',
   'Latest iPhone 14 in blue color. Battery health 95%. Under Apple warranty. All original accessories. Mint condition.',
   68000, 'electronics', 'koramangala', 'Bangalore', 'like_new',
   true, '8765432101', true, 0,
   12.9352, 77.6245, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Deepa Rao', '8765432102',
   'Samsung Galaxy S22 5G 128GB',
   'Samsung flagship phone. Excellent camera and display. 8GB RAM. Good battery backup. With charger and original case.',
   42000, 'electronics', 'indiranagar', 'Bangalore', 'good',
   true, '8765432102', true, 0,
   12.9716, 77.6412, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Varun Kumar', '8765432103',
   'Nothing Phone 2 256GB White',
   'Unique Nothing Phone with glyph interface. 12GB RAM, 256GB storage. White color. Tech enthusiasts will love it.',
   42000, 'electronics', 'whitefield', 'Bangalore', 'like_new',
   true, '8765432103', true, 0,
   12.9698, 77.7500, NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Vikram Singh', '9876543214',
   'Google Pixel 7 Pro 128GB Obsidian',
   'Best camera phone. Google Pixel 7 Pro in obsidian black. Clean Android experience. Regular updates guaranteed. Excellent condition.',
   48000, 'electronics', 'thane-west', 'Mumbai', 'like_new',
   true, '9876543214', true, 0,
   19.2183, 72.9781, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Ananya Hegde', '8765432104',
   'Xiaomi 13 Pro 256GB Ceramic White',
   'Xiaomi flagship with Leica camera. Stunning camera quality. 12GB RAM. Ceramic white color. Like new condition.',
   55000, 'electronics', 'hsr-layout', 'Bangalore', 'like_new',
   true, '8765432104', true, 0,
   12.9121, 77.6446, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Pooja Mehta', '9876543215',
   'Vivo V27 Pro 256GB Color Changing',
   'Vivo flagship with color changing back. Amazing camera with night mode. 12GB RAM. With original accessories and box.',
   32000, 'electronics', 'malad-west', 'Mumbai', 'like_new',
   true, '9876543215', true, 0,
   19.1871, 72.8489, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Rakesh Gowda', '8765432105',
   'OnePlus Nord CE 3 128GB Aqua Surge',
   'Mid-range OnePlus with 5G. Good performance for daily use. 8GB RAM. Aqua surge color. 6 months old.',
   22000, 'electronics', 'marathahalli', 'Bangalore', 'like_new',
   true, '8765432105', true, 0,
   12.9591, 77.6974, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Sowmya Reddy', '8765432106',
   'Realme GT Neo 3 150W Fast Charging',
   'Fastest charging phone - 150W. 12GB RAM, 256GB storage. Perfect for heavy users. Sprint white color.',
   28000, 'electronics', 'jayanagar', 'Bangalore', 'like_new',
   true, '8765432106', true, 0,
   12.9250, 77.5838, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');


-- LAPTOPS (10 listings)
INSERT INTO listings (
  owner_token, owner_name, owner_phone, title, description,
  price, category_slug, area_slug, city, condition,
  whatsapp_enabled, whatsapp_number, is_active, views_count,
  latitude, longitude, created_at, updated_at
)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Rohan Joshi', '9876543220',
   'MacBook Pro M2 14" 512GB Space Grey',
   'Latest MacBook Pro with M2 chip. 16GB RAM, 512GB SSD. Perfect for developers and creators. Like new, barely used for 4 months. All accessories and box included.',
   165000, 'electronics', 'bandra-west', 'Mumbai', 'like_new',
   true, '9876543220', true, 0,
   19.0596, 72.8295, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Kavita Kulkarni', '9876543221',
   'MacBook Air M1 256GB Silver',
   'MacBook Air M1 chip. 8GB RAM, 256GB SSD. Excellent battery life. Perfect for students and office work. 1 year old, pristine condition.',
   72000, 'electronics', 'andheri-west', 'Mumbai', 'like_new',
   true, '9876543221', true, 0,
   19.1358, 72.8264, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Preethi Nair', '8765432110',
   'MacBook Air M2 256GB Midnight Blue',
   'Latest MacBook Air with M2 chip. 8GB RAM, 256GB SSD. Midnight blue color. Barely used for 3 months. Perfect condition.',
   95000, 'electronics', 'indiranagar', 'Bangalore', 'like_new',
   true, '8765432110', true, 0,
   12.9716, 77.6412, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Manish Gupta', '9876543222',
   'HP Pavilion Gaming RTX 3050 4GB',
   'HP Pavilion gaming laptop. i5 12th gen, 16GB RAM, 512GB SSD, RTX 3050 4GB graphics. Perfect for gaming and video editing. 8 months old.',
   62000, 'electronics', 'powai', 'Mumbai', 'like_new',
   true, '9876543222', true, 0,
   19.1176, 72.9060, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Sandeep Shah', '9876543223',
   'Lenovo Legion 5 RTX 3060 6GB',
   'Beast gaming laptop. Ryzen 7, 16GB RAM, 1TB SSD, RTX 3060 6GB. Perfect for AAA gaming. RGB keyboard, excellent cooling.',
   95000, 'electronics', 'borivali-west', 'Mumbai', 'like_new',
   true, '9876543223', true, 0,
   19.2304, 72.8562, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Naveen Kumar', '8765432111',
   'Asus ROG Strix Ryzen 7 RTX 3060',
   'Asus ROG gaming laptop. Ryzen 7 5800H, 16GB RAM, 512GB SSD, RTX 3060 6GB. Perfect for gaming and development. Under warranty.',
   98000, 'electronics', 'koramangala', 'Bangalore', 'like_new',
   true, '8765432111', true, 0,
   12.9352, 77.6245, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Harsha Reddy', '8765432112',
   'Acer Predator Helios 300 RTX 3050Ti',
   'Acer Predator gaming laptop. i7 11th gen, 16GB RAM, 512GB SSD, RTX 3050Ti. Great for gaming and coding. Good condition.',
   72000, 'electronics', 'whitefield', 'Bangalore', 'good',
   true, '8765432112', true, 0,
   12.9698, 77.7500, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Shruti Jain', '9876543224',
   'Dell XPS 13 i7 11th Gen 16GB RAM',
   'Premium Dell XPS ultrabook. i7 11th gen, 16GB RAM, 512GB SSD. Stunning display. Perfect for professionals. Excellent condition.',
   85000, 'electronics', 'thane-west', 'Mumbai', 'like_new',
   true, '9876543224', true, 0,
   19.2183, 72.9781, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Divya Naidu', '8765432113',
   'ThinkPad X1 Carbon i7 10th Gen',
   'Business class ThinkPad. i7 10th gen, 16GB RAM, 512GB SSD. Lightweight and durable. Perfect for corporate professionals.',
   78000, 'electronics', 'hsr-layout', 'Bangalore', 'good',
   true, '8765432113', true, 0,
   12.9121, 77.6446, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Chaitanya Rao', '8765432114',
   'MSI GF63 Thin i5 GTX 1650 4GB',
   'MSI gaming laptop. i5 10th gen, 8GB RAM, 512GB SSD, GTX 1650 4GB. Good entry-level gaming laptop. Well maintained.',
   45000, 'electronics', 'electronic-city', 'Bangalore', 'good',
   true, '8765432114', true, 0,
   12.8456, 77.6603, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');


-- BIKES (10 listings)
INSERT INTO listings (
  owner_token, owner_name, owner_phone, title, description,
  price, category_slug, area_slug, city, condition,
  whatsapp_enabled, whatsapp_number, is_active, views_count,
  latitude, longitude, created_at, updated_at
)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Arjun Nair', '9876543230',
   'Royal Enfield Classic 350 2022 Black',
   'Royal Enfield Classic 350 in stealth black. Single owner. Only 8,000 km driven. Regular servicing from authorized center. All documents clear. Excellent condition.',
   145000, 'vehicles', 'andheri-west', 'Mumbai', 'like_new',
   true, '9876543230', true, 0,
   19.1358, 72.8264, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Ganesh Gowda', '8765432120',
   'Royal Enfield Himalayan 2021 White',
   'Royal Enfield Himalayan adventure bike. Perfect for long rides. Second owner. 18,000 km. Well maintained. New tyres. All accessories included.',
   165000, 'vehicles', 'koramangala', 'Bangalore', 'good',
   true, '8765432120', true, 0,
   12.9352, 77.6245, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Divya Shah', '9876543231',
   'Honda Activa 6G 2023 Red',
   'Brand new condition Honda Activa. Bought 6 months ago. Only 2,500 km driven. Under warranty. All papers clear. First owner.',
   68000, 'vehicles', 'bandra-west', 'Mumbai', 'like_new',
   true, '9876543231', true, 0,
   19.0596, 72.8295, NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Pallavi Nambiar', '8765432121',
   'Honda CB Shine 2022 Grey',
   'Honda CB Shine commuter bike. Excellent mileage - 55 kmpl. First owner. Only 8,000 km. Under warranty. Perfect condition.',
   62000, 'vehicles', 'indiranagar', 'Bangalore', 'like_new',
   true, '8765432121', true, 0,
   12.9716, 77.6412, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Sanjay Kumar', '9876543232',
   'Yamaha FZ Version 3.0 2021 Blue',
   'Yamaha FZ V3 in racing blue. Well maintained bike. Second owner. 15,000 km driven. New tyres fitted. Average 45 kmpl. Test ride available.',
   82000, 'vehicles', 'powai', 'Mumbai', 'good',
   true, '9876543232', true, 0,
   19.1176, 72.9060, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Aditya Singh', '8765432122',
   'Yamaha R15 V4 2023 Racing Blue',
   'Yamaha R15 V4 racing bike. Metallic blue color. Only 5,000 km. Under warranty. Perfect sports bike. Like new condition.',
   145000, 'vehicles', 'hsr-layout', 'Bangalore', 'like_new',
   true, '8765432122', true, 0,
   12.9121, 77.6446, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Meera Pillai', '9876543233',
   'Hero Splendor Plus 2022 Black',
   'Hero Splendor Plus in excellent condition. Single owner. 12,000 km. Average mileage 60 kmpl. Perfect commuter bike. All documents ready.',
   58000, 'vehicles', 'thane-west', 'Mumbai', 'like_new',
   true, '9876543233', true, 0,
   19.2183, 72.9781, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Simran Kaur', '8765432123',
   'Hero Xtreme 160R 2022 Red',
   'Hero Xtreme sporty bike. Single owner. 10,000 km. Good mileage - 48 kmpl. LED lights, digital console. Excellent running condition.',
   88000, 'vehicles', 'marathahalli', 'Bangalore', 'good',
   true, '8765432123', true, 0,
   12.9591, 77.6974, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Vishal Pandey', '9876543234',
   'Bajaj Pulsar NS200 2022 Red',
   'Bajaj Pulsar NS200 in red. Sporty bike in great condition. First owner. 10,000 km driven. New battery installed. Serviced regularly.',
   98000, 'vehicles', 'borivali-west', 'Mumbai', 'like_new',
   true, '9876543234', true, 0,
   19.2304, 72.8562, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Nisha Shah', '8765432124',
   'TVS Apache RTR 160 4V 2022',
   'TVS Apache sporty bike. First owner. 12,000 km driven. Race edition with ABS. Excellent condition. Serviced regularly from authorized center.',
   95000, 'vehicles', 'whitefield', 'Bangalore', 'like_new',
   true, '8765432124', true, 0,
   12.9698, 77.7500, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');


-- CARS (8 listings)
INSERT INTO listings (
  owner_token, owner_name, owner_phone, title, description,
  price, category_slug, area_slug, city, condition,
  whatsapp_enabled, whatsapp_number, is_active, views_count,
  latitude, longitude, created_at, updated_at
)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Karan Malhotra', '9876543240',
   'Maruti Swift VXI 2020 Red Petrol',
   'Maruti Swift petrol variant. Single owner. Driven 28,000 km. Full service history. AC cooling excellent. Never met with accident. All documents clear.',
   520000, 'vehicles', 'bandra-west', 'Mumbai', 'like_new',
   true, '9876543240', true, 0,
   19.0596, 72.8295, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Lakshmi Iyer', '8765432130',
   'Maruti Baleno Delta 2021 Grey',
   'Maruti Baleno premium hatchback. First owner. 24,000 km. Petrol automatic. Smart hybrid technology. Excellent mileage. Well maintained.',
   720000, 'vehicles', 'koramangala', 'Bangalore', 'like_new',
   true, '8765432130', true, 0,
   12.9352, 77.6245, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Shruti Joshi', '9876543241',
   'Hyundai i20 Sportz 2021 White',
   'Hyundai i20 top model. First owner. 22,000 km driven. Petrol automatic. Insurance valid. Perfect family car. Showroom maintained.',
   780000, 'vehicles', 'andheri-west', 'Mumbai', 'like_new',
   true, '9876543241', true, 0,
   19.1358, 72.8264, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Neha Kapoor', '8765432131',
   'Hyundai Creta SX 2021 Red Diesel',
   'Hyundai Creta SUV. Diesel manual. Second owner. 32,000 km driven. Full service records. Perfect family SUV. Good condition.',
   1280000, 'vehicles', 'indiranagar', 'Bangalore', 'good',
   true, '8765432131', true, 0,
   12.9716, 77.6412, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Rekha Agarwal', '9876543242',
   'Honda City VX 2020 Silver Petrol',
   'Honda City top variant. Petrol manual. Second owner. 35,000 km. Average 16 kmpl. All features working. Well maintained car.',
   950000, 'vehicles', 'powai', 'Mumbai', 'good',
   true, '9876543242', true, 0,
   19.1176, 72.9060, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Akash Rane', '8765432132',
   'Honda Amaze VX 2021 White Petrol',
   'Honda Amaze sedan. Petrol automatic. First owner. 20,000 km. Under extended warranty. AC excellent. Perfect compact sedan.',
   680000, 'vehicles', 'whitefield', 'Bangalore', 'like_new',
   true, '8765432132', true, 0,
   12.9698, 77.7500, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Suresh Patel', '9876543243',
   'Tata Nexon XZ Plus 2022 Blue Diesel',
   'Tata Nexon diesel variant. First owner. Only 18,000 km. Under warranty. 5-star safety rating. Excellent condition. Sunroof model.',
   980000, 'vehicles', 'thane-west', 'Mumbai', 'like_new',
   true, '9876543243', true, 0,
   19.2183, 72.9781, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Swati Menon', '8765432133',
   'Kia Seltos HTX 2021 Black Petrol',
   'Kia Seltos premium SUV. Petrol automatic. First owner. 28,000 km. Loaded with features. Sunroof, ventilated seats. Excellent condition.',
   1350000, 'vehicles', 'hsr-layout', 'Bangalore', 'like_new',
   true, '8765432133', true, 0,
   12.9121, 77.6446, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');


-- ============================================
-- VERIFY DATA
-- ============================================

-- Count totals
SELECT COUNT(*) as total_listings FROM listings WHERE owner_token = 'df9040a9-212f-47c3-b5bb-773cb971e3d4';

-- Count by category
SELECT category_slug, COUNT(*) as count 
FROM listings 
WHERE owner_token = 'df9040a9-212f-47c3-b5bb-773cb971e3d4'
GROUP BY category_slug;

-- View recent listings
SELECT id, title, price, category_slug, city, created_at 
FROM listings 
WHERE owner_token = 'df9040a9-212f-47c3-b5bb-773cb971e3d4'
ORDER BY created_at DESC 
LIMIT 20;