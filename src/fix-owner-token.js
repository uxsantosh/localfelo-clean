/**
 * FIX OWNER TOKEN MISMATCH
 * 
 * This script updates all existing listings to use the correct owner_token
 * from the profile table based on client_token.
 * 
 * INSTRUCTIONS:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter
 * 4. The script will fix all listings automatically
 */

async function fixOwnerTokens() {
  console.log('🔧 [FIX] Starting owner_token fix...');
  
  try {
    // Get client_token from localStorage
    const clientToken = localStorage.getItem('oldcycle_token');
    
    if (!clientToken) {
      console.error('❌ [FIX] No clientToken found in localStorage');
      return;
    }
    
    console.log('✅ [FIX] Found clientToken:', clientToken.substring(0, 12) + '...');
    
    // Get the correct owner_token from profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('owner_token, client_token, name, phone')
      .eq('client_token', clientToken)
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (profileError || !profiles || profiles.length === 0) {
      console.error('❌ [FIX] Could not find profile:', profileError);
      return;
    }
    
    const correctOwnerToken = profiles[0].owner_token;
    console.log('✅ [FIX] Found correct owner_token:', correctOwnerToken.substring(0, 12) + '...');
    
    // Get ALL listings (even those with wrong owner_token)
    // We'll check which ones were created by this user by checking owner_phone
    const userPhone = profiles[0].phone;
    console.log('📞 [FIX] User phone:', userPhone);
    
    const { data: allListings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .eq('owner_phone', userPhone); // Match by phone instead of owner_token
    
    if (listingsError) {
      console.error('❌ [FIX] Error fetching listings:', listingsError);
      return;
    }
    
    console.log(`📊 [FIX] Found ${allListings.length} listing(s) with your phone number`);
    
    // Update each listing with the correct owner_token
    for (const listing of allListings) {
      console.log(`🔄 [FIX] Updating listing: ${listing.title} (${listing.id})`);
      console.log(`   Old owner_token: ${listing.owner_token.substring(0, 12)}...`);
      console.log(`   New owner_token: ${correctOwnerToken.substring(0, 12)}...`);
      
      const { error: updateError } = await supabase
        .from('listings')
        .update({ owner_token: correctOwnerToken })
        .eq('id', listing.id);
      
      if (updateError) {
        console.error(`❌ [FIX] Failed to update listing ${listing.id}:`, updateError);
      } else {
        console.log(`✅ [FIX] Successfully updated listing ${listing.id}`);
      }
    }
    
    console.log('🎉 [FIX] All done! Refresh your profile page to see your listings.');
    console.log('💡 [FIX] You can now delete old listings or create new ones.');
    
  } catch (error) {
    console.error('❌ [FIX] Error:', error);
  }
}

// Run the fix
fixOwnerTokens();
