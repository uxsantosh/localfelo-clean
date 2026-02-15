/**
 * OldCycle INDIAN Production Seed
 * - 100% Indian context images
 * - Complete desi marketplace feel
 * - Real Indian product names
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const SUPABASE_URL = 'https://drofnrntrbedtjtpseve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SELLERS = [
  { name: 'Rajesh Kumar', phone: '9876543210' }, { name: 'Priya Sharma', phone: '9823456789' },
  { name: 'Amit Patel', phone: '9765432109' }, { name: 'Sneha Reddy', phone: '9654321098' },
  { name: 'Vikram Singh', phone: '9543210987' }, { name: 'Anjali Gupta', phone: '9432109876' },
  { name: 'Rahul Verma', phone: '9321098765' }, { name: 'Pooja Nair', phone: '9210987654' },
  { name: 'Arjun Mehta', phone: '9109876543' }, { name: 'Kavya Iyer', phone: '9098765432' },
  { name: 'Sanjay Joshi', phone: '9987654321' }, { name: 'Neha Kapoor', phone: '9876549876' },
  { name: 'Rohan Das', phone: '9765438765' }, { name: 'Divya Pillai', phone: '9654327654' },
  { name: 'Karthik Rao', phone: '9543216543' }, { name: 'Shreya Desai', phone: '9432105432' },
  { name: 'Manish Agarwal', phone: '9321094321' }, { name: 'Ritu Malhotra', phone: '9210983210' },
  { name: 'Aditya Saxena', phone: '9109872109' }, { name: 'Meera Jain', phone: '9098761098' },
  { name: 'Suresh Patil', phone: '9887654321' }, { name: 'Lakshmi Reddy', phone: '9776543210' },
  { name: 'Praveen Kumar', phone: '9665432109' }, { name: 'Swati Singh', phone: '9554321098' },
  { name: 'Nikhil Shah', phone: '9443210987' }, { name: 'Deepika Nair', phone: '9332109876' },
  { name: 'Harish Menon', phone: '9221098765' }, { name: 'Pallavi Chopra', phone: '9110987654' },
  { name: 'Varun Khanna', phone: '9009876543' }, { name: 'Sonal Bhat', phone: '9898765432' },
  { name: 'Ramesh Iyer', phone: '9787654321' }, { name: 'Kavita Singh', phone: '9676543210' },
  { name: 'Vishal Gupta', phone: '9565432109' }, { name: 'Anita Deshmukh', phone: '9454321098' },
  { name: 'Prakash Rao', phone: '9343210987' },
];

// INDIAN-SPECIFIC IMAGE POOLS (from Unsplash with India context)
const INDIAN_IMAGE_POOLS = {
  mobiles: [
    'https://images.unsplash.com/photo-1589894404892-7310b92ea7a2?w=800', // india mobile phone
    'https://images.unsplash.com/photo-1622732776208-a70bb61da7c9?w=800', // indian workspace laptop
    'https://images.unsplash.com/photo-1646929189708-eb1b9fff7387?w=800', // india street market
    'https://images.unsplash.com/photo-1534403639057-777ab3b0015b?w=800', // india traffic urban
    'https://images.unsplash.com/flagged/photo-1561057598-7b1e48ee7c42?w=800', // indian street vendor
  ],
  vehicles: [
    'https://images.unsplash.com/photo-1616551169622-d5ff22d1d249?w=800', // indian car parking
    'https://images.unsplash.com/photo-1694928938628-5be5454d3302?w=800', // maruti suzuki car
    'https://images.unsplash.com/photo-1685019718640-6e562edc365e?w=800', // tata motors vehicle
    'https://images.unsplash.com/photo-1687448703223-894503f57527?w=800', // mahindra suv india
    'https://images.unsplash.com/photo-1534403639057-777ab3b0015b?w=800', // india traffic urban
  ],
  furniture: [
    'https://images.unsplash.com/photo-1633605016074-9ea5617128a7?w=800', // indian home interior
    'https://images.unsplash.com/photo-1742319096912-7bb94fdfeb03?w=800', // indian bedroom furniture
    'https://images.unsplash.com/photo-1745301558339-44eb3217d5da?w=800', // india living room
    'https://images.unsplash.com/photo-1713719469527-254d1308e35c?w=800', // indian house traditional
    'https://images.unsplash.com/photo-1646929189708-eb1b9fff7387?w=800', // india street market
  ],
  electronics: [
    'https://images.unsplash.com/photo-1692935794713-a0f9304749a5?w=800', // india laptop computer
    'https://images.unsplash.com/photo-1622732776208-a70bb61da7c9?w=800', // indian workspace laptop
    'https://images.unsplash.com/photo-1672065016242-896182ce7c45?w=800', // indian television home
    'https://images.unsplash.com/photo-1700234678818-b354a49ef9de?w=800', // bangalore tech office
    'https://images.unsplash.com/photo-1674559793997-8b94366ddf41?w=800', // delhi india city
  ],
  'bikes-scooters': [
    'https://images.unsplash.com/photo-1591517487866-e7c7bf9896fb?w=800', // indian scooter bike
    'https://images.unsplash.com/photo-1683743637041-a1215e8e3052?w=800', // india motorcycle road
    'https://images.unsplash.com/photo-1626491058156-2daaeea7f578?w=800', // india auto rickshaw
    'https://images.unsplash.com/photo-1534403639057-777ab3b0015b?w=800', // india traffic urban
  ],
  appliances: [
    'https://images.unsplash.com/photo-1702206292733-a5d452e62180?w=800', // indian kitchen appliances
    'https://images.unsplash.com/photo-1633605016074-9ea5617128a7?w=800', // indian home interior
    'https://images.unsplash.com/photo-1745301558339-44eb3217d5da?w=800', // india living room
    'https://images.unsplash.com/photo-1713719469527-254d1308e35c?w=800', // indian house traditional
  ],
  books: [
    'https://images.unsplash.com/photo-1676302447092-14a103558511?w=800', // india books education
    'https://images.unsplash.com/photo-1623863568368-69e4cbe6cc0b?w=800', // indian textbooks students
    'https://images.unsplash.com/photo-1562236457-bdc2bec633cb?w=800', // indian market bazaar
  ],
  fashion: [
    'https://images.unsplash.com/photo-1752653425039-cf1ff22d61bc?w=800', // indian clothing fashion
    'https://images.unsplash.com/photo-1726133731374-31f3ab7d29d9?w=800', // indian shoes footwear
    'https://images.unsplash.com/photo-1562236457-bdc2bec633cb?w=800', // indian market bazaar
    'https://images.unsplash.com/photo-1646929189708-eb1b9fff7387?w=800', // india street market
  ],
  'sports-fitness': [
    'https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?w=800', // india cricket sports
    'https://images.unsplash.com/photo-1651165924201-d8156dbe9fc2?w=800', // india gym fitness
    'https://images.unsplash.com/photo-1711446731875-82e07f8c11b3?w=800', // india festival celebration
  ],
  pets: [
    'https://images.unsplash.com/photo-1643781947685-df6b607c3fe5?w=800', // indian pet dog
    'https://images.unsplash.com/photo-1633605016074-9ea5617128a7?w=800', // indian home interior
    'https://images.unsplash.com/photo-1713719469527-254d1308e35c?w=800', // indian house traditional
  ],
  'real-estate': [
    'https://images.unsplash.com/photo-1708168583024-ab1826128190?w=800', // mumbai apartment building
    'https://images.unsplash.com/photo-1667375887091-2237f31fa92b?w=800', // india residential building
    'https://images.unsplash.com/photo-1713719469527-254d1308e35c?w=800', // indian house traditional
    'https://images.unsplash.com/photo-1633605016074-9ea5617128a7?w=800', // indian home interior
    'https://images.unsplash.com/photo-1674559793997-8b94366ddf41?w=800', // delhi india city
    'https://images.unsplash.com/photo-1720108431534-c314670edc99?w=800', // pune india cityscape
  ],
  jobs: [
    'https://images.unsplash.com/photo-1622732776208-a70bb61da7c9?w=800', // indian workspace laptop
    'https://images.unsplash.com/photo-1700234678818-b354a49ef9de?w=800', // bangalore tech office
    'https://images.unsplash.com/photo-1692935794713-a0f9304749a5?w=800', // india laptop computer
  ],
  services: [
    'https://images.unsplash.com/photo-1646929189708-eb1b9fff7387?w=800', // india street market
    'https://images.unsplash.com/photo-1633605016074-9ea5617128a7?w=800', // indian home interior
    'https://images.unsplash.com/photo-1702206292733-a5d452e62180?w=800', // indian kitchen appliances
  ],
  other: [
    'https://images.unsplash.com/photo-1677891963999-0d65355e8fea?w=800', // india plants garden
    'https://images.unsplash.com/photo-1650439938130-7c1438af7dcf?w=800', // india temple colorful
    'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?w=800', // indian wedding decoration
    'https://images.unsplash.com/photo-1562236457-bdc2bec633cb?w=800', // indian market bazaar
  ],
};

// Comprehensive listings
const LISTINGS = {
  mobiles: [
    { title: 'iPhone 13 128GB Midnight Black Excellent Condition', desc: 'Used iPhone 13 in excellent condition. Battery health 91%. Original box and charger included. Single owner, very well maintained. No scratches on screen. Face ID working perfectly. Bought from authorized Apple store.', price: 42000 },
    { title: 'iPhone 12 Pro 256GB Pacific Blue With Bill', desc: 'iPhone 12 Pro in mint condition. All accessories with bill from Imagine store. Battery health 88%. No dents or marks. Selling as upgrading to 14 Pro. Camera excellent.', price: 52000 },
    { title: 'iPhone 11 64GB White Good Working', desc: 'Good condition iPhone 11. Minor scratches on back but screen is perfect. Works flawlessly. With charger. Battery backup decent. Great for daily use.', price: 28000 },
    { title: 'iPhone 14 128GB Purple Like New 4 Months', desc: 'iPhone 14 barely used for 4 months. Like new condition. Under Apple warranty. All original accessories. Midnight purple color. Premium phone. Bill available.', price: 68000 },
    { title: 'Samsung Galaxy S22 Ultra 256GB Phantom Black', desc: 'Samsung S22 Ultra barely used for 6 months. Complete box with S Pen and all accessories. Like new condition. Amazing camera with 108MP. 5G enabled. Fast charging.', price: 68000 },
    { title: 'Samsung Galaxy S21 5G 128GB Violet', desc: 'S21 5G in excellent condition. 5G enabled, amazing camera. Used for 1 year. Original charger and case included. Fast charging working. Great condition.', price: 38000 },
    { title: 'Samsung Galaxy M52 8GB 128GB Black', desc: 'Galaxy M52 mid-range phone. 8GB RAM, 120Hz display. Excellent for daily use. 6 months old. No scratches. Great battery backup.', price: 18000 },
    { title: 'OnePlus 11R 16GB RAM 256GB Galactic Silver', desc: 'OnePlus 11R top variant with 16GB RAM. Blazing fast performance. Only 3 months old. Bill available from OnePlus store. Fast charging 100W.', price: 35000 },
    { title: 'OnePlus 9 Pro 12GB 256GB Morning Mist', desc: 'OnePlus 9 Pro with Hasselblad camera. Excellent gaming phone. Minor scratches on back. Works perfectly. Smooth 120Hz display. OxygenOS latest.', price: 32000 },
    { title: 'OnePlus Nord 2T 8GB 128GB Gray Shadow', desc: 'OnePlus Nord 2T with MediaTek Dimensity. Great mid-ranger. Used for 7 months. Good condition. Fast charging 80W. Perfect for students.', price: 23000 },
    { title: 'Xiaomi 13 Pro 12GB 256GB Ceramic Black', desc: 'Mi 13 Pro flagship phone. Leica camera, incredible photos. Barely used for 4 months. Complete package. Premium ceramic back. MIUI latest version.', price: 58000 },
    { title: 'Xiaomi 12 Pro 12GB 256GB Blue', desc: 'Mi 12 Pro with Snapdragon 8 Gen 1. Great performance. 8 months old. Good condition. Fast charging 120W included. Great display.', price: 42000 },
    { title: 'Redmi Note 12 Pro 8GB 128GB White', desc: 'Redmi Note 12 Pro budget king. 108MP camera, AMOLED display. Like new. Only 3 months old. Bill available. Perfect value for money.', price: 18000 },
    { title: 'Realme GT 2 Pro 12GB 256GB Steel Black', desc: 'Realme GT 2 Pro gaming beast. Snapdragon 8 Gen 1. Perfect condition. Used for 6 months. Great for BGMI and COD. Smooth gaming experience.', price: 28000 },
    { title: 'Vivo V27 Pro 12GB 256GB Magic Blue', desc: 'Vivo V27 Pro with amazing selfie camera. Color changing back. Like new. Only 2 months old. Great for photography. Curved display.', price: 32000 },
  ],
  vehicles: [
    { title: 'Maruti Swift VXI 2020 Pearl White', desc: 'Swift VXI petrol in excellent condition. Single owner from Delhi. 32,000 km driven. Full service history from Maruti showroom. No accidents. AC working perfect. All papers clear.', price: 650000 },
    { title: 'Maruti Baleno Alpha 2021 Nexa Blue', desc: 'Baleno Alpha top model from Nexa. Automatic CVT. 28,000 km. Premium hatchback. All features working. Showroom maintained. Great fuel efficiency.', price: 850000 },
    { title: 'Hyundai i20 Sportz 2019 Fiery Red', desc: 'i20 Sportz top model. Diesel. Well maintained. 45,000 km. First owner. All papers clear. Great condition. Delhi registered.', price: 720000 },
    { title: 'Hyundai Venue SX Plus 2022 Black', desc: 'Venue SX Plus compact SUV. Petrol. Only 18,000 km. Under warranty. Excellent condition. Premium interior. Sunroof available.', price: 1100000 },
    { title: 'Honda City VX CVT 2021 Radiant Silver', desc: 'Honda City automatic petrol. Premium sedan. Only 28,000 km. Under warranty. Showroom maintained. Leather seats. Great mileage.', price: 1250000 },
    { title: 'Tata Nexon XZ Plus 2020 Foliage Green', desc: 'Nexon XZ Plus diesel. Excellent SUV. Well serviced. 38,000 km. Single owner. All features working. 5-star safety rating. Mumbai registered.', price: 920000 },
    { title: 'Mahindra XUV500 W10 2018 Volcano Black', desc: 'XUV500 W10 diesel in great condition. 7 seater SUV. 55,000 km. Well maintained. Family car. Spacious and comfortable. Pune registered.', price: 1150000 },
  ],
  furniture: [
    { title: 'L Shape Sofa 6 Seater Grey Fabric Premium', desc: 'Beautiful L shape sofa set in grey fabric. Excellent condition. Barely used for 1 year. Very comfortable with soft cushions. Selling due to home shifting to Bangalore. Heavy and sturdy.', price: 22000 },
    { title: '3+2 Seater Sofa Set Brown Fabric', desc: '3 seater and 2 seater sofa in brown fabric. Good condition. Used for 2 years. Comfortable and stylish. Moving sale. Perfect for Indian homes.', price: 28000 },
    { title: 'Sheesham Wood Double Bed with Storage Box', desc: 'Solid sheesham wood king size double bed with box storage. Includes good quality mattress. Used for 2 years. Well maintained. Beautiful carved design. Heavy quality.', price: 18000 },
    { title: 'Queen Size Bed Hydraulic Storage White', desc: 'Modern queen bed with hydraulic storage. Engineered wood. Excellent condition. 1 year old. With ortho mattress. Space saving design.', price: 16000 },
    { title: '6 Seater Dining Table Teak Wood Carved', desc: 'Teak wood dining table with 6 cushioned chairs. Beautiful traditional design. Excellent condition. Moving sale. Heavy and premium quality.', price: 28000 },
    { title: 'Study Table with Chair and Storage Drawer', desc: 'Modern study table with comfortable chair. Plenty of storage drawers. Perfect for WFH or students. 6 months old. Good quality engineered wood.', price: 4500 },
    { title: '3 Door Wardrobe Sliding Dark Brown Mirror', desc: 'Spacious 3 door sliding wardrobe with mirror. Engineered wood. Good condition. Used for 3 years. Height 7 feet. Lots of storage space.', price: 12000 },
  ],
  electronics: [
    { title: 'Dell Inspiron 15 i5 10th Gen 8GB 512GB SSD', desc: 'Dell laptop in excellent working condition. i5 10th gen processor, 8GB RAM, 512GB SSD. Perfect for students and office work. Battery backup 4-5 hours. With original charger and bag. Bill available.', price: 32000 },
    { title: 'MacBook Air M1 2020 8GB 256GB Space Grey', desc: 'Apple MacBook Air M1 chip. Blazing fast. Excellent battery life 12+ hours. Barely used for 1 year. Complete box with charger. Premium laptop. Bill from Imagine.', price: 68000 },
    { title: 'HP Pavilion Gaming Ryzen 5 16GB GTX 1650', desc: 'HP gaming laptop. Ryzen 5, 16GB RAM, GTX 1650 graphics. Perfect for gaming and editing. Good condition. Runs AAA games smoothly. With cooling pad.', price: 52000 },
    { title: 'Lenovo Ideapad Slim i3 11th Gen Student', desc: 'Lenovo slim laptop perfect for students. i3 11th gen, 8GB RAM, 256GB SSD. Lightweight and portable. 1 year old. Good battery backup.', price: 28000 },
    { title: 'Samsung 55 inch Crystal UHD 4K Smart TV', desc: 'Samsung 55" 4K Smart TV. Crystal clear picture. All streaming apps working - Netflix, Prime, Hotstar. 2 years old. Excellent condition. Wall mount included. Remote working.', price: 42000 },
    { title: 'LG 43 inch Full HD Smart TV WebOS', desc: 'LG 43" Full HD Smart TV with WebOS. Great picture quality. 3 years old. Works perfectly. Magic remote included. All apps working.', price: 22000 },
    { title: 'Mi TV 5X 55 inch 4K Dolby Vision', desc: 'Mi TV 55" 4K with Dolby Vision and Atmos. Great value smart TV. 2 years old. Good condition. All apps working. With warranty card.', price: 35000 },
    { title: 'Canon EOS 1500D DSLR 18-55mm Kit', desc: 'Canon DSLR camera with kit lens 18-55mm. Barely used. Like new condition. Complete box with bag, strap and accessories. Perfect for beginners. Bill from Flipkart.', price: 28000 },
  ],
  'bikes-scooters': [
    { title: 'Honda Activa 6G 2022 Matte Grey Metallic', desc: 'Honda Activa 6G in excellent condition. Only 4,000 km driven. Single owner. All papers clear. BS6 engine. Great mileage 45+ kmpl. Well maintained. Delhi registered.', price: 68000 },
    { title: 'Honda Activa 5G 2020 Black', desc: 'Honda Activa 5G good condition. 12,000 km driven. Well serviced from Honda center. First owner. Insurance valid till next year. Smooth scooty.', price: 58000 },
    { title: 'TVS Jupiter Classic 2021 Matte Maroon', desc: 'TVS Jupiter in mint condition. 8,000 km. Well maintained. First owner. Insurance valid. Excellent scooty. Comfortable ride. Ladies used.', price: 58000 },
    { title: 'Hero Splendor Plus 2020 Black Matte', desc: 'Hero Splendor Plus bike. 15,000 km. Good condition. Well serviced. Great mileage 60+ kmpl. Single owner. Economical bike. Pune registered.', price: 48000 },
    { title: 'Bajaj Pulsar 150 2019 Blue Metallic', desc: 'Pulsar 150 in good condition. 22,000 km driven. Well maintained. RC and insurance ready. Smooth riding. Popular bike. Mumbai registered.', price: 65000 },
    { title: 'Suzuki Access 125 2021 Pearl White', desc: 'Suzuki Access 125 scooty. Excellent condition. Only 6,000 km. Ladies used. Very smooth. All documents clear. Comfortable seat. Good mileage.', price: 62000 },
  ],
  appliances: [
    { title: 'Samsung 7kg Fully Automatic Front Load', desc: 'Samsung fully automatic front load washing machine. 7kg capacity. Works perfectly. 3 years old. Well maintained. All programs working. Energy efficient. Moving sale.', price: 12000 },
    { title: 'LG 260L Double Door Refrigerator Silver', desc: 'LG double door fridge 260 liters. Frost free. Inverter compressor. Excellent cooling. 4 years old. No issues. Moving sale. Works like new.', price: 15000 },
    { title: 'Whirlpool 1.5 Ton 3 Star Split AC Copper', desc: 'Whirlpool AC in good working condition. 1.5 ton. Copper coil. 3 star rating. 5 years old. Gas filled recently. Cools excellently.', price: 18000 },
    { title: 'IFB 30L Convection Microwave Oven', desc: 'IFB microwave oven with convection. 30 liter capacity. Rarely used. Like new. With manual, grill stand and recipes. Multi-function oven.', price: 8500 },
  ],
  books: [
    { title: 'Engineering Books Complete CSE BTech Set', desc: 'Complete set of Computer Science engineering books for all 4 years. Includes Data Structures, DBMS, OS, Networks. All in good condition. No marks or highlights. Perfect for VTU students.', price: 3500 },
    { title: 'NCERT Books Class 12 Science Complete Set', desc: 'All NCERT books for Class 12 Science. Physics Part 1&2, Chemistry Part 1&2, Maths Part 1&2, Biology. Lightly used. No damage. CBSE latest edition.', price: 1200 },
    { title: 'CA Foundation Books Complete New Edition', desc: 'CA Foundation complete study material with practice books. Latest edition from ICAI. Barely used. Includes all 4 papers. With revision test papers.', price: 4000 },
    { title: 'NEET Preparation Books MTG Arihant Complete', desc: 'Complete NEET preparation books. MTG, Arihant, DC Pandey Physics, MS Chouhan Chemistry. Previous years papers included. Good condition.', price: 2500 },
  ],
  fashion: [
    { title: 'Nike Air Force 1 White Sneakers Size 10 UK', desc: 'Original Nike Air Force 1 white sneakers. Size UK 10. Worn only 3-4 times. Like new condition. With box and tags. Authentic Nike product from Nike store.', price: 4500 },
    { title: 'Adidas Ultraboost Running Shoes Size 9', desc: 'Adidas Ultraboost original. Size 9. Very comfortable for running. Used for 6 months. Good condition. Boost technology. Bought from Adidas store.', price: 3500 },
    { title: 'Levis 511 Slim Fit Jeans W32 L32 Dark Blue', desc: 'Original Levis 511 slim fit jeans. Size 32x32. Barely worn. Excellent condition. Authentic Levis product. Dark blue wash. From Levis exclusive store.', price: 1800 },
  ],
  'sports-fitness': [
    { title: 'Home Gym Equipment Set Complete 50kg Weight', desc: 'Complete home gym set with adjustable bench, dumbbells, rods, and plates. Total 50kg weight. Barely used for 1 year. Great condition. Perfect for home workouts.', price: 18000 },
    { title: 'Yonex Badminton Racket Nanoray Professional', desc: 'Yonex Nanoray Z-Speed professional badminton racket. Original product from Decathlon. Good condition. With cover. Light weight racket. Great for tournaments.', price: 2800 },
    { title: 'Cricket Bat English Willow SS Ton Master', desc: 'SS Ton English Willow cricket bat. Professional grade. Lightly used. Good condition. Light weight. Great balance. Perfect for leather ball cricket.', price: 5500 },
  ],
  pets: [
    { title: 'Golden Retriever Puppy Male 3 Months KCI', desc: 'Adorable Golden Retriever male puppy. 3 months old. Fully vaccinated and dewormed. Very friendly and playful. KCI registered. Healthy pup. Good with kids. Champion bloodline.', price: 18000 },
    { title: 'Labrador Puppy Female 2 Months Black Cute', desc: 'Cute black Labrador female puppy. 2 months old. First vaccination done. Healthy and active. Very playful. Good temperament. Perfect family dog.', price: 12000 },
    { title: 'Persian Cat Kitten 4 Months White Fluffy', desc: 'Beautiful white Persian cat. 4 months old. Fully vaccinated. Very calm and friendly. Litter trained. Fluffy coat. Well groomed. Good with children.', price: 15000 },
  ],
  'real-estate': [
    { title: '2BHK Flat for Rent Fully Furnished Whitefield', desc: 'Spacious 2BHK fully furnished apartment in Whitefield Bangalore. 1200 sqft. Good locality near metro station. All amenities - gym, park, 24x7 security. Modular kitchen. Family preferred. Available immediately.', price: 18000 },
    { title: '3BHK Independent House for Sale Baner Pune', desc: '3BHK independent house with parking in Baner Pune. 1800 sqft. Good construction quality. Prime location. Clear title. East facing. Spacious rooms. Negotiable price.', price: 8500000 },
    { title: '1BHK Studio Apartment Near Cyber City Gurgaon', desc: '1BHK studio flat near Cyber City IT park Gurgaon. 600 sqft. Fully furnished. Suitable for working professionals. WiFi ready. Power backup. Close to metro.', price: 12000 },
    { title: '2BHK Semi Furnished Apartment Indiranagar', desc: '2BHK semi furnished flat in Indiranagar Bangalore. 1000 sqft. Good ventilation. 2nd floor. Lift available. Close to schools and market. Family building.', price: 25000 },
  ],
  jobs: [
    { title: 'Software Developer React Node.js 2-4 Years Bangalore', desc: 'Hiring experienced Software Developer with 2-4 years in React and Node.js. Must have good knowledge of MongoDB. Good salary package based on experience. Work from office in Bangalore tech park. 5 day work week.', price: 800000 },
    { title: 'Content Writer Work From Home Freshers Mumbai', desc: 'Hiring content writers for blog posts and website content. Freshers welcome with good English skills. Flexible hours. Work from home opportunity. Performance based incentives. Mumbai based company.', price: 300000 },
    { title: 'Sales Executive Field Job Delhi NCR 1-3 Years', desc: 'Hiring Sales Executives for field work in Delhi NCR. 1-3 years experience preferred. Good incentives and commission. Two wheeler must. Target based role. FMCG sector.', price: 400000 },
  ],
  services: [
    { title: 'Home Cleaning Services Mumbai Professional', desc: 'Professional home cleaning services in Mumbai. Trained staff with experience. Affordable rates. Deep cleaning, sofa cleaning, kitchen cleaning available. Call for free quote. Eco-friendly products used.', price: 500 },
    { title: 'Laptop Repair Services All Brands Bangalore', desc: 'Expert laptop repair services in Bangalore. All brands - HP, Dell, Lenovo, Asus. Same day service for most issues. Free pickup and delivery. Affordable rates. Hardware and software both.', price: 1000 },
    { title: 'AC Repair Service Delhi All Brands Same Day', desc: 'AC repair and service in Delhi NCR. All brands supported. Experienced technicians. Gas refilling available. Reasonable rates. Same day service. Annual maintenance contracts available.', price: 800 },
  ],
  other: [
    { title: 'Indoor Plants Collection 10 Varieties with Pots', desc: 'Beautiful collection of 10 indoor plants. Includes money plant, snake plant, peace lily, pothos, jade plant. With decorative pots. Air purifying plants. Easy maintenance. Perfect for Indian homes.', price: 1500 },
    { title: 'Acoustic Guitar Yamaha F310 Beginners', desc: 'Yamaha F310 acoustic guitar. Perfect for beginners and students. Good sound quality. Lightly used. With soft case and picks. Great condition.', price: 7500 },
    { title: 'Aquarium 3 Feet with Stand Filter Accessories', desc: '3 feet aquarium with wooden stand. Includes filter, air pump, LED lighting. Good condition. Complete setup. Easy to maintain. Perfect for home decoration.', price: 6500 },
  ],
};

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    const timeout = setTimeout(() => reject(new Error('Timeout')), 20000);
    
    client.get(url, (response) => {
      clearTimeout(timeout);
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Status ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function uploadImage(buffer, filename) {
  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(`seed/${filename}`, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    });
  if (error) return null;
  const { data: urlData } = supabase.storage
    .from('listing-images')
    .getPublicUrl(`seed/${filename}`);
  return urlData.publicUrl;
}

async function createListing(categorySlug, areaSlug, city, data, seller, ownerToken) {
  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      title: data.title,
      description: data.desc,
      price: data.price,
      category_slug: categorySlug,
      area_slug: areaSlug,
      city: city,
      owner_token: ownerToken,
      owner_name: seller.name,
      owner_phone: seller.phone,
      whatsapp_enabled: true,
      whatsapp_number: seller.phone,
      is_active: true,
    })
    .select()
    .single();
  return error ? null : listing;
}

async function createListingImages(listingId, imageUrls) {
  const records = imageUrls.map((url, i) => ({
    listing_id: listingId,
    image_url: url,
    display_order: i
  }));
  const { error } = await supabase.from('listing_images').insert(records);
  return !error;
}

async function seedIndian() {
  console.log('🇮🇳 INDIAN PRODUCTION SEED - Complete Desi Feel\n');

  const { data: categories } = await supabase.from('categories').select('*').order('name');
  const { data: cities } = await supabase.from('cities').select('*').order('name');
  const { data: areas } = await supabase.from('areas').select('*').order('name');
  const { data: profiles } = await supabase.from('profiles').select('owner_token').limit(1);

  if (!categories || !cities || !areas) {
    console.error('❌ Failed to fetch data');
    return;
  }

  const baseToken = profiles?.[0]?.owner_token || 'SEED_TOKEN';

  console.log(`✅ ${categories.length} categories`);
  console.log(`✅ ${cities.length} cities`);
  console.log(`✅ ${areas.length} areas\n`);

  let total = 0;
  let images = 0;
  let sellerIndex = 0;
  let usedImages = new Set();

  for (const category of categories) {
    const listings = LISTINGS[category.slug] || [];
    const imagePool = INDIAN_IMAGE_POOLS[category.slug] || [];
    
    if (listings.length === 0 || imagePool.length === 0) continue;

    console.log(`\n📦 ${category.name} (${listings.length} listings)`);

    for (const listingData of listings) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const cityAreas = areas.filter(a => a.city_id === city.id);
      if (cityAreas.length === 0) continue;
      
      const area = cityAreas[Math.floor(Math.random() * cityAreas.length)];
      const seller = SELLERS[sellerIndex % SELLERS.length];
      sellerIndex++;

      // Pick unused image from pool
      let imageUrl = null;
      for (const img of imagePool) {
        if (!usedImages.has(img)) {
          imageUrl = img;
          usedImages.add(img);
          break;
        }
      }
      
      // If all images used, recycle
      if (!imageUrl) imageUrl = imagePool[Math.floor(Math.random() * imagePool.length)];

      // Download and upload image
      let uploadedImages = [];
      try {
        const buffer = await downloadImage(imageUrl);
        const filename = `${category.slug}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;
        const publicUrl = await uploadImage(buffer, filename);
        
        if (publicUrl) {
          uploadedImages.push(publicUrl);
          images++;
        }
      } catch (err) {
        console.log(`  ⚠️  Image failed, skipping...`);
        continue;
      }

      if (uploadedImages.length === 0) continue;

      const listing = await createListing(
        category.slug,
        area.id,
        city.name,
        listingData,
        seller,
        baseToken
      );

      if (listing) {
        await createListingImages(listing.id, uploadedImages);
        total++;
        const displayTitle = listingData.title.length > 50 
          ? listingData.title.substring(0, 47) + '...' 
          : listingData.title;
        console.log(`  ✅ ${displayTitle} (${seller.name})`);
      }
    }
  }

  console.log(`\n🎉 INDIAN SEED COMPLETE!`);
  console.log(`✅ Created ${total} listings`);
  console.log(`✅ Uploaded ${images} images`);
  console.log(`✅ ${SELLERS.length} unique sellers`);
  console.log(`✅ Complete Indian feel 🇮🇳`);
}

seedIndian()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
