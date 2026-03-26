-- ============================================
-- OLDCYCLE MOCK DATA GENERATOR
-- ============================================
-- This script creates realistic Indian marketplace data
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Get your admin user ID first
-- Replace 'YOUR_ADMIN_USER_ID' with your actual user ID from auth.users or profiles table

-- To find your user ID, run this first:
-- SELECT id, email, phone FROM auth.users LIMIT 5;

-- ============================================
-- WISHES - Mock Data (15 wishes)
-- ============================================

INSERT INTO wishes (user_id, user_name, user_avatar, title, description, category, budget_min, budget_max, location, latitude, longitude, city, area, status, created_at)
VALUES
  -- Replace 'YOUR_USER_ID_HERE' with actual user IDs
  ('YOUR_USER_ID_HERE', 'Rahul Kumar', null, 'Looking for iPhone 12 or 13', 'Need a used iPhone in good condition. Budget flexible for good condition phone. Prefer Mumbai area.', 'Electronics', 15000, 25000, 'Andheri West, Mumbai', 19.1358, 72.8264, 'Mumbai', 'Andheri West', 'open', NOW() - INTERVAL '2 days'),
  
  ('YOUR_USER_ID_HERE', 'Priya Sharma', null, 'Need Study Table and Chair', 'Moving to new apartment, need a good study table with chair for my son. Must be in good condition.', 'Furniture', 2000, 4000, 'Koramangala, Bangalore', 12.9352, 77.6245, 'Bangalore', 'Koramangala', 'open', NOW() - INTERVAL '5 days'),
  
  ('YOUR_USER_ID_HERE', 'Amit Patel', null, 'Looking for Royal Enfield Motorcycle', 'Want to buy used Royal Enfield Classic 350. Prefer 2018 or newer model. Ready to pay good price for well maintained bike.', 'Vehicles', 80000, 120000, 'Satellite, Ahmedabad', 23.0225, 72.5714, 'Ahmedabad', 'Satellite', 'open', NOW() - INTERVAL '1 day'),
  
  ('YOUR_USER_ID_HERE', 'Sneha Reddy', null, 'Need Canon DSLR Camera', 'Looking for Canon 1500D or similar DSLR camera with kit lens. For photography hobby. Budget around 25k.', 'Electronics', 20000, 30000, 'Banjara Hills, Hyderabad', 17.4239, 78.4738, 'Hyderabad', 'Banjara Hills', 'open', NOW() - INTERVAL '3 days'),
  
  ('YOUR_USER_ID_HERE', 'Vikram Singh', null, 'Want Gaming Laptop', 'Need gaming laptop for video editing and gaming. Looking for RTX 3050 or better. Budget negotiable.', 'Electronics', 45000, 65000, 'Gomti Nagar, Lucknow', 26.8467, 80.9462, 'Lucknow', 'Gomti Nagar', 'open', NOW() - INTERVAL '4 days'),
  
  ('YOUR_USER_ID_HERE', 'Anjali Mehta', null, 'Looking for Treadmill', 'Want a treadmill for home use. Should be in working condition. Can pick up from your location.', 'Sports', 8000, 15000, 'Vastrapur, Ahmedabad', 23.0395, 72.5264, 'Ahmedabad', 'Vastrapur', 'open', NOW() - INTERVAL '6 hours'),
  
  ('YOUR_USER_ID_HERE', 'Karthik Iyer', null, 'Need Refrigerator', 'Looking for double door fridge, 250L or more. Samsung/LG preferred. Should be in good working condition.', 'Home Appliances', 8000, 12000, 'T Nagar, Chennai', 13.0418, 80.2341, 'Chennai', 'T Nagar', 'open', NOW() - INTERVAL '8 hours'),
  
  ('YOUR_USER_ID_HERE', 'Neha Gupta', null, 'Want Kids Bicycle', 'Need bicycle for 8 year old kid. Hero or similar brand. Must be in safe condition.', 'Sports', 2000, 4000, 'Sector 62, Noida', 28.6271, 77.3714, 'Noida', 'Sector 62', 'open', NOW() - INTERVAL '12 hours'),
  
  ('YOUR_USER_ID_HERE', 'Rajesh Rao', null, 'Looking for AC 1.5 Ton', 'Need split AC for bedroom. 1.5 ton capacity. Any good brand. Should cool properly.', 'Home Appliances', 12000, 18000, 'Whitefield, Bangalore', 12.9698, 77.7500, 'Bangalore', 'Whitefield', 'open', NOW() - INTERVAL '1 day'),
  
  ('YOUR_USER_ID_HERE', 'Pooja Desai', null, 'Need Sofa Set 3+2', 'Looking for sofa set in good condition. Color preference: Brown or Beige. For living room.', 'Furniture', 10000, 20000, 'Navrangpura, Ahmedabad', 23.0395, 72.5553, 'Ahmedabad', 'Navrangpura', 'open', NOW() - INTERVAL '2 days'),
  
  ('YOUR_USER_ID_HERE', 'Arjun Nair', null, 'Want PS5 or Xbox Series X', 'Looking for gaming console. PS5 digital or Xbox Series X. With controller and cables.', 'Electronics', 35000, 45000, 'Indiranagar, Bangalore', 12.9716, 77.6412, 'Bangalore', 'Indiranagar', 'open', NOW() - INTERVAL '18 hours'),
  
  ('YOUR_USER_ID_HERE', 'Divya Shah', null, 'Need Washing Machine', 'Looking for fully automatic washing machine. 6-7 kg capacity. Top load or front load both ok.', 'Home Appliances', 8000, 14000, 'Bodakdev, Ahmedabad', 23.0395, 72.5008, 'Ahmedabad', 'Bodakdev', 'open', NOW() - INTERVAL '3 days'),
  
  ('YOUR_USER_ID_HERE', 'Sanjay Kumar', null, 'Looking for Dining Table', 'Need 6 seater dining table with chairs. Wooden preferred. Should be sturdy and in good shape.', 'Furniture', 8000, 15000, 'Vashi, Navi Mumbai', 19.0768, 73.0004, 'Navi Mumbai', 'Vashi', 'open', NOW() - INTERVAL '5 days'),
  
  ('YOUR_USER_ID_HERE', 'Meera Pillai', null, 'Want MacBook Air', 'Looking for MacBook Air M1 or M2. Should be in excellent condition with charger. Budget flexible.', 'Electronics', 50000, 70000, 'Kakkanad, Kochi', 10.0051, 76.3467, 'Kochi', 'Kakkanad', 'open', NOW() - INTERVAL '1 day'),
  
  ('YOUR_USER_ID_HERE', 'Rohan Joshi', null, 'Need Guitar for Beginner', 'Want acoustic guitar for learning. Yamaha or similar brand. Should have good sound quality.', 'Music', 3000, 6000, 'Shivaji Nagar, Pune', 18.5304, 73.8567, 'Pune', 'Shivaji Nagar', 'open', NOW() - INTERVAL '2 days');


