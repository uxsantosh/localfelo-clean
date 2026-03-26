-- ============================================
-- OLDCYCLE MOCK DATA - READY TO RUN
-- Priority: Mobiles, Laptops, Bikes, Cars
-- User ID: df9040a9-212f-47c3-b5bb-773cb971e3d4
-- ============================================

-- MOBILE PHONES - Mumbai
INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Rajesh Kumar', 'iPhone 14 Pro Max 256GB Deep Purple', 'Excellent condition iPhone. Battery health 92%. All original accessories included with box. No scratches on screen or body. Genuine reason for selling - upgrading to iPhone 15.', 'Electronics', 95000, 'Excellent', 'Andheri West, Mumbai', 19.1358, 72.8264, 'Mumbai', 'Andheri West', 'available', 'sell', NOW() - INTERVAL '2 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Priya Sharma', 'Samsung Galaxy S23 Ultra 256GB', 'Flagship Samsung phone in mint condition. 12GB RAM, 256GB storage. Camera quality is exceptional. Under warranty till next year. With original charger and case.', 'Electronics', 85000, 'Excellent', 'Bandra West, Mumbai', 19.0596, 72.8295, 'Mumbai', 'Bandra West', 'available', 'sell', NOW() - INTERVAL '5 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Amit Patel', 'iPhone 13 128GB Midnight Black', 'iPhone 13 in great condition. Battery health 87%. All accessories included. Original box available. Very well maintained phone.', 'Electronics', 52000, 'Good', 'Borivali West, Mumbai', 19.2304, 72.8562, 'Mumbai', 'Borivali West', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Sneha Desai', 'OnePlus 11R 5G 256GB', 'OnePlus flagship with 16GB RAM. Lightning fast performance. 100W fast charging. Galactic Silver color. 5 months old only.', 'Electronics', 35000, 'Excellent', 'Powai, Mumbai', 19.1176, 72.9060, 'Mumbai', 'Powai', 'available', 'sell', NOW() - INTERVAL '8 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Vikram Singh', 'Google Pixel 7 Pro 128GB', 'Best camera phone. Google Pixel 7 Pro in obsidian black. Clean Android experience. Regular updates guaranteed. Excellent condition.', 'Electronics', 48000, 'Excellent', 'Thane West, Mumbai', 19.2183, 72.9781, 'Mumbai', 'Thane West', 'available', 'sell', NOW() - INTERVAL '12 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Pooja Mehta', 'Vivo V27 Pro 256GB', 'Vivo flagship with color changing back. Amazing camera with night mode. 12GB RAM. With original accessories and box.', 'Electronics', 32000, 'Excellent', 'Malad West, Mumbai', 19.1871, 72.8489, 'Mumbai', 'Malad West', 'available', 'sell', NOW() - INTERVAL '1 day');

