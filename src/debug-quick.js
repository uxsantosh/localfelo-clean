// QUICK DEBUG SCRIPT - Copy to console
// This uses the correct Supabase URL from your app

async function debugProfileIssue() {
  // Import Supabase from CDN with correct URL
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  
  const supabaseUrl = 'https://drofnrntrbedtjtpseve.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const clientToken = localStorage.getItem('oldcycle_token');
  const userData = JSON.parse(localStorage.getItem('oldcycle_user') || '{}');
  
  console.log('====================================');
  console.log('🔍 DEBUGGING PROFILE ISSUE');
  console.log('====================================');
  console.log('Client Token:', clientToken?.substring(0, 12) + '...');
  console.log('User Phone:', userData.phone);
  console.log('User Name:', userData.name);
  console.log('');
  
  // Step 1: Check profiles
  console.log('📋 STEP 1: Your Profile(s)');
  console.log('====================================');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('client_token', clientToken)
    .order('created_at', { ascending: true });
  
  if (profileError) {
    console.error('❌ Error:', profileError);
    return;
  }
  
  console.table(profiles);
  console.log(`Found ${profiles?.length || 0} profile(s)`);
  
  if (!profiles || profiles.length === 0) {
    console.log('❌ NO PROFILES FOUND! This is the problem.');
    return;
  }
  
  const ownerToken = profiles[0].owner_token;
  console.log('');
  console.log('✅ Using owner_token from FIRST profile:', ownerToken?.substring(0, 12) + '...');
  
  // Step 2: Check listings with owner_token
  console.log('');
  console.log('📋 STEP 2: Listings with YOUR owner_token');
  console.log('====================================');
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, title, owner_token, owner_phone, is_active, created_at')
    .eq('owner_token', ownerToken)
    .order('created_at', { ascending: false });
  
  if (listingsError) {
    console.error('❌ Error:', listingsError);
  } else {
    console.table(listings);
    console.log(`Found ${listings?.length || 0} listing(s) with matching owner_token`);
  }
  
  // Step 3: Check ALL listings with phone
  console.log('');
  console.log('📋 STEP 3: ALL listings with your phone number');
  console.log('====================================');
  const { data: allListings, error: allError } = await supabase
    .from('listings')
    .select('id, title, owner_token, owner_phone, is_active, created_at')
    .eq('owner_phone', userData.phone)
    .order('created_at', { ascending: false });
  
  if (allError) {
    console.error('❌ Error:', allError);
  } else {
    console.table(allListings);
    console.log(`Found ${allListings?.length || 0} listing(s) with your phone`);
  }
  
  // Step 4: Analysis
  console.log('');
  console.log('📊 ANALYSIS');
  console.log('====================================');
  
  if (!allListings || allListings.length === 0) {
    console.log('❌ NO LISTINGS FOUND with your phone number!');
    console.log('   Did you create any listings while logged in?');
    return;
  }
  
  const mismatched = allListings.filter(l => l.owner_token !== ownerToken);
  
  if (mismatched.length > 0) {
    console.log(`⚠️  PROBLEM FOUND!`);
    console.log(`   ${mismatched.length} listing(s) have DIFFERENT owner_token`);
    console.log('');
    console.log('   Expected owner_token:', ownerToken?.substring(0, 12) + '...');
    console.log('   Mismatched listings:');
    mismatched.forEach(l => {
      console.log(`   - "${l.title}" has token: ${l.owner_token?.substring(0, 12)}...`);
    });
    console.log('');
    console.log('✅ SOLUTION: Run await fixOwnerTokens()');
  } else {
    console.log('✅ All tokens match correctly!');
    console.log('   The problem might be in the ProfileScreen component.');
  }
}

async function fixOwnerTokens() {
  console.log('====================================');
  console.log('🔧 FIXING OWNER TOKENS');
  console.log('====================================');
  
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  
  const supabaseUrl = 'https://drofnrntrbedtjtpseve.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb2Zucm50cmJlZHRqdHBzZXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODMzMjQsImV4cCI6MjA3OTM1OTMyNH0.HONRnz8phA-6j0hwf6XLhD8aRX4zwQR-2x6pQHcUBAo';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const clientToken = localStorage.getItem('oldcycle_token');
  const userData = JSON.parse(localStorage.getItem('oldcycle_user') || '{}');
  
  // Get correct profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('owner_token, phone')
    .eq('client_token', clientToken)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();
  
  if (profileError || !profile) {
    console.error('❌ Cannot find profile:', profileError);
    return;
  }
  
  console.log('✅ Found correct profile');
  console.log('   Phone:', profile.phone);
  console.log('   Owner Token:', profile.owner_token?.substring(0, 12) + '...');
  
  // Update all listings
  console.log('');
  console.log('Updating all listings with phone:', userData.phone);
  
  const { data: updated, error: updateError } = await supabase
    .from('listings')
    .update({ owner_token: profile.owner_token })
    .eq('owner_phone', userData.phone)
    .select();
  
  if (updateError) {
    console.error('❌ Update failed:', updateError);
    return;
  }
  
  console.log('');
  console.log('✅ SUCCESS! Updated', updated?.length || 0, 'listing(s)');
  console.log('');
  console.log('🎉 Your listings should now appear in your Profile!');
  console.log('   Refresh the Profile page to see them.');
}

console.log('✅ Debug functions loaded!');
console.log('Run: await debugProfileIssue()');