-- ============================================
-- TASKS - Mock Data (15 tasks)
-- ============================================

INSERT INTO tasks (user_id, user_name, user_avatar, title, description, category, price, location, latitude, longitude, city, area, status, deadline, created_at)
VALUES
  ('YOUR_USER_ID_HERE', 'Aisha Khan', null, 'Need House Cleaning Service', 'Looking for someone to clean 2BHK apartment. Deep cleaning required. Should bring own cleaning supplies.', 'Home Services', 1500, 'Malad West, Mumbai', 19.1871, 72.8489, 'Mumbai', 'Malad West', 'open', NOW() + INTERVAL '7 days', NOW() - INTERVAL '1 day'),
  
  ('YOUR_USER_ID_HERE', 'Suresh Pillai', null, 'AC Repair Needed Urgently', 'My split AC is not cooling. Need experienced technician to check and repair. Urgent requirement.', 'Repair Services', 800, 'HSR Layout, Bangalore', 12.9121, 77.6446, 'Bangalore', 'HSR Layout', 'open', NOW() + INTERVAL '3 days', NOW() - INTERVAL '5 hours'),
  
  ('YOUR_USER_ID_HERE', 'Lakshmi Iyer', null, 'Home Tutor for Class 10 Math', 'Need experienced tutor for 10th standard CBSE mathematics. 5 days a week, 1 hour per day. Good pay for quality teaching.', 'Education', 8000, 'Anna Nagar, Chennai', 13.0850, 80.2101, 'Chennai', 'Anna Nagar', 'open', NOW() + INTERVAL '15 days', NOW() - INTERVAL '2 days'),
  
  ('YOUR_USER_ID_HERE', 'Manish Sharma', null, 'Need Plumber for Kitchen Work', 'Kitchen sink and tap replacement work. Should complete in one day. Materials will be provided.', 'Home Services', 1200, 'Vaishali Nagar, Jaipur', 26.9124, 75.7873, 'Jaipur', 'Vaishali Nagar', 'open', NOW() + INTERVAL '5 days', NOW() - INTERVAL '8 hours'),
  
  ('YOUR_USER_ID_HERE', 'Deepa Reddy', null, 'Pet Grooming Required', 'Need professional grooming for my Golden Retriever. Bath, trimming, nail cutting. At home preferred.', 'Pet Services', 1000, 'Jubilee Hills, Hyderabad', 17.4239, 78.4067, 'Hyderabad', 'Jubilee Hills', 'open', NOW() + INTERVAL '4 days', NOW() - INTERVAL '1 day'),
  
  ('YOUR_USER_ID_HERE', 'Varun Malhotra', null, 'Bike Service at Home', 'Need mechanic to service my Honda Activa at home. Oil change, general checkup. I will provide oil.', 'Vehicle Services', 500, 'Sector 18, Noida', 28.5706, 77.3272, 'Noida', 'Sector 18', 'open', NOW() + INTERVAL '6 days', NOW() - INTERVAL '12 hours'),
  
  ('YOUR_USER_ID_HERE', 'Shreya Nair', null, 'Website Design for Small Business', 'Need simple 5-page website for my boutique. Should be mobile responsive. WordPress or similar platform ok.', 'Digital Services', 15000, 'Frazer Town, Bangalore', 12.9897, 77.6196, 'Bangalore', 'Frazer Town', 'open', NOW() + INTERVAL '20 days', NOW() - INTERVAL '3 days'),
  
  ('YOUR_USER_ID_HERE', 'Ravi Kumar', null, 'Painting Work for 2 Rooms', 'Need painter for 2 bedrooms. Walls already plastered, just painting needed. Paint will be provided.', 'Home Services', 5000, 'Pimple Saudagar, Pune', 18.5990, 73.8072, 'Pune', 'Pimple Saudagar', 'open', NOW() + INTERVAL '10 days', NOW() - INTERVAL '2 days'),
  
  ('YOUR_USER_ID_HERE', 'Priyanka Das', null, 'Yoga Instructor Needed', 'Looking for certified yoga instructor for home sessions. 3 days a week in morning. Experienced only.', 'Health & Fitness', 6000, 'Salt Lake, Kolkata', 22.5697, 88.4322, 'Kolkata', 'Salt Lake', 'open', NOW() + INTERVAL '14 days', NOW() - INTERVAL '1 day'),
  
  ('YOUR_USER_ID_HERE', 'Akash Patel', null, 'Electrician for Fan Installation', 'Need to install 3 ceiling fans. Wiring is ready, just installation and testing required.', 'Home Services', 800, 'Maninagar, Ahmedabad', 23.0008, 72.6003, 'Ahmedabad', 'Maninagar', 'open', NOW() + INTERVAL '5 days', NOW() - INTERVAL '18 hours'),
  
  ('YOUR_USER_ID_HERE', 'Kavya Menon', null, 'Logo Design for Startup', 'Need creative logo design for my food delivery startup. Should be modern and eye-catching. 3-4 concepts needed.', 'Digital Services', 5000, 'MG Road, Bangalore', 12.9716, 77.5946, 'Bangalore', 'MG Road', 'open', NOW() + INTERVAL '12 days', NOW() - IDENTIFIER '4 days'),
  
  ('YOUR_USER_ID_HERE', 'Nikhil Jain', null, 'Carpenter for Wardrobe Repair', 'Bedroom wardrobe door hinges broken. Need carpenter to fix hinges and align doors properly.', 'Home Services', 600, 'C Scheme, Jaipur', 26.9124, 75.7873, 'Jaipur', 'C Scheme', 'open', NOW() + INTERVAL '6 days', NOW() - INTERVAL '1 day'),
  
  ('YOUR_USER_ID_HERE', 'Ananya Roy', null, 'Photography for Birthday Party', 'Need photographer for kids birthday party. 3-4 hours coverage. Should provide edited photos within a week.', 'Events', 4000, 'Park Street, Kolkata', 22.5542, 88.3514, 'Kolkata', 'Park Street', 'open', NOW() + INTERVAL '8 days', NOW() - INTERVAL '2 days'),
  
  ('YOUR_USER_ID_HERE', 'Harish Nambiar', null, 'Content Writing for Blog', 'Need content writer for technology blog. 10 articles, 800-1000 words each. SEO optimized content required.', 'Digital Services', 10000, 'Vyttila, Kochi', 9.9674, 76.3162, 'Kochi', 'Vyttila', 'open', NOW() + INTERVAL '25 days', NOW() - INTERVAL '5 days'),
  
  ('YOUR_USER_ID_HERE', 'Ritika Chopra', null, 'Dog Walking Service Needed', 'Need someone to walk my Labrador twice daily. Morning 7am and evening 6pm. Must love dogs!', 'Pet Services', 4000, 'Versova, Mumbai', 19.1310, 72.8114, 'Mumbai', 'Versova', 'open', NOW() + INTERVAL '30 days', NOW() - INTERVAL '1 day');


