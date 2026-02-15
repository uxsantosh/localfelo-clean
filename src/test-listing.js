/**
 * Simple test - Try to create ONE listing without images
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://drofnrntrbedtjtpseve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCreateListing() {
  console.log('🧪 Testing listing creation...\n');

  // Get first category, city, area
  const { data: categories } = await supabase.from('categories').select('id, name').limit(1).single();
  const { data: cities } = await supabase.from('cities').select('id, name').limit(1).single();
  const { data: areas } = await supabase.from('areas').select('id, name').limit(1).single();
  const { data: profile } = await supabase.from('profiles').select('owner_token').limit(1).single();

  console.log('Using:');
  console.log(`  Category: ${categories.name} (${categories.id})`);
  console.log(`  City: ${cities.name} (${cities.id})`);
  console.log(`  Area: ${areas.name} (${areas.id})`);
  console.log(`  Owner Token: ${profile.owner_token}\n`);

  // Try to insert a simple listing
  const testListing = {
    title: 'TEST - iPhone 12',
    description: 'This is a test listing',
    price: 30000,
    category_id: categories.id,
    area_id: areas.id,
    city_id: cities.id,
    owner_token: profile.owner_token,
    status: 'active'
  };

  console.log('Attempting to create listing...');
  const { data, error } = await supabase
    .from('listings')
    .insert(testListing)
    .select();

  if (error) {
    console.error('\n❌ FAILED TO CREATE LISTING:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
    console.error('\n🔍 This is likely a Row Level Security (RLS) policy issue!');
    console.error('The anon key cannot insert into the listings table.');
  } else {
    console.log('\n✅ SUCCESS! Listing created:', data);
  }
}

testCreateListing();
