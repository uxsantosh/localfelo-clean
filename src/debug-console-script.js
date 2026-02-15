// Copy and paste this entire script into your browser console
// Then run: await debugProfileIssue()

async function debugProfileIssue() {
  console.log('====== DEBUG PROFILE ISSUE ======');
  
  // Get Supabase client from your app
  const supabaseUrl = 'https://vgbznsvdnecdfxylfqfm.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYnpuc3ZkbmVjZGZ4eWxmcWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1OTk1NzYsImV4cCI6MjA1MTE3NTU3Nn0.AO6fLShQFBd4nX1sQN3T2OzXbJTzSvz1BX0tVUH-Xok';
  
  const { createClient } = window.supabase || {};
  
  if (!createClient) {
    console.error('ERROR: Supabase client not available. Make sure the page is loaded.');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const clientToken = localStorage.getItem('oldcycle_token');
  const userStr = localStorage.getItem('oldcycle_user');
  
  console.log('1. LocalStorage Data:');
  console.log('   Client Token:', clientToken);
  console.log('   User Data:', userStr);
  
  if (!clientToken) {
    console.log('ERROR: No client token found. Please login first.');
    return;
  }
  
  const userData = userStr ? JSON.parse(userStr) : null;
  console.log('   Phone:', userData?.phone);
  console.log('   Name:', userData?.name);
  
  // Step 1: Check all profiles with this client_token
  console.log('\n2. Profiles with this client_token:');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('client_token', clientToken)
    .order('created_at', { ascending: true });
  
  if (profileError) {
    console.error('ERROR fetching profiles:', profileError);
    return;
  }
  
  console.log(`   Found ${profiles.length} profile(s)`);
  profiles.forEach((profile, idx) => {
    console.log(`   Profile ${idx + 1}:`, {
      id: profile.id,
      phone: profile.phone,
      name: profile.name,
      client_token: profile.client_token?.substring(0, 8) + '...',
      owner_token: profile.owner_token?.substring(0, 8) + '...',
      created_at: profile.created_at,
    });
  });
  
  if (profiles.length === 0) {
    console.log('ERROR: No profiles found with this client_token!');
    return;
  }
  
  const firstProfile = profiles[0];
  const ownerToken = firstProfile.owner_token;
  
  console.log(`\nUsing FIRST profile owner_token: ${ownerToken?.substring(0, 8)}...`);
  
  // Step 2: Check all listings with this owner_token
  console.log('\n3. Listings with this owner_token:');
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_token', ownerToken)
    .order('created_at', { ascending: false });
  
  if (listingsError) {
    console.error('ERROR fetching listings:', listingsError);
    return;
  }
  
  console.log(`   Found ${listings.length} listing(s) with owner_token`);
  if (listings.length > 0) {
    listings.forEach((listing, idx) => {
      console.log(`   Listing ${idx + 1}:`, {
        id: listing.id,
        title: listing.title,
        owner_token: listing.owner_token?.substring(0, 8) + '...',
        is_active: listing.is_active,
        created_at: listing.created_at,
      });
    });
  } else {
    console.log('   WARNING: No listings found with this owner_token!');
  }
  
  // Step 3: Check if there are ANY listings with the phone number
  console.log(`\n4. All listings with phone ${userData?.phone}:`);
  const { data: allListings, error: allListingsError } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_phone', userData?.phone)
    .order('created_at', { ascending: false });
  
  if (allListingsError) {
    console.error('ERROR fetching all listings:', allListingsError);
    return;
  }
  
  console.log(`   Found ${allListings?.length || 0} listing(s) with this phone`);
  if (allListings && allListings.length > 0) {
    allListings.forEach((listing, idx) => {
      console.log(`   Listing ${idx + 1}:`, {
        id: listing.id,
        title: listing.title,
        owner_phone: listing.owner_phone,
        owner_token: listing.owner_token?.substring(0, 8) + '...',
        is_active: listing.is_active,
        created_at: listing.created_at,
      });
    });
    
    // Check if owner_tokens match
    console.log('\n5. Token Match Analysis:');
    const mismatchedListings = allListings.filter(l => l.owner_token !== ownerToken);
    if (mismatchedListings.length > 0) {
      console.log(`   PROBLEM FOUND! ${mismatchedListings.length} listing(s) have DIFFERENT owner_token!`);
      console.log('   Expected owner_token:', ownerToken?.substring(0, 8) + '...');
      mismatchedListings.forEach((listing, idx) => {
        console.log(`   Mismatched Listing ${idx + 1}:`, {
          title: listing.title,
          actual_owner_token: listing.owner_token?.substring(0, 8) + '...',
        });
      });
      
      console.log('\nSOLUTION:');
      console.log('   Your listings were created with a DIFFERENT owner_token.');
      console.log('   This usually means you had multiple profiles.');
      console.log('   Run: await fixOwnerTokens() to update them.');
    } else {
      console.log('   SUCCESS: All listings have matching owner_token!');
    }
  }
  
  console.log('\n====== DEBUG COMPLETE ======');
}

async function fixOwnerTokens() {
  console.log('====== FIXING OWNER TOKENS ======');
  
  const supabaseUrl = 'https://vgbznsvdnecdfxylfqfm.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYnpuc3ZkbmVjZGZ4eWxmcWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1OTk1NzYsImV4cCI6MjA1MTE3NTU3Nn0.AO6fLShQFBd4nX1sQN3T2OzXbJTzSvz1BX0tVUH-Xok';
  
  const { createClient } = window.supabase || {};
  
  if (!createClient) {
    console.error('ERROR: Supabase client not available.');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const clientToken = localStorage.getItem('oldcycle_token');
  const userStr = localStorage.getItem('oldcycle_user');
  
  if (!clientToken) {
    console.log('ERROR: No client token found. Please login first.');
    return;
  }
  
  const userData = userStr ? JSON.parse(userStr) : null;
  
  // Get the correct profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('owner_token, phone')
    .eq('client_token', clientToken)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();
  
  if (profileError || !profile) {
    console.error('ERROR fetching profile:', profileError);
    return;
  }
  
  console.log('SUCCESS: Got correct profile');
  console.log('   Phone:', profile.phone);
  console.log('   Owner Token:', profile.owner_token?.substring(0, 8) + '...');
  
  // Update all listings with this phone to use the correct owner_token
  console.log('\nUpdating listings...');
  const { data: updated, error: updateError } = await supabase
    .from('listings')
    .update({ owner_token: profile.owner_token })
    .eq('owner_phone', userData?.phone || profile.phone)
    .select();
  
  if (updateError) {
    console.error('ERROR updating listings:', updateError);
    return;
  }
  
  console.log(`SUCCESS: Updated ${updated?.length || 0} listing(s)!`);
  console.log('   All your listings now have the correct owner_token.');
  console.log('\nRefresh the profile page to see your listings!');
}

console.log('Debug functions loaded! Run: await debugProfileIssue()');