-- ============================================
-- LISTINGS - Mock Data (20 listings)
-- ============================================

INSERT INTO listings (user_id, user_name, user_avatar, title, description, category, price, condition, location, latitude, longitude, city, area, status, listing_type, created_at)
VALUES
  ('YOUR_USER_ID_HERE', 'Ajay Verma', null, 'iPhone 11 128GB - Excellent Condition', 'Selling iPhone 11 128GB in mint condition. Battery health 87%. All accessories included. No scratches on screen. Original box available.', 'Electronics', 28000, 'Excellent', 'Borivali West, Mumbai', 19.2304, 72.8562, 'Mumbai', 'Borivali West', 'available', 'sell', NOW() - INTERVAL '1 day'),
  
  ('YOUR_USER_ID_HERE', 'Swati Kulkarni', null, 'Wooden Study Table with Chair', 'Solid wood study table with matching chair. Very good condition, minimal usage. Compact design perfect for small rooms. Reason for selling: shifting abroad.', 'Furniture', 3500, 'Good', 'Jayanagar, Bangalore', 12.9250, 77.5838, 'Bangalore', 'Jayanagar', 'available', 'sell', NOW() - INTERVAL '2 days'),
  
  ('YOUR_USER_ID_HERE', 'Mohammed Ali', null, 'Sony PlayStation 4 Pro with 5 Games', 'PS4 Pro 1TB console in perfect working condition. Includes 5 games (FIFA 23, GTA V, Spider-Man, God of War, Uncharted 4). 2 controllers included.', 'Electronics', 22000, 'Excellent', 'Banjara Hills, Hyderabad', 17.4239, 78.4738, 'Hyderabad', 'Banjara Hills', 'available', 'sell', NOW() - INTERVAL '3 hours'),
  
  ('YOUR_USER_ID_HERE', 'Sunita Agarwal', null, 'LG Double Door Refrigerator 260L', 'LG 260L frost free refrigerator. 4 years old but works perfectly. Moving to smaller apartment so selling. Silver color.', 'Home Appliances', 10000, 'Good', 'Hazratganj, Lucknow', 26.8548, 80.9429, 'Lucknow', 'Hazratganj', 'available', 'sell', NOW() - INTERVAL '4 days'),
  
  ('YOUR_USER_ID_HERE', 'Kiran Rao', null, 'Hero Splendor Plus 2019 Model', 'Well maintained bike, single owner. Regular servicing done. All documents clear. New tyres fitted 2 months back. Genuine reason for selling.', 'Vehicles', 42000, 'Excellent', 'Marathahalli, Bangalore', 12.9591, 77.6974, 'Bangalore', 'Marathahalli', 'available', 'sell', NOW() - INTERVAL '5 days'),
  
  ('YOUR_USER_ID_HERE', 'Tanvi Joshi', null, 'Canon EOS 1500D DSLR with Lens', 'Canon 1500D with 18-55mm kit lens. Purchased 1 year ago. Rarely used, like new condition. Camera bag and memory card included.', 'Electronics', 24000, 'Excellent', 'Aundh, Pune', 18.5642, 73.8077, 'Pune', 'Aundh', 'available', 'sell', NOW() - INTERVAL '1 day'),
  
  ('YOUR_USER_ID_HERE', 'Vishal Pandey', null, 'HP Pavilion Gaming Laptop i5 10th Gen', 'HP Pavilion gaming laptop. i5 10th gen, 8GB RAM, 512GB SSD, GTX 1650 4GB graphics. Perfect for gaming and video editing. 2 years old.', 'Electronics', 45000, 'Good', 'Gomti Nagar, Lucknow', 26.8467, 80.9462, 'Lucknow', 'Gomti Nagar', 'available', 'sell', NOW() - INTERVAL '2 days'),
  
  ('YOUR_USER_ID_HERE', 'Rekha Menon', null, '5 Seater Sofa Set - Brown Leather', 'Premium quality 5 seater sofa set in brown leather. Very comfortable and looks elegant. Only 1 year old. Selling due to home renovation.', 'Furniture', 18000, 'Excellent', 'Powai, Mumbai', 19.1176, 72.9060, 'Mumbai', 'Powai', 'available', 'sell', NOW() - INTERVAL '6 hours'),
  
  ('YOUR_USER_ID_HERE', 'Ashwin Kumar', null, 'Treadmill - Motorized with Incline', 'Branded motorized treadmill with auto incline feature. Max speed 12kmph. Rarely used, almost new. Heavy duty motor. Space issue, hence selling.', 'Sports', 18000, 'Excellent', 'Velachery, Chennai', 12.9750, 80.2212, 'Chennai', 'Velachery', 'available', 'sell', NOW() - INTERVAL '3 days'),
  
  ('YOUR_USER_ID_HERE', 'Nisha Kapoor', null, 'Samsung 43 inch Smart TV Full HD', 'Samsung Full HD smart TV 43 inch. Perfect display, no dead pixels. All apps work smoothly. With original remote and wall mount.', 'Electronics', 20000, 'Good', 'Sector 50, Noida', 28.5706, 77.3671, 'Noida', 'Sector 50', 'available', 'sell', NOW() - INTERVAL '1 day'),
  
  ('YOUR_USER_ID_HERE', 'Ganesh Iyer', null, 'Yamaha FZ Version 3.0 2020', 'Yamaha FZ V3 in metallic blue color. Excellent condition, regularly serviced. Second owner but maintained like new. All papers clear.', 'Vehicles', 85000, 'Excellent', 'Koramangala, Bangalore', 12.9352, 77.6245, 'Bangalore', 'Koramangala', 'available', 'sell', NOW() - INTERVAL '4 days'),
  
  ('YOUR_USER_ID_HERE', 'Pallavi Shah', null, 'IFB Front Load Washing Machine 6kg', 'IFB 6kg front load fully automatic washing machine. Works perfectly. 3 years old. All functions working fine. Minor scratches on body.', 'Home Appliances', 9000, 'Good', 'Prahlad Nagar, Ahmedabad', 23.0072, 72.5044, 'Ahmedabad', 'Prahlad Nagar', 'available', 'sell', NOW() - INTERVAL '2 days'),
  
  ('YOUR_USER_ID_HERE', 'Siddharth Desai', null, 'Office Chair - Ergonomic High Back', 'Ergonomic office chair with lumbar support. High back, adjustable height and armrest. Very comfortable for long hours. Black color.', 'Furniture', 4000, 'Good', 'Baner, Pune', 18.5362, 73.7845, 'Pune', 'Baner', 'available', 'sell', NOW() - INTERVAL '5 hours'),
  
  ('YOUR_USER_ID_HERE', 'Geeta Krishnan', null, 'Nikon D3500 DSLR Camera with Accessories', 'Nikon D3500 DSLR with 18-55mm and 70-300mm lenses. Tripod, camera bag, extra battery included. Excellent condition, barely used.', 'Electronics', 32000, 'Excellent', 'Adyar, Chennai', 13.0010, 80.2574, 'Chennai', 'Adyar', 'available', 'sell', NOW() - INTERVAL '1 day'),
  
  ('YOUR_USER_ID_HERE', 'Aryan Sinha', null, 'Kids Bicycle 6-10 Years - Hero Brand', 'Hero kids bicycle suitable for 6-10 years age. Red color, good condition. Training wheels can be attached. My kid has outgrown it.', 'Sports', 2500, 'Good', 'Dwarka Sector 12, Delhi', 28.5921, 77.0460, 'Delhi', 'Dwarka Sector 12', 'available', 'sell', NOW() - INTERVAL '3 days'),
  
  ('YOUR_USER_ID_HERE', 'Madhuri Rane', null, 'Dining Table 6 Seater Wooden', '6 seater wooden dining table with chairs. Solid construction, heavy duty. Beautiful finish. Selling as bought new furniture. No damage.', 'Furniture', 12000, 'Good', 'Thane West, Thane', 19.2183, 72.9781, 'Thane', 'Thane West', 'available', 'sell', NOW() - INTERVAL '2 days'),
  
  ('YOUR_USER_ID_HERE', 'Rahul Jain', null, 'Split AC 1.5 Ton - Voltas Brand', 'Voltas 1.5 ton split AC. 3 star rating. Cools very well. 5 years old but well maintained. Selling due to relocation. Installation included.', 'Home Appliances', 14000, 'Good', 'Satellite, Ahmedabad', 23.0225, 72.5714, 'Ahmedabad', 'Satellite', 'available', 'sell', NOW() - INTERVAL '4 days'),
  
  ('YOUR_USER_ID_HERE', 'Snehal Patil', null, 'OnePlus 9R 5G - 128GB Lake Blue', 'OnePlus 9R in lake blue color. 8GB RAM, 128GB storage. Excellent condition with original charger and case. Battery backup still great. 1.5 years old.', 'Electronics', 24000, 'Excellent', 'Hinjewadi, Pune', 18.5912, 73.7389, 'Pune', 'Hinjewadi', 'available', 'sell', NOW() - INTERVAL '8 hours'),
  
  ('YOUR_USER_ID_HERE', 'Vikrant Mishra', null, 'Acoustic Guitar - Yamaha F310', 'Yamaha F310 acoustic guitar. Great sound quality, perfect for beginners and intermediate players. Well maintained. With soft case.', 'Music', 4500, 'Good', 'Indira Nagar, Lucknow', 26.8760, 80.9981, 'Lucknow', 'Indira Nagar', 'available', 'sell', NOW() - INTERVAL '3 days'),
  
  ('YOUR_USER_ID_HERE', 'Aditi Bhatt', null, 'MacBook Air M1 2020 - 256GB Silver', 'MacBook Air M1 chip, 8GB RAM, 256GB SSD. Silver color. Like new condition, barely 6 months used. All accessories and box included. No scratches.', 'Electronics', 62000, 'Excellent', 'Indiranagar, Bangalore', 12.9716, 77.6412, 'Bangalore', 'Indiranagar', 'available', 'sell', NOW() - INTERVAL '1 day');


-- ============================================
-- IMPORTANT: REPLACE USER IDs
-- ============================================
-- Before running this script:
-- 1. Find your actual user ID by running: SELECT id, email FROM auth.users LIMIT 5;
-- 2. Replace ALL instances of 'YOUR_USER_ID_HERE' with actual user IDs
-- 3. You can use same user ID for all, or distribute among multiple test users
-- 4. Run this script in Supabase SQL Editor
-- ============================================

-- To verify data after insertion:
-- SELECT COUNT(*) FROM wishes;
-- SELECT COUNT(*) FROM tasks;
-- SELECT COUNT(*) FROM listings;