-- MOBILE PHONES - Bangalore
INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Karthik Iyer', 'iPhone 14 128GB Blue', 'Latest iPhone 14 in blue color. Battery health 95%. Under Apple warranty. All original accessories. Mint condition.', 'Electronics', 68000, 'Excellent', 'Koramangala, Bangalore', 12.9352, 77.6245, 'Bangalore', 'Koramangala', 'available', 'sell', NOW() - INTERVAL '3 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Deepa Rao', 'Samsung Galaxy S22 5G 128GB', 'Samsung flagship phone. Excellent camera and display. 8GB RAM. Good battery backup. With charger and original case.', 'Electronics', 42000, 'Good', 'Indiranagar, Bangalore', 12.9716, 77.6412, 'Bangalore', 'Indiranagar', 'available', 'sell', NOW() - INTERVAL '6 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Varun Kumar', 'Nothing Phone 2 256GB', 'Unique Nothing Phone with glyph interface. 12GB RAM, 256GB storage. White color. Tech enthusiasts will love it.', 'Electronics', 42000, 'Excellent', 'Whitefield, Bangalore', 12.9698, 77.7500, 'Bangalore', 'Whitefield', 'available', 'sell', NOW() - INTERVAL '10 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Ananya Hegde', 'Xiaomi 13 Pro 256GB', 'Xiaomi flagship with Leica camera. Stunning camera quality. 12GB RAM. Ceramic white color. Like new condition.', 'Electronics', 55000, 'Excellent', 'HSR Layout, Bangalore', 12.9121, 77.6446, 'Bangalore', 'HSR Layout', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Rakesh Gowda', 'OnePlus Nord CE 3 128GB', 'Mid-range OnePlus with 5G. Good performance for daily use. 8GB RAM. Aqua surge color. 6 months old.', 'Electronics', 22000, 'Excellent', 'Marathahalli, Bangalore', 12.9591, 77.6974, 'Bangalore', 'Marathahalli', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Sowmya Reddy', 'Realme GT Neo 3 150W', 'Fastest charging phone - 150W. 12GB RAM, 256GB storage. Perfect for heavy users. Sprint white color.', 'Electronics', 28000, 'Excellent', 'Jayanagar, Bangalore', 12.9250, 77.5838, 'Bangalore', 'Jayanagar', 'available', 'sell', NOW() - INTERVAL '1 day');

-- LAPTOPS - Mumbai
INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Rohan Joshi', 'MacBook Pro M2 14" 512GB Space Grey', 'Latest MacBook Pro with M2 chip. 16GB RAM, 512GB SSD. Perfect for developers and creators. Like new, barely used for 4 months. All accessories and box included.', 'Electronics', 165000, 'Excellent', 'Bandra West, Mumbai', 19.0596, 72.8295, 'Mumbai', 'Bandra West', 'available', 'sell', NOW() - INTERVAL '6 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Kavita Kulkarni', 'MacBook Air M1 256GB Silver', 'MacBook Air M1 chip. 8GB RAM, 256GB SSD. Excellent battery life. Perfect for students and office work. 1 year old, pristine condition.', 'Electronics', 72000, 'Excellent', 'Andheri West, Mumbai', 19.1358, 72.8264, 'Mumbai', 'Andheri West', 'available', 'sell', NOW() - INTERVAL '12 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Manish Gupta', 'HP Pavilion Gaming RTX 3050 4GB', 'HP Pavilion gaming laptop. i5 12th gen, 16GB RAM, 512GB SSD, RTX 3050 4GB graphics. Perfect for gaming and video editing. 8 months old.', 'Electronics', 62000, 'Excellent', 'Powai, Mumbai', 19.1176, 72.9060, 'Mumbai', 'Powai', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Shruti Jain', 'Dell XPS 13 i7 11th Gen 16GB', 'Premium Dell XPS ultrabook. i7 11th gen, 16GB RAM, 512GB SSD. Stunning display. Perfect for professionals. Excellent condition.', 'Electronics', 85000, 'Excellent', 'Thane West, Mumbai', 19.2183, 72.9781, 'Mumbai', 'Thane West', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Sandeep Shah', 'Lenovo Legion 5 RTX 3060 16GB', 'Beast gaming laptop. Ryzen 7, 16GB RAM, 1TB SSD, RTX 3060 6GB. Perfect for AAA gaming. RGB keyboard, excellent cooling.', 'Electronics', 95000, 'Excellent', 'Borivali West, Mumbai', 19.2304, 72.8562, 'Mumbai', 'Borivali West', 'available', 'sell', NOW() - INTERVAL '3 days');

