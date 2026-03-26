/**
 * Debug helper to diagnose login/profile issues
 * Use this in browser console: window.debugOldCycleAuth()
 */

import { supabase } from '../lib/supabaseClient';

export async function debugAuth() {
  console.log('🔍 === OldCycle Auth Debug ===');
  
  // 1. Check localStorage
  const token = localStorage.getItem('oldcycle_token');
  const userStr = localStorage.getItem('oldcycle_user');
  
  console.log('📦 LocalStorage:');
  console.log('  Token:', token ? 'EXISTS' : 'MISSING');
  console.log('  User:', userStr ? JSON.parse(userStr) : 'MISSING');
  
  if (!token) {
    console.log('❌ No token found in localStorage. User not logged in.');
    return;
  }
  
  // 2. Check profile in database
  console.log('\n🔍 Checking profile in database...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('client_token', token)
    .single();
  
  if (profileError) {
    console.error('❌ Profile fetch error:', profileError);
  } else {
    console.log('✅ Profile found:', {
      id: profile.id,
      name: profile.name,
      phone: profile.phone,
      client_token: profile.client_token,
      owner_token: profile.owner_token,
      created_at: profile.created_at,
    });
  }
  
  // 3. Check if there are duplicate profiles with same phone
  if (profile) {
    console.log('\n🔍 Checking for duplicate profiles...');
    const { data: duplicates, error: dupError } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', profile.phone)
      .order('created_at', { ascending: true });
    
    if (dupError) {
      console.error('❌ Duplicate check error:', dupError);
    } else {
      console.log(`📊 Found ${duplicates.length} profile(s) with phone ${profile.phone}:`);
      duplicates.forEach((dup, idx) => {
        console.log(`  ${idx + 1}. ID: ${dup.id}, Created: ${dup.created_at}, Owner Token: ${dup.owner_token}`);
      });
      
      if (duplicates.length > 1) {
        console.warn('⚠️ WARNING: Multiple profiles found! This may cause issues.');
      }
    }
    
    // 4. Check listings
    console.log('\n🔍 Checking listings...');
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, owner_token, created_at')
      .eq('owner_token', profile.owner_token)
      .order('created_at', { ascending: false });
    
    if (listingsError) {
      console.error('❌ Listings fetch error:', listingsError);
    } else {
      console.log(`✅ Found ${listings.length} listing(s):`);
      listings.forEach((listing, idx) => {
        console.log(`  ${idx + 1}. ${listing.title} (Created: ${listing.created_at})`);
      });
    }
    
    // 5. Check if there are orphaned listings (listings not matching current owner_token)
    if (duplicates && duplicates.length > 1) {
      console.log('\n🔍 Checking for orphaned listings...');
      const otherOwnerTokens = duplicates
        .filter(d => d.owner_token !== profile.owner_token)
        .map(d => d.owner_token);
      
      for (const ownerToken of otherOwnerTokens) {
        const { data: orphanedListings } = await supabase
          .from('listings')
          .select('id, title, created_at')
          .eq('owner_token', ownerToken);
        
        if (orphanedListings && orphanedListings.length > 0) {
          console.warn(`⚠️ Found ${orphanedListings.length} orphaned listing(s) with owner_token ${ownerToken}:`);
          orphanedListings.forEach((listing, idx) => {
            console.log(`    ${idx + 1}. ${listing.title}`);
          });
        }
      }
    }
  }
  
  console.log('\n✅ === Debug Complete ===');
}

// Make it available globally for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).debugOldCycleAuth = debugAuth;
}
