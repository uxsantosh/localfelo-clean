-- ============================================
-- OLDCYCLE COMPREHENSIVE MOCK DATA GENERATOR
-- ============================================
-- This script creates realistic data for ALL cities, areas, and categories
-- Step 1: Check your database structure first
-- Step 2: Then run the main data generation script
-- ============================================

-- ============================================
-- STEP 1: CHECK DATABASE STRUCTURE
-- ============================================
-- Run these queries first to see what data you have:

-- Check all cities
SELECT id, name, state, latitude, longitude FROM cities ORDER BY name;

-- Check all areas
SELECT id, name, city, latitude, longitude FROM areas ORDER BY city, name;

-- Check all categories for marketplace
SELECT * FROM categories WHERE type = 'marketplace' OR type IS NULL ORDER BY name;

-- Check all categories for wishes
SELECT * FROM v_wish_categories ORDER BY name;

-- Check all categories for tasks
SELECT * FROM v_task_categories ORDER BY name;

-- Count existing data
SELECT 
  (SELECT COUNT(*) FROM listings) as existing_listings,
  (SELECT COUNT(*) FROM wishes) as existing_wishes,
  (SELECT COUNT(*) FROM tasks) as existing_tasks;


-- ============================================
-- STEP 2: COMPREHENSIVE MOCK DATA GENERATION
-- ============================================
-- After reviewing the structure above, we'll generate data
-- You need to replace 'YOUR_USER_ID_HERE' with actual user IDs

-- First, let's create a temporary function to get random items
-- This will help distribute data across cities and areas


-- ============================================
-- MARKETPLACE LISTINGS - BY CATEGORY
-- ============================================

