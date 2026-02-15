// Profiles Service for OldCycle
// User profile-related API calls (No Supabase Auth - using client_token)

import { supabase } from '../lib/supabaseClient';

interface ProfileData {
  display_name: string;
  phone: string;
  whatsapp_enabled?: boolean;
  whatsapp_number?: string | null;
}

interface ProfileUpdate {
  display_name?: string;
  phone?: string;
  avatar_url?: string;
  whatsapp_enabled?: boolean;
  whatsapp_number?: string | null;
}

/**
 * Create or get profile using client token (Soft Auth)
 */
export async function getProfileByToken(clientToken: string) {
  console.log('[Service] getProfileByToken called');
  
  if (!clientToken) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('client_token', clientToken)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('[Service] Error fetching profile:', error);
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error('[Service] getProfileByToken error:', error);
    return null;
  }
}

/**
 * Create a new profile (Soft Auth)
 */
export async function createProfile(profileData: ProfileData) {
  console.log('[Service] createProfile called with data:', profileData);
  
  try {
    const clientToken = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: crypto.randomUUID(),
        client_token: clientToken,
        display_name: profileData.display_name,
        phone: profileData.phone,
        whatsapp_enabled: profileData.whatsapp_enabled || false,
        whatsapp_number: profileData.whatsapp_number || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('[Service] Error creating profile:', error);
      throw error;
    }
    
    return {
      ...data,
      clientToken,
    };
  } catch (error) {
    console.error('[Service] createProfile error:', error);
    throw error;
  }
}

/**
 * Update existing profile
 */
export async function updateProfile(clientToken: string, updates: ProfileUpdate) {
  console.log('[Service] updateProfile called with updates:', updates);
  
  if (!clientToken) {
    throw new Error('Client token required');
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: updates.display_name,
        phone: updates.phone,
        avatar_url: updates.avatar_url,
        whatsapp_enabled: updates.whatsapp_enabled,
        whatsapp_number: updates.whatsapp_number,
      })
      .eq('client_token', clientToken)
      .select()
      .single();
    
    if (error) {
      console.error('[Service] Error updating profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[Service] updateProfile error:', error);
    throw error;
  }
}