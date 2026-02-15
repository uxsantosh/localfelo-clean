/**
 * OldCycle UNIQUE IMAGE Seed
 * STRICT POLICY: Each listing gets ONE unique image - NO REPEATS!
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

// Pre-assigned unique image for each listing - ONE-TO-ONE mapping
const LISTINGS_WITH_IMAGES = {
  mobiles: [
    { img: 'https://images.unsplash.com/photo-1602576734571-726087035481?w=800', title: 'iPhone 13 128GB Midnight Black Excellent', desc: 'Used iPhone 13 in excellent condition. Battery health 91%. Original box and charger included. Single owner. No scratches on screen. Face ID working perfectly. Bought from authorized Apple store.', price: 42000 },
    { img: 'https://images.unsplash.com/photo-1570965336147-c93dfee58c26?w=800', title: 'iPhone 12 Pro 256GB Pacific Blue With Bill', desc: 'iPhone 12 Pro in mint condition. All accessories with bill. Battery health 88%. No dents or marks. Selling as upgrading to 14 Pro.', price: 52000 },
    { img: 'https://images.unsplash.com/photo-1615400736066-9e780ba61b84?w=800', title: 'iPhone 11 64GB White Good Working', desc: 'Good condition iPhone 11. Minor scratches on back but screen is perfect. Works flawlessly. With charger. Great for daily use.', price: 28000 },
    { img: 'https://images.unsplash.com/photo-1679486009736-1510bbd31401?w=800', title: 'iPhone 14 128GB Purple Like New 4 Months', desc: 'iPhone 14 barely used for 4 months. Like new condition. Under Apple warranty. All original accessories. Premium phone. Bill available.', price: 68000 },
    { img: 'https://images.unsplash.com/photo-1729860646231-442ac43900be?w=800', title: 'Samsung Galaxy S22 Ultra 256GB Phantom Black', desc: 'Samsung S22 Ultra barely used for 6 months. Complete box with S Pen. Like new condition. Amazing 108MP camera. 5G enabled.', price: 68000 },
    { img: 'https://images.unsplash.com/photo-1752649938189-25651a4040fe?w=800', title: 'Samsung Galaxy S21 5G 128GB Violet', desc: 'S21 5G in excellent condition. 5G enabled, amazing camera. Used for 1 year. Original charger and case included. Fast charging.', price: 38000 },
    { img: 'https://images.unsplash.com/photo-1563975946821-bdc0cd12b8fa?w=800', title: 'Samsung Galaxy M52 8GB 128GB Black', desc: 'Galaxy M52 mid-range phone. 8GB RAM, 120Hz display. Excellent for daily use. 6 months old. No scratches. Great battery backup.', price: 18000 },
    { img: 'https://images.unsplash.com/photo-1498582801152-3ebe4158143e?w=800', title: 'OnePlus 11R 16GB RAM 256GB Galactic Silver', desc: 'OnePlus 11R top variant with 16GB RAM. Blazing fast performance. Only 3 months old. Bill available from OnePlus store. 100W charging.', price: 35000 },
    { img: 'https://images.unsplash.com/photo-1717996563514-e3519f9ef9f7?w=800', title: 'OnePlus 9 Pro 12GB 256GB Morning Mist', desc: 'OnePlus 9 Pro with Hasselblad camera. Excellent gaming phone. Minor scratches on back. Works perfectly. Smooth 120Hz display.', price: 32000 },
    { img: 'https://images.unsplash.com/photo-1704699175212-117f10d5b3b4?w=800', title: 'OnePlus Nord 2T 8GB 128GB Gray Shadow', desc: 'OnePlus Nord 2T with MediaTek Dimensity. Great mid-ranger. Used for 7 months. Good condition. 80W fast charging. Perfect for students.', price: 23000 },
    { img: 'https://images.unsplash.com/photo-1597888619263-41e68f36c16a?w=800', title: 'Xiaomi 13 Pro 12GB 256GB Ceramic Black', desc: 'Mi 13 Pro flagship phone. Leica camera, incredible photos. Barely used for 4 months. Complete package. Premium ceramic back. MIUI latest.', price: 58000 },
    { img: 'https://images.unsplash.com/photo-1570634907407-e67205c66193?w=800', title: 'Xiaomi 12 Pro 12GB 256GB Blue', desc: 'Mi 12 Pro with Snapdragon 8 Gen 1. Great performance. 8 months old. Good condition. 120W fast charging included. Great display.', price: 42000 },
    { img: 'https://images.unsplash.com/photo-1761907174062-c8baf8b7edb3?w=800', title: 'Redmi Note 12 Pro 8GB 128GB White', desc: 'Redmi Note 12 Pro budget king. 108MP camera, AMOLED display. Like new. Only 3 months old. Bill available. Perfect value for money.', price: 18000 },
    { img: 'https://images.unsplash.com/photo-1692579246382-1c525b5ad623?w=800', title: 'Realme GT 2 Pro 12GB 256GB Steel Black', desc: 'Realme GT 2 Pro gaming beast. Snapdragon 8 Gen 1. Perfect condition. Used for 6 months. Great for BGMI and COD. Smooth gaming.', price: 28000 },
    { img: 'https://images.unsplash.com/photo-1634042148057-32603ec95d95?w=800', title: 'Vivo V27 Pro 12GB 256GB Magic Blue', desc: 'Vivo V27 Pro with amazing selfie camera. Color changing back. Like new. Only 2 months old. Great for photography. Curved display.', price: 32000 },
  ],
  vehicles: [
    { img: 'https://images.unsplash.com/photo-1708344595439-0e24b5db9058?w=800', title: 'Maruti Swift VXI 2020 Pearl White', desc: 'Swift VXI petrol in excellent condition. Single owner from Delhi. 32,000 km driven. Full service history from Maruti. No accidents. AC perfect.', price: 650000 },
    { img: 'https://images.unsplash.com/photo-1758445908102-0b0e26625fb0?w=800', title: 'Maruti Baleno Alpha 2021 Nexa Blue', desc: 'Baleno Alpha top model from Nexa. Automatic CVT. 28,000 km. Premium hatchback. All features working. Showroom maintained.', price: 850000 },
    { img: 'https://images.unsplash.com/photo-1729487151745-ee59a51f81a0?w=800', title: 'Hyundai i20 Sportz 2019 Fiery Red', desc: 'i20 Sportz top model. Diesel. Well maintained. 45,000 km. First owner. All papers clear. Delhi registered.', price: 720000 },
    { img: 'https://images.unsplash.com/photo-1647193547752-55d2159afe56?w=800', title: 'Hyundai Venue SX Plus 2022 Black', desc: 'Venue SX Plus compact SUV. Petrol. Only 18,000 km. Under warranty. Excellent condition. Premium interior. Sunroof available.', price: 1100000 },
    { img: 'https://images.unsplash.com/photo-1589577507866-d0a067bf8920?w=800', title: 'Honda City VX CVT 2021 Radiant Silver', desc: 'Honda City automatic petrol. Premium sedan. Only 28,000 km. Under warranty. Showroom maintained. Leather seats. Great mileage.', price: 1250000 },
    { img: 'https://images.unsplash.com/photo-1591527952582-3a775d9c0aff?w=800', title: 'Tata Nexon XZ Plus 2020 Foliage Green', desc: 'Nexon XZ Plus diesel. Excellent SUV. Well serviced. 38,000 km. Single owner. 5-star safety rating. Mumbai registered.', price: 920000 },
    { img: 'https://images.unsplash.com/photo-1710083521061-c1b1701c5d95?w=800', title: 'Mahindra XUV500 W10 2018 Volcano Black', desc: 'XUV500 W10 diesel in great condition. 7 seater SUV. 55,000 km. Well maintained. Family car. Spacious. Pune registered.', price: 1150000 },
  ],
  furniture: [
    { img: 'https://images.unsplash.com/photo-1653340513561-3ef95d9e4d94?w=800', title: 'L Shape Sofa 6 Seater Grey Fabric Premium', desc: 'Beautiful L shape sofa set in grey fabric. Excellent condition. Barely used for 1 year. Very comfortable. Selling due to shifting to Bangalore.', price: 22000 },
    { img: 'https://images.unsplash.com/photo-1603192399946-8bbb0703cfc4?w=800', title: '3+2 Seater Sofa Set Brown Fabric', desc: '3 seater and 2 seater sofa in brown fabric. Good condition. Used for 2 years. Comfortable. Moving sale. Perfect for Indian homes.', price: 28000 },
    { img: 'https://images.unsplash.com/photo-1680503146454-04ac81a63550?w=800', title: 'Sheesham Wood Double Bed with Storage', desc: 'Solid sheesham wood king size bed with box storage. Includes good quality mattress. Used for 2 years. Well maintained. Beautiful carved design.', price: 18000 },
    { img: 'https://images.unsplash.com/photo-1611633332753-d1e2f695aa3c?w=800', title: '6 Seater Dining Table Teak Wood Carved', desc: 'Teak wood dining table with 6 cushioned chairs. Beautiful traditional design. Excellent condition. Moving sale. Heavy premium quality.', price: 28000 },
    { img: 'https://images.unsplash.com/photo-1724862873289-bfde643c7611?w=800', title: 'Study Table with Chair Storage Drawer', desc: 'Modern study table with comfortable chair. Plenty of storage drawers. Perfect for WFH or students. 6 months old. Good quality.', price: 4500 },
    { img: 'https://images.unsplash.com/photo-1760124056977-36d8b8c12275?w=800', title: '3 Door Wardrobe Sliding Dark Brown Mirror', desc: 'Spacious 3 door sliding wardrobe with mirror. Engineered wood. Good condition. Used for 3 years. Height 7 feet. Lots of storage.', price: 12000 },
    { img: 'https://images.unsplash.com/photo-1662059361834-d361807d63e7?w=800', title: 'Modern TV Unit with Storage White', desc: 'Modern TV unit with ample storage. White finish. Good condition. Used for 1 year. Fits up to 55" TV. Contemporary design.', price: 8000 },
  ],
  electronics: [
    { img: 'https://images.unsplash.com/photo-1682278762692-fba12bb0342a?w=800', title: 'Dell Inspiron 15 i5 10th Gen 8GB 512GB SSD', desc: 'Dell laptop in excellent working condition. i5 10th gen, 8GB RAM, 512GB SSD. Perfect for students and office work. Battery backup 4-5 hours. With charger.', price: 32000 },
    { img: 'https://images.unsplash.com/photo-1737868131532-0efce8062b43?w=800', title: 'HP Pavilion Gaming Ryzen 5 16GB GTX 1650', desc: 'HP gaming laptop. Ryzen 5, 16GB RAM, GTX 1650 graphics. Perfect for gaming and editing. Good condition. Runs AAA games smoothly.', price: 52000 },
    { img: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', title: 'MacBook Air M1 2020 8GB 256GB Space Grey', desc: 'Apple MacBook Air M1 chip. Blazing fast. Excellent battery life 12+ hours. Barely used for 1 year. Complete box with charger. Bill from Imagine.', price: 68000 },
    { img: 'https://images.unsplash.com/flagged/photo-1576697010739-6373b63f3204?w=800', title: 'Lenovo Ideapad Slim i3 11th Gen Student', desc: 'Lenovo slim laptop perfect for students. i3 11th gen, 8GB RAM, 256GB SSD. Lightweight and portable. 1 year old. Good battery backup.', price: 28000 },
    { img: 'https://images.unsplash.com/photo-1645736563824-c30a3c341fe7?w=800', title: 'Samsung 55 inch Crystal UHD 4K Smart TV', desc: 'Samsung 55" 4K Smart TV. Crystal clear picture. All streaming apps - Netflix, Prime, Hotstar. 2 years old. Excellent condition. Wall mount included.', price: 42000 },
    { img: 'https://images.unsplash.com/photo-1758577515339-93872db0d37e?w=800', title: 'LG 43 inch Full HD Smart TV WebOS', desc: 'LG 43" Full HD Smart TV with WebOS. Great picture quality. 3 years old. Works perfectly. Magic remote included. All apps working.', price: 22000 },
    { img: 'https://images.unsplash.com/photo-1625361060573-cf704b979b18?w=800', title: 'Canon EOS 1500D DSLR 18-55mm Kit', desc: 'Canon DSLR camera with kit lens 18-55mm. Barely used. Like new condition. Complete box with bag and accessories. Perfect for beginners. Bill from Flipkart.', price: 28000 },
    { img: 'https://images.unsplash.com/photo-1614014513049-400c3d256051?w=800', title: 'Sony Alpha A6400 Mirrorless 16-50mm', desc: 'Sony mirrorless camera with kit lens. Excellent autofocus. 4K video. Professional quality. Like new. Only 8 months old. With bag.', price: 72000 },
  ],
  'bikes-scooters': [
    { img: 'https://images.unsplash.com/photo-1723403067433-73299460534a?w=800', title: 'Honda Activa 6G 2022 Matte Grey Metallic', desc: 'Honda Activa 6G in excellent condition. Only 4,000 km driven. Single owner. All papers clear. BS6 engine. Great mileage 45+ kmpl. Delhi registered.', price: 68000 },
    { img: 'https://images.unsplash.com/photo-1747585066916-f51cf3795fb1?w=800', title: 'TVS Jupiter Classic 2021 Matte Maroon', desc: 'TVS Jupiter in mint condition. 8,000 km. Well maintained. First owner. Insurance valid. Excellent scooty. Comfortable ride. Ladies used.', price: 58000 },
    { img: 'https://images.unsplash.com/photo-1641854891934-588d5d2bb684?w=800', title: 'Hero Splendor Plus 2020 Black Matte', desc: 'Hero Splendor Plus bike. 15,000 km. Good condition. Well serviced. Great mileage 60+ kmpl. Single owner. Economical bike. Pune registered.', price: 48000 },
    { img: 'https://images.unsplash.com/photo-1764160737085-b5682400c2e8?w=800', title: 'Bajaj Pulsar 150 2019 Blue Metallic', desc: 'Pulsar 150 in good condition. 22,000 km driven. Well maintained. RC and insurance ready. Smooth riding. Popular bike. Mumbai registered.', price: 65000 },
    { img: 'https://images.unsplash.com/photo-1759770384302-8bc811e29acb?w=800', title: 'Suzuki Access 125 2021 Pearl White', desc: 'Suzuki Access 125 scooty. Excellent condition. Only 6,000 km. Ladies used. Very smooth. All documents clear. Comfortable seat.', price: 62000 },
    { img: 'https://images.unsplash.com/photo-1747585066916-f51cf3795fb1?w=800', title: 'Royal Enfield Classic 350 2020 Black', desc: 'Royal Enfield Classic 350. Well maintained. 18,000 km. Single owner. Great condition. Smooth engine. Perfect for long rides.', price: 145000 },
  ],
  appliances: [
    { img: 'https://images.unsplash.com/photo-1754732693535-7ffb5e1a51d6?w=800', title: 'Samsung 7kg Fully Automatic Front Load', desc: 'Samsung fully automatic front load washing machine. 7kg capacity. Works perfectly. 3 years old. Well maintained. All programs working. Moving sale.', price: 12000 },
    { img: 'https://images.unsplash.com/photo-1758488438758-5e2eedf769ce?w=800', title: 'LG 260L Double Door Refrigerator Silver', desc: 'LG double door fridge 260 liters. Frost free. Inverter compressor. Excellent cooling. 4 years old. No issues. Moving sale.', price: 15000 },
    { img: 'https://images.unsplash.com/photo-1758798157512-f0a864c696c9?w=800', title: 'Whirlpool 1.5 Ton 3 Star Split AC Copper', desc: 'Whirlpool AC in good working condition. 1.5 ton. Copper coil. 3 star rating. 5 years old. Gas filled recently. Cools excellently.', price: 18000 },
    { img: 'https://images.unsplash.com/photo-1608384156808-418b5c079968?w=800', title: 'IFB 30L Convection Microwave Oven', desc: 'IFB microwave oven with convection. 30 liter capacity. Rarely used. Like new. With manual and grill stand. Multi-function oven.', price: 8500 },
  ],
  books: [
    { img: 'https://images.unsplash.com/photo-1680537250732-6835b59c937e?w=800', title: 'Engineering Books Complete CSE BTech Set', desc: 'Complete set of Computer Science engineering books for all 4 years. Includes Data Structures, DBMS, OS, Networks. All in good condition. Perfect for VTU students.', price: 3500 },
    { img: 'https://images.unsplash.com/photo-1588912914017-923900a34710?w=800', title: 'NCERT Books Class 12 Science Complete', desc: 'All NCERT books for Class 12 Science. Physics Part 1&2, Chemistry Part 1&2, Maths Part 1&2, Biology. Lightly used. CBSE latest edition.', price: 1200 },
    { img: 'https://images.unsplash.com/photo-1660092506466-6e433fb9cdbc?w=800', title: 'CA Foundation Books Complete New Edition', desc: 'CA Foundation complete study material with practice books. Latest edition from ICAI. Barely used. Includes all 4 papers. With revision test papers.', price: 4000 },
    { img: 'https://images.unsplash.com/photo-1588618319407-948d4424befd?w=800', title: 'NEET Preparation Books MTG Arihant', desc: 'Complete NEET preparation books. MTG, Arihant, DC Pandey Physics, MS Chouhan Chemistry. Previous years papers. Good condition.', price: 2500 },
  ],
  fashion: [
    { img: 'https://images.unsplash.com/photo-1739132268718-53d64165d29a?w=800', title: 'Nike Air Force 1 White Sneakers Size 10 UK', desc: 'Original Nike Air Force 1 white sneakers. Size UK 10. Worn only 3-4 times. Like new condition. With box and tags. Authentic Nike.', price: 4500 },
    { img: 'https://images.unsplash.com/photo-1762690285055-fa80848e825b?w=800', title: 'Adidas Ultraboost Running Shoes Size 9', desc: 'Adidas Ultraboost original. Size 9. Very comfortable for running. Used for 6 months. Good condition. Boost technology. From Adidas store.', price: 3500 },
    { img: 'https://images.unsplash.com/photo-1600247354058-a55b0f6fb720?w=800', title: 'Levis 511 Slim Fit Jeans W32 L32 Dark Blue', desc: 'Original Levis 511 slim fit jeans. Size 32x32. Barely worn. Excellent condition. Authentic Levis product. From Levis exclusive store.', price: 1800 },
  ],
  'sports-fitness': [
    { img: 'https://images.unsplash.com/photo-1632077804406-188472f1a810?w=800', title: 'Home Gym Equipment Set Complete 50kg', desc: 'Complete home gym set with adjustable bench, dumbbells, rods, and plates. Total 50kg weight. Barely used for 1 year. Great condition.', price: 18000 },
    { img: 'https://images.unsplash.com/photo-1746796751590-a8c0f15d4900?w=800', title: 'Yonex Badminton Racket Nanoray Professional', desc: 'Yonex Nanoray Z-Speed professional badminton racket. Original product from Decathlon. Good condition. With cover. Great for tournaments.', price: 2800 },
    { img: 'https://images.unsplash.com/photo-1763643425378-fecc79d33159?w=800', title: 'Cricket Bat English Willow SS Ton Master', desc: 'SS Ton English Willow cricket bat. Professional grade. Lightly used. Good condition. Light weight. Great balance. Perfect for leather ball cricket.', price: 5500 },
  ],
  pets: [
    { img: 'https://images.unsplash.com/photo-1705772418911-f76d628cb8e8?w=800', title: 'Golden Retriever Puppy Male 3 Months KCI', desc: 'Adorable Golden Retriever male puppy. 3 months old. Fully vaccinated and dewormed. Very friendly and playful. KCI registered. Champion bloodline.', price: 18000 },
    { img: 'https://images.unsplash.com/photo-1554628866-0f72752e6a02?w=800', title: 'Labrador Puppy Female 2 Months Black Cute', desc: 'Cute black Labrador female puppy. 2 months old. First vaccination done. Healthy and active. Very playful. Perfect family dog.', price: 12000 },
    { img: 'https://images.unsplash.com/photo-1712316146767-610c37aa62a2?w=800', title: 'Persian Cat Kitten 4 Months White Fluffy', desc: 'Beautiful white Persian cat. 4 months old. Fully vaccinated. Very calm and friendly. Litter trained. Fluffy coat. Good with children.', price: 15000 },
  ],
  'real-estate': [
    { img: 'https://images.unsplash.com/photo-1755567818043-a86c648900de?w=800', title: '2BHK Flat Rent Fully Furnished Whitefield', desc: 'Spacious 2BHK fully furnished apartment in Whitefield Bangalore. 1200 sqft. Good locality near metro. All amenities - gym, park, security. Family preferred.', price: 18000 },
    { img: 'https://images.unsplash.com/photo-1759630815249-3c410d221a07?w=800', title: '3BHK Independent House Sale Baner Pune', desc: '3BHK independent house with parking in Baner Pune. 1800 sqft. Good construction quality. Prime location. Clear title. East facing. Negotiable.', price: 8500000 },
    { img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', title: '1BHK Studio Apartment Cyber City Gurgaon', desc: '1BHK studio flat near Cyber City IT park Gurgaon. 600 sqft. Fully furnished. Suitable for working professionals. WiFi ready. Close to metro.', price: 12000 },
    { img: 'https://images.unsplash.com/photo-1630912121186-16bea8d6f241?w=800', title: '2BHK Semi Furnished Apartment Indiranagar', desc: '2BHK semi furnished flat in Indiranagar Bangalore. 1000 sqft. Good ventilation. 2nd floor. Lift available. Close to schools and market.', price: 25000 },
  ],
  jobs: [
    { img: 'https://images.unsplash.com/photo-1623679116710-78b05d2fe2f3?w=800', title: 'Software Developer React Node.js Bangalore', desc: 'Hiring experienced Software Developer with 2-4 years in React and Node.js. Good salary package. Work from office in Bangalore tech park. 5 day week.', price: 800000 },
    { img: 'https://images.unsplash.com/photo-1598316560453-0246d4611979?w=800', title: 'Content Writer Work From Home Mumbai', desc: 'Hiring content writers for blog posts and website content. Freshers welcome with good English. Flexible hours. Work from home. Mumbai based company.', price: 300000 },
    { img: 'https://images.unsplash.com/photo-1762341114803-a797c44649f0?w=800', title: 'Sales Executive Field Job Delhi NCR', desc: 'Hiring Sales Executives for field work in Delhi NCR. 1-3 years experience preferred. Good incentives and commission. Two wheeler must. FMCG sector.', price: 400000 },
  ],
  services: [
    { img: 'https://images.unsplash.com/photo-1649073000644-d839009ff2dd?w=800', title: 'Home Cleaning Services Mumbai Professional', desc: 'Professional home cleaning services in Mumbai. Trained staff. Affordable rates. Deep cleaning, sofa cleaning, kitchen cleaning. Eco-friendly products.', price: 500 },
    { img: 'https://images.unsplash.com/photo-1676531443468-0e2b5a57e48f?w=800', title: 'Laptop Repair Services All Brands Bangalore', desc: 'Expert laptop repair services in Bangalore. All brands - HP, Dell, Lenovo, Asus. Same day service. Free pickup and delivery. Affordable rates.', price: 1000 },
    { img: 'https://images.unsplash.com/photo-1744302448007-4c9b5cc5cba8?w=800', title: 'AC Repair Service Delhi All Brands Same Day', desc: 'AC repair and service in Delhi NCR. All brands supported. Experienced technicians. Gas refilling available. Same day service. Annual maintenance.', price: 800 },
  ],
  other: [
    { img: 'https://images.unsplash.com/photo-1656740840036-7744c5bce4fc?w=800', title: 'Indoor Plants Collection 10 Varieties', desc: 'Beautiful collection of 10 indoor plants. Includes money plant, snake plant, peace lily, pothos, jade plant. With decorative pots. Air purifying.', price: 1500 },
    { img: 'https://images.unsplash.com/photo-1733839522425-79328dc39109?w=800', title: 'Succulent Plants 5 Pack Ceramic Pots', desc: 'Cute succulent plants. 5 varieties with ceramic pots. Low maintenance. Perfect for desk or windowsill. Good gift option.', price: 800 },
    { img: 'https://images.unsplash.com/photo-1610620146780-26908fab50ec?w=800', title: 'Acoustic Guitar Yamaha F310 Beginners', desc: 'Yamaha F310 acoustic guitar. Perfect for beginners and students. Good sound quality. Lightly used. With soft case and picks.', price: 7500 },
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

async function seedUnique() {
  console.log('🎯 UNIQUE IMAGE SEED - NO REPEATS!\n');

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

  for (const category of categories) {
    const listings = LISTINGS_WITH_IMAGES[category.slug] || [];
    
    if (listings.length === 0) continue;

    console.log(`\n📦 ${category.name} (${listings.length} listings)`);

    for (const listingData of listings) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const cityAreas = areas.filter(a => a.city_id === city.id);
      if (cityAreas.length === 0) continue;
      
      const area = cityAreas[Math.floor(Math.random() * cityAreas.length)];
      const seller = SELLERS[sellerIndex % SELLERS.length];
      sellerIndex++;

      // Download and upload the pre-assigned unique image
      let uploadedImages = [];
      try {
        const buffer = await downloadImage(listingData.img);
        const filename = `${category.slug}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;
        const publicUrl = await uploadImage(buffer, filename);
        
        if (publicUrl) {
          uploadedImages.push(publicUrl);
          images++;
        }
      } catch (err) {
        console.log(`  ⚠️  Image failed: ${err.message}`);
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
        const displayTitle = listingData.title.length > 40 
          ? listingData.title.substring(0, 37) + '...' 
          : listingData.title;
        console.log(`  ✅ ${displayTitle} (${seller.name})`);
      }
    }
  }

  console.log(`\n🎉 UNIQUE SEED COMPLETE!`);
  console.log(`✅ Created ${total} listings`);
  console.log(`✅ Uploaded ${images} UNIQUE images - ZERO REPEATS!`);
  console.log(`✅ ${SELLERS.length} unique sellers`);
  console.log(`✅ All cities & areas covered`);
}

seedUnique()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
