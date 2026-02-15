import { supabase } from '../lib/supabaseClient';

export interface SiteSetting {
  id: string;
  setting_type: 'banner' | 'greeting' | 'floating_badge' | 'ticker';
  enabled: boolean;
  title?: string;
  message: string;
  emoji?: string;
  icon?: 'sparkles' | 'gift' | 'megaphone' | 'bell' | 'party' | 'zap';
  style_type?: 'promo' | 'info' | 'success' | 'announcement';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  storage_key?: string;
  priority: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all site settings
 */
export async function getAllSiteSettings(): Promise<SiteSetting[]> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[SiteSettings] Error fetching settings:', error);
    return [];
  }
}

/**
 * Get active settings by type
 */
export async function getActiveSettingsByType(type: string): Promise<SiteSetting[]> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('setting_type', type)
      .eq('enabled', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`[SiteSettings] Error fetching ${type} settings:`, error);
    return [];
  }
}

/**
 * Get a single setting by ID
 */
export async function getSiteSetting(id: string): Promise<SiteSetting | null> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[SiteSettings] Error fetching setting:', error);
    return null;
  }
}

/**
 * Create a new site setting
 */
export async function createSiteSetting(setting: Omit<SiteSetting, 'created_at' | 'updated_at'>): Promise<SiteSetting | null> {
  try {
    // Convert empty strings to null for optional fields
    const cleanSetting = Object.fromEntries(
      Object.entries(setting)
        .map(([key, value]) => {
          // Convert empty strings to null for optional fields
          if (value === '' && ['title', 'emoji', 'icon', 'style_type', 'position', 'storage_key', 'start_date', 'end_date'].includes(key)) {
            return [key, null];
          }
          return [key, value];
        })
    );
    
    console.log('[SiteSettings] Creating setting:', JSON.stringify(cleanSetting, null, 2));
    
    const { data, error } = await supabase
      .from('site_settings')
      .insert([cleanSetting])
      .select()
      .single();

    if (error) {
      console.error('[SiteSettings] Supabase error details:', JSON.stringify(error, null, 2));
      console.error('[SiteSettings] Error code:', error.code);
      console.error('[SiteSettings] Error message:', error.message);
      console.error('[SiteSettings] Error details:', error.details);
      console.error('[SiteSettings] Error hint:', error.hint);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('[SiteSettings] Error creating setting:', error);
    throw error;
  }
}

/**
 * Update a site setting
 */
export async function updateSiteSetting(id: string, updates: Partial<SiteSetting>): Promise<SiteSetting | null> {
  try {
    // Remove read-only fields that shouldn't be updated
    const { id: _, created_at, updated_at, ...cleanUpdates } = updates as any;
    
    // Remove undefined values and convert empty strings to null for optional fields
    const filteredUpdates = Object.fromEntries(
      Object.entries(cleanUpdates)
        .filter(([key, value]) => {
          // Always include enabled field even if it's false/null
          if (key === 'enabled') return true;
          // Filter out undefined values
          return value !== undefined;
        })
        .map(([key, value]) => {
          // Convert empty strings to null for optional fields
          if (value === '' && ['title', 'emoji', 'icon', 'style_type', 'position', 'storage_key', 'start_date', 'end_date'].includes(key)) {
            return [key, null];
          }
          // Ensure enabled is a boolean
          if (key === 'enabled') {
            return [key, Boolean(value)];
          }
          return [key, value];
        })
    );
    
    console.log('[SiteSettings] Updating setting:', id, 'with:', JSON.stringify(filteredUpdates, null, 2));
    
    const { data, error } = await supabase
      .from('site_settings')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SiteSettings] Supabase error details:', JSON.stringify(error, null, 2));
      console.error('[SiteSettings] Error code:', error.code);
      console.error('[SiteSettings] Error message:', error.message);
      console.error('[SiteSettings] Error details:', error.details);
      console.error('[SiteSettings] Error hint:', error.hint);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('[SiteSettings] Error updating setting:', error);
    throw error;
  }
}

/**
 * Delete a site setting
 */
export async function deleteSiteSetting(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[SiteSettings] Error deleting setting:', error);
    return false;
  }
}

/**
 * Toggle setting enabled status
 */
export async function toggleSettingEnabled(id: string, enabled: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('site_settings')
      .update({ enabled })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[SiteSettings] Error toggling setting:', error);
    return false;
  }
}