-- LAPTOPS - Bangalore
INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Naveen Kumar', 'Asus ROG Strix Ryzen 7 RTX 3060', 'Asus ROG gaming laptop. Ryzen 7 5800H, 16GB RAM, 512GB SSD, RTX 3060 6GB. Perfect for gaming and development. Under warranty.', 'Electronics', 98000, 'Excellent', 'Koramangala, Bangalore', 12.9352, 77.6245, 'Bangalore', 'Koramangala', 'available', 'sell', NOW() - INTERVAL '8 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Preethi Nair', 'MacBook Air M2 256GB Midnight', 'Latest MacBook Air with M2 chip. 8GB RAM, 256GB SSD. Midnight blue color. Barely used for 3 months. Perfect condition.', 'Electronics', 95000, 'Excellent', 'Indiranagar, Bangalore', 12.9716, 77.6412, 'Bangalore', 'Indiranagar', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Harsha Reddy', 'Acer Predator Helios 300 RTX 3050Ti', 'Acer Predator gaming laptop. i7 11th gen, 16GB RAM, 512GB SSD, RTX 3050Ti. Great for gaming and coding. Good condition.', 'Electronics', 72000, 'Good', 'Whitefield, Bangalore', 12.9698, 77.7500, 'Bangalore', 'Whitefield', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Divya Naidu', 'ThinkPad X1 Carbon i7 10th Gen', 'Business class ThinkPad. i7 10th gen, 16GB RAM, 512GB SSD. Lightweight and durable. Perfect for corporate professionals.', 'Electronics', 78000, 'Good', 'HSR Layout, Bangalore', 12.9121, 77.6446, 'Bangalore', 'HSR Layout', 'available', 'sell', NOW() - INTERVAL '3 days'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Chaitanya Rao', 'MSI GF63 Thin i5 GTX 1650 4GB', 'MSI gaming laptop. i5 10th gen, 8GB RAM, 512GB SSD, GTX 1650 4GB. Good entry-level gaming laptop. Well maintained.', 'Electronics', 45000, 'Good', 'Electronic City, Bangalore', 12.8456, 77.6603, 'Bangalore', 'Electronic City', 'available', 'sell', NOW() - INTERVAL '4 days');

-- BIKES - Mumbai
INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Arjun Nair', 'Royal Enfield Classic 350 2022 Black', 'Royal Enfield Classic 350 in stealth black. Single owner. Only 8,000 km driven. Regular servicing from authorized center. All documents clear. Excellent condition.', 'Vehicles', 145000, 'Excellent', 'Andheri West, Mumbai', 19.1358, 72.8264, 'Mumbai', 'Andheri West', 'available', 'sell', NOW() - INTERVAL '5 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Divya Shah', 'Honda Activa 6G 2023 Red', 'Brand new condition Honda Activa. Bought 6 months ago. Only 2,500 km driven. Under warranty. All papers clear. First owner.', 'Vehicles', 68000, 'Excellent', 'Bandra West, Mumbai', 19.0596, 72.8295, 'Mumbai', 'Bandra West', 'available', 'sell', NOW() - INTERVAL '10 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Sanjay Kumar', 'Yamaha FZ Version 3.0 2021 Blue', 'Yamaha FZ V3 in racing blue. Well maintained bike. Second owner. 15,000 km driven. New tyres fitted. Average 45 kmpl. Test ride available.', 'Vehicles', 82000, 'Good', 'Powai, Mumbai', 19.1176, 72.9060, 'Mumbai', 'Powai', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Meera Pillai', 'Hero Splendor Plus 2022 Black', 'Hero Splendor Plus in excellent condition. Single owner. 12,000 km. Average mileage 60 kmpl. Perfect commuter bike. All documents ready.', 'Vehicles', 58000, 'Excellent', 'Thane West, Mumbai', 19.2183, 72.9781, 'Mumbai', 'Thane West', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Vishal Pandey', 'Bajaj Pulsar NS200 2022 Red', 'Bajaj Pulsar NS200 in red. Sporty bike in great condition. First owner. 10,000 km driven. New battery installed. Serviced regularly.', 'Vehicles', 98000, 'Excellent', 'Borivali West, Mumbai', 19.2304, 72.8562, 'Mumbai', 'Borivali West', 'available', 'sell', NOW() - INTERVAL '3 days');

