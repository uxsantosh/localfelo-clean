/**
 * Profile Cleanup Service
 * Fixes duplicate profiles and consolidates listings
 */

import { supabase } from '../lib/supabaseClient';

interface CleanupResult {
  success: boolean;
  message: string;
  duplicatesFound: number;
  duplicatesRemoved: number;
  listingsMigrated: number;
}

/**
 * Finds and removes duplicate profiles for the same phone number
 * Keeps the oldest profile and migrates all listings to it
 */
export async function cleanupDuplicateProfiles(phone: string): Promise<CleanupResult> {
  console.log('🧹 [Cleanup] Starting cleanup for phone:', phone);
  
  try {
    // 1. Find all profiles with this phone number
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: true }); // Oldest first
    
    if (fetchError) {
      console.error('❌ [Cleanup] Error fetching profiles:', fetchError);
      return {
        success: false,
        message: 'Failed to fetch profiles',
        duplicatesFound: 0,
        duplicatesRemoved: 0,
        listingsMigrated: 0,
      };
    }
    
    if (!profiles || profiles.length <= 1) {
      console.log('✅ [Cleanup] No duplicates found');
      return {
        success: true,
        message: 'No duplicate profiles found',
        duplicatesFound: 0,
        duplicatesRemoved: 0,
        listingsMigrated: 0,
      };
    }
    
    console.log(`⚠️ [Cleanup] Found ${profiles.length} profiles for this phone!`);
    
    // 2. Keep the oldest profile (first one)
    const keepProfile = profiles[0];
    const duplicateProfiles = profiles.slice(1);
    
    console.log('✅ [Cleanup] Keeping profile:', {
      id: keepProfile.id,
      client_token: keepProfile.client_token,
      owner_token: keepProfile.owner_token,
      created_at: keepProfile.created_at,
    });
    
    let totalListingsMigrated = 0;
    
    // 3. For each duplicate profile, migrate their listings to the kept profile
    for (const dupProfile of duplicateProfiles) {
      console.log('🔄 [Cleanup] Processing duplicate profile:', {
        id: dupProfile.id,
        owner_token: dupProfile.owner_token,
      });
      
      // Find all listings with this duplicate's owner_token
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id')
        .eq('owner_token', dupProfile.owner_token);
      
      if (listingsError) {
        console.error('❌ [Cleanup] Error fetching listings:', listingsError);
        continue;
      }
      
      if (listings && listings.length > 0) {
        console.log(`📦 [Cleanup] Found ${listings.length} listings to migrate`);
        
        // Update all listings to use the kept profile's owner_token
        const { error: updateError } = await supabase
          .from('listings')
          .update({ 
            owner_token: keepProfile.owner_token,
            owner_phone: keepProfile.phone,
            owner_name: keepProfile.display_name || keepProfile.name,
            whatsapp_number: keepProfile.whatsapp_number,
            whatsapp_enabled: keepProfile.whatsapp_enabled,
          })
          .eq('owner_token', dupProfile.owner_token);
        
        if (updateError) {
          console.error('❌ [Cleanup] Error updating listings:', updateError);
        } else {
          console.log(`✅ [Cleanup] Migrated ${listings.length} listings`);
          totalListingsMigrated += listings.length;
        }
      }
      
      // Delete the duplicate profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', dupProfile.id);
      
      if (deleteError) {
        console.error('❌ [Cleanup] Error deleting duplicate profile:', deleteError);
      } else {
        console.log('✅ [Cleanup] Deleted duplicate profile');
      }
    }
    
    console.log('🎉 [Cleanup] Cleanup complete!');
    
    return {
      success: true,
      message: `Cleaned up ${duplicateProfiles.length} duplicate profile(s)`,
      duplicatesFound: profiles.length,
      duplicatesRemoved: duplicateProfiles.length,
      listingsMigrated: totalListingsMigrated,
    };
  } catch (error) {
    console.error('❌ [Cleanup] Unexpected error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      duplicatesFound: 0,
      duplicatesRemoved: 0,
      listingsMigrated: 0,
    };
  }
}

/**
 * Cleanup duplicates for the currently logged-in user
 */
export async function cleanupMyDuplicateProfiles(): Promise<CleanupResult> {
  const userStr = localStorage.getItem('oldcycle_user');
  if (!userStr) {
    return {
      success: false,
      message: 'User not logged in',
      duplicatesFound: 0,
      duplicatesRemoved: 0,
      listingsMigrated: 0,
    };
  }
  
  try {
    const user = JSON.parse(userStr);
    return await cleanupDuplicateProfiles(user.phone);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return {
      success: false,
      message: 'Failed to parse user data',
      duplicatesFound: 0,
      duplicatesRemoved: 0,
      listingsMigrated: 0,
    };
  }
}
