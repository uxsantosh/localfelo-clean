import { Preferences } from '@capacitor/preferences';

/**
 * Storage adapter that implements the Supabase storage interface
 * using Capacitor Preferences API
 */
export const CapacitorStorageAdapter = {
  /**
   * Get an item from storage
   */
  async getItem(key: string): Promise<string | null> {
    console.log('🔍 [CapacitorStorage] GET:', key);
    try {
      const { value } = await Preferences.get({ key });
      
      if (value) {
        console.log('✅ [CapacitorStorage] GET Result:', key, '→ Found', `(${value.length} chars)`);
      } else {
        console.log('❌ [CapacitorStorage] GET Result:', key, '→ Not found');
      }
      
      return value;
    } catch (error) {
      console.error('❌ [CapacitorStorage] GET ERROR:', key, error);
      return null;
    }
  },

  /**
   * Set an item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    console.log('💾 [CapacitorStorage] SET:', key, `(${value.length} chars)`);
    try {
      await Preferences.set({ key, value });
      console.log('✅ [CapacitorStorage] SET Complete:', key);
      
      // Verify the save worked
      const { value: verifyValue } = await Preferences.get({ key });
      if (verifyValue === value) {
        console.log('✅ [CapacitorStorage] VERIFIED:', key, 'saved correctly');
      } else {
        console.error('❌ [CapacitorStorage] VERIFY FAILED:', key, 'value mismatch!');
      }
    } catch (error) {
      console.error('❌ [CapacitorStorage] SET ERROR:', key, error);
      throw error;
    }
  },

  /**
   * Remove an item from storage
   */
  async removeItem(key: string): Promise<void> {
    console.log('🗑️ [CapacitorStorage] REMOVE:', key);
    try {
      await Preferences.remove({ key });
      console.log('✅ [CapacitorStorage] REMOVE Complete:', key);
    } catch (error) {
      console.error('❌ [CapacitorStorage] REMOVE ERROR:', key, error);
      throw error;
    }
  },
};