-- BIKES - Bangalore
INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Ganesh Gowda', 'Royal Enfield Himalayan 2021 White', 'Royal Enfield Himalayan adventure bike. Perfect for long rides. Second owner. 18,000 km. Well maintained. New tyres. All accessories included.', 'Vehicles', 165000, 'Good', 'Koramangala, Bangalore', 12.9352, 77.6245, 'Bangalore', 'Koramangala', 'available', 'sell', NOW() - INTERVAL '8 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Pallavi Nambiar', 'Honda CB Shine 2022 Grey', 'Honda CB Shine commuter bike. Excellent mileage - 55 kmpl. First owner. Only 8,000 km. Under warranty. Perfect condition.', 'Vehicles', 62000, 'Excellent', 'Indiranagar, Bangalore', 12.9716, 77.6412, 'Bangalore', 'Indiranagar', 'available', 'sell', NOW() - INTERVAL '12 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Nisha Shah', 'TVS Apache RTR 160 4V 2022', 'TVS Apache sporty bike. First owner. 12,000 km driven. Race edition with ABS. Excellent condition. Serviced regularly from authorized center.', 'Vehicles', 95000, 'Excellent', 'Whitefield, Bangalore', 12.9698, 77.7500, 'Bangalore', 'Whitefield', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Aditya Singh', 'Yamaha R15 V4 2023 Blue', 'Yamaha R15 V4 racing bike. Metallic blue color. Only 5,000 km. Under warranty. Perfect sports bike. Like new condition.', 'Vehicles', 145000, 'Excellent', 'HSR Layout, Bangalore', 12.9121, 77.6446, 'Bangalore', 'HSR Layout', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Simran Kaur', 'Hero Xtreme 160R 2022 Red', 'Hero Xtreme sporty bike. Single owner. 10,000 km. Good mileage - 48 kmpl. LED lights, digital console. Excellent running condition.', 'Vehicles', 88000, 'Good', 'Marathahalli, Bangalore', 12.9591, 77.6974, 'Bangalore', 'Marathahalli', 'available', 'sell', NOW() - INTERVAL '3 days');

-- CARS - Mumbai  
INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Karan Malhotra', 'Maruti Swift VXI 2020 Red', 'Maruti Swift petrol variant. Single owner. Driven 28,000 km. Full service history. AC cooling excellent. Never met with accident. All documents clear.', 'Vehicles', 520000, 'Excellent', 'Bandra West, Mumbai', 19.0596, 72.8295, 'Mumbai', 'Bandra West', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Shruti Joshi', 'Hyundai i20 Sportz 2021 White', 'Hyundai i20 top model. First owner. 22,000 km driven. Petrol automatic. Insurance valid. Perfect family car. Showroom maintained.', 'Vehicles', 780000, 'Excellent', 'Andheri West, Mumbai', 19.1358, 72.8264, 'Mumbai', 'Andheri West', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Rekha Agarwal', 'Honda City VX 2020 Silver', 'Honda City top variant. Petrol manual. Second owner. 35,000 km. Average 16 kmpl. All features working. Well maintained car.', 'Vehicles', 950000, 'Good', 'Powai, Mumbai', 19.1176, 72.9060, 'Mumbai', 'Powai', 'available', 'sell', NOW() - INTERVAL '3 days'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Suresh Patel', 'Tata Nexon XZ Plus 2022 Blue', 'Tata Nexon diesel variant. First owner. Only 18,000 km. Under warranty. 5-star safety rating. Excellent condition. Sunroof model.', 'Vehicles', 980000, 'Excellent', 'Thane West, Mumbai', 19.2183, 72.9781, 'Mumbai', 'Thane West', 'available', 'sell', NOW() - INTERVAL '1 day');