-- ELECTRONICS CATEGORY (Smartphones, Laptops, Cameras, TVs, etc.)
INSERT INTO listings (user_id, user_name, user_avatar, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
VALUES
  -- Mumbai listings
  ('YOUR_USER_ID', 'Rajesh Kumar', null, 'iPhone 13 128GB Midnight Black', 'iPhone 13 in excellent condition. Battery health 92%. All original accessories included. Box available. Single owner, very well maintained.', 'Electronics', 52000, 'Excellent', 'Andheri West, Mumbai', 19.1358, 72.8264, 'Mumbai', 'Andheri West', 'available', 'sell', NOW() - INTERVAL '2 hours'),
  ('YOUR_USER_ID', 'Priya Sharma', null, 'Samsung Galaxy S21 FE 5G', 'Samsung S21 FE in mint condition. 8GB RAM, 128GB storage. Graphite color. Under warranty till next month. With charger and case.', 'Electronics', 38000, 'Excellent', 'Bandra West, Mumbai', 19.0596, 72.8295, 'Mumbai', 'Bandra West', 'available', 'sell', NOW() - INTERVAL '5 hours'),
  ('YOUR_USER_ID', 'Amit Patel', null, 'Dell Inspiron 15 Laptop i5 11th Gen', 'Dell laptop in good condition. i5 11th gen, 8GB RAM, 512GB SSD. Perfect for office work and studies. Minor scratches on body.', 'Electronics', 35000, 'Good', 'Borivali West, Mumbai', 19.2304, 72.8562, 'Mumbai', 'Borivali West', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Sneha Desai', null, 'Sony Bravia 43" 4K Smart TV', 'Sony 43 inch 4K Android TV. Excellent picture quality. All apps work perfectly. With wall mount and remote. 2 years old.', 'Electronics', 32000, 'Good', 'Thane West, Mumbai', 19.2183, 72.9781, 'Mumbai', 'Thane West', 'available', 'sell', NOW() - INTERVAL '3 days'),
  
  -- Bangalore listings
  ('YOUR_USER_ID', 'Karthik Iyer', null, 'MacBook Pro M1 13" 256GB', 'MacBook Pro M1 in space grey. 8GB RAM, 256GB SSD. Like new, barely used for 6 months. All accessories and original box included.', 'Electronics', 85000, 'Excellent', 'Koramangala, Bangalore', 12.9352, 77.6245, 'Bangalore', 'Koramangala', 'available', 'sell', NOW() - INTERVAL '8 hours'),
  ('YOUR_USER_ID', 'Deepa Rao', null, 'Canon EOS 200D Mark II DSLR', 'Canon DSLR with 18-55mm kit lens. Perfect for photography enthusiasts. Rarely used. Camera bag and 32GB memory card included.', 'Electronics', 42000, 'Excellent', 'Indiranagar, Bangalore', 12.9716, 77.6412, 'Bangalore', 'Indiranagar', 'available', 'sell', NOW() - INTERVAL '12 hours'),
  ('YOUR_USER_ID', 'Varun Kumar', null, 'HP Pavilion Gaming Laptop RTX 3050', 'HP Pavilion gaming laptop. i5 12th gen, 16GB RAM, 512GB SSD, RTX 3050 4GB. Perfect for gaming and video editing.', 'Electronics', 65000, 'Excellent', 'Whitefield, Bangalore', 12.9698, 77.7500, 'Bangalore', 'Whitefield', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Ananya Hegde', null, 'OnePlus Nord CE 3 5G 128GB', 'OnePlus Nord CE 3 in aqua surge color. 8GB RAM, 128GB storage. Excellent condition with original charger (65W SUPERVOOC). 4 months old.', 'Electronics', 22000, 'Excellent', 'HSR Layout, Bangalore', 12.9121, 77.6446, 'Bangalore', 'HSR Layout', 'available', 'sell', NOW() - INTERVAL '2 days'),

  -- Delhi listings
  ('YOUR_USER_ID', 'Rohan Malhotra', null, 'iPad Air 5th Gen 64GB WiFi', 'iPad Air latest gen in starlight color. With Apple Pencil 2nd gen and magic keyboard. Barely used, pristine condition.', 'Electronics', 58000, 'Excellent', 'Dwarka Sector 10, Delhi', 28.5921, 77.0460, 'Delhi', 'Dwarka Sector 10', 'available', 'sell', NOW() - INTERVAL '4 hours'),
  ('YOUR_USER_ID', 'Neha Kapoor', null, 'LG 32" Full HD Monitor', 'LG Full HD IPS monitor. Perfect for office and design work. Excellent display quality. With HDMI cable and stand.', 'Electronics', 12000, 'Good', 'Rohini Sector 7, Delhi', 28.7041, 77.1025, 'Delhi', 'Rohini Sector 7', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Arjun Singh', null, 'Nintendo Switch OLED with Games', 'Nintendo Switch OLED model white. Includes 5 games (Zelda, Mario Kart, Pokemon, etc.). 2 controllers, charging dock, case included.', 'Electronics', 28000, 'Excellent', 'Lajpat Nagar, Delhi', 28.5677, 77.2431, 'Delhi', 'Lajpat Nagar', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('YOUR_USER_ID', 'Simran Kaur', null, 'Mi 55" 4K Android TV', 'Xiaomi 55 inch 4K smart TV. Excellent picture and sound. All streaming apps work smoothly. With remote and wall bracket.', 'Electronics', 28000, 'Good', 'Janakpuri, Delhi', 28.6219, 77.0834, 'Delhi', 'Janakpuri', 'available', 'sell', NOW() - INTERVAL '3 days'),

  -- Chennai listings
  ('YOUR_USER_ID', 'Sundar Rajan', null, 'Samsung Galaxy Tab S8 256GB', 'Samsung Tab S8 with S-Pen. 256GB storage, 12.4" display. Perfect for work and entertainment. Book cover keyboard included.', 'Electronics', 52000, 'Excellent', 'T Nagar, Chennai', 13.0418, 80.2341, 'Chennai', 'T Nagar', 'available', 'sell', NOW() - INTERVAL '6 hours'),
  ('YOUR_USER_ID', 'Lakshmi Iyer', null, 'Asus ROG Strix Gaming Laptop', 'Asus ROG laptop with Ryzen 7, RTX 3060, 16GB RAM, 1TB SSD. Beast for gaming and heavy tasks. RGB keyboard, excellent cooling.', 'Electronics', 95000, 'Excellent', 'Anna Nagar, Chennai', 13.0850, 80.2101, 'Chennai', 'Anna Nagar', 'available', 'sell', NOW() - INTERVAL '18 hours'),
  ('YOUR_USER_ID', 'Vikram Kumar', null, 'Realme GT Neo 3 150W 12GB RAM', 'Realme GT Neo 3 with 150W fast charging. 12GB RAM, 256GB storage. Sprint white color. Lightning fast performance. 8 months old.', 'Electronics', 28000, 'Excellent', 'Adyar, Chennai', 13.0010, 80.2574, 'Chennai', 'Adyar', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Meera Krishnan', null, 'Sony WH-1000XM4 Headphones', 'Sony premium noise cancelling headphones. Excellent sound quality. All accessories and case included. Works perfectly. 1 year old.', 'Electronics', 18000, 'Excellent', 'Velachery, Chennai', 12.9750, 80.2212, 'Chennai', 'Velachery', 'available', 'sell', NOW() - INTERVAL '2 days'),

  -- Pune listings
  ('YOUR_USER_ID', 'Siddharth Joshi', null, 'Lenovo Legion 5 Gaming Laptop', 'Lenovo Legion 5 with Ryzen 5, RTX 3050Ti, 16GB RAM, 512GB SSD. Perfect gaming laptop. Under warranty for 1 more year.', 'Electronics', 68000, 'Excellent', 'Hinjewadi, Pune', 18.5912, 73.7389, 'Pune', 'Hinjewadi', 'available', 'sell', NOW() - INTERVAL '10 hours'),
  ('YOUR_USER_ID', 'Pooja Patil', null, 'Vivo V27 Pro 5G 256GB', 'Vivo V27 Pro with color changing back. 12GB RAM, 256GB storage. Amazing camera quality. With original charger and protective case.', 'Electronics', 32000, 'Excellent', 'Baner, Pune', 18.5362, 73.7845, 'Pune', 'Baner', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Rahul Deshmukh', null, 'Apple Watch Series 7 45mm GPS', 'Apple Watch Series 7 in midnight aluminum. GPS model. With original charger and extra sport band. Excellent battery life.', 'Electronics', 32000, 'Excellent', 'Shivaji Nagar, Pune', 18.5304, 73.8567, 'Pune', 'Shivaji Nagar', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('YOUR_USER_ID', 'Anjali Kulkarni', null, 'Samsung 32" Curved Monitor', 'Samsung curved gaming monitor. 165Hz refresh rate. Perfect for gaming and content creation. With all cables and stand.', 'Electronics', 18000, 'Good', 'Kothrud, Pune', 18.5074, 73.8077, 'Pune', 'Kothrud', 'available', 'sell', NOW() - INTERVAL '3 days'),

  -- Hyderabad listings  
  ('YOUR_USER_ID', 'Harsha Reddy', null, 'Nothing Phone 2 12GB 256GB', 'Nothing Phone 2 in white. Unique design with glyph interface. 12GB RAM, 256GB storage. Excellent condition with box and accessories.', 'Electronics', 42000, 'Excellent', 'Banjara Hills, Hyderabad', 17.4239, 78.4738, 'Hyderabad', 'Banjara Hills', 'available', 'sell', NOW() - INTERVAL '7 hours'),
  ('YOUR_USER_ID', 'Divya Naidu', null, 'Nikon D5600 DSLR with 2 Lenses', 'Nikon D5600 with 18-55mm and 70-300mm lenses. Perfect for wildlife and portrait photography. Camera bag, tripod, filters included.', 'Electronics', 48000, 'Excellent', 'Jubilee Hills, Hyderabad', 17.4239, 78.4067, 'Hyderabad', 'Jubilee Hills', 'available', 'sell', NOW() - INTERVAL '15 hours'),
  ('YOUR_USER_ID', 'Chaitanya Rao', null, 'Acer Predator Gaming Monitor 27"', 'Acer Predator 27" gaming monitor. 144Hz, 1ms response time, QHD resolution. Perfect for competitive gaming. Like new.', 'Electronics', 28000, 'Excellent', 'Hitech City, Hyderabad', 17.4485, 78.3908, 'Hyderabad', 'Hitech City', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Sravani Patel', null, 'JBL Flip 6 Bluetooth Speaker', 'JBL Flip 6 portable speaker in black. Excellent sound quality, waterproof. Perfect for outdoor use. 6 months old with warranty.', 'Electronics', 8500, 'Excellent', 'Gachibowli, Hyderabad', 17.4399, 78.3489, 'Hyderabad', 'Gachibowli', 'available', 'sell', NOW() - INTERVAL '2 days');


-- FURNITURE CATEGORY (Sofa, Bed, Table, Chair, Wardrobe, etc.)
INSERT INTO listings (user_id, user_name, user_avatar, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
VALUES
  -- Mumbai
  ('YOUR_USER_ID', 'Sandeep Shah', null, '5 Seater L-Shape Sofa Grey Fabric', 'Modern L-shape sofa in grey fabric. Very comfortable with good cushioning. Only 1 year old. Selling due to relocation. No stains or damage.', 'Furniture', 22000, 'Excellent', 'Malad West, Mumbai', 19.1871, 72.8489, 'Mumbai', 'Malad West', 'available', 'sell', NOW() - INTERVAL '4 hours'),
  ('YOUR_USER_ID', 'Kavita Mehta', null, 'Queen Size Bed with Storage Drawers', 'Solid wood queen size bed with 4 storage drawers underneath. Excellent condition. Mattress not included. Dark brown finish.', 'Furniture', 18000, 'Good', 'Powai, Mumbai', 19.1176, 72.9060, 'Mumbai', 'Powai', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Manish Gupta', null, 'Study Table with Bookshelves', 'Compact study table with built-in bookshelves. Perfect for students and work from home. White color. Very sturdy construction.', 'Furniture', 5500, 'Good', 'Versova, Mumbai', 19.1310, 72.8114, 'Mumbai', 'Versova', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('YOUR_USER_ID', 'Shruti Jain', null, '6 Seater Dining Table with Chairs', 'Beautiful sheesham wood dining table with 6 cushioned chairs. Honey finish. Very sturdy and elegant. Minor usage marks only.', 'Furniture', 28000, 'Good', 'Kandivali West, Mumbai', 19.2074, 72.8318, 'Mumbai', 'Kandivali West', 'available', 'sell', NOW() - INTERVAL '3 days'),

  -- Bangalore
  ('YOUR_USER_ID', 'Rakesh Gowda', null, '3+2 Sofa Set Brown Leather', 'Premium leather sofa set (3 seater + 2 seater). Brown color. Very comfortable and looks premium. Imported quality. 2 years old.', 'Furniture', 35000, 'Excellent', 'Marathahalli, Bangalore', 12.9591, 77.6974, 'Bangalore', 'Marathahalli', 'available', 'sell', NOW() - INTERVAL '6 hours'),
  ('YOUR_USER_ID', 'Sowmya Reddy', null, 'Wardrobe 4 Door with Mirror', 'Spacious 4 door wardrobe with full length mirror. White and wood finish. Perfect for master bedroom. In excellent condition.', 'Furniture', 25000, 'Excellent', 'Jayanagar, Bangalore', 12.9250, 77.5838, 'Bangalore', 'Jayanagar', 'available', 'sell', NOW() - INTERVAL '12 hours'),
  ('YOUR_USER_ID', 'Naveen Kumar', null, 'Ergonomic Office Chair with Lumbar Support', 'Premium ergonomic office chair. Adjustable height, armrest, and lumbar support. Mesh back for breathability. Perfect for WFH.', 'Furniture', 8500, 'Excellent', 'Bellandur, Bangalore', 12.9258, 77.6784, 'Bangalore', 'Bellandur', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Preethi Nair', null, 'Coffee Table with Glass Top', 'Modern coffee table with tempered glass top and wooden frame. Scratch resistant. Perfect for living room. Like new condition.', 'Furniture', 4500, 'Excellent', 'Electronic City, Bangalore', 12.8456, 77.6603, 'Bangalore', 'Electronic City', 'available', 'sell', NOW() - INTERVAL '2 days'),

  -- Delhi
  ('YOUR_USER_ID', 'Aditya Verma', null, 'King Size Hydraulic Storage Bed', 'King size bed with hydraulic storage system. Easy lift mechanism. Solid construction. Dark walnut finish. Without mattress.', 'Furniture', 32000, 'Excellent', 'Dwarka Sector 12, Delhi', 28.5921, 77.0460, 'Delhi', 'Dwarka Sector 12', 'available', 'sell', NOW() - INTERVAL '8 hours'),
  ('YOUR_USER_ID', 'Nidhi Sharma', null, 'TV Unit with Storage Cabinets', 'Modern TV unit suitable for up to 55" TVs. Multiple storage cabinets and shelves. White high gloss finish. Excellent condition.', 'Furniture', 12000, 'Good', 'Vasant Kunj, Delhi', 28.5244, 77.1579, 'Delhi', 'Vasant Kunj', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Kunal Khanna', null, 'Recliner Sofa Single Seater', 'Premium single seater recliner in brown leather. Multiple reclining positions. Very comfortable for relaxing. Barely used.', 'Furniture', 18000, 'Excellent', 'Saket, Delhi', 28.5244, 77.2066, 'Delhi', 'Saket', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('YOUR_USER_ID', 'Megha Arora', null, 'Shoe Rack Wooden 5 Tier', 'Sturdy wooden shoe rack with 5 tiers. Can hold 15-20 pairs. Natural wood finish. Perfect for organizing footwear near entrance.', 'Furniture', 3500, 'Good', 'Pitampura, Delhi', 28.6964, 77.1311, 'Delhi', 'Pitampura', 'available', 'sell', NOW() - INTERVAL '3 days'),

  -- Chennai
  ('YOUR_USER_ID', 'Karthikeyan S', null, 'Modular Kitchen Cabinets Set', 'Complete modular kitchen cabinet set. 8 units including base and wall cabinets. White and grey combination. Excellent condition.', 'Furniture', 45000, 'Good', 'Porur, Chennai', 13.0358, 80.1560, 'Chennai', 'Porur', 'available', 'sell', NOW() - INTERVAL '5 hours'),
  ('YOUR_USER_ID', 'Janani Raman', null, 'Bookshelf 5 Tier Ladder Design', 'Modern ladder style bookshelf in white. 5 tiers with ample space. Perfect for books, decor items. Sturdy and stylish.', 'Furniture', 6500, 'Excellent', 'Sholinganallur, Chennai', 12.9010, 80.2279, 'Chennai', 'Sholinganallur', 'available', 'sell', NOW() - INTERVAL '14 hours'),
  ('YOUR_USER_ID', 'Rajkumar P', null, 'Computer Table with Keyboard Tray', 'Compact computer table with sliding keyboard tray and CPU cabinet. Dark wood finish. Perfect for small spaces. Very sturdy.', 'Furniture', 4000, 'Good', 'Tambaram, Chennai', 12.9249, 80.1000, 'Chennai', 'Tambaram', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Devika Subramanian', null, 'Bean Bag XXL - Black Leather', 'Extra large bean bag in premium black leatherette. Very comfortable for gaming and relaxing. Washable cover. Barely used.', 'Furniture', 5500, 'Excellent', 'OMR Thoraipakkam, Chennai', 12.9395, 80.2337, 'Chennai', 'OMR Thoraipakkam', 'available', 'sell', NOW() - INTERVAL '2 days'),

  -- Pune
  ('YOUR_USER_ID', 'Yash Patwardhan', null, 'Dressing Table with Large Mirror', 'Elegant dressing table with large mirror and multiple drawers. White finish. Perfect for bedroom. In excellent condition.', 'Furniture', 11000, 'Excellent', 'Wakad, Pune', 18.5974, 73.7898, 'Pune', 'Wakad', 'available', 'sell', NOW() - INTERVAL '9 hours'),
  ('YOUR_USER_ID', 'Gauri Deshpande', null, 'Center Table Marble Top', 'Premium center table with Italian marble top and brass legs. Luxurious look. Perfect for modern living rooms. Like new.', 'Furniture', 15000, 'Excellent', 'Pimple Saudagar, Pune', 18.5990, 73.8072, 'Pune', 'Pimple Saudagar', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Sameer Bhosale', null, 'Bar Cabinet with Wine Storage', 'Stylish bar cabinet with wine bottle storage and glass holder. Dark walnut finish. Perfect for home bar setup. Excellent condition.', 'Furniture', 18000, 'Good', 'Aundh, Pune', 18.5642, 73.8077, 'Pune', 'Aundh', 'available', 'sell', NOW() - INTERVAL '2 days'),
  ('YOUR_USER_ID', 'Tanvi Joshi', null, 'Kids Study Table Pink & White', 'Cute study table for kids with storage drawers. Pink and white color. Height adjustable chair included. Perfect for 5-12 years age.', 'Furniture', 6000, 'Good', 'Viman Nagar, Pune', 18.5679, 73.9143, 'Pune', 'Viman Nagar', 'available', 'sell', NOW() - INTERVAL '3 days'),

  -- Hyderabad
  ('YOUR_USER_ID', 'Tarun Krishna', null, 'L-Shape Sofa Cum Bed Grey', 'Convertible L-shape sofa that can be used as bed. Perfect for guests. Grey fabric. Storage underneath. Very comfortable.', 'Furniture', 28000, 'Excellent', 'Kondapur, Hyderabad', 17.4648, 78.3671, 'Hyderabad', 'Kondapur', 'available', 'sell', NOW() - INTERVAL '7 hours'),
  ('YOUR_USER_ID', 'Bhavana Reddy', null, '3 Door Sliding Wardrobe with Mirror', 'Spacious sliding door wardrobe. One door with full mirror. White finish. Perfect storage solution. Assembly service available.', 'Furniture', 22000, 'Good', 'Madhapur, Hyderabad', 17.4485, 78.3908, 'Hyderabad', 'Madhapur', 'available', 'sell', NOW() - INTERVAL '16 hours'),
  ('YOUR_USER_ID', 'Srikanth Varma', null, 'Executive Office Table Mahogany', 'Large executive office table in mahogany finish. Multiple drawers and cable management. Very professional look. Excellent quality.', 'Furniture', 25000, 'Good', 'Kukatpally, Hyderabad', 17.4849, 78.3914, 'Hyderabad', 'Kukatpally', 'available', 'sell', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Pallavi Nair', null, 'Swing Chair with Stand Cream', 'Indoor swing chair with sturdy stand. Cream colored cushions. Perfect for balcony or living room. Very relaxing. Like new.', 'Furniture', 12000, 'Excellent', 'Miyapur, Hyderabad', 17.4948, 78.3545, 'Hyderabad', 'Miyapur', 'available', 'sell', NOW() - INTERVAL '2 days');


-- MORE CATEGORIES TO BE ADDED (Total 4+ items per category across cities)
-- You can continue this pattern for:
-- - Home Appliances (Refrigerator, Washing Machine, AC, Microwave, etc.)
-- - Vehicles (Bikes, Scooters, Cars, Bicycles)
-- - Sports & Fitness (Gym equipment, Bicycles, Sports gear)
-- - Books & Hobbies (Books, Musical instruments, Art supplies)
-- - Fashion (Clothing, Accessories, Shoes)
-- - Kids & Baby (Toys, Baby gear, Kids furniture)


-- ============================================
-- WISHES - BY CATEGORY AND CITY
-- ============================================

INSERT INTO wishes (user_id, user_name, user_avatar, title, description, category, budget_min, budget_max, location, latitude, longitude, city, area, status, created_at)
VALUES
  -- Electronics wishes
  ('YOUR_USER_ID', 'Vishal Rane', null, 'Looking for iPhone 14 or 14 Pro', 'Need iPhone 14 or 14 Pro in good condition. Prefer 128GB or higher. Budget flexible for excellent condition. Mumbai areas preferred.', 'Electronics', 55000, 75000, 'Goregaon West, Mumbai', 19.1663, 72.8526, 'Mumbai', 'Goregaon West', 'open', NOW() - INTERVAL '3 hours'),
  ('YOUR_USER_ID', 'Ramya Krishnan', null, 'Want MacBook Air M2 for Work', 'Looking for MacBook Air M2. Need for software development. Prefer 256GB or 512GB. Bangalore location. Ready to buy immediately.', 'Electronics', 80000, 110000, 'Koramangala, Bangalore', 12.9352, 77.6245, 'Bangalore', 'Koramangala', 'open', NOW() - INTERVAL '8 hours'),
  ('YOUR_USER_ID', 'Ayush Agarwal', null, 'Need Gaming Laptop RTX 3060', 'Want gaming laptop with at least RTX 3060. For gaming and video editing. Budget around 80k. Delhi NCR areas. Good condition required.', 'Electronics', 70000, 90000, 'Dwarka Sector 10, Delhi', 28.5921, 77.0460, 'Delhi', 'Dwarka Sector 10', 'open', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Nithya Srinivasan', null, 'Looking for iPad Pro 12.9 inch', 'Need iPad Pro 12.9" for digital art. Prefer with Apple Pencil. Budget negotiable for good condition. Chennai areas only.', 'Electronics', 60000, 85000, 'T Nagar, Chennai', 13.0418, 80.2341, 'Chennai', 'T Nagar', 'open', NOW() - INTERVAL '2 days'),
  
  -- Furniture wishes
  ('YOUR_USER_ID', 'Akash Pawar', null, 'Need Sofa Set 3+2 for Living Room', 'Looking for sofa set in good condition. Prefer leather or premium fabric. Color: Brown, Grey, or Beige. Pune city only.', 'Furniture', 15000, 30000, 'Baner, Pune', 18.5362, 73.7845, 'Pune', 'Baner', 'open', NOW() - INTERVAL '5 hours'),
  ('YOUR_USER_ID', 'Swapna Reddy', null, 'Want Queen Size Bed with Storage', 'Need queen size bed with storage. Solid wood preferred. For new apartment. Hyderabad location. Budget around 20k.', 'Furniture', 15000, 25000, 'Gachibowli, Hyderabad', 17.4399, 78.3489, 'Hyderabad', 'Gachibowli', 'open', NOW() - INTERVAL '12 hours'),
  ('YOUR_USER_ID', 'Alok Tiwari', null, 'Looking for Dining Table 6 Seater', 'Want dining table with 6 chairs. Wooden preferred. Should be sturdy and in good shape. Mumbai areas. Can pickup.', 'Furniture', 10000, 20000, 'Thane West, Mumbai', 19.2183, 72.9781, 'Mumbai', 'Thane West', 'open', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Priyanka Menon', null, 'Need Study Table for Home Office', 'Looking for study/computer table with storage. For WFH setup. Bangalore location. Budget flexible for good quality.', 'Furniture', 4000, 8000, 'Whitefield, Bangalore', 12.9698, 77.7500, 'Bangalore', 'Whitefield', 'open', NOW() - INTERVAL '2 days'),

  -- Vehicles wishes
  ('YOUR_USER_ID', 'Rohan Kulkarni', null, 'Want Royal Enfield Classic 350', 'Looking for RE Classic 350. Prefer 2019 or newer. Well maintained only. Pune city. Ready to pay good price.', 'Vehicles', 100000, 140000, 'Hinjewadi, Pune', 18.5912, 73.7389, 'Pune', 'Hinjewadi', 'open', NOW() - INTERVAL '6 hours'),
  ('YOUR_USER_ID', 'Sanjana Rao', null, 'Need Activa or Similar Scooter', 'Looking for Honda Activa or similar scooter. Should be in good running condition. Bangalore areas. Budget around 40k.', 'Vehicles', 35000, 50000, 'HSR Layout, Bangalore', 12.9121, 77.6446, 'Bangalore', 'HSR Layout', 'open', NOW() - INTERVAL '10 hours'),
  ('YOUR_USER_ID', 'Abhishek Ghosh', null, 'Want Swift or i20 Hatchback', 'Looking for Maruti Swift or Hyundai i20. 2017 or newer model. Well maintained with all papers. Delhi NCR. Budget 4-5 lakh.', 'Vehicles', 400000, 550000, 'Rohini Sector 7, Delhi', 28.7041, 77.1025, 'Delhi', 'Rohini Sector 7', 'open', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Kavitha Ramesh', null, 'Looking for Kids Bicycle 6-10 Years', 'Need kids bicycle for my daughter. Hero or similar brand. Should be in safe condition. Chennai areas. Budget around 3k.', 'Vehicles', 2000, 4000, 'Velachery, Chennai', 12.9750, 80.2212, 'Chennai', 'Velachery', 'open', NOW() - INTERVAL '2 days');


-- ============================================
-- TASKS - BY CATEGORY AND CITY
-- ============================================

INSERT INTO tasks (user_id, user_name, user_avatar, title, description, category, price, location, latitude, longitude, city, area, status, deadline, created_at)
VALUES
  -- Home Services tasks
  ('YOUR_USER_ID', 'Seema Khanna', null, 'House Deep Cleaning Required', 'Need professional cleaning for 3BHK apartment. Deep cleaning including kitchen, bathrooms, windows. Should bring own supplies. Mumbai Andheri area.', 'Home Services', 2500, 'Andheri West, Mumbai', 19.1358, 72.8264, 'Mumbai', 'Andheri West', 'open', NOW() + INTERVAL '5 days', NOW() - INTERVAL '4 hours'),
  ('YOUR_USER_ID', 'Manoj Kumar', null, 'Plumber Needed for Bathroom Work', 'Bathroom tap and shower replacement work. Materials ready, just installation needed. Should complete in one day. Bangalore Koramangala.', 'Home Services', 1500, 'Koramangala, Bangalore', 12.9352, 77.6245, 'Bangalore', 'Koramangala', 'open', NOW() + INTERVAL '3 days', NOW() - INTERVAL '6 hours'),
  ('YOUR_USER_ID', 'Ritu Malhotra', null, 'Electrician for Fan and Light Installation', 'Need electrician to install 4 ceiling fans and 6 LED lights. Wiring is ready. Delhi Dwarka area. Urgent requirement.', 'Home Services', 2000, 'Dwarka Sector 12, Delhi', 28.5921, 77.0460, 'Delhi', 'Dwarka Sector 12', 'open', NOW() + INTERVAL '2 days', NOW() - INTERVAL '8 hours'),
  ('YOUR_USER_ID', 'Ganesh Iyer', null, 'Painting Work for 2 Bedrooms', 'Need painter for 2 bedrooms. Walls ready, just painting work. Paint will be provided. Chennai T Nagar area. Good pay for quality work.', 'Home Services', 6000, 'T Nagar, Chennai', 13.0418, 80.2341, 'Chennai', 'T Nagar', 'open', NOW() + INTERVAL '7 days', NOW() - INTERVAL '1 day'),

  -- Repair Services tasks
  ('YOUR_USER_ID', 'Arvind Sharma', null, 'AC Repair - Not Cooling Properly', 'My 1.5 ton AC is not cooling properly. Need experienced technician to check and repair. Gas filling if required. Pune Baner area.', 'Repair Services', 1200, 'Baner, Pune', 18.5362, 73.7845, 'Pune', 'Baner', 'open', NOW() + INTERVAL '2 days', NOW() - INTERVAL '5 hours'),
  ('YOUR_USER_ID', 'Deepika Reddy', null, 'Washing Machine Repair Needed', 'Front load washing machine not draining water. Need repair person urgently. Hyderabad Gachibowli area. Will pay well.', 'Repair Services', 800, 'Gachibowli, Hyderabad', 17.4399, 78.3489, 'Hyderabad', 'Gachibowli', 'open', NOW() + INTERVAL '1 day', NOW() - INTERVAL '3 hours'),
  ('YOUR_USER_ID', 'Nitin Agarwal', null, 'Laptop Screen Replacement', 'Need laptop screen replacement. Dell Inspiron 15. Screen is cracked. Have spare screen, just need installation. Mumbai Powai.', 'Repair Services', 1000, 'Powai, Mumbai', 19.1176, 72.9060, 'Mumbai', 'Powai', 'open', NOW() + INTERVAL '4 days', NOW() - INTERVAL '9 hours'),
  ('YOUR_USER_ID', 'Madhavi Krishna', null, 'Refrigerator Repair - Freezer Issue', 'Double door fridge freezer section not cooling. Main compartment working fine. Need experienced technician. Bangalore Whitefield.', 'Repair Services', 1500, 'Whitefield, Bangalore', 12.9698, 77.7500, 'Bangalore', 'Whitefield', 'open', NOW() + INTERVAL '3 days', NOW() - INTERVAL '12 hours'),

  -- Education & Tutoring tasks
  ('YOUR_USER_ID', 'Usha Patel', null, 'Home Tutor for Class 10 Maths & Science', 'Need experienced tutor for 10th CBSE. Maths and Science subjects. 5 days a week, 1.5 hours per day. Good pay for quality teaching. Delhi Rohini.', 'Education', 12000, 'Rohini Sector 7, Delhi', 28.7041, 77.1025, 'Delhi', 'Rohini Sector 7', 'open', NOW() + INTERVAL '15 days', NOW() - INTERVAL '2 days'),
  ('YOUR_USER_ID', 'Raghu Nath', null, 'English Speaking Classes for Adults', 'Looking for English speaking trainer for myself. Beginner level. 3 days a week. Prefer home visit. Chennai Velachery area.', 'Education', 6000, 'Velachery, Chennai', 12.9750, 80.2212, 'Chennai', 'Velachery', 'open', NOW() + INTERVAL '20 days', NOW() - INTERVAL '3 days'),
  ('YOUR_USER_ID', 'Shilpa Joshi', null, 'Guitar Classes for Beginner', 'Want guitar teacher for myself. Complete beginner. Acoustic guitar. Weekend classes preferred. Pune Hinjewadi area. Budget 4k per month.', 'Education', 4000, 'Hinjewadi, Pune', 18.5912, 73.7389, 'Pune', 'Hinjewadi', 'open', NOW() + INTERVAL '10 days', NOW() - INTERVAL '1 day'),
  ('YOUR_USER_ID', 'Mohan Reddy', null, 'Coding Classes for Kid - Python', 'Need coding teacher for my 12 year old son. Python basics. 2 days a week. Can be online or home visit. Hyderabad Kondapur.', 'Education', 8000, 'Kondapur, Hyderabad', 17.4648, 78.3671, 'Hyderabad', 'Kondapur', 'open', NOW() + INTERVAL '12 days', NOW() - INTERVAL '2 days'),

  -- Digital Services tasks
  ('YOUR_USER_ID', 'Vaibhav Mehta', null, 'Website Design for Boutique Business', 'Need simple 5-page website for my clothing boutique. Mobile responsive. WordPress preferred. Include contact form. Mumbai Bandra.', 'Digital Services', 18000, 'Bandra West, Mumbai', 19.0596, 72.8295, 'Mumbai', 'Bandra West', 'open', NOW() + INTERVAL '25 days', NOW() - INTERVAL '4 days'),
  ('YOUR_USER_ID', 'Anupama Rao', null, 'Logo Design for Startup', 'Need creative logo design for food delivery startup. Modern and colorful. 3-4 concepts required. Final files in all formats. Bangalore area.', 'Digital Services', 8000, 'Indiranagar, Bangalore', 12.9716, 77.6412, 'Bangalore', 'Indiranagar', 'open', NOW() + INTERVAL '15 days', NOW() - INTERVAL '5 days'),
  ('YOUR_USER_ID', 'Karan Bhatia', null, 'Content Writing for Blog - Tech', 'Need content writer for technology blog. 15 articles, 1000 words each. SEO optimized. Good research required. Delhi based preferred.', 'Digital Services', 15000, 'Lajpat Nagar, Delhi', 28.5677, 77.2431, 'Delhi', 'Lajpat Nagar', 'open', NOW() + INTERVAL '30 days', NOW() - INTERVAL '6 days'),
  ('YOUR_USER_ID', 'Divya Sundaram', null, 'Video Editing for YouTube Channel', 'Looking for video editor for my cooking YouTube channel. 4 videos per month. Simple editing with titles and music. Chennai area.', 'Digital Services', 6000, 'Adyar, Chennai', 13.0010, 80.2574, 'Chennai', 'Adyar', 'open', NOW() + INTERVAL '20 days', NOW() - INTERVAL '3 days');


-- ============================================
-- IMPORTANT INSTRUCTIONS
-- ============================================
-- 1. First, run STEP 1 queries to check your cities, areas, and categories
-- 2. Replace ALL 'YOUR_USER_ID' with actual user IDs from your database
-- 3. Adjust city/area names to match your actual database values
-- 4. This is a starter template - you can add more entries following the same pattern
-- 5. Ensure latitude/longitude values match the actual city/area coordinates
-- 6. Add more categories as needed from your database

-- To check the inserted data:
SELECT category, COUNT(*) as count FROM listings GROUP BY category;
SELECT category, COUNT(*) as count FROM wishes GROUP BY category;
SELECT category, COUNT(*) as count FROM tasks GROUP BY category;
SELECT city, COUNT(*) as count FROM listings GROUP BY city;
