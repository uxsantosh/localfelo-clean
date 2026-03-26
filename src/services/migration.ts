// One-time migration to fix owner_token mismatch
import { supabase } from '../lib/supabaseClient';

interface MigrationResult {
  success: boolean;
  updatedCount?: number;
  error?: any;
}

/**
 * Fix listings that were created with client_token instead of owner_token
 * This happens because the old code used client_token as owner_token
 */
export async function fixListingsOwnerToken(clientToken: string): Promise<MigrationResult> {
  console.log('🔧 Starting migration to fix owner_token...');
  
  if (!clientToken) {
    console.error('❌ No client token provided');
    return { success: false, error: 'No client token' };
  }
  
  try {
    // Get the current user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('client_token, owner_token')
      .eq('client_token', clientToken)
      .single();
    
    if (profileError || !profile) {
      console.error('❌ Error fetching profile:', profileError);
      return { success: false, error: profileError };
    }
    
    console.log('✅ Profile data:', {
      client_token: profile.client_token,
      owner_token: profile.owner_token
    });
    
    // Get ALL listings to see what's in the database
    const { data: allListings } = await supabase
      .from('listings')
      .select('id, title, owner_token, owner_name, owner_phone');
    
    console.log('📊 ALL listings in database:', allListings);
    
    const { client_token, owner_token } = profile;
    
    // Find listings where owner_token = client_token (wrong)
    const { data: listingsToFix, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, owner_token')
      .eq('owner_token', client_token);
    
    console.log('🔍 Listings with client_token as owner_token:', listingsToFix);
    
    if (listingsError) {
      console.error('❌ Error fetching listings:', listingsError);
      return { success: false, error: listingsError };
    }
    
    if (!listingsToFix || listingsToFix.length === 0) {
      console.log('⚠️ No listings found with client_token. Checking for other possibilities...');
      
      // Maybe the listings have NO owner_token or NULL?
      const { data: nullOwnerListings } = await supabase
        .from('listings')
        .select('id, title, owner_token, owner_phone')
        .or(`owner_token.is.null,owner_phone.eq.${profile.client_token}`);
      
      console.log('🔍 Listings with null owner_token or matching phone:', nullOwnerListings);
      
      return { success: true, updatedCount: 0 };
    }
    
    console.log(`📝 Found ${listingsToFix.length} listings to fix`);
    
    // Update them to use the correct owner_token
    const { error: updateError } = await supabase
      .from('listings')
      .update({ owner_token: owner_token })
      .eq('owner_token', client_token);
    
    if (updateError) {
      console.error('❌ Error updating listings:', updateError);
      return { success: false, error: updateError };
    }
    
    console.log(`🎉 Migration complete! Updated ${listingsToFix.length} listing(s)`);
    return { success: true, updatedCount: listingsToFix.length };
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { success: false, error };
  }
}