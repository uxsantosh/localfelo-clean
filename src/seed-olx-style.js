/**
 * OldCycle OLX-STYLE Production Seed
 * - 100% INDIAN images only
 * - Lower quality (marketplace style)
 * - NO repeated images (strict 1:1 mapping)
 * - Realistic Indian pricing
 * - OLX-like authentic feel
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

// 100% INDIAN IMAGES - One-to-One mapping (NO REPEATS!)
const OLX_STYLE_LISTINGS = {
  mobiles: [
    { img: 'https://images.unsplash.com/photo-1603812188321-94ba55ed5652?w=600', title: 'iPhone 13 128GB Black Used Good Condition', desc: 'Used iPhone 13 in good condition. Battery 89%. Small scratches on back. Screen perfect. With charger. Delhi. Urgent sale.', price: 39000 },
    { img: 'https://images.unsplash.com/photo-1700847365077-e398dadac872?w=600', title: 'iPhone 12 Pro 256GB Blue Bill Available', desc: 'iPhone 12 Pro mint condition. Battery 86%. All accessories. Bill from Imagine store. Single owner. Mumbai.', price: 48000 },
    { img: 'https://images.unsplash.com/photo-1625204393604-b8a07288a0d4?w=600', title: 'iPhone 11 64GB White Fair Condition', desc: 'Fair condition iPhone 11. Some scratches. Everything working fine. Good for daily use. Charger included. Bangalore.', price: 26000 },
    { img: 'https://images.unsplash.com/photo-1678539888654-faf959072a7d?w=600', title: 'Samsung Galaxy S22 Ultra 256GB Black', desc: 'S22 Ultra 6 months old. Barely used. Complete box with S Pen. Like new. Fast charging. Pune.', price: 65000 },
    { img: 'https://images.unsplash.com/photo-1708884831332-56f4e081fabe?w=600', title: 'Samsung Galaxy S21 5G 128GB Violet', desc: 'S21 5G good condition. 1 year old. 5G working. Original charger. Minor scratches. Hyderabad.', price: 35000 },
    { img: 'https://images.unsplash.com/photo-1681708405300-e8106984fa56?w=600', title: 'Samsung Galaxy M52 8GB 128GB Black', desc: 'M52 6 months used. 120Hz display. Good battery. No scratches. With box. Chennai.', price: 17000 },
    { img: 'https://images.unsplash.com/photo-1573127433748-eda8ff4ca80f?w=600', title: 'OnePlus 11R 16GB 256GB Silver Top Model', desc: 'OnePlus 11R top variant. 16GB RAM. Only 3 months. Bill available. 100W charger. Delhi.', price: 32000 },
    { img: 'https://images.unsplash.com/photo-1615400736066-9e780ba61b84?w=600', title: 'OnePlus 9 Pro 12GB 256GB Hasselblad', desc: 'OnePlus 9 Pro good condition. Hasselblad camera. Some scratches on back. Works perfect. Kolkata.', price: 29000 },
    { img: 'https://images.unsplash.com/photo-1668885309844-5bb50f7c2e61?w=600', title: 'Xiaomi 13 Pro 12GB 256GB Leica Camera', desc: 'Mi 13 Pro flagship. Leica camera. Barely used 4 months. Complete box. Premium phone. Mumbai.', price: 54000 },
    { img: 'https://images.unsplash.com/photo-1748342604000-53d94c778642?w=600', title: 'Redmi Note 12 Pro 8GB 128GB White', desc: 'Redmi Note 12 Pro like new. 108MP camera. 3 months old. Bill available. Great value. Bangalore.', price: 16500 },
    { img: 'https://images.unsplash.com/photo-1716512060259-d114cfba13e8?w=600', title: 'Realme GT 2 Pro 12GB 256GB Gaming Phone', desc: 'Realme GT 2 Pro gaming phone. Snapdragon 8 Gen 1. Good for BGMI. 6 months used. Pune.', price: 26000 },
    { img: 'https://images.unsplash.com/photo-1646127185253-555eb2a0f660?w=600', title: 'Vivo V27 Pro 12GB 256GB Color Changing', desc: 'Vivo V27 Pro. Color changing back. Curved display. Selfie camera excellent. 2 months. Delhi.', price: 29000 },
  ],
  vehicles: [
    { img: 'https://images.unsplash.com/photo-1644524334100-e868d735997b?w=600', title: 'Maruti Swift VXI 2020 White 32000 km', desc: 'Swift VXI petrol. Single owner. 32000 km. Service history. No accident. AC good. Delhi registered.', price: 620000 },
    { img: 'https://images.unsplash.com/photo-1748215041506-2392c951fff2?w=600', title: 'Hyundai i20 Sportz 2019 Red Diesel', desc: 'i20 Sportz diesel. Well maintained. 45000 km. First owner. Papers clear. Good condition. Mumbai.', price: 690000 },
    { img: 'https://images.unsplash.com/photo-1714502524998-e8ea4dd3781d?w=600', title: 'Honda City VX CVT 2021 Silver Automatic', desc: 'Honda City automatic. Premium sedan. 28000 km. Under warranty. Showroom serviced. Bangalore.', price: 1200000 },
    { img: 'https://images.unsplash.com/photo-1687448703223-894503f57527?w=600', title: 'Tata Nexon XZ Plus 2020 Green Diesel', desc: 'Nexon XZ Plus diesel. 38000 km. Single owner. Well serviced. 5-star safety. Pune.', price: 890000 },
  ],
  furniture: [
    { img: 'https://images.unsplash.com/photo-1598895719216-c3ec6eb625ab?w=600', title: 'L Shape Sofa 6 Seater Grey Fabric', desc: 'L shape sofa grey fabric. Good condition. 1 year used. Comfortable. Home shifting sale. Delhi.', price: 20000 },
    { img: 'https://images.unsplash.com/photo-1743059199976-b709ec1e35f8?w=600', title: 'Sheesham Wood Double Bed King Size', desc: 'Solid sheesham wood bed. King size. With mattress. 2 years old. Good condition. Mumbai.', price: 16000 },
    { img: 'https://images.unsplash.com/photo-1689626698503-47934d011285?w=600', title: '6 Seater Dining Table Teak Wood', desc: 'Teak wood dining table with 6 chairs. Good condition. Moving sale. Heavy quality. Bangalore.', price: 25000 },
    { img: 'https://images.unsplash.com/photo-1639747541782-8673b4682d18?w=600', title: 'Study Table with Chair Storage', desc: 'Study table with chair. Storage drawers. Good for WFH. 6 months old. Pune.', price: 4000 },
    { img: 'https://images.unsplash.com/photo-1660915076159-def99bbbc1bb?w=600', title: '3 Door Wardrobe Sliding Dark Brown', desc: 'Wardrobe 3 door sliding. Good condition. 3 years used. Lots of storage. Chennai.', price: 11000 },
  ],
  electronics: [
    { img: 'https://images.unsplash.com/photo-1622732776208-a70bb61da7c9?w=600', title: 'Dell Inspiron 15 i5 10th Gen 8GB 512GB', desc: 'Dell laptop good condition. i5 10th gen. 8GB RAM. 512GB SSD. Battery 4 hours. With charger. Delhi.', price: 29000 },
    { img: 'https://images.unsplash.com/photo-1630821816375-248e9e483742?w=600', title: 'HP Pavilion Gaming Ryzen 5 16GB GTX 1650', desc: 'HP gaming laptop. Ryzen 5. 16GB RAM. GTX 1650. Gaming good. Some scratches. Mumbai.', price: 48000 },
    { img: 'https://images.unsplash.com/photo-1745238745177-929da33bb07b?w=600', title: 'MacBook Air M1 2020 8GB 256GB Grey', desc: 'MacBook Air M1. Excellent battery. 1 year used. Complete box. Bill available. Bangalore.', price: 62000 },
    { img: 'https://images.unsplash.com/photo-1597058712635-3182d1eacc1e?w=600', title: 'Samsung 55 inch 4K Smart TV', desc: 'Samsung 55" 4K Smart TV. Good condition. 2 years old. Netflix Prime working. Wall mount. Pune.', price: 38000 },
    { img: 'https://images.unsplash.com/photo-1582072291448-5db861a71699?w=600', title: 'LG 43 inch Full HD Smart TV WebOS', desc: 'LG 43" Smart TV. WebOS. Good condition. 3 years old. Remote included. Chennai.', price: 20000 },
    { img: 'https://images.unsplash.com/photo-1665386361890-9068b6d1d359?w=600', title: 'Canon EOS 1500D DSLR 18-55mm', desc: 'Canon DSLR with kit lens. Barely used. Like new. Complete box with bag. Delhi.', price: 25000 },
  ],
  'bikes-scooters': [
    { img: 'https://images.unsplash.com/photo-1688127307814-8b1ca607e4ad?w=600', title: 'Honda Activa 6G 2022 Grey 4000 km', desc: 'Activa 6G excellent condition. Only 4000 km. Single owner. Papers clear. BS6. Delhi.', price: 65000 },
    { img: 'https://images.unsplash.com/photo-1731447597411-6daba29dfa76?w=600', title: 'TVS Jupiter Classic 2021 Maroon 8000 km', desc: 'TVS Jupiter good condition. 8000 km. Well maintained. First owner. Insurance valid. Mumbai.', price: 55000 },
    { img: 'https://images.unsplash.com/photo-1661188279623-d9fc9dda3b6c?w=600', title: 'Hero Splendor Plus 2020 Black 15000 km', desc: 'Splendor Plus. 15000 km. Good condition. Well serviced. Great mileage. Bangalore.', price: 45000 },
    { img: 'https://images.unsplash.com/photo-1750715665990-fe87235a45bd?w=600', title: 'Bajaj Pulsar 150 2019 Blue 22000 km', desc: 'Pulsar 150 good condition. 22000 km. RC insurance ready. Smooth bike. Pune.', price: 62000 },
    { img: 'https://images.unsplash.com/photo-1709874859086-b50e500f4136?w=600', title: 'Suzuki Access 125 2021 White 6000 km', desc: 'Suzuki Access 125. Only 6000 km. Ladies used. Very smooth. Papers clear. Chennai.', price: 58000 },
  ],
  appliances: [
    { img: 'https://images.unsplash.com/photo-1760443832338-eba8085b6709?w=600', title: 'Samsung 7kg Fully Automatic Front Load', desc: 'Samsung washing machine 7kg. Front load. Works perfectly. 3 years old. Moving sale. Delhi.', price: 11000 },
    { img: 'https://images.unsplash.com/photo-1584910799193-44ff686a1b7b?w=600', title: 'LG 260L Double Door Fridge Silver', desc: 'LG double door fridge 260L. Frost free. Good cooling. 4 years old. Mumbai.', price: 13500 },
    { img: 'https://images.unsplash.com/photo-1702206292733-a5d452e62180?w=600', title: 'Whirlpool 1.5 Ton 3 Star AC Split', desc: 'Whirlpool AC 1.5 ton. Good working. 5 years old. Gas filled. Cools well. Bangalore.', price: 16000 },
    { img: 'https://images.unsplash.com/photo-1691328024236-55b85f698fe4?w=600', title: 'IFB 30L Convection Microwave Oven', desc: 'IFB microwave 30L. Convection. Rarely used. Like new. With manual. Pune.', price: 7500 },
  ],
  books: [
    { img: 'https://images.unsplash.com/photo-1578729908473-7ae487a9bf69?w=600', title: 'Engineering Books CSE BTech Complete Set', desc: 'Complete CSE engineering books. All 4 years. Good condition. No marks. Delhi.', price: 3000 },
    { img: 'https://images.unsplash.com/photo-1654234237051-39720e868d55?w=600', title: 'NCERT Books Class 12 Science Complete', desc: 'NCERT Class 12 Science all subjects. Lightly used. Latest edition. Mumbai.', price: 1000 },
    { img: 'https://images.unsplash.com/photo-1663230596855-cbf814695c18?w=600', title: 'CA Foundation Books Complete New', desc: 'CA Foundation complete set. Latest edition. Barely used. All 4 papers. Bangalore.', price: 3500 },
    { img: 'https://images.unsplash.com/photo-1656342805779-6999524434bd?w=600', title: 'NEET Preparation Books MTG Arihant', desc: 'NEET books complete. MTG Arihant. Previous years. Good condition. Pune.', price: 2200 },
  ],
  fashion: [
    { img: 'https://images.unsplash.com/photo-1726133731374-31f3ab7d29d9?w=600', title: 'Nike Air Force 1 White Size 10 UK', desc: 'Nike Air Force 1 white. Size 10. Worn 3-4 times. Like new. With box. Delhi.', price: 4000 },
    { img: 'https://images.unsplash.com/photo-1654843616984-b0ab0a9a99a7?w=600', title: 'Adidas Ultraboost Size 9 Black', desc: 'Adidas Ultraboost original. Size 9. Used 6 months. Good condition. Mumbai.', price: 3200 },
    { img: 'https://images.unsplash.com/photo-1752653425039-cf1ff22d61bc?w=600', title: 'Levis 511 Slim Fit Jeans W32 L32', desc: 'Levis 511 slim fit. Size 32x32. Barely worn. Excellent condition. Bangalore.', price: 1500 },
  ],
  'sports-fitness': [
    { img: 'https://images.unsplash.com/photo-1651165924201-d8156dbe9fc2?w=600', title: 'Home Gym Equipment Set 50kg Complete', desc: 'Home gym set complete. Bench dumbbells rods. 50kg total. Barely used. Delhi.', price: 16000 },
    { img: 'https://images.unsplash.com/photo-1648657850347-81445c3978ae?w=600', title: 'Yonex Badminton Racket Nanoray Pro', desc: 'Yonex Nanoray professional racket. Original. Good condition. With cover. Mumbai.', price: 2500 },
    { img: 'https://images.unsplash.com/photo-1630740451344-3ee2cdcfe070?w=600', title: 'Cricket Bat English Willow SS Ton', desc: 'SS Ton English Willow bat. Professional grade. Lightly used. Bangalore.', price: 5000 },
  ],
  pets: [
    { img: 'https://images.unsplash.com/photo-1643781947685-df6b607c3fe5?w=600', title: 'Golden Retriever Puppy Male 3 Months', desc: 'Golden Retriever male puppy. 3 months. Vaccinated. Very friendly. KCI. Delhi.', price: 16000 },
    { img: 'https://images.unsplash.com/photo-1736225072401-274c4af5bdce?w=600', title: 'Labrador Puppy Female 2 Months Black', desc: 'Labrador female puppy. 2 months. First vaccination. Healthy active. Mumbai.', price: 11000 },
    { img: 'https://images.unsplash.com/photo-1761376378502-a28a3d798497?w=600', title: 'Persian Cat Kitten 4 Months White', desc: 'Persian cat white. 4 months. Vaccinated. Litter trained. Very calm. Bangalore.', price: 13000 },
  ],
  'real-estate': [
    { img: 'https://images.unsplash.com/photo-1708168583024-ab1826128190?w=600', title: '2BHK Flat Rent Furnished Whitefield', desc: '2BHK furnished flat. 1200 sqft. Good locality. Near metro. All amenities. Bangalore. Family.', price: 17000 },
    { img: 'https://images.unsplash.com/photo-1688978022482-00702c9eb83c?w=600', title: '3BHK House Sale Baner Pune', desc: '3BHK independent house. 1800 sqft. Good construction. Prime location. Clear title. Pune.', price: 8000000 },
    { img: 'https://images.unsplash.com/photo-1716713438776-13a7a9dee523?w=600', title: '1BHK Studio Flat Cyber City Gurgaon', desc: '1BHK studio near Cyber City. 600 sqft. Furnished. Working professionals. Gurgaon.', price: 11000 },
    { img: 'https://images.unsplash.com/photo-1764120330256-389dc3da33ad?w=600', title: '2BHK Semi Furnished Indiranagar', desc: '2BHK semi furnished. 1000 sqft. Lift available. Close to schools. Bangalore.', price: 23000 },
  ],
  jobs: [
    { img: 'https://images.unsplash.com/photo-1572523463046-51b03c1e4423?w=600', title: 'Software Developer React Node 2-4 Years', desc: 'Hiring Software Developer. React Node.js. 2-4 years. Good salary. Bangalore office. 5 day week.', price: 700000 },
    { img: 'https://images.unsplash.com/photo-1681164315430-6159b2361615?w=600', title: 'Content Writer Work From Home Freshers', desc: 'Hiring content writers. Freshers welcome. Good English. Work from home. Mumbai based.', price: 250000 },
    { img: 'https://images.unsplash.com/photo-1731657021987-65b55c98568d?w=600', title: 'Sales Executive Field Job Delhi NCR', desc: 'Sales Executives needed. Field work. 1-3 years. Good incentives. Two wheeler must. Delhi NCR.', price: 350000 },
  ],
  services: [
    { img: 'https://images.unsplash.com/photo-1559307183-517680cd78d5?w=600', title: 'Home Cleaning Services Mumbai', desc: 'Professional home cleaning. Trained staff. Affordable rates. Deep cleaning available. Mumbai.', price: 500 },
    { img: 'https://images.unsplash.com/photo-1512457226770-bfa3d6e944b3?w=600', title: 'Laptop Repair All Brands Bangalore', desc: 'Laptop repair services. All brands. Same day. Free pickup delivery. Bangalore.', price: 800 },
    { img: 'https://images.unsplash.com/photo-1617253426922-a2996af8c133?w=600', title: 'AC Repair Service Delhi Same Day', desc: 'AC repair service. All brands. Gas refilling. Same day service. Delhi NCR.', price: 700 },
  ],
  other: [
    { img: 'https://images.unsplash.com/photo-1705629173711-6b62a5167ec1?w=600', title: 'Indoor Plants Collection 10 Varieties', desc: 'Indoor plants 10 varieties. With pots. Air purifying. Easy maintenance. Delhi.', price: 1200 },
    { img: 'https://images.unsplash.com/photo-1763650859389-4e8700b47f75?w=600', title: 'Succulent Plants 5 Pack Ceramic Pots', desc: 'Succulent plants 5 varieties. Ceramic pots. Low maintenance. Good gift. Mumbai.', price: 700 },
    { img: 'https://images.unsplash.com/photo-1556088764-56e2dd8ec8b5?w=600', title: 'Acoustic Guitar Yamaha F310 Beginners', desc: 'Yamaha F310 acoustic guitar. Good for beginners. Lightly used. With case. Bangalore.', price: 6500 },
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

async function seedOLXStyle() {
  console.log('🇮🇳 OLX-STYLE SEED - 100% Indian Marketplace Feel\n');

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
    const listings = OLX_STYLE_LISTINGS[category.slug] || [];
    
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
        const displayTitle = listingData.title.length > 35 
          ? listingData.title.substring(0, 32) + '...' 
          : listingData.title;
        console.log(`  ✅ ${displayTitle} (${seller.name})`);
      }
    }
  }

  console.log(`\n🎉 OLX-STYLE SEED COMPLETE!`);
  console.log(`✅ Created ${total} listings`);
  console.log(`✅ Uploaded ${images} UNIQUE Indian images`);
  console.log(`✅ ZERO image repeats - 100% Indian context`);
  console.log(`✅ Realistic OLX-style pricing`);
  console.log(`✅ Ready to go LIVE! 🚀`);
}

seedOLXStyle()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
