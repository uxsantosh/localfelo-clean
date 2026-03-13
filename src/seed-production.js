/**
 * OldCycle Production Seed Script
 * Creates realistic listings with authentic photos across ALL cities and areas
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const SUPABASE_URL = 'https://drofnrntrbedtjtpseve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Indian names for variety
const SELLER_NAMES = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
  'Anjali Gupta', 'Rahul Verma', 'Pooja Nair', 'Arjun Mehta', 'Kavya Iyer',
  'Sanjay Joshi', 'Neha Kapoor', 'Rohan Das', 'Divya Pillai', 'Karthik Rao',
  'Shreya Desai', 'Manish Agarwal', 'Ritu Malhotra', 'Aditya Saxena', 'Meera Jain',
  'Suresh Patil', 'Lakshmi Reddy', 'Praveen Kumar', 'Swati Singh', 'Nikhil Shah',
  'Deepika Nair', 'Harish Menon', 'Pallavi Chopra', 'Varun Khanna', 'Sonal Bhat'
];

// Indian phone numbers (realistic format)
const generatePhone = () => {
  const prefixes = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const remaining = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + remaining;
};

// Realistic listing templates by category with mobile-style image URLs
const LISTING_TEMPLATES = {
  'mobiles': [
    {
      title: 'iPhone {model} {storage}GB {color} - {condition}',
      description: 'Used iPhone {model} in {condition} condition. {details}. {accessories}. {reason}.',
      priceRange: [15000, 80000],
      models: ['11', '12', '12 Pro', '13', '13 Pro', '14'],
      storage: ['64', '128', '256'],
      colors: ['Black', 'Blue', 'White', 'Red', 'Green', 'Purple'],
      conditions: ['excellent', 'very good', 'good'],
      details: ['Battery health 85-95%', 'No scratches', 'Minor scratches on back', 'Screen protector applied'],
      accessories: ['Original box included', 'With charger and cable', 'All accessories', 'Bill available'],
      reasons: ['Upgrading to new model', 'Switching to Android', 'Need urgent cash', 'Got as gift'],
      images: [
        'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    },
    {
      title: 'Samsung Galaxy {model} {storage}GB',
      description: 'Samsung {model} in {condition} condition. {details}. {reason}.',
      priceRange: [10000, 60000],
      models: ['S20', 'S21', 'S22', 'A52', 'A72', 'M32'],
      storage: ['128', '256'],
      conditions: ['excellent', 'good', 'fair'],
      details: ['5G enabled', 'All features working', 'Fast charging', 'Good battery backup'],
      reasons: ['Upgrading', 'Switching brand', 'Selling extra phone'],
      images: [
        'https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    },
    {
      title: '{brand} {model} - {condition}',
      description: '{brand} {model} smartphone. {details}. {reason}.',
      priceRange: [8000, 35000],
      brands: ['OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo'],
      models: ['9 Pro', 'Nord', 'Note 12', 'X70', '11T', 'GT 2'],
      conditions: ['like new', 'good', 'excellent'],
      details: ['6GB RAM 128GB storage', '8GB RAM', 'Great camera', 'Fast processor'],
      reasons: ['Upgrading to iPhone', 'Got new phone from company', 'Extra phone'],
      images: [
        'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'vehicles': [
    {
      title: '{brand} {model} {year} - {variant}',
      description: 'Well maintained {brand} {model}. {details}. {km} km driven. {owner} owner.',
      priceRange: [200000, 1200000],
      brands: ['Maruti', 'Hyundai', 'Honda', 'Tata', 'Mahindra'],
      models: ['Swift', 'i20', 'City', 'Nexon', 'Creta', 'Venue'],
      years: ['2017', '2018', '2019', '2020', '2021'],
      variants: ['VXI', 'ZXI', 'LXI', 'Sportz', 'SX'],
      details: ['Full service history', 'Single owner', 'Well maintained', 'AC working', 'New tyres'],
      km: ['25000', '35000', '45000', '55000', '30000'],
      owner: ['First', 'Single', 'Second'],
      images: [
        'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'furniture': [
    {
      title: '{item} - {material} {style}',
      description: '{item} in {condition} condition. {details}. {reason}.',
      priceRange: [2000, 30000],
      items: ['Sofa Set 3+2', 'Double Bed', 'Dining Table', 'Study Table', 'Wardrobe', 'TV Unit'],
      materials: ['Wood', 'Engineered Wood', 'Sheesham Wood', 'Teak'],
      styles: ['Modern', 'Contemporary', 'Traditional', 'Classic'],
      conditions: ['excellent', 'good', 'like new'],
      details: ['Barely used', 'Well maintained', '1 year old', '6 months old', 'Very comfortable'],
      reasons: ['Moving to new city', 'Home relocation', 'Upgrading furniture', 'Leaving India'],
      images: [
        'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'electronics': [
    {
      title: '{brand} Laptop {processor} {ram}GB RAM {storage}',
      description: '{brand} laptop in {condition} condition. {processor} processor, {ram}GB RAM, {storage}. {details}.',
      priceRange: [15000, 80000],
      brands: ['Dell', 'HP', 'Lenovo', 'Asus', 'Apple'],
      processors: ['i3 8th Gen', 'i5 8th Gen', 'i5 10th Gen', 'i7 10th Gen', 'Ryzen 5', 'M1'],
      ram: ['4', '8', '16'],
      storage: ['256GB SSD', '512GB SSD', '1TB HDD'],
      conditions: ['excellent', 'good', 'very good'],
      details: ['Perfect for students', 'Good for office work', 'With charger', 'Bill available'],
      images: [
        'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    },
    {
      title: '{brand} {size}" {type} TV',
      description: '{brand} {size} inch {type} Smart TV. {details}. {condition} condition.',
      priceRange: [12000, 60000],
      brands: ['Samsung', 'LG', 'Sony', 'Mi', 'OnePlus'],
      sizes: ['32', '43', '50', '55'],
      types: ['Full HD', '4K', '4K HDR'],
      conditions: ['excellent', 'like new', 'good'],
      details: ['WiFi enabled', 'All apps working', 'Remote included', 'Wall mount available'],
      images: [
        'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'bikes-scooters': [
    {
      title: '{brand} {model} {year} - {condition}',
      description: '{brand} {model} in {condition} condition. {km} km driven. {details}. {documents}.',
      priceRange: [25000, 80000],
      brands: ['Honda', 'Hero', 'TVS', 'Bajaj', 'Suzuki'],
      models: ['Activa', 'Splendor', 'Jupiter', 'Pulsar', 'Access'],
      years: ['2018', '2019', '2020', '2021'],
      conditions: ['excellent', 'good', 'well maintained'],
      km: ['8000', '12000', '15000', '20000', '25000'],
      details: ['Good mileage', 'Well serviced', 'New battery', 'New tyres'],
      documents: ['All papers clear', 'RC available', 'Insurance valid'],
      images: [
        'https://images.pexels.com/photos/2074693/pexels-photo-2074693.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1426449/pexels-photo-1426449.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'appliances': [
    {
      title: '{brand} {item} {capacity}',
      description: '{brand} {item} in {condition} working condition. {details}. {age}.',
      priceRange: [3000, 25000],
      brands: ['Samsung', 'LG', 'Whirlpool', 'IFB', 'Godrej'],
      items: ['Washing Machine', 'Refrigerator', 'Microwave', 'AC'],
      capacities: ['6kg', '7kg', '260L', '1.5 Ton', '28L'],
      conditions: ['good', 'excellent', 'working'],
      details: ['Works perfectly', 'No issues', 'Well maintained', 'Energy efficient'],
      age: ['3 years old', '2 years old', '4 years old', '1 year old'],
      images: [
        'https://images.pexels.com/photos/2343467/pexels-photo-2343467.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/4112236/pexels-photo-4112236.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'books': [
    {
      title: '{subject} Books - {level}',
      description: 'Complete set of {subject} books for {level}. {details}. {condition}.',
      priceRange: [500, 3000],
      subjects: ['Engineering', 'Medical', 'NCERT', 'Competitive Exam', 'UPSC'],
      levels: ['Class 12', 'BTech', 'MBBS', 'NEET', 'JEE'],
      details: ['All books included', 'Lightly used', 'No markings', 'With solutions'],
      conditions: ['Good condition', 'Excellent condition', 'Like new'],
      images: [
        'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'fashion': [
    {
      title: '{brand} {item} - {gender} {size}',
      description: '{brand} {item} in {condition} condition. {details}. {usage}.',
      priceRange: [500, 8000],
      brands: ['Nike', 'Adidas', 'Puma', 'Levis', 'Zara', 'H&M'],
      items: ['Shoes', 'Jacket', 'Jeans', 'T-Shirts', 'Sneakers'],
      genders: ['Mens', 'Womens', 'Unisex'],
      sizes: ['S', 'M', 'L', 'XL', '8', '9', '10'],
      conditions: ['like new', 'excellent', 'barely used'],
      details: ['Original product', 'Authentic', 'With tags', 'No defects'],
      usage: ['Worn once', 'Used few times', 'Hardly used'],
      images: [
        'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'sports-fitness': [
    {
      title: '{item} - {brand}',
      description: '{brand} {item} in {condition} condition. {details}. {usage}.',
      priceRange: [1000, 20000],
      brands: ['Cosco', 'Nivia', 'Yonex', 'Decathlon', 'Domyos'],
      items: ['Gym Equipment', 'Cricket Bat', 'Badminton Racket', 'Treadmill', 'Dumbbells Set'],
      conditions: ['excellent', 'good', 'like new'],
      details: ['Barely used', 'Home use only', 'Well maintained'],
      usage: ['Used for 6 months', 'Lightly used', 'Hardly used'],
      images: [
        'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'pets': [
    {
      title: '{breed} {type} - {age}',
      description: 'Healthy {breed} {type}. {details}. {vaccination}.',
      priceRange: [5000, 25000],
      breeds: ['Labrador', 'Golden Retriever', 'German Shepherd', 'Beagle', 'Persian Cat', 'Pug'],
      types: ['Puppy', 'Dog', 'Kitten', 'Cat'],
      ages: ['2 months old', '3 months old', '6 months old', '1 year old'],
      details: ['Very friendly', 'Playful', 'Well trained', 'Good with kids'],
      vaccination: ['Fully vaccinated', 'First dose done', 'All vaccines complete'],
      images: [
        'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'real-estate': [
    {
      title: '{type} for {purpose} - {config}',
      description: '{config} {type} for {purpose}. {sqft} sqft. {details}. {furnishing}.',
      priceRange: [8000, 50000],
      types: ['Apartment', 'Independent House', 'Villa', 'PG', 'Office Space'],
      purposes: ['Rent', 'Sale'],
      configs: ['1BHK', '2BHK', '3BHK', '1RK'],
      sqfts: ['600', '800', '1000', '1200', '1500'],
      details: ['Good locality', 'Near metro', 'All amenities', 'Gated community'],
      furnishings: ['Fully furnished', 'Semi furnished', 'Unfurnished'],
      images: [
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'jobs': [
    {
      title: '{role} - {experience}',
      description: 'Hiring {role} with {experience}. {requirements}. {salary}.',
      priceRange: [200000, 1200000],
      roles: ['Software Developer', 'Sales Executive', 'Content Writer', 'Accountant', 'Digital Marketing'],
      experiences: ['Freshers', '1-2 years exp', '2-5 years exp'],
      requirements: ['Good communication', 'Team player', 'Quick learner', 'Immediate joining'],
      salaries: ['Good salary package', 'As per industry standards', 'Negotiable salary'],
      images: [
        'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'services': [
    {
      title: '{service} Services - {type}',
      description: 'Professional {service} services. {details}. {pricing}.',
      priceRange: [500, 5000],
      services: ['Home Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Pest Control'],
      types: ['Home', 'Office', 'Commercial'],
      details: ['Experienced staff', 'Quality work', 'Same day service', 'Affordable rates'],
      pricings: ['Reasonable rates', 'Free inspection', 'Best prices'],
      images: [
        'https://images.pexels.com/photos/3964341/pexels-photo-3964341.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/209277/pexels-photo-209277.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ],
  'other': [
    {
      title: '{item}',
      description: '{item} in {condition} condition. {details}. {reason}.',
      priceRange: [500, 5000],
      items: ['Indoor Plants', 'Wall Clock', 'Curtains', 'Utensils Set', 'Home Decor'],
      conditions: ['good', 'excellent', 'like new'],
      details: ['Barely used', 'Well maintained', 'Good quality'],
      reasons: ['Home shifting', 'Extra items', 'Not needed'],
      images: [
        'https://images.pexels.com/photos/1172105/pexels-photo-1172105.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/5825362/pexels-photo-5825362.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    }
  ]
};

// Helper to generate listing from template
function generateListing(template) {
  let title = template.title;
  let description = template.description;
  
  // Replace placeholders in title and description
  const replacePlaceholder = (text, key, values) => {
    if (values && text.includes(`{${key}}`)) {
      const value = values[Math.floor(Math.random() * values.length)];
      return text.replace(`{${key}}`, value);
    }
    return text;
  };
  
  // Replace all placeholders
  Object.keys(template).forEach(key => {
    if (Array.isArray(template[key]) && key !== 'images') {
      title = replacePlaceholder(title, key, template[key]);
      description = replacePlaceholder(description, key, template[key]);
    }
  });
  
  // Generate price
  const price = Math.floor(
    Math.random() * (template.priceRange[1] - template.priceRange[0]) + template.priceRange[0]
  );
  
  // Pick random images (1-2 images)
  const numImages = Math.random() > 0.5 ? 1 : 2;
  const images = template.images
    .sort(() => Math.random() - 0.5)
    .slice(0, numImages);
  
  return { title, description, price, images };
}

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const timeout = setTimeout(() => {
      reject(new Error('Download timeout'));
    }, 15000);
    
    client.get(url, (response) => {
      clearTimeout(timeout);
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed: ${response.statusCode}`));
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

async function uploadImageToSupabase(imageBuffer, filename) {
  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(`seed/${filename}`, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) return null;

  const { data: urlData } = supabase.storage
    .from('listing-images')
    .getPublicUrl(`seed/${filename}`);

  return urlData.publicUrl;
}

async function createListing(categorySlug, areaSlug, city, listingData, ownerToken, ownerName, ownerPhone) {
  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      title: listingData.title,
      description: listingData.description,
      price: listingData.price,
      category_slug: categorySlug,
      area_slug: areaSlug,
      city: city,
      owner_token: ownerToken,
      owner_name: ownerName,
      owner_phone: ownerPhone,
      whatsapp_enabled: true,
      whatsapp_number: ownerPhone,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
    return null;
  }

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

  return !error;
}

async function seedProduction() {
  console.log('🚀 PRODUCTION SEED - Creating realistic marketplace...\n');

  // Fetch categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  if (catError || !categories) {
    console.error('❌ Error fetching categories');
    return;
  }

  // Fetch ALL cities
  const { data: cities, error: cityError } = await supabase
    .from('cities')
    .select('id, name')
    .order('name');

  if (cityError || !cities) {
    console.error('❌ Error fetching cities');
    return;
  }

  // Fetch ALL areas
  const { data: areas, error: areaError } = await supabase
    .from('areas')
    .select('id, name, city_id')
    .order('name');

  if (areaError || !areas) {
    console.error('❌ Error fetching areas');
    return;
  }

  console.log(`✅ Found ${categories.length} categories`);
  console.log(`✅ Found ${cities.length} cities`);
  console.log(`✅ Found ${areas.length} areas\n`);

  // Get owner token
  const { data: profiles } = await supabase
    .from('profiles')
    .select('owner_token')
    .limit(1);

  const baseOwnerToken = profiles?.[0]?.owner_token || 'SEED_TOKEN_123';

  let totalCreated = 0;
  let totalImages = 0;

  // Strategy: Create 2-3 listings per category, distributed across different cities/areas
  for (const category of categories) {
    const templates = LISTING_TEMPLATES[category.slug];
    
    if (!templates || templates.length === 0) {
      console.log(`⚠️  No templates for: ${category.name}`);
      continue;
    }

    console.log(`\n📦 ${category.name}`);

    // Create 2-3 listings for this category
    const numListings = Math.floor(Math.random() * 2) + 2; // 2-3 listings
    
    for (let i = 0; i < numListings; i++) {
      // Pick random template
      const template = templates[Math.floor(Math.random() * templates.length)];
      const listingData = generateListing(template);
      
      // Pick random city
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      // Find areas for this city
      const cityAreas = areas.filter(a => a.city_id === city.id);
      if (cityAreas.length === 0) continue;
      
      // Pick random area
      const area = cityAreas[Math.floor(Math.random() * cityAreas.length)];
      
      // Pick random seller name and generate phone
      const sellerName = SELLER_NAMES[Math.floor(Math.random() * SELLER_NAMES.length)];
      const sellerPhone = generatePhone();
      
      // Download and upload images
      const uploadedImages = [];
      for (const imageUrl of listingData.images) {
        try {
          const buffer = await downloadImage(imageUrl);
          const filename = `${category.slug}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
          const publicUrl = await uploadImageToSupabase(buffer, filename);
          
          if (publicUrl) {
            uploadedImages.push(publicUrl);
            totalImages++;
          }
        } catch (err) {
          console.log(`  ⚠️  Image failed: ${err.message}`);
        }
      }
      
      if (uploadedImages.length === 0) continue;
      
      // Create listing
      const listing = await createListing(
        category.slug,
        area.id,
        city.name,
        listingData,
        baseOwnerToken,
        sellerName,
        sellerPhone
      );
      
      if (listing) {
        await createListingImages(listing.id, uploadedImages);
        totalCreated++;
        console.log(`  ✅ ${listingData.title.substring(0, 40)}... (${sellerName} - ${city.name})`);
      }
    }
  }

  console.log(`\n🎉 PRODUCTION SEED COMPLETE!`);
  console.log(`✅ Created ${totalCreated} listings`);
  console.log(`✅ Uploaded ${totalImages} images`);
  console.log(`✅ ${SELLER_NAMES.length} unique sellers`);
  console.log(`✅ Distributed across ${cities.length} cities`);
}

seedProduction()
  .then(() => {
    console.log('\n✅ Script finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
