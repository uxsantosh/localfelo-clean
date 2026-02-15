/**
 * OldCycle Cleanup Script
 * Completely removes all existing listings and images
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://drofnrntrbedtjtpseve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanupListings() {
  console.log('🧹 Starting cleanup...\n');

  // Step 1: Delete all listing images (cascade will handle this but let's be explicit)
  console.log('📸 Deleting listing images from database...');
  const { error: imgDbError, count: imgCount } = await supabase
    .from('listing_images')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (imgDbError) {
    console.error('❌ Error deleting images from DB:', imgDbError.message);
  } else {
    console.log(`✅ Deleted ${imgCount || 'all'} image records`);
  }

  // Step 2: Delete all listings
  console.log('\n📝 Deleting all listings...');
  const { error: listError, count: listCount } = await supabase
    .from('listings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (listError) {
    console.error('❌ Error deleting listings:', listError.message);
  } else {
    console.log(`✅ Deleted ${listCount || 'all'} listings`);
  }

  // Step 3: Clean up storage bucket
  console.log('\n🗑️  Cleaning up storage bucket...');
  const { data: files, error: listFilesError } = await supabase.storage
    .from('listing-images')
    .list('seed');

  if (listFilesError) {
    console.log('⚠️  Could not list storage files:', listFilesError.message);
  } else if (files && files.length > 0) {
    const filePaths = files.map(f => `seed/${f.name}`);
    const { error: deleteFilesError } = await supabase.storage
      .from('listing-images')
      .remove(filePaths);

    if (deleteFilesError) {
      console.log('⚠️  Could not delete some files:', deleteFilesError.message);
    } else {
      console.log(`✅ Deleted ${files.length} image files from storage`);
    }
  } else {
    console.log('✅ No files to delete from storage');
  }

  console.log('\n🎉 Cleanup complete! Database is clean.');
  console.log('\nYou can now run: node seed-real.js');
}

cleanupListings()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  });
