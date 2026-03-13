/**
 * OldCycle Seed Script - Creates realistic listings with marketplace images
 * 
 * Run with: node seed-listings-ready.js
 * 
 * BEFORE RUNNING:
 * 1. Replace YOUR_ANON_KEY_HERE with your actual anon key from Supabase
 * 2. Run: npm install @supabase/supabase-js
 * 3. Run: node seed-listings-ready.js
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';
import { URL } from 'url';

// ===== CONFIGURATION =====
const SUPABASE_URL = 'https://drofnrntrbedtjtpseve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== REALISTIC MARKETPLACE DATA =====
const SAMPLE_LISTINGS = {
  'Mobiles': [
    {
      title: 'iPhone 12 128GB Blue - Excellent Condition',
      description: 'Used iPhone 12 in excellent condition. No scratches, battery health 89%. Original box and charger included. Single owner, very well maintained.',
      price: 32000,
      images: [
        'https://images.unsplash.com/photo-1603791239531-49180c485003?w=800&q=80',
        'https://images.unsplash.com/photo-1592286927505-ed0d9d7b0197?w=800&q=80'
      ]
    },
    {
      title: 'Samsung Galaxy M32 4GB/64GB',
      description: 'Lightly used Samsung Galaxy M32, bought 8 months ago. All accessories included. Minor scratches on back. Works perfectly.',
      price: 11500,
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80'
      ]
    }
  ],
  'Electronics': [
    {
      title: 'Dell Laptop i5 8th Gen 8GB RAM 256GB SSD',
      description: 'Dell Inspiron 15 laptop in good working condition. i5 8th gen processor, 8GB RAM, 256GB SSD. Ideal for students and office work. Battery backup 3-4 hours.',
      price: 28000,
      images: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80'
      ]
    },
    {
      title: 'Sony Bluetooth Headphones WH-CH510',
      description: 'Wireless Sony headphones, barely used. 35 hours battery backup. Great sound quality. Original box available.',
      price: 2200,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
      ]
    }
  ],
  'Vehicles': [
    {
      title: 'Honda Activa 5G 2019 - Well Maintained',
      description: '2019 Honda Activa 5G in excellent condition. Single owner, all service records available. New battery fitted last month. 18000 km done.',
      price: 52000,
      images: [
        'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80'
      ]
    },
    {
      title: 'Hero Splendor Plus 2018 - Single Owner',
      description: 'Hero Splendor Plus 2018 model. Excellent mileage 60+ kmpl. Well maintained, insurance valid till Dec 2025. 25000 km only.',
      price: 38000,
      images: [
        'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80'
      ]
    }
  ],
  'Furniture': [
    {
      title: 'Wooden Queen Size Bed with Mattress',
      description: 'Solid wood queen size bed with storage. Includes good quality mattress (1 year old). No damages. Selling due to relocation.',
      price: 15000,
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
        'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80'
      ]
    },
    {
      title: 'L-Shape Sofa Set 5 Seater - Grey',
      description: '5 seater L-shape sofa in excellent condition. Comfortable and stylish. Minor wear, overall great condition. Buyer to arrange transport.',
      price: 18000,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
      ]
    }
  ],
  'Fashion': [
    {
      title: 'Mens Formal Shoes Size 9 - Like New',
      description: 'Branded formal shoes size 9. Worn only 2-3 times. Like new condition. Original price 3500.',
      price: 1500,
      images: [
        'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80'
      ]
    },
    {
      title: 'Ladies Designer Kurti Set - Size M',
      description: 'Beautiful designer kurti with palazzo. Size M. Worn once for function. Excellent fabric and stitching.',
      price: 800,
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80'
      ]
    }
  ],
  'Books': [
    {
      title: 'Engineering Textbooks - 3rd Year CSE',
      description: 'Set of 5 engineering books for 3rd year CSE students. Good condition, minimal markings. Great for exam preparation.',
      price: 1200,
      images: [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80'
      ]
    },
    {
      title: 'Harry Potter Complete Collection',
      description: 'All 7 Harry Potter books in paperback. Read once, excellent condition. Perfect gift for Potter fans.',
      price: 2500,
      images: [
        'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=800&q=80'
      ]
    }
  ],
  'Home': [
    {
      title: 'LG 190L Single Door Refrigerator',
      description: '2020 model LG fridge in perfect working condition. 190L capacity, ideal for small family. Energy efficient. Moving abroad, need to sell urgently.',
      price: 8500,
      images: [
        'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80'
      ]
    },
    {
      title: 'Bajaj Mixer Grinder 750W - 6 Months Old',
      description: 'Bajaj mixer grinder with 3 jars. Barely used, 6 months old. Bill and warranty available. Works perfectly.',
      price: 2200,
      images: [
        'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&q=80'
      ]
    }
  ],
  'Pets': [
    {
      title: 'Labrador Puppies - 45 Days Old',
      description: 'Cute Labrador puppies available. 45 days old, vaccinated. Parents are pure breed. Very playful and healthy.',
      price: 8000,
      images: [
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
        'https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=800&q=80'
      ]
    }
  ],
  'Sports': [
    {
      title: 'Cricket Kit Complete Set - Lightly Used',
      description: 'Complete cricket kit including bat, pads, gloves, helmet. Brand: SS. Used for one season only. Great condition.',
      price: 4500,
      images: [
        'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80'
      ]
    },
    {
      title: 'Gym Dumbbells Set 2.5kg to 10kg',
      description: 'Set of dumbbells from 2.5kg to 10kg pairs. Iron dumbbells with rubber coating. Good for home gym.',
      price: 3500,
      images: [
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80'
      ]
    }
  ],
  'Real Estate': [
    {
      title: '2BHK Flat for Rent - 1000 sqft',
      description: '2BHK apartment for rent. 1st floor, 1000 sqft. Semi-furnished with modular kitchen. Gated community with parking. Family preferred.',
      price: 15000,
      images: [
        'https://images.unsplash.com/photo-1502672260066-6bc358611c74?w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'
      ]
    },
    {
      title: 'Commercial Shop for Rent - Main Road',
      description: '400 sqft shop on main road. Ground floor with good footfall. Suitable for retail business. 3 months advance.',
      price: 25000,
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
      ]
    }
  ],
  'Jobs': [
    {
      title: 'Need Delivery Boys - Immediate Joining',
      description: 'Urgently required delivery boys for e-commerce company. Own bike mandatory. Salary 18k-22k + fuel allowance. Immediate joining.',
      price: 20000,
      images: [
        'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&q=80'
      ]
    },
    {
      title: 'Sales Executive Required - FMCG',
      description: 'Sales executive needed for FMCG distribution. Experience 1-3 years. Salary 25k-30k + incentives. Must have two-wheeler.',
      price: 25000,
      images: [
        'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80'
      ]
    }
  ]
};

// ===== HELPER FUNCTIONS =====

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function uploadImageToSupabase(imageBuffer, filename) {
  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(`seed/${filename}`, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    console.error(`Error uploading ${filename}:`, error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('listing-images')
    .getPublicUrl(`seed/${filename}`);

  return urlData.publicUrl;
}

async function createListing(categoryId, areaId, cityId, listingData, ownerToken) {
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      title: listingData.title,
      description: listingData.description,
      price: listingData.price,
      category_id: categoryId,
      area_id: areaId,
      city_id: cityId,
      owner_token: ownerToken,
      status: 'active'
    })
    .select()
    .single();

  if (listingError) {
    console.error('Error creating listing:', listingError);
    return null;
  }

  console.log(`✅ Created listing: ${listingData.title}`);
  return listing;
}

async function createListingImages(listingId, imageUrls) {
  const imageRecords = imageUrls.map((url, index) => ({
    listing_id: listingId,
    image_url: url,
    display_order: index
  }));

  const { error } = await supabase
    .from('listing_images')
    .insert(imageRecords);

  if (error) {
    console.error('Error creating listing images:', error);
    return false;
  }

  return true;
}

// ===== MAIN SEED FUNCTION =====

async function seedListings() {
  console.log('🌱 Starting OldCycle seed script...\n');

  // 1. Fetch categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  if (catError || !categories || categories.length === 0) {
    console.error('❌ Error fetching categories:', catError);
    return;
  }

  console.log(`✅ Found ${categories.length} categories\n`);

  // 2. Fetch cities
  const { data: cities, error: cityError } = await supabase
    .from('cities')
    .select('id, name')
    .order('name');

  if (cityError || !cities || cities.length === 0) {
    console.error('❌ Error fetching cities:', cityError);
    return;
  }

  console.log(`✅ Found ${cities.length} cities\n`);

  // 3. Fetch areas
  const { data: areas, error: areaError } = await supabase
    .from('areas')
    .select('id, name, city_id')
    .order('name');

  if (areaError || !areas || areas.length === 0) {
    console.error('❌ Error fetching areas:', areaError);
    return;
  }

  console.log(`✅ Found ${areas.length} areas\n`);

  // 4. Get a demo owner token
  const { data: profiles } = await supabase
    .from('profiles')
    .select('owner_token')
    .limit(1)
    .single();

  const ownerToken = profiles?.owner_token || 'SEED_OWNER_TOKEN_123';

  console.log('🚀 Starting to seed listings...\n');

  let totalListings = 0;
  let totalImages = 0;

  // 5. Create listings for each category in each city
  for (const category of categories) {
    const sampleData = SAMPLE_LISTINGS[category.name];
    if (!sampleData || sampleData.length === 0) {
      console.log(`⏭️  No sample data for category: ${category.name}`);
      continue;
    }

    console.log(`\n📁 Processing category: ${category.name}`);

    const citiesToUse = cities.slice(0, 3);

    for (const city of citiesToUse) {
      const cityAreas = areas.filter(a => a.city_id === city.id);
      if (cityAreas.length === 0) continue;

      const area = cityAreas[0];
      const listingData = sampleData[Math.floor(Math.random() * sampleData.length)];

      console.log(`  📍 ${city.name} > ${area.name} > ${listingData.title}`);

      const uploadedImageUrls = [];
      for (let i = 0; i < listingData.images.length; i++) {
        const imageUrl = listingData.images[i];
        try {
          console.log(`    ⬇️  Downloading image ${i + 1}/${listingData.images.length}...`);
          const imageBuffer = await downloadImage(imageUrl);
          
          const filename = `${category.name.toLowerCase()}_${city.id}_${area.id}_${Date.now()}_${i}.jpg`;
          const publicUrl = await uploadImageToSupabase(imageBuffer, filename);
          
          if (publicUrl) {
            uploadedImageUrls.push(publicUrl);
            console.log(`    ✅ Uploaded image ${i + 1}`);
            totalImages++;
          }

          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`    ❌ Failed to process image ${i + 1}:`, error.message);
        }
      }

      if (uploadedImageUrls.length === 0) {
        console.log(`    ⚠️  No images uploaded, skipping listing`);
        continue;
      }

      const listing = await createListing(
        category.id,
        area.id,
        city.id,
        listingData,
        ownerToken
      );

      if (listing) {
        await createListingImages(listing.id, uploadedImageUrls);
        totalListings++;
        console.log(`    ✅ Created listing with ${uploadedImageUrls.length} images`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n\n🎉 Seed complete!`);
  console.log(`✅ Created ${totalListings} listings`);
  console.log(`✅ Uploaded ${totalImages} images`);
  console.log(`\n💡 Tip: Check your Supabase Storage > listing-images > seed/ folder`);
}

// ===== RUN SCRIPT =====

seedListings()
  .then(() => {
    console.log('\n✅ Script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
