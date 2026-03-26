// =====================================================
// Map Provider Configuration
// =====================================================
// Centralized config for Google Maps vs Leaflet
// =====================================================

export type MapProvider = 'google' | 'leaflet';

/**
 * Maps Configuration Module
 * 
 * Manages Google Maps integration with fallback to Leaflet
 */

// 🔍 IMMEDIATE DEBUG LOG - This runs when file is imported
console.log('🚀🚀🚀 MAPS CONFIG FILE LOADED! 🚀🚀🚀');

/**
 * Map provider preference type
 */
export type MapProviderPreference = 'google' | 'leaflet' | 'auto';

/**
 * Get Google Maps API key from environment
 */
export function getGoogleMapsApiKey(): string | undefined {
  // Get from environment variable only
  try {
    return import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Get Google Geocoding API key (fallback to Maps key if not set)
 */
export function getGoogleGeocodingApiKey(): string | undefined {
  try {
    return import.meta.env?.VITE_GOOGLE_GEOCODING_API_KEY || getGoogleMapsApiKey();
  } catch {
    return undefined;
  }
}

/**
 * Check if Google Maps API key is available
 */
export function hasGoogleMapsKey(): boolean {
  const key = getGoogleMapsApiKey();
  return !!(key && key.trim().length > 0 && !key.includes('your_api_key'));
}

/**
 * Get configured map provider preference
 */
export function getMapProviderPreference(): MapProviderPreference {
  try {
    const pref = import.meta.env?.VITE_MAP_PROVIDER || 'auto';
    if (pref === 'google' || pref === 'leaflet' || pref === 'auto') {
      return pref;
    }
    return 'auto';
  } catch {
    return 'auto';
  }
}

/**
 * Determine which map provider to use
 * Priority:
 * 1. If VITE_MAP_PROVIDER = 'leaflet', always use Leaflet
 * 2. If VITE_MAP_PROVIDER = 'google' and key exists, use Google Maps
 * 3. If VITE_MAP_PROVIDER = 'auto' (default), use Google Maps if key exists, else Leaflet
 * 4. If no key, always fall back to Leaflet
 */
export function determineMapProvider(): MapProvider {
  const preference = getMapProviderPreference();
  const hasKey = hasGoogleMapsKey();
  
  if (preference === 'leaflet') {
    return 'leaflet';
  }
  
  if (preference === 'google') {
    if (hasKey) {
      return 'google';
    } else {
      console.warn('⚠️ Google Maps selected but no API key found. Falling back to Leaflet.');
      return 'leaflet';
    }
  }
  
  // Auto mode (default)
  return hasKey ? 'google' : 'leaflet';
}

/**
 * Check if user should get Google Maps (for gradual rollout)
 */
export function shouldUseGoogleMaps(): boolean {
  const provider = determineMapProvider();
  
  if (provider === 'leaflet') {
    return false;
  }
  
  if (provider === 'google') {
    // Check rollout percentage
    try {
      const rolloutPercentage = parseFloat(import.meta.env?.VITE_GOOGLE_MAPS_ROLLOUT_PERCENTAGE || '1.0');
      
      if (rolloutPercentage >= 1.0) {
        return true; // 100% rollout
      }
      
      if (rolloutPercentage <= 0.0) {
        return false; // 0% rollout
      }
      
      // Use deterministic rollout based on session
      const sessionId = getOrCreateSessionId();
      const hash = simpleHash(sessionId);
      const randomValue = (hash % 100) / 100; // 0.00 to 0.99
      
      return randomValue < rolloutPercentage;
    } catch {
      return true; // Default to enabled if rollout check fails
    }
  }
  
  return false;
}

/**
 * Check if Leaflet fallback should be disabled
 * Set VITE_GOOGLE_MAPS_ONLY=true to disable Leaflet entirely
 */
export function isGoogleMapsOnly(): boolean {
  try {
    return import.meta.env?.VITE_GOOGLE_MAPS_ONLY === 'true';
  } catch {
    return false;
  }
}

/**
 * Get or create session ID for consistent rollout
 */
function getOrCreateSessionId(): string {
  const key = 'localfelo_session_id';
  let sessionId = localStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    localStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

/**
 * Simple hash function for deterministic rollout
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get debug mode setting
 */
export function isDebugMapsEnabled(): boolean {
  try {
    return import.meta.env?.VITE_DEBUG_MAPS === 'true';
  } catch {
    return false;
  }
}

/**
 * Log map provider info (if debug enabled)
 */
export function logMapProviderInfo() {
  if (!isDebugMapsEnabled()) return;
  
  const provider = determineMapProvider();
  const hasKey = hasGoogleMapsKey();
  const preference = getMapProviderPreference();
  const useGoogle = shouldUseGoogleMaps();
  const apiKey = getGoogleMapsApiKey();
  
  console.log('🗺️ Map Provider Configuration:');
  console.log('  - Preference:', preference);
  console.log('  - Has Google Maps Key:', hasKey);
  console.log('  - API Key (first 20 chars):', apiKey ? apiKey.substring(0, 20) + '...' : 'NOT SET');
  console.log('  - Determined Provider:', provider);
  console.log('  - Using Google Maps:', useGoogle);
  
  if (provider === 'google' && !hasKey) {
    console.warn('⚠️ Warning: Google Maps selected but no API key configured');
  }
  
  if (!hasKey) {
    console.warn('⚠️ No Google Maps API key found - using Leaflet fallback');
  }
}