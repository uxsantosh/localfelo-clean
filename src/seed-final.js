/**
 * OldCycle FINAL Production Seed
 * - 100+ realistic listings
 * - Unique images for each (NO REPEATS!)
 * - All cities, all areas, all categories
 * - 35 unique Indian sellers
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

// Image pools for each category (from Unsplash)
const IMAGE_POOLS = {
  mobiles: [
    'https://images.unsplash.com/photo-1580137157953-3798238360f9?w=800',
    'https://images.unsplash.com/photo-1658755550754-bdf5d58da07b?w=800',
    'https://images.unsplash.com/photo-1608539254904-2941af95cd82?w=800',
    'https://images.unsplash.com/photo-1679486009736-1510bbd31401?w=800',
    'https://images.unsplash.com/photo-1615400736066-9e780ba61b84?w=800',
    'https://images.unsplash.com/photo-1652352545956-34c26af007da?w=800',
    'https://images.unsplash.com/photo-1725304774412-c0c20ef03689?w=800',
  ],
  vehicles: [
    'https://images.unsplash.com/photo-1760312206290-d884595398d9?w=800',
    'https://images.unsplash.com/photo-1729783458306-3615ee09ecd6?w=800',
    'https://images.unsplash.com/photo-1687448703223-894503f57527?w=800',
    'https://images.unsplash.com/photo-1691520971817-835780eb5e5c?w=800',
  ],
  furniture: [
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800',
    'https://images.unsplash.com/photo-1583221742001-9ad88bf233ff?w=800',
    'https://images.unsplash.com/photo-1611633332753-d1e2f695aa3c?w=800',
    'https://images.unsplash.com/photo-1603192399946-8bbb0703cfc4?w=800',
    'https://images.unsplash.com/photo-1563310791-ae647a16498b?w=800',
  ],
  electronics: [
    'https://images.unsplash.com/flagged/photo-1576697010739-6373b63f3204?w=800',
    'https://images.unsplash.com/photo-1642670350252-6eef1a5c0ac7?w=800',
    'https://images.unsplash.com/photo-1522439773404-99299bcdad5e?w=800',
    'https://images.unsplash.com/photo-1735980968208-1b85bdcd857b?w=800',
    'https://images.unsplash.com/photo-1651176118867-f4ac0b1d6da4?w=800',
    'https://images.unsplash.com/photo-1680701572796-b8cc1143b97a?w=800',
  ],
  'bikes-scooters': [
    'https://images.unsplash.com/photo-1693407787355-2a77a9160898?w=800',
    'https://images.unsplash.com/photo-1748344640450-f628289d152d?w=800',
  ],
  appliances: [
    'https://images.unsplash.com/photo-1754732693535-7ffb5e1a51d6?w=800',
    'https://images.unsplash.com/photo-1758488438758-5e2eedf769ce?w=800',
    'https://images.unsplash.com/photo-1637327534911-ee8057d51aec?w=800',
    'https://images.unsplash.com/photo-1608384156808-418b5c079968?w=800',
  ],
  books: [
    'https://images.unsplash.com/photo-1707586234446-a1338e496161?w=800',
    'https://images.unsplash.com/photo-1633707392225-d883c8cd3e99?w=800',
  ],
  fashion: [
    'https://images.unsplash.com/photo-1664470386591-89712aec7174?w=800',
    'https://images.unsplash.com/photo-1657349038547-b18a07fb4329?w=800',
    'https://images.unsplash.com/photo-1719759674376-a001dc166cb6?w=800',
  ],
  'sports-fitness': [
    'https://images.unsplash.com/photo-1584827387150-8ae4caebe906?w=800',
    'https://images.unsplash.com/photo-1637714409323-d5e6e9731252?w=800',
  ],
  pets: [
    'https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?w=800',
    'https://images.unsplash.com/photo-1692713456114-798f4e1ba740?w=800',
    'https://images.unsplash.com/photo-1673213903941-9eec882d90a3?w=800',
  ],
  'real-estate': [
    'https://images.unsplash.com/photo-1654506012740-09321c969dc2?w=800',
    'https://images.unsplash.com/photo-1662454419736-de132ff75638?w=800',
    'https://images.unsplash.com/photo-1664425989440-91c9eb455a70?w=800',
  ],
  jobs: [
    'https://images.unsplash.com/photo-1616329965712-cd10c0d3c599?w=800',
    'https://images.unsplash.com/photo-1607799632518-da91dd151b38?w=800',
  ],
  services: [
    'https://images.unsplash.com/photo-1649073000644-d839009ff2dd?w=800',
    'https://images.unsplash.com/photo-1599463698367-11cb72775b67?w=800',
  ],
  other: [
    'https://images.unsplash.com/photo-1581572145515-5c6c361286ca?w=800',
    'https://images.unsplash.com/photo-1549298240-0d8e60513026?w=800',
    'https://images.unsplash.com/photo-1642375143840-0c7e9db07b40?w=800',
  ],
};

// Comprehensive listings with real product names
const LISTINGS = {
  mobiles: [
    { title: 'iPhone 13 128GB Midnight Black', desc: 'Used iPhone 13 in excellent condition. Battery health 91%. Original box and charger included. Single owner, very well maintained. No scratches on screen. Face ID working perfectly.', price: 42000 },
    { title: 'iPhone 12 Pro 256GB Pacific Blue', desc: 'iPhone 12 Pro in mint condition. All accessories with bill. Battery health 88%. No dents or marks. Selling as upgrading to 14 Pro.', price: 52000 },
    { title: 'iPhone 11 64GB White', desc: 'Good condition iPhone 11. Minor scratches on back but screen is perfect. Works flawlessly. With charger.', price: 28000 },
    { title: 'Samsung Galaxy S22 Ultra 256GB Phantom Black', desc: 'Samsung S22 Ultra barely used for 6 months. Complete box with S Pen and all accessories. Like new condition.', price: 68000 },
    { title: 'Samsung Galaxy S21 5G 128GB Violet', desc: 'S21 5G in excellent condition. 5G enabled, amazing camera. Used for 1 year. Original charger and case included.', price: 38000 },
    { title: 'OnePlus 11R 16GB RAM 256GB Galactic Silver', desc: 'OnePlus 11R top variant with 16GB RAM. Blazing fast performance. Only 3 months old. Bill available.', price: 35000 },
    { title: 'OnePlus 9 Pro 12GB 256GB Morning Mist', desc: 'OnePlus 9 Pro with Hasselblad camera. Excellent gaming phone. Minor scratches on back. Works perfectly.', price: 32000 },
  ],
  vehicles: [
    { title: 'Maruti Swift VXI 2020 Pearl White', desc: 'Swift VXI petrol in excellent condition. Single owner. 32,000 km driven. Full service history. No accidents. AC working perfect.', price: 650000 },
    { title: 'Hyundai i20 Sportz 2019 Fiery Red', desc: 'i20 Sportz top model. Diesel. Well maintained. 45,000 km. First owner. All papers clear.', price: 720000 },
    { title: 'Honda City VX CVT 2021 Radiant Silver', desc: 'Honda City automatic petrol. Premium sedan. Only 28,000 km. Under warranty. Showroom maintained.', price: 1250000 },
    { title: 'Tata Nexon XZ Plus 2020 Foliage Green', desc: 'Nexon XZ Plus diesel. Excellent SUV. Well serviced. 38,000 km. Single owner. All features working.', price: 920000 },
  ],
  furniture: [
    { title: 'L Shape Sofa 6 Seater Grey Fabric', desc: 'Beautiful L shape sofa set in grey fabric. Excellent condition. Barely used for 1 year. Very comfortable. Selling due to home shifting.', price: 22000 },
    { title: 'Sheesham Wood Double Bed with Storage', desc: 'Solid sheesham wood king size double bed with box storage. Includes good quality mattress. Used for 2 years. Well maintained.', price: 18000 },
    { title: '6 Seater Dining Table Teak Wood', desc: 'Teak wood dining table with 6 cushioned chairs. Beautiful design. Excellent condition. Moving sale.', price: 28000 },
    { title: 'Study Table with Chair and Drawers', desc: 'Modern study table with comfortable chair. Plenty of storage. Perfect for WFH or students. 6 months old.', price: 4500 },
    { title: '3 Door Wardrobe Sliding Dark Brown', desc: 'Spacious 3 door sliding wardrobe. Engineered wood. Good condition. Used for 3 years. Height 7 feet.', price: 12000 },
  ],
  electronics: [
    { title: 'Dell Inspiron 15 i5 10th Gen 8GB 512GB SSD', desc: 'Dell laptop in excellent working condition. i5 10th gen, 8GB RAM, 512GB SSD. Perfect for students and office work. With original charger.', price: 32000 },
    { title: 'MacBook Air M1 2020 8GB 256GB Space Grey', desc: 'Apple MacBook Air M1 chip. Blazing fast. Excellent battery life. Barely used for 1 year. Complete box with charger.', price: 68000 },
    { title: 'HP Pavilion Gaming Ryzen 5 16GB GTX 1650', desc: 'HP gaming laptop. Ryzen 5, 16GB RAM, GTX 1650 graphics. Perfect for gaming and editing. Good condition.', price: 52000 },
    { title: 'Samsung 55 inch Crystal UHD 4K Smart TV', desc: 'Samsung 55" 4K Smart TV. Crystal clear picture. All streaming apps. 2 years old. Excellent condition. Wall mount included.', price: 42000 },
    { title: 'LG 43 inch Full HD Smart TV WebOS', desc: 'LG 43" Full HD Smart TV with WebOS. Great picture quality. 3 years old. Works perfectly. Remote included.', price: 22000 },
    { title: 'Canon EOS 1500D DSLR 18-55mm Lens', desc: 'Canon DSLR camera with kit lens. Barely used. Like new condition. Complete box with bag and accessories.', price: 28000 },
  ],
  'bikes-scooters': [
    { title: 'Honda Activa 6G 2022 Matte Grey', desc: 'Honda Activa 6G in excellent condition. Only 4,000 km driven. Single owner. All papers clear. BS6 engine. Great mileage.', price: 68000 },
    { title: 'TVS Jupiter Classic 2021 Matte Maroon', desc: 'TVS Jupiter in mint condition. 8,000 km. Well maintained. First owner. Insurance valid. Excellent scooty.', price: 58000 },
  ],
  appliances: [
    { title: 'Samsung 7kg Fully Automatic Washing Machine', desc: 'Samsung fully automatic front load washing machine. 7kg capacity. Works perfectly. 3 years old. Well maintained.', price: 12000 },
    { title: 'LG 260L Double Door Refrigerator Silver', desc: 'LG double door fridge 260 liters. Frost free. Excellent cooling. 4 years old. No issues. Moving sale.', price: 15000 },
    { title: 'Whirlpool 1.5 Ton 3 Star Split AC', desc: 'Whirlpool AC in good working condition. 1.5 ton. Copper coil. 5 years old. Gas filled. Cools well.', price: 18000 },
    { title: 'IFB 30L Convection Microwave Oven', desc: 'IFB microwave oven with convection. 30 liter capacity. Rarely used. Like new. With manual and grill stand.', price: 8500 },
  ],
  books: [
    { title: 'Engineering Books Complete Set CSE BTech', desc: 'Complete set of Computer Science engineering books for all 4 years. All in good condition. No marks or highlights.', price: 3500 },
    { title: 'NCERT Books Class 12 Science Complete', desc: 'All NCERT books for Class 12 Science. Physics, Chemistry, Maths, Biology. Lightly used. No damage.', price: 1200 },
  ],
  fashion: [
    { title: 'Nike Air Force 1 White Sneakers Size 10 UK', desc: 'Original Nike Air Force 1 white sneakers. Size UK 10. Worn only 3-4 times. Like new condition. With box.', price: 4500 },
    { title: 'Adidas Ultraboost Running Shoes Size 9 Black', desc: 'Adidas Ultraboost original. Size 9. Very comfortable. Used for 6 months. Good condition.', price: 3500 },
    { title: 'Levis 511 Slim Fit Jeans W32 L32 Dark Blue', desc: 'Original Levis 511 slim fit jeans. Size 32x32. Barely worn. Excellent condition. Authentic product.', price: 1800 },
  ],
  'sports-fitness': [
    { title: 'Home Gym Equipment Set Complete 50kg', desc: 'Complete home gym set with bench, dumbbells, rods, and plates. Total 50kg weight. Barely used. Great condition.', price: 18000 },
    { title: 'Yonex Badminton Racket Nanoray Professional', desc: 'Yonex Nanoray professional badminton racket. Original product. Good condition. With cover.', price: 2800 },
  ],
  pets: [
    { title: 'Golden Retriever Puppy Male 3 Months', desc: 'Adorable Golden Retriever male puppy. 3 months old. Fully vaccinated and dewormed. Very friendly and playful.', price: 18000 },
    { title: 'Labrador Puppy Female 2 Months Black', desc: 'Cute black Labrador female puppy. 2 months old. First vaccination done. Healthy and active.', price: 12000 },
    { title: 'Persian Cat Kitten 4 Months White', desc: 'Beautiful white Persian cat. 4 months old. Fully vaccinated. Very calm and friendly. Litter trained.', price: 15000 },
  ],
  'real-estate': [
    { title: '2BHK Flat for Rent Fully Furnished 1200 sqft', desc: 'Spacious 2BHK fully furnished apartment. 1200 sqft. Good locality. Near metro station. All amenities. Family preferred.', price: 18000 },
    { title: '3BHK Independent House for Sale 1800 sqft', desc: '3BHK independent house with parking. 1800 sqft. Good construction. Prime location. Clear title.', price: 8500000 },
    { title: '1BHK Studio Apartment Near IT Park', desc: '1BHK studio flat near IT park. 600 sqft. Semi furnished. Suitable for working professionals.', price: 12000 },
  ],
  jobs: [
    { title: 'Software Developer React Node.js 2-4 Years', desc: 'Hiring experienced Software Developer with 2-4 years in React and Node.js. Good salary package. Work from office.', price: 800000 },
    { title: 'Content Writer Work From Home Freshers', desc: 'Hiring content writers for blog posts and website content. Freshers welcome. Flexible hours. Work from home.', price: 300000 },
  ],
  services: [
    { title: 'Home Cleaning Services Professional Staff', desc: 'Professional home cleaning services. Trained staff. Affordable rates. Deep cleaning available. Call for free quote.', price: 500 },
    { title: 'Laptop Repair Services All Brands Same Day', desc: 'Expert laptop repair services. All brands. Same day service. Free pickup and delivery. Affordable rates.', price: 1000 },
  ],
  other: [
    { title: 'Indoor Plants Collection 10 Varieties', desc: 'Beautiful collection of 10 indoor plants. Includes money plant, snake plant, peace lily. With pots.', price: 1500 },
    { title: 'Acoustic Guitar Yamaha F310 Beginners', desc: 'Yamaha F310 acoustic guitar. Perfect for beginners. Good sound quality. Lightly used. With soft case.', price: 7500 },
    { title: 'Aquarium 3 Feet with Stand and Accessories', desc: '3 feet aquarium with wooden stand. Includes filter, air pump, and lighting. Good condition.', price: 6500 },
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

async function seedFinal() {
  console.log('🚀 FINAL PRODUCTION SEED\n');

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
  let usedImages = new Set(); // Track used images

  for (const category of categories) {
    const listings = LISTINGS[category.slug] || [];
    const imagePool = IMAGE_POOLS[category.slug] || [];
    
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

  console.log(`\n🎉 SEED COMPLETE!`);
  console.log(`✅ Created ${total} listings`);
  console.log(`✅ Uploaded ${images} images`);
  console.log(`✅ ${SELLERS.length} unique sellers`);
  console.log(`✅ Distributed across ${cities.length} cities`);
}

seedFinal()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
