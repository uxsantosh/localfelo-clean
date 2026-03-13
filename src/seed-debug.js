/**
 * OldCycle Seed Script - DEBUG VERSION
 * Shows detailed error messages
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const SUPABASE_URL = 'https://drofnrntrbedtjtpseve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SAMPLE_LISTINGS = {
  'Mobiles': [
    {
      title: 'iPhone 12 128GB Blue - Excellent Condition',
      description: 'Used iPhone 12 in excellent condition. No scratches, battery health 89%. Original box and charger included. Single owner, very well maintained.',
      price: 32000,
      images: [
        'https://images.unsplash.com/photo-1603791239531-49180c485003?w=800&q=80'
      ]
    }
  ],
  'Electronics': [
    {
      title: 'Dell Laptop i5 8th Gen 8GB RAM 256GB SSD',
      description: 'Dell Inspiron 15 laptop in good working condition. i5 8th gen processor, 8GB RAM, 256GB SSD.',
      price: 28000,
      images: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80'
      ]
    }
  ]
};

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
    console.error(`❌ Error uploading ${filename}:`, error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('listing-images')
    .getPublicUrl(`seed/${filename}`);

  return urlData.publicUrl;
}

async function createListing(categoryId, areaId, cityId, listingData, ownerToken) {
  console.log(`\n🔍 DEBUG: Attempting to create listing...`);
  console.log(`   Category ID: ${categoryId}`);
  console.log(`   Area ID: ${areaId}`);
  console.log(`   City ID: ${cityId}`);
  console.log(`   Title: ${listingData.title}`);
  console.log(`   Price: ${listingData.price}`);
  console.log(`   Owner Token: ${ownerToken}`);

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
    console.error('❌ ERROR CREATING LISTING:');
    console.error('   Code:', listingError.code);
    console.error('   Message:', listingError.message);
    console.error('   Details:', JSON.stringify(listingError.details, null, 2));
    console.error('   Hint:', listingError.hint);
    return null;
  }

  console.log(`✅ Listing created successfully! ID: ${listing.id}`);
  return listing;
}

async function createListingImages(listingId, imageUrls) {
  console.log(`\n🔍 DEBUG: Creating listing images for listing ${listingId}...`);
  console.log(`   Number of images: ${imageUrls.length}`);

  const imageRecords = imageUrls.map((url, index) => ({
    listing_id: listingId,
    image_url: url,
    display_order: index
  }));

  const { error } = await supabase
    .from('listing_images')
    .insert(imageRecords);

  if (error) {
    console.error('❌ ERROR CREATING LISTING IMAGES:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    console.error('   Details:', JSON.stringify(error.details, null, 2));
    return false;
  }

  console.log(`✅ Listing images created successfully!`);
  return true;
}

async function seedListings() {
  console.log('🌱 DEBUG MODE: Starting seed script...\n');

  // 1. Check categories
  console.log('1️⃣ Fetching categories...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  if (catError) {
    console.error('❌ Error fetching categories:', catError);
    return;
  }

  if (!categories || categories.length === 0) {
    console.error('❌ No categories found!');
    return;
  }

  console.log(`✅ Found ${categories.length} categories`);
  console.log('   Categories:', categories.map(c => `${c.name} (id: ${c.id})`).join(', '));

  // 2. Check cities
  console.log('\n2️⃣ Fetching cities...');
  const { data: cities, error: cityError } = await supabase
    .from('cities')
    .select('id, name')
    .order('name');

  if (cityError) {
    console.error('❌ Error fetching cities:', cityError);
    return;
  }

  if (!cities || cities.length === 0) {
    console.error('❌ No cities found!');
    return;
  }

  console.log(`✅ Found ${cities.length} cities`);
  console.log('   First 3 cities:', cities.slice(0, 3).map(c => `${c.name} (id: ${c.id})`).join(', '));

  // 3. Check areas
  console.log('\n3️⃣ Fetching areas...');
  const { data: areas, error: areaError } = await supabase
    .from('areas')
    .select('id, name, city_id')
    .order('name');

  if (areaError) {
    console.error('❌ Error fetching areas:', areaError);
    return;
  }

  if (!areas || areas.length === 0) {
    console.error('❌ No areas found!');
    return;
  }

  console.log(`✅ Found ${areas.length} areas`);

  // 4. Check profiles for owner token
  console.log('\n4️⃣ Getting owner token...');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('owner_token, name, email')
    .limit(1);

  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError);
  }

  let ownerToken;
  if (profiles && profiles.length > 0) {
    ownerToken = profiles[0].owner_token;
    console.log(`✅ Using owner token from profile: ${profiles[0].name} (${profiles[0].email})`);
    console.log(`   Token: ${ownerToken}`);
  } else {
    ownerToken = 'SEED_OWNER_TOKEN_123';
    console.log(`⚠️  No profiles found, using default token: ${ownerToken}`);
  }

  // 5. Try creating ONE test listing
  console.log('\n5️⃣ Creating TEST listing...');
  
  const testCategory = categories.find(c => c.name === 'Mobiles') || categories[0];
  const testCity = cities[0];
  const testArea = areas.find(a => a.city_id === testCity.id) || areas[0];
  const testData = SAMPLE_LISTINGS['Mobiles'] ? SAMPLE_LISTINGS['Mobiles'][0] : SAMPLE_LISTINGS[Object.keys(SAMPLE_LISTINGS)[0]][0];

  console.log(`\nTest listing details:`);
  console.log(`   Category: ${testCategory.name} (id: ${testCategory.id})`);
  console.log(`   City: ${testCity.name} (id: ${testCity.id})`);
  console.log(`   Area: ${testArea.name} (id: ${testArea.id})`);
  console.log(`   Title: ${testData.title}`);

  // Try to upload one image
  console.log(`\n📥 Downloading test image...`);
  try {
    const imageBuffer = await downloadImage(testData.images[0]);
    console.log(`✅ Image downloaded: ${imageBuffer.length} bytes`);

    const filename = `test_${Date.now()}.jpg`;
    const publicUrl = await uploadImageToSupabase(imageBuffer, filename);
    
    if (publicUrl) {
      console.log(`✅ Image uploaded: ${publicUrl}`);

      // Try to create listing
      const listing = await createListing(
        testCategory.id,
        testArea.id,
        testCity.id,
        testData,
        ownerToken
      );

      if (listing) {
        // Try to create listing images
        await createListingImages(listing.id, [publicUrl]);
        console.log(`\n🎉 SUCCESS! Test listing created with ID: ${listing.id}`);
      } else {
        console.log(`\n❌ FAILED to create listing (check error details above)`);
      }
    }
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

seedListings()
  .then(() => {
    console.log('\n✅ Debug script finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