-- CARS - Bangalore
INSERT INTO listings (user_id, user_name, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Lakshmi Iyer', 'Maruti Baleno Delta 2021 Grey', 'Maruti Baleno premium hatchback. First owner. 24,000 km. Petrol automatic. Smart hybrid technology. Excellent mileage. Well maintained.', 'Vehicles', 720000, 'Excellent', 'Koramangala, Bangalore', 12.9352, 77.6245, 'Bangalore', 'Koramangala', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Neha Kapoor', 'Hyundai Creta SX 2021 Red', 'Hyundai Creta SUV. Diesel manual. Second owner. 32,000 km driven. Full service records. Perfect family SUV. Good condition.', 'Vehicles', 1280000, 'Good', 'Indiranagar, Bangalore', 12.9716, 77.6412, 'Bangalore', 'Indiranagar', 'available', 'sell', NOW() - INTERVAL '3 days'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Akash Rane', 'Honda Amaze VX 2021 White', 'Honda Amaze sedan. Petrol automatic. First owner. 20,000 km. Under extended warranty. AC excellent. Perfect compact sedan.', 'Vehicles', 680000, 'Excellent', 'Whitefield, Bangalore', 12.9698, 77.7500, 'Bangalore', 'Whitefield', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Swati Menon', 'Kia Seltos HTX 2021 Black', 'Kia Seltos premium SUV. Petrol automatic. First owner. 28,000 km. Loaded with features. Sunroof, ventilated seats. Excellent condition.', 'Vehicles', 1350000, 'Excellent', 'HSR Layout, Bangalore', 12.9121, 77.6446, 'Bangalore', 'HSR Layout', 'available', 'sell', NOW() - INTERVAL '2 days');


-- ============================================
-- WISHES for Priority Items
-- ============================================

INSERT INTO wishes (user_id, user_name, title, description, category, budget_min, budget_max, location, latitude, longitude, city, area, status, created_at)
VALUES
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Rahul Verma', 'Looking for iPhone 13 or 14', 'Need iPhone in excellent condition. Battery health should be 85%+. Budget flexible for genuine product. Mumbai location preferred. Ready to buy immediately.', 'Electronics', 45000, 70000, 'Andheri West, Mumbai', 19.1358, 72.8264, 'Mumbai', 'Andheri West', 'open', NOW() - INTERVAL '6 hours'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Siddharth Jain', 'Need Gaming Laptop RTX 3050 or Higher', 'Looking for powerful gaming laptop. RTX 3050 minimum required for video editing. Good condition only. Bangalore areas preferred. Budget around 60-80k.', 'Electronics', 55000, 85000, 'Koramangala, Bangalore', 12.9352, 77.6245, 'Bangalore', 'Koramangala', 'open', NOW() - INTERVAL '1 day'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Tanvi Deshmukh', 'Want Royal Enfield Classic or Himalayan', 'Looking for Royal Enfield bike. Well maintained with clear documents. Ready to pay good price for quality bike. Mumbai location.', 'Vehicles', 100000, 160000, 'Bandra West, Mumbai', 19.0596, 72.8295, 'Mumbai', 'Bandra West', 'open', NOW() - INTERVAL '2 days'),
  ('df9040a9-212f-47c3-b5bb-773cb971e3d4', 'Harsha Reddy', 'Looking for Swift or i20 Hatchback', 'Need good condition hatchback car. 2019 or newer model preferred. All documents should be clear. Bangalore location. Budget 5-7 lakh.', 'Vehicles', 500000, 750000, 'Whitefield, Bangalore', 12.9698, 77.7500, 'Bangalore', 'Whitefield', 'open', NOW() - INTERVAL '1 day');


-- ============================================
-- VERIFY DATA
-- ============================================

-- Count totals
SELECT COUNT(*) as total_listings FROM listings;
SELECT COUNT(*) as total_wishes FROM wishes;

-- Count by category
SELECT category, COUNT(*) as count FROM listings GROUP BY category ORDER BY count DESC;

-- View recent listings
SELECT title, category, city, price FROM listings ORDER BY created_at DESC LIMIT 20;
