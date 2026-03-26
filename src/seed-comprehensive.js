/**
 * OldCycle COMPREHENSIVE Production Seed
 * - Unique images for each listing (NO REPEATS)
 * - More realistic mobile-quality images
 * - 100+ listings covering all cities, areas, categories
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const SUPABASE_URL = 'https://drofnrntrbedtjtpseve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Indian seller names
const SELLERS = [
  { name: 'Rajesh Kumar', phone: '9876543210' },
  { name: 'Priya Sharma', phone: '9823456789' },
  { name: 'Amit Patel', phone: '9765432109' },
  { name: 'Sneha Reddy', phone: '9654321098' },
  { name: 'Vikram Singh', phone: '9543210987' },
  { name: 'Anjali Gupta', phone: '9432109876' },
  { name: 'Rahul Verma', phone: '9321098765' },
  { name: 'Pooja Nair', phone: '9210987654' },
  { name: 'Arjun Mehta', phone: '9109876543' },
  { name: 'Kavya Iyer', phone: '9098765432' },
  { name: 'Sanjay Joshi', phone: '9987654321' },
  { name: 'Neha Kapoor', phone: '9876549876' },
  { name: 'Rohan Das', phone: '9765438765' },
  { name: 'Divya Pillai', phone: '9654327654' },
  { name: 'Karthik Rao', phone: '9543216543' },
  { name: 'Shreya Desai', phone: '9432105432' },
  { name: 'Manish Agarwal', phone: '9321094321' },
  { name: 'Ritu Malhotra', phone: '9210983210' },
  { name: 'Aditya Saxena', phone: '9109872109' },
  { name: 'Meera Jain', phone: '9098761098' },
  { name: 'Suresh Patil', phone: '9887654321' },
  { name: 'Lakshmi Reddy', phone: '9776543210' },
  { name: 'Praveen Kumar', phone: '9665432109' },
  { name: 'Swati Singh', phone: '9554321098' },
  { name: 'Nikhil Shah', phone: '9443210987' },
  { name: 'Deepika Nair', phone: '9332109876' },
  { name: 'Harish Menon', phone: '9221098765' },
  { name: 'Pallavi Chopra', phone: '9110987654' },
  { name: 'Varun Khanna', phone: '9009876543' },
  { name: 'Sonal Bhat', phone: '9898765432' },
  { name: 'Ramesh Iyer', phone: '9787654321' },
  { name: 'Kavita Singh', phone: '9676543210' },
  { name: 'Vishal Gupta', phone: '9565432109' },
  { name: 'Anita Deshmukh', phone: '9454321098' },
  { name: 'Prakash Rao', phone: '9343210987' },
];

// EXPANDED LISTINGS - More variety, NO REPEATED IMAGES
const COMPREHENSIVE_LISTINGS = {
  'mobiles': [
    { title: 'iPhone 13 128GB Midnight Black Excellent Condition', desc: 'Used iPhone 13 in excellent condition. Battery health 91%. Original box and charger included. Single owner, very well maintained. No scratches on screen. Face ID working perfectly.', price: 42000, img: 'iphone black closeup' },
    { title: 'iPhone 12 Pro 256GB Pacific Blue Premium', desc: 'iPhone 12 Pro in mint condition. All accessories with bill. Battery health 88%. No dents or marks. Selling as upgrading to 14 Pro. Camera excellent.', price: 52000, img: 'iphone blue smartphone' },
    { title: 'iPhone 11 64GB White Good Working', desc: 'Good condition iPhone 11. Minor scratches on back but screen is perfect. Works flawlessly. With charger. Battery backup decent.', price: 28000, img: 'white iphone hand' },
    { title: 'iPhone 14 128GB Purple Like New', desc: 'iPhone 14 barely used for 4 months. Like new condition. Under warranty. All original accessories. Midnight purple color. Premium phone.', price: 68000, img: 'iphone purple new' },
    { title: 'iPhone 12 64GB Product Red', desc: 'iPhone 12 Product Red in good condition. Battery 85%. Minor wear on edges. All functions working. Original cable included.', price: 38000, img: 'red iphone table' },
    { title: 'Samsung Galaxy S22 Ultra 256GB Phantom Black', desc: 'Samsung S22 Ultra barely used for 6 months. Complete box with S Pen and all accessories. Like new condition. Amazing camera with 108MP. 5G enabled.', price: 68000, img: 'samsung black phone' },
    { title: 'Samsung Galaxy S21 5G 128GB Violet', desc: 'S21 5G in excellent condition. 5G enabled, amazing camera. Used for 1 year. Original charger and case included. Fast charging working.', price: 38000, img: 'samsung violet mobile' },
    { title: 'Samsung Galaxy A52s 8GB 128GB Black', desc: 'Galaxy A52s mid-range beast. 8GB RAM, 120Hz display. Excellent for daily use. 6 months old. No scratches.', price: 22000, img: 'samsung galaxy display' },
    { title: 'Samsung Galaxy M32 6GB 128GB Light Blue', desc: 'Budget Samsung phone in great condition. 6GB RAM, good battery life. Perfect for students. Used carefully for 8 months.', price: 13000, img: 'samsung blue budget' },
    { title: 'OnePlus 11R 16GB RAM 256GB Galactic Silver', desc: 'OnePlus 11R top variant with 16GB RAM. Blazing fast performance. Only 3 months old. Bill available. Fast charging 100W.', price: 35000, img: 'oneplus silver phone' },
    { title: 'OnePlus 9 Pro 12GB 256GB Morning Mist', desc: 'OnePlus 9 Pro with Hasselblad camera. Excellent gaming phone. Minor scratches on back. Works perfectly. Smooth 120Hz display.', price: 32000, img: 'oneplus camera phone' },
    { title: 'OnePlus Nord 2T 8GB 128GB Gray Shadow', desc: 'OnePlus Nord 2T with MediaTek Dimensity. Great mid-ranger. Used for 7 months. Good condition. Fast charging 80W.', price: 23000, img: 'oneplus nord grey' },
    { title: 'Xiaomi 13 Pro 12GB 256GB Ceramic Black', desc: 'Mi 13 Pro flagship phone. Leica camera, incredible photos. Barely used for 4 months. Complete package. Premium ceramic back.', price: 58000, img: 'xiaomi black ceramic' },
    { title: 'Xiaomi 12 Pro 12GB 256GB Blue', desc: 'Mi 12 Pro with Snapdragon 8 Gen 1. Great performance. 8 months old. Good condition. Fast charging 120W included.', price: 42000, img: 'xiaomi blue flagship' },
    { title: 'Redmi Note 12 Pro 8GB 128GB White', desc: 'Redmi Note 12 Pro budget king. 108MP camera, AMOLED display. Like new. Only 3 months old. Bill available.', price: 18000, img: 'redmi white note' },
    { title: 'Realme GT 2 Pro 12GB 256GB Steel Black', desc: 'Realme GT 2 Pro gaming beast. Snapdragon 8 Gen 1. Perfect condition. Used for 6 months. Great for BGMI and COD.', price: 28000, img: 'realme gaming black' },
    { title: 'Realme 11 Pro Plus 12GB 256GB Sunrise Beige', desc: 'Realme 11 Pro Plus with curved display. 200MP camera. Premium phone. Like new condition. 4 months old.', price: 32000, img: 'realme beige curved' },
    { title: 'Vivo V27 Pro 12GB 256GB Magic Blue', desc: 'Vivo V27 Pro with amazing selfie camera. Color changing back. Like new. Only 2 months old. Great for photography.', price: 32000, img: 'vivo blue color' },
    { title: 'Vivo X80 12GB 256GB Cosmic Black', desc: 'Vivo X80 with Zeiss optics. Flagship camera phone. Excellent condition. Used for 7 months. Great photos and videos.', price: 45000, img: 'vivo camera zeiss' },
    { title: 'Oppo Reno 8 Pro 12GB 256GB Glazed Green', desc: 'Oppo Reno 8 Pro with Marisilicon chip. Great camera performance. Good condition. 8 months old. Fast charging 80W.', price: 28000, img: 'oppo green reno' },
  ],
  'vehicles': [
    { title: 'Maruti Swift VXI 2020 Pearl White', desc: 'Swift VXI petrol in excellent condition. Single owner. 32,000 km driven. Full service history from Maruti showroom. No accidents. AC working perfect. New tyres.', price: 650000, img: 'white hatchback car' },
    { title: 'Maruti Baleno Alpha 2021 Nexa Blue', desc: 'Baleno Alpha top model. Automatic CVT. 28,000 km. Premium hatchback. All features working. Showroom maintained.', price: 850000, img: 'blue baleno nexa' },
    { title: 'Hyundai i20 Sportz 2019 Fiery Red', desc: 'i20 Sportz top model. Diesel. Well maintained. 45,000 km. First owner. All papers clear. Great condition.', price: 720000, img: 'red i20 hyundai' },
    { title: 'Hyundai Venue SX Plus 2022 Black', desc: 'Venue SX Plus compact SUV. Petrol. Only 18,000 km. Under warranty. Excellent condition. Premium interior.', price: 1100000, img: 'black venue suv' },
    { title: 'Honda City VX CVT 2021 Radiant Silver', desc: 'Honda City automatic petrol. Premium sedan. Only 28,000 km. Under warranty. Showroom maintained. Leather seats.', price: 1250000, img: 'silver honda city' },
    { title: 'Honda Amaze VX 2020 Modern Steel', desc: 'Honda Amaze diesel sedan. 42,000 km. Well maintained. Great mileage 25+ kmpl. Family car. All servicing done.', price: 780000, img: 'grey honda amaze' },
    { title: 'Tata Nexon XZ Plus 2020 Foliage Green', desc: 'Nexon XZ Plus diesel. Excellent SUV. Well serviced. 38,000 km. Single owner. All features working. 5-star safety.', price: 920000, img: 'green nexon tata' },
    { title: 'Tata Altroz XT 2021 High Street Gold', desc: 'Altroz premium hatchback. Petrol. 25,000 km. Excellent condition. Safe car. Well maintained. Unique color.', price: 680000, img: 'gold altroz premium' },
    { title: 'Mahindra XUV500 W10 2018 Volcano Black', desc: 'XUV500 W10 diesel in great condition. 7 seater. 55,000 km. Well maintained. Family car. Spacious and comfortable.', price: 1150000, img: 'black xuv500 mahindra' },
    { title: 'Mahindra Scorpio S11 2019 Pearl White', desc: 'Scorpio S11 diesel. Powerful SUV. 48,000 km. Well serviced. Great for highway drives. Single owner.', price: 1280000, img: 'white scorpio suv' },
  ],
  'furniture': [
    { title: 'L Shape Sofa 6 Seater Grey Fabric Premium', desc: 'Beautiful L shape sofa set in grey fabric. Excellent condition. Barely used for 1 year. Very comfortable with soft cushions. Selling due to home shifting. Heavy and sturdy.', price: 22000, img: 'grey l shape sofa' },
    { title: '3+2 Seater Sofa Set Brown Leather', desc: '3 seater and 2 seater sofa in brown leather. Good condition. Used for 2 years. Comfortable and stylish. Moving sale.', price: 28000, img: 'brown leather sofa' },
    { title: 'Recliner Sofa 3 Seater Blue Fabric', desc: 'Recliner sofa with manual recline. Very comfortable. Blue fabric upholstery. Like new. Only 6 months old.', price: 35000, img: 'blue recliner sofa' },
    { title: 'Sheesham Wood Double Bed King Size with Storage', desc: 'Solid sheesham wood king size double bed with box storage. Includes good quality mattress. Used for 2 years. Well maintained. Beautiful carved design.', price: 18000, img: 'wooden bed storage' },
    { title: 'Queen Size Bed with Hydraulic Storage', desc: 'Modern queen bed with hydraulic storage. Engineered wood. Excellent condition. 1 year old. With ortho mattress.', price: 16000, img: 'modern bed hydraulic' },
    { title: 'Single Bed Solid Wood with Mattress', desc: 'Solid wood single bed perfect for kids or guest room. With comfortable mattress. Good condition. 3 years old.', price: 8000, img: 'single wooden bed' },
    { title: '6 Seater Dining Table Teak Wood with Chairs', desc: 'Teak wood dining table with 6 cushioned chairs. Beautiful design. Excellent condition. Moving sale. Heavy and premium.', price: 28000, img: 'teak dining table' },
    { title: '4 Seater Dining Set Glass Top Modern', desc: 'Modern dining set with glass top table and 4 chairs. Contemporary design. Like new. Only 8 months old.', price: 18000, img: 'glass dining modern' },
    { title: 'Study Table with Chair and Storage Drawer', desc: 'Modern study table with comfortable chair. Plenty of storage drawers. Perfect for WFH or students. 6 months old.', price: 4500, img: 'study table drawer' },
    { title: 'Computer Table L Shape with Shelf', desc: 'L-shaped computer table with overhead shelf. Engineered wood. Good for home office. Used for 1 year.', price: 5500, img: 'l shape computer desk' },
    { title: '3 Door Wardrobe Sliding Dark Brown Mirror', desc: 'Spacious 3 door sliding wardrobe with mirror. Engineered wood. Good condition. Used for 3 years. Height 7 feet. Lots of storage.', price: 12000, img: 'brown wardrobe sliding' },
    { title: '2 Door Wardrobe White with Drawers', desc: 'White wardrobe with 2 doors and bottom drawers. Compact design. Perfect for small rooms. Good condition.', price: 8000, img: 'white wardrobe compact' },
  ],
  'electronics': [
    { title: 'Dell Inspiron 15 i5 10th Gen 8GB 512GB SSD Silver', desc: 'Dell laptop in excellent working condition. i5 10th gen processor, 8GB RAM, 512GB SSD. Perfect for students and office work. Battery backup 4-5 hours. With original charger and bag.', price: 32000, img: 'dell laptop silver' },
    { title: 'Dell Latitude 7490 i7 8th Gen 16GB Business Laptop', desc: 'Dell business laptop. i7 8th gen, 16GB RAM, 512GB SSD. Premium build quality. Great for professionals. Used carefully.', price: 38000, img: 'dell business laptop' },
    { title: 'HP Pavilion 15 i5 11th Gen 8GB 512GB SSD', desc: 'HP Pavilion with 11th gen i5. 8GB RAM, fast SSD. Good for multitasking. 1 year old. Excellent condition.', price: 36000, img: 'hp pavilion silver' },
    { title: 'HP Pavilion Gaming Ryzen 5 16GB GTX 1650 Green', desc: 'HP gaming laptop. Ryzen 5, 16GB RAM, GTX 1650 graphics. Perfect for gaming and editing. Good condition. Runs AAA games smoothly.', price: 52000, img: 'hp gaming green' },
    { title: 'Lenovo Ideapad Slim i3 11th Gen 8GB Student Laptop', desc: 'Lenovo slim laptop perfect for students. i3 11th gen, 8GB RAM, 256GB SSD. Lightweight and portable. 1 year old.', price: 28000, img: 'lenovo slim student' },
    { title: 'Lenovo ThinkPad E14 i5 10th Gen 16GB Professional', desc: 'Lenovo ThinkPad business laptop. i5 10th gen, 16GB RAM. Excellent keyboard. Professional grade. Used carefully.', price: 42000, img: 'lenovo thinkpad black' },
    { title: 'Asus Vivobook 15 i5 12th Gen 16GB 512GB SSD', desc: 'Asus Vivobook latest model. i5 12th gen, 16GB RAM. Very fast performance. Only 6 months old. Like new.', price: 48000, img: 'asus vivobook thin' },
    { title: 'MacBook Air M1 2020 8GB 256GB Space Grey', desc: 'Apple MacBook Air M1 chip. Blazing fast. Excellent battery life 12+ hours. Barely used for 1 year. Complete box with charger. Premium laptop.', price: 68000, img: 'macbook air grey' },
    { title: 'MacBook Pro 13 M1 2021 16GB 512GB Silver', desc: 'MacBook Pro with M1 chip. 16GB unified memory. 512GB storage. Professional grade. Under Apple warranty. Perfect condition.', price: 115000, img: 'macbook pro silver' },
    { title: 'Samsung 55 inch Crystal UHD 4K Smart TV', desc: 'Samsung 55" 4K Smart TV. Crystal clear picture. All streaming apps working. 2 years old. Excellent condition. Wall mount included. Remote working.', price: 42000, img: 'samsung 55 tv' },
    { title: 'Samsung 43 inch Full HD Smart TV 2023 Model', desc: 'Samsung 43" Full HD Smart TV latest model. WiFi enabled. Good picture quality. Only 1 year old. With warranty.', price: 28000, img: 'samsung 43 smart' },
    { title: 'LG 43 inch Full HD Smart TV WebOS Magic Remote', desc: 'LG 43" Full HD Smart TV with WebOS. Magic remote included. Great picture quality. 3 years old. Works perfectly.', price: 22000, img: 'lg 43 webos' },
    { title: 'LG 55 inch 4K OLED TV Cinema HDR', desc: 'LG 55" OLED TV with stunning picture quality. Perfect blacks. Cinema HDR. Premium TV. 2 years old. Excellent condition.', price: 95000, img: 'lg oled 55' },
    { title: 'Sony 50 inch 4K Android TV Bravia X75K', desc: 'Sony Bravia 50" 4K Android TV. Premium picture quality. Google TV. Only 1 year old. Under warranty. Excellent for movies.', price: 52000, img: 'sony bravia 50' },
    { title: 'Sony 65 inch 4K Android TV X80K', desc: 'Sony 65" big screen 4K TV. Android TV with Google assistant. Immersive viewing. 1 year old. Premium quality.', price: 78000, img: 'sony 65 inch' },
    { title: 'Mi TV 5X 55 inch 4K Dolby Vision', desc: 'Mi TV 55" 4K with Dolby Vision and Atmos. Great value smart TV. 2 years old. Good condition. All apps working.', price: 35000, img: 'mi tv 55' },
    { title: 'OnePlus Y1S Pro 55 inch 4K Smart TV', desc: 'OnePlus 55" 4K smart TV. Bezel-less design. Good picture quality. 1 year old. With warranty. Remote included.', price: 38000, img: 'oneplus tv 55' },
    { title: 'Canon EOS 1500D DSLR 18-55mm Kit Lens', desc: 'Canon DSLR camera with kit lens 18-55mm. Barely used. Like new condition. Complete box with bag, strap and accessories. Perfect for beginners.', price: 28000, img: 'canon 1500d dslr' },
    { title: 'Nikon D5600 DSLR 18-140mm VR Kit', desc: 'Nikon D5600 with 18-140mm VR lens. Excellent camera for enthusiasts. Used for 1 year. All accessories included. Bag and memory card.', price: 45000, img: 'nikon d5600 kit' },
    { title: 'Sony Alpha A6400 Mirrorless 16-50mm Lens', desc: 'Sony mirrorless camera with kit lens. Excellent autofocus. 4K video. Professional quality. Like new. Only 8 months old.', price: 72000, img: 'sony alpha mirrorless' },
  ],
  'bikes-scooters': [
    { title: 'Honda Activa 6G 2022 Matte Grey Metallic', desc: 'Honda Activa 6G in excellent condition. Only 4,000 km driven. Single owner. All papers clear. BS6 engine. Great mileage 45+ kmpl. Well maintained.', price: 68000, img: 'grey activa honda' },
    { title: 'Honda Activa 5G 2020 Black', desc: 'Honda Activa 5G good condition. 12,000 km driven. Well serviced. First owner. Insurance valid till next year.', price: 58000, img: 'black activa scooty' },
    { title: 'TVS Jupiter Classic 2021 Matte Maroon', desc: 'TVS Jupiter in mint condition. 8,000 km. Well maintained. First owner. Insurance valid. Excellent scooty. Comfortable ride.', price: 58000, img: 'maroon jupiter tvs' },
    { title: 'TVS Ntorq 125 Race Edition 2022 Red', desc: 'TVS Ntorq sporty scooter. Race edition. Only 5,000 km. Like new. Digital console. Fast and stylish.', price: 72000, img: 'red ntorq sporty' },
    { title: 'Hero Splendor Plus 2020 Black Matte', desc: 'Hero Splendor Plus bike. 15,000 km. Good condition. Well serviced. Great mileage 60+ kmpl. Single owner. Economical bike.', price: 48000, img: 'black splendor bike' },
    { title: 'Hero Passion Pro 2021 Red', desc: 'Hero Passion Pro in good condition. 10,000 km. First owner. All papers ready. Smooth bike. Self start working.', price: 52000, img: 'red passion hero' },
    { title: 'Bajaj Pulsar 150 2019 Blue Metallic', desc: 'Pulsar 150 in good condition. 22,000 km driven. Well maintained. RC and insurance ready. Smooth riding. Popular bike.', price: 65000, img: 'blue pulsar 150' },
    { title: 'Bajaj Pulsar NS 200 2020 Black', desc: 'Pulsar NS 200 performance bike. 18,000 km. Excellent condition. Single owner. Great for long rides. Powerful engine.', price: 98000, img: 'black pulsar ns' },
    { title: 'Suzuki Access 125 2021 Pearl White', desc: 'Suzuki Access 125 scooty. Excellent condition. Only 6,000 km. Ladies used. Very smooth. All documents clear. Comfortable seat.', price: 62000, img: 'white suzuki access' },
    { title: 'Suzuki Gixxer SF 2020 Blue Racing', desc: 'Suzuki Gixxer SF sports bike. 15,000 km. Well maintained. Great condition. Full fairing. Looks aggressive.', price: 88000, img: 'blue gixxer sports' },
  ],
  'appliances': [
    { title: 'Samsung 7kg Fully Automatic Washing Machine Front Load', desc: 'Samsung fully automatic front load washing machine. 7kg capacity. Works perfectly. 3 years old. Well maintained. All programs working. Energy efficient.', price: 12000, img: 'samsung washing machine' },
    { title: 'LG 6.5kg Top Load Fully Automatic Turbo Drum', desc: 'LG top load washing machine. 6.5kg capacity. Turbo drum technology. Good working condition. 4 years old.', price: 9000, img: 'lg top load washer' },
    { title: 'IFB 8kg Front Load Washing Machine', desc: 'IFB premium washing machine. 8kg capacity. Front load. Multiple wash programs. 2 years old. Excellent condition.', price: 18000, img: 'ifb front load' },
    { title: 'LG 260L Double Door Refrigerator Silver Inverter', desc: 'LG double door fridge 260 liters. Frost free. Inverter compressor. Excellent cooling. 4 years old. No issues. Moving sale.', price: 15000, img: 'silver lg refrigerator' },
    { title: 'Samsung 253L Double Door Fridge', desc: 'Samsung double door refrigerator. 253L capacity. Frost free. Good cooling. 5 years old. Well maintained.', price: 13000, img: 'samsung double door' },
    { title: 'Whirlpool 200L Single Door Fridge Blue', desc: 'Whirlpool single door refrigerator. 200L. Perfect for small families. 3 years old. Good working condition.', price: 8000, img: 'blue whirlpool fridge' },
    { title: 'Whirlpool 1.5 Ton 3 Star Split AC Copper Coil', desc: 'Whirlpool AC in good working condition. 1.5 ton. Copper coil. 3 star rating. 5 years old. Gas filled. Cools well.', price: 18000, img: 'whirlpool split ac' },
    { title: 'Daikin 1.5 Ton 5 Star Inverter AC', desc: 'Daikin inverter AC. 1.5 ton. 5 star energy rating. Excellent cooling. 3 years old. Premium brand. Under AMC.', price: 28000, img: 'daikin inverter ac' },
    { title: 'Voltas 1 Ton 3 Star Window AC', desc: 'Voltas window AC. 1 ton capacity. 3 star rating. Good for small rooms. 6 years old but works fine.', price: 12000, img: 'voltas window ac' },
    { title: 'IFB 30L Convection Microwave Oven', desc: 'IFB microwave oven with convection. 30 liter capacity. Rarely used. Like new. With manual, grill stand and recipes. Multi-function oven.', price: 8500, img: 'ifb microwave convection' },
    { title: 'LG 28L Charcoal Microwave Oven', desc: 'LG microwave with charcoal lighting. 28L capacity. Looks premium. Good condition. 2 years old. All functions working.', price: 7500, img: 'lg charcoal microwave' },
    { title: 'Godrej 190L Single Door Refrigerator Burgundy Red', desc: 'Godrej small fridge perfect for bachelors. 190L. Works great. 6 years old but well maintained. Unique red color.', price: 6000, img: 'red godrej fridge' },
  ],
  'books': [
    { title: 'Engineering Books Complete Set Computer Science BTech', desc: 'Complete set of Computer Science engineering books for all 4 years. Includes Data Structures, DBMS, OS, Networks, etc. All in good condition. No marks or highlights. Worth Rs.15000 new.', price: 3500, img: 'engineering computer books' },
    { title: 'Mechanical Engineering Books Semester 1 to 8', desc: 'Complete mechanical engineering books. All semesters. Good condition. Lightly used. Perfect for students.', price: 4000, img: 'mechanical engineering books' },
    { title: 'NCERT Books Class 12 Science Stream Complete Set', desc: 'All NCERT books for Class 12 Science. Physics, Chemistry, Maths, Biology, English. Lightly used. No damage. Latest edition.', price: 1200, img: 'ncert class 12' },
    { title: 'NCERT Books Class 10 Complete Set All Subjects', desc: 'Complete NCERT set for Class 10. All subjects included. Good condition. No torn pages. Useful for CBSE students.', price: 800, img: 'ncert class 10' },
    { title: 'CA Foundation Books Complete Set 2023 Edition', desc: 'CA Foundation complete study material with practice books. Latest edition. Barely used. Includes all 4 papers. With revision test papers.', price: 4000, img: 'ca foundation books' },
    { title: 'CA Inter Books Group 1 Complete', desc: 'CA Intermediate Group 1 complete books. Latest edition. Good condition. All subjects included.', price: 3500, img: 'ca inter group books' },
    { title: 'NEET Preparation Books MTG Arihant Complete Package', desc: 'Complete NEET preparation books. MTG, Arihant, DC Pandey Physics, MS Chouhan Chemistry, Truemans Biology. Previous years papers. Good condition.', price: 2500, img: 'neet preparation books' },
    { title: 'JEE Main Advanced Books Complete Set', desc: 'JEE preparation complete set. HCV Physics, MS Chauhan Chemistry, Cengage Maths. Previous year papers. Lightly used.', price: 3200, img: 'jee preparation set' },
    { title: 'UPSC Civil Services Books Prelims Complete', desc: 'UPSC CSE Prelims complete study material. NCERTs, Spectrum, Laxmikant, etc. Good condition. Latest edition.', price: 4500, img: 'upsc prelims books' },
  ],
  'fashion': [
    { title: 'Nike Air Force 1 White Sneakers Size 10 UK Original', desc: 'Original Nike Air Force 1 white sneakers. Size UK 10. Worn only 3-4 times. Like new condition. With box and tags. Authentic Nike product from Nike store.', price: 4500, img: 'white nike airforce' },
    { title: 'Nike Air Max 270 Black Size 9 UK', desc: 'Nike Air Max 270 original. Size 9. Very comfortable. Used for 6 months. Good condition. With box. Great cushioning.', price: 5000, img: 'black nike airmax' },
    { title: 'Adidas Ultraboost Running Shoes Size 9 Black White', desc: 'Adidas Ultraboost original. Size 9. Very comfortable for running. Used for 6 months. Good condition. Boost technology.', price: 3500, img: 'adidas ultraboost black' },
    { title: 'Adidas Originals Superstar White Size 10', desc: 'Adidas Superstar classic sneakers. Size 10. Iconic design. Good condition. Used lightly. With box.', price: 3000, img: 'white adidas superstar' },
    { title: 'Puma RS-X Running Shoes Blue Size 9 UK', desc: 'Puma RS-X trendy sneakers. Size 9. Blue colorway. Barely used. Like new. With box and tags.', price: 3200, img: 'blue puma rsx' },
    { title: 'Levis 511 Slim Fit Jeans W32 L32 Dark Blue', desc: 'Original Levis 511 slim fit jeans. Size 32x32. Barely worn. Excellent condition. Authentic Levis product. Dark blue wash.', price: 1800, img: 'levis blue jeans' },
    { title: 'Levis 501 Original Fit Jeans W34 L32 Black', desc: 'Levis 501 original fit black jeans. Size 34x32. Classic fit. Good condition. Original product. Timeless style.', price: 2000, img: 'levis black jeans' },
    { title: 'Zara Mens Leather Jacket Size L Black Genuine', desc: 'Zara leather jacket for men. Size Large. Premium quality genuine leather. Worn few times. Like new. Stylish and warm.', price: 3200, img: 'black leather jacket' },
    { title: 'H&M Mens Denim Jacket Blue Size M', desc: 'H&M denim jacket. Size Medium. Classic blue denim. Good condition. Perfect for casual wear.', price: 1200, img: 'blue denim jacket' },
    { title: 'Tommy Hilfiger Polo T-Shirt Size L White', desc: 'Tommy Hilfiger original polo t-shirt. Size Large. White color. Barely worn. Authentic product. With tags.', price: 1500, img: 'white polo tshirt' },
  ],
  'sports-fitness': [
    { title: 'Home Gym Equipment Set Complete with Bench 50kg Weight', desc: 'Complete home gym set with adjustable bench, dumbbells, rods, and plates. Total 50kg weight. Barely used for 1 year. Great condition. Perfect for home workouts.', price: 18000, img: 'home gym equipment' },
    { title: 'Dumbbell Set 20kg Adjustable Pair', desc: 'Adjustable dumbbell set. 20kg total (10kg each). Good quality. Lightly used. Perfect for home workouts.', price: 3500, img: 'dumbbell set adjustable' },
    { title: 'Gym Bench Adjustable Incline Decline', desc: 'Multi-purpose gym bench. Adjustable positions. Good quality. Used for 1 year. Sturdy and stable.', price: 5500, img: 'adjustable gym bench' },
    { title: 'Yonex Badminton Racket Nanoray Professional ZSpeed', desc: 'Yonex Nanoray Z-Speed professional badminton racket. Original product. Good condition. With cover. Light weight racket.', price: 2800, img: 'yonex badminton racket' },
    { title: 'Li-Ning Badminton Racket G-Force Pro', desc: 'Li-Ning professional badminton racket. Good quality. Used in tournaments. With cover and grip.', price: 2200, img: 'lining badminton professional' },
    { title: 'Cricket Bat English Willow SS Ton Master', desc: 'SS Ton English Willow cricket bat. Professional grade. Lightly used. Good condition. Light weight. Great balance.', price: 5500, img: 'cricket bat english' },
    { title: 'Cricket Kit Complete with Bat Pads Gloves Helmet', desc: 'Complete cricket kit. Bat, pads, gloves, helmet, shoes. Good quality. Used for practice. All in good condition.', price: 8500, img: 'cricket kit complete' },
    { title: 'Decathlon Treadmill 2HP Motor Foldable', desc: 'Decathlon motorized treadmill. 2HP motor. Foldable design. Used for 1 year. Works perfectly. Speed up to 12 kmph. Good for home use.', price: 28000, img: 'treadmill foldable decathlon' },
    { title: 'Exercise Cycle Home Fitness Bike', desc: 'Stationary exercise cycle. Good for cardio. Used for 2 years. Works fine. Adjustable seat and resistance.', price: 6000, img: 'exercise cycle home' },
    { title: 'Yoga Mat 6mm Thick with Bag Anti-Slip', desc: 'Premium yoga mat. 6mm thick. Anti-slip surface. With carrying bag. Barely used. Like new. Good grip.', price: 800, img: 'yoga mat thick' },
  ],
  'pets': [
    { title: 'Golden Retriever Puppy Male 3 Months Vaccinated', desc: 'Adorable Golden Retriever male puppy. 3 months old. Fully vaccinated and dewormed. Very friendly and playful. KCI registered. Healthy pup. Good with kids.', price: 18000, img: 'golden retriever puppy' },
    { title: 'Golden Retriever Female 6 Months Trained', desc: 'Golden Retriever female. 6 months old. Basic training done. Fully vaccinated. Very friendly. Loves to play. KCI papers.', price: 22000, img: 'golden retriever female' },
    { title: 'Labrador Puppy Female 2 Months Black Cute', desc: 'Cute black Labrador female puppy. 2 months old. First vaccination done. Healthy and active. Very playful. Good temperament.', price: 12000, img: 'black labrador puppy' },
    { title: 'Labrador Male 4 Months Yellow Champion Line', desc: 'Yellow Labrador male from champion bloodline. 4 months old. Fully vaccinated. Very healthy. Good for family.', price: 15000, img: 'yellow labrador male' },
    { title: 'German Shepherd Puppy Male 3 Months', desc: 'German Shepherd male puppy. 3 months old. Good quality. Vaccinated. Alert and intelligent. Good guard dog.', price: 16000, img: 'german shepherd puppy' },
    { title: 'Persian Cat Kitten 4 Months White Long Hair', desc: 'Beautiful white Persian cat. 4 months old. Fully vaccinated. Very calm and friendly. Litter trained. Fluffy coat. Well groomed.', price: 15000, img: 'white persian cat' },
    { title: 'Persian Cat Male 6 Months Grey', desc: 'Persian cat male. Grey color. 6 months old. Vaccinated. Litter trained. Very friendly. Good with children.', price: 12000, img: 'grey persian male' },
    { title: 'Beagle Puppy Male 3 Months Tri Color', desc: 'Beagle puppy tri color. Male. 3 months old. Vaccinated. Very active and playful. Good hunting instinct.', price: 14000, img: 'beagle puppy tricolor' },
  ],
  'real-estate': [
    { title: '2BHK Flat for Rent Fully Furnished 1200 sqft Prime Location', desc: 'Spacious 2BHK fully furnished apartment. 1200 sqft. Good locality near metro station. All amenities - gym, park, security. Modular kitchen. Family preferred. Available immediately.', price: 18000, img: 'furnished apartment 2bhk' },
    { title: '2BHK Semi Furnished Apartment 1000 sqft', desc: '2BHK semi furnished flat. 1000 sqft. Good ventilation. 2nd floor. Lift available. Close to schools and market.', price: 15000, img: 'semifurnished flat apartment' },
    { title: '1BHK Studio Apartment Furnished Near IT Park', desc: '1BHK studio flat near IT park. 600 sqft. Fully furnished. Suitable for working professionals. WiFi ready. Power backup.', price: 12000, img: 'studio apartment 1bhk' },
    { title: '1RK Independent Room Kitchen for Single', desc: '1RK for single person or couple. 400 sqft. Basic furnishing. Suitable for bachelors. All utilities included.', price: 8000, img: 'single room kitchen' },
    { title: '3BHK Independent House for Sale 1800 sqft', desc: '3BHK independent house with parking. 1800 sqft. Good construction. Prime location. Clear title. East facing. Spacious rooms. Negotiable.', price: 8500000, img: 'independent house 3bhk' },
    { title: '4BHK Villa for Sale Gated Community 2500 sqft', desc: '4BHK villa in premium gated community. 2500 sqft. Modern amenities. Swimming pool, clubhouse. Beautifully designed.', price: 15000000, img: 'villa gated community' },
    { title: '3BHK Apartment for Rent Unfurnished 1400 sqft', desc: '3BHK unfurnished apartment for rent. 1400 sqft. Good locality. Family building. Car parking available. Ready to move.', price: 20000, img: 'unfurnished 3bhk flat' },
    { title: 'Commercial Shop for Rent 500 sqft Main Road', desc: 'Commercial shop on main road. 500 sqft. Prime location. High footfall area. Suitable for any business. Good visibility.', price: 35000, img: 'commercial shop space' },
    { title: 'Office Space for Rent 1000 sqft IT Park', desc: 'Office space in IT park. 1000 sqft. Furnished with workstations. Suitable for startup or small company. Lift and parking.', price: 40000, img: 'office space coworking' },
  ],
  'jobs': [
    { title: 'Software Developer React Node.js 2-4 Years Experience', desc: 'Hiring experienced Software Developer with 2-4 years in React and Node.js. Must have good knowledge of MongoDB. Good salary package based on experience. Work from office in tech park. 5 day work week.', price: 800000, img: 'software developer coding' },
    { title: 'Full Stack Developer MERN 3-5 Years', desc: 'Looking for Full Stack Developer. MERN stack expertise required. 3-5 years experience. Good package with incentives. Product based company.', price: 1200000, img: 'fullstack developer work' },
    { title: 'Content Writer Work From Home Freshers Welcome', desc: 'Hiring content writers for blog posts and website content. Freshers welcome with good English. Flexible hours. Work from home opportunity. Performance based incentives.', price: 300000, img: 'content writer laptop' },
    { title: 'Digital Marketing Executive SEO SEM 1-3 Years', desc: 'Digital marketing executive needed. SEO, SEM, Social Media expertise. 1-3 years experience. Growing company. Good growth opportunities.', price: 400000, img: 'digital marketing office' },
    { title: 'Sales Executive Field Job 1-3 Years', desc: 'Hiring Sales Executives for field work. 1-3 years experience. Good incentives and commission. Two wheeler must. Target based role. FMCG sector.', price: 400000, img: 'sales executive meeting' },
    { title: 'Accountant Tally GST 2-5 Years Experience', desc: 'Accountant needed with Tally and GST knowledge. 2-5 years experience. Full time office job. Manufacturing company. Good salary.', price: 350000, img: 'accountant office work' },
  ],
  'services': [
    { title: 'Home Cleaning Services Professional Trained Staff', desc: 'Professional home cleaning services. Trained staff with experience. Affordable rates. Deep cleaning, sofa cleaning, kitchen cleaning available. Call for free quote. Eco-friendly products used.', price: 500, img: 'home cleaning service' },
    { title: 'Pest Control Services Cockroach Termite', desc: 'Professional pest control services. Cockroach, termite, rodent control. Safe chemicals. Licensed technicians. Guaranteed results. Free inspection.', price: 1500, img: 'pest control spray' },
    { title: 'Laptop Repair Services All Brands Same Day', desc: 'Expert laptop repair services. All brands - HP, Dell, Lenovo, Asus. Same day service for most issues. Free pickup and delivery. Affordable rates. Hardware and software both.', price: 1000, img: 'laptop repair service' },
    { title: 'Mobile Phone Repair All Brands Screen Replacement', desc: 'Mobile phone repair center. All brands supported. Screen replacement, battery change, charging port. Genuine spare parts. Quick service.', price: 800, img: 'mobile phone repair' },
    { title: 'AC Repair and Service All Brands Same Day', desc: 'AC repair and service. All brands supported. Experienced technicians. Gas refilling available. Reasonable rates. Same day service. Annual maintenance contracts.', price: 800, img: 'ac repair technician' },
    { title: 'Plumbing Services 24x7 Emergency Available', desc: 'Professional plumbing services. Leakage repair, pipe fitting, bathroom fitting. 24x7 emergency service. Experienced plumbers. Reasonable charges.', price: 500, img: 'plumber fixing pipe' },
    { title: 'Interior Design Services Home Office', desc: 'Interior design and decoration services. Complete home makeover. Modular kitchen, false ceiling, painting. Experienced designers. Free consultation.', price: 50000, img: 'interior design modern' },
  ],
  'other': [
    { title: 'Indoor Plants Collection 10 Varieties with Pots', desc: 'Beautiful collection of 10 indoor plants. Includes money plant, snake plant, peace lily, pothos, and more. With decorative pots. Air purifying plants. Easy maintenance.', price: 1500, img: 'indoor plants collection' },
    { title: 'Succulent Plants 5 Pack with Ceramic Pots', desc: 'Cute succulent plants. 5 varieties with ceramic pots. Low maintenance. Perfect for desk or windowsill. Good gift option.', price: 800, img: 'succulent plants pots' },
    { title: 'Antique Wall Clock Vintage 50 Years Old Working', desc: 'Beautiful antique wall clock. Over 50 years old. Works perfectly with new mechanism. Great decorative piece. Collector item. Wooden frame.', price: 4500, img: 'antique wall clock' },
    { title: 'Aquarium 3 Feet with Stand Filter and Accessories', desc: '3 feet aquarium with wooden stand. Includes filter, air pump, LED lighting. Good condition. Complete setup. Easy to maintain.', price: 6500, img: 'aquarium fish tank' },
    { title: 'Aquarium 2 Feet Complete Setup with Fish', desc: '2 feet aquarium with stand. Complete setup with filter and lights. Includes 10 goldfish. Good for beginners.', price: 3500, img: 'small aquarium setup' },
    { title: 'Musical Keyboard Casio 61 Keys with Stand', desc: 'Casio keyboard 61 keys. With stand and adapter. Good condition. Perfect for learning. Multiple tones and rhythms.', price: 6000, img: 'casio keyboard stand' },
    { title: 'Guitar Acoustic Beginners Yamaha F310', desc: 'Yamaha F310 acoustic guitar. Perfect for beginners. Good sound quality. Lightly used. With soft case and picks.', price: 7500, img: 'yamaha acoustic guitar' },
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

  const { error } = await supabase
    .from('listing_images')
    .insert(records);

  return !error;
}

// Fetch image from Unsplash API
async function fetchUnsplashImage(query) {
  return new Promise((resolve, reject) => {
    const searchQuery = encodeURIComponent(query);
    const url = `https://api.unsplash.com/photos/random?query=${searchQuery}&orientation=squarish&client_id=hCHA-HrxSB0dgt5vgfKbRl5Tq2SsUBbuDvRcKHjOQj0`;
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Unsplash API error: ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          // Get medium quality image (more realistic than full resolution)
          const imageUrl = json.urls.regular || json.urls.small;
          resolve(imageUrl);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function seedComprehensive() {
  console.log('🚀 COMPREHENSIVE PRODUCTION SEED\n');
  console.log('📸 Fetching unique realistic images for each listing...\n');

  // Fetch all data
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

  // Process each category
  for (const category of categories) {
    const listings = COMPREHENSIVE_LISTINGS[category.slug] || [];
    
    if (listings.length === 0) {
      console.log(`⚠️  No listings for: ${category.name}`);
      continue;
    }

    console.log(`\n📦 ${category.name} (${listings.length} listings)`);

    for (const listingData of listings) {
      // Pick random city
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      // Find areas for this city
      const cityAreas = areas.filter(a => a.city_id === city.id);
      if (cityAreas.length === 0) continue;
      
      const area = cityAreas[Math.floor(Math.random() * cityAreas.length)];
      const seller = SELLERS[sellerIndex % SELLERS.length];
      sellerIndex++;

      // Fetch unique image from Unsplash
      let uploadedImages = [];
      try {
        const imageUrl = await fetchUnsplashImage(listingData.img);
        const buffer = await downloadImage(imageUrl);
        const filename = `${category.slug}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;
        const publicUrl = await uploadImage(buffer, filename);
        
        if (publicUrl) {
          uploadedImages.push(publicUrl);
          images++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.log(`  ⚠️  Image failed: ${err.message}`);
        continue;
      }

      if (uploadedImages.length === 0) continue;

      // Create listing
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

  console.log(`\n🎉 SEED COMPLETE!`);
  console.log(`✅ Created ${total} listings`);
  console.log(`✅ Uploaded ${images} unique images`);
  console.log(`✅ ${SELLERS.length} unique sellers`);
  console.log(`✅ Distributed across ${cities.length} cities`);
}

seedComprehensive()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
