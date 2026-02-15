import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getAreaCoordinates } from '../data/areaCoordinates';

// Helper function to sanitize location IDs (convert invalid IDs to null)
const sanitizeLocationId = (id: string | null | undefined): string | null => {
  if (!id || id === 'auto-detected' || id === 'undefined' || id === 'null') {
    return null;
  }
  return id;
};

export interface UserLocation {
  cityId: string | null;
  city: string;
  areaId: string | null;
  area: string;
  subAreaId?: string; // 3rd level (optional)
  subArea?: string; // 3rd level name (optional)
  street?: string; // Optional street/landmark
  latitude: number; // PRECISE GPS coordinates (primary)
  longitude: number; // PRECISE GPS coordinates (primary)
  address?: string; // Full human-readable address
  locality?: string; // Neighborhood/locality name
  state?: string; // State name
  pincode?: string; // Postal code
  detectionMethod?: 'auto' | 'search' | 'manual' | 'dropdown'; // How location was determined
  updatedAt?: string;
}

interface UseLocationResult {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  hasAttemptedLoad: boolean;
  updateLocation: (location: UserLocation) => Promise<void>;
  clearLocation: () => Promise<void>;
}

/**
 * Location Hook with 3-level support (City → Area → Sub-Area)
 * IMPORTANT: Distance calculations use AREA coordinates (latitude/longitude)
 * Sub-area is for precise user location display only
 */
export function useLocation(userId: string | null): UseLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // ✅ DEFAULT LOCATION: Bangalore, India (when no location is set)
  const DEFAULT_LOCATION: UserLocation = {
    cityId: null,
    city: 'Bangalore',
    areaId: null,
    area: '',
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'Bangalore, Karnataka, India',
    state: 'Karnataka',
    detectionMethod: 'manual',
  };

  // Load location from Supabase or localStorage
  useEffect(() => {
    if (!userId) {
      // ✅ Guest user: Load from localStorage (two possible keys for backward compatibility)
      const savedGuestLocation = 
        localStorage.getItem('localfelo_guest_location') || 
        localStorage.getItem('oldcycle_guest_location');
      
      if (savedGuestLocation) {
        try {
          const guestLocation = JSON.parse(savedGuestLocation);
          console.log('📍 [useLocation] Loaded guest location from localStorage:', guestLocation);
          setLocation(guestLocation);
        } catch (err) {
          console.error('❌ [useLocation] Failed to parse guest location:', err);
          localStorage.removeItem('localfelo_guest_location');
          localStorage.removeItem('oldcycle_guest_location');
          // ✅ Set default location if parsing fails
          console.log('📍 [useLocation] Setting default location: Bangalore');
          setLocation(DEFAULT_LOCATION);
        }
      } else {
        // ✅ No saved location - set Bangalore as default
        console.log('📍 [useLocation] No saved location - setting default: Bangalore');
        setLocation(DEFAULT_LOCATION);
      }
      setLoading(false);
      setHasAttemptedLoad(true);
      return;
    }

    loadLocationFromDatabase();
  }, [userId]);

  // ✅ NEW: Listen for location changes from other components
  useEffect(() => {
    // Listen for cross-tab changes (storage event)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'localfelo_location_version') {
        console.log('📍 [useLocation] Location version changed (cross-tab) - reloading location');
        if (userId) {
          loadLocationFromDatabase();
        } else {
          // Reload guest location from localStorage
          const savedGuestLocation = 
            localStorage.getItem('localfelo_guest_location') || 
            localStorage.getItem('oldcycle_guest_location');
          
          if (savedGuestLocation) {
            try {
              const guestLocation = JSON.parse(savedGuestLocation);
              console.log('📍 [useLocation] Reloaded guest location after change:', guestLocation);
              setLocation(guestLocation);
            } catch (err) {
              console.error('❌ [useLocation] Failed to parse guest location after change:', err);
            }
          }
        }
      }
    };

    // Listen for same-tab changes (custom event)
    const handleLocationChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('📍 [useLocation] Location changed (same-tab) - updating location:', customEvent.detail);
      setLocation(customEvent.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('locationChanged', handleLocationChanged);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('locationChanged', handleLocationChanged);
    };
  }, [userId]);

  const loadLocationFromDatabase = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // ✅ CRITICAL FIX: Load localStorage location FIRST as fallback
      // This ensures location is never empty during the login transition
      const savedGuestLocation = 
        localStorage.getItem('localfelo_guest_location') || 
        localStorage.getItem('oldcycle_guest_location');
      
      let fallbackLocation: UserLocation | null = null;
      if (savedGuestLocation) {
        try {
          fallbackLocation = JSON.parse(savedGuestLocation);
          console.log('📍 [useLocation] Found localStorage fallback:', fallbackLocation);
          // Set immediately so header shows location right away
          setLocation(fallbackLocation);
        } catch (err) {
          console.error('❌ [useLocation] Failed to parse localStorage fallback:', err);
        }
      }
      
      // Try to fetch with sub_area columns (3-level support)
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('city_id, city, area_id, area, sub_area_id, sub_area, latitude, longitude, location_updated_at')
        .eq('id', userId)
        .single();

      if (fetchError) {
        // Handle missing sub_area columns (backward compatibility)
        if (fetchError.code === '42703' || fetchError.code === 'PGRST204') {
          console.warn('⚠️ [useLocation] sub_area columns not found, using 2-level location');
          
          // Retry without sub_area columns
          const { data: dataWithoutSubArea, error: retryError } = await supabase
            .from('profiles')
            .select('city_id, city, area_id, area, latitude, longitude, location_updated_at')
            .eq('id', userId)
            .single();
          
          if (retryError) {
            console.error('❌ [useLocation] Error loading location (retry):', retryError);
            // Keep fallback location if database fails
            if (!fallbackLocation) {
              setLocation(null);
            }
            setError(null);
            setLoading(false);
            setHasAttemptedLoad(true);
            return;
          }
          
          if (dataWithoutSubArea && dataWithoutSubArea.city && dataWithoutSubArea.latitude && dataWithoutSubArea.longitude) {
            setLocation({
              cityId: sanitizeLocationId(dataWithoutSubArea.city_id),
              city: dataWithoutSubArea.city,
              areaId: sanitizeLocationId(dataWithoutSubArea.area_id) || '',
              area: dataWithoutSubArea.area || '',
              latitude: parseFloat(dataWithoutSubArea.latitude),
              longitude: parseFloat(dataWithoutSubArea.longitude),
              updatedAt: dataWithoutSubArea.location_updated_at,
            });
          } else if (!fallbackLocation) {
            // Only clear if no fallback exists
            setLocation(null);
          }
          
          setLoading(false);
          setHasAttemptedLoad(true);
          return;
        }
        
        console.error('❌ [useLocation] Error loading location:', fetchError);
        // Keep fallback location if database fails
        if (!fallbackLocation) {
          setError('Failed to load location');
        }
        setLoading(false);
        setHasAttemptedLoad(true);
        return;
      }

      // Successfully loaded with 3-level support
      if (data && data.city && data.latitude && data.longitude) {
        const loadedLocation: UserLocation = {
          cityId: sanitizeLocationId(data.city_id),
          city: data.city,
          areaId: sanitizeLocationId(data.area_id) || '',
          area: data.area || '',
          subAreaId: data.sub_area_id || undefined,
          subArea: data.sub_area || undefined,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          updatedAt: data.location_updated_at,
        };
        
        console.log('✅ [useLocation] Loaded location from database:', loadedLocation);
        setLocation(loadedLocation);
      } else {
        console.log('ℹ️ [useLocation] No location in database');
        // Keep fallback location if database has none
        if (!fallbackLocation) {
          // ✅ Set default location (Bangalore) for logged-in users with no location
          console.log('📍 [useLocation] Setting default location for logged-in user: Bangalore');
          setLocation(DEFAULT_LOCATION);
        } else {
          console.log('📍 [useLocation] Using localStorage fallback since database is empty');
        }
      }

      setLoading(false);
      setHasAttemptedLoad(true);
    } catch (err) {
      console.error('❌ [useLocation] Exception:', err);
      setError('Failed to load location');
      setLoading(false);
      setHasAttemptedLoad(true);
    }
  };

  const updateLocation = async (newLocation: UserLocation) => {
    console.log('📍 [useLocation] updateLocation called');
    console.log('📍 [useLocation] New location:', newLocation);
    console.log('📍 [useLocation] User ID:', userId);
    
    // ✅ Guest user: Save to localStorage (using new key)
    if (!userId) {
      console.log('📍 [useLocation] Saving to localStorage (guest user)');
      
      const finalLat = newLocation.latitude;
      const finalLon = newLocation.longitude;
      
      if (!finalLat || !finalLon) {
        console.error('❌ [useLocation] No coordinates provided for guest location');
        setError('Location coordinates missing');
        return;
      }
      
      const guestLocation: UserLocation = {
        ...newLocation,
        latitude: finalLat,
        longitude: finalLon,
        updatedAt: new Date().toISOString(),
      };
      
      // Save to new key (and old key for backward compatibility)
      localStorage.setItem('localfelo_guest_location', JSON.stringify(guestLocation));
      localStorage.setItem('oldcycle_guest_location', JSON.stringify(guestLocation));
      
      // ✅ CRITICAL: Trigger storage event for other components/tabs
      localStorage.setItem('localfelo_location_version', Date.now().toString());
      console.log('✅ [useLocation] Guest location saved and version updated:', guestLocation);
      
      // ✅ CRITICAL: Trigger custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('locationChanged', { detail: guestLocation }));
      
      setLocation(guestLocation);
      setError(null);
      return;
    }

    // Logged-in user: Save to database
    try {
      setLoading(true);
      setError(null);

      // Use provided coordinates (from AREA - used for distance calculation)
      let finalLat = newLocation.latitude;
      let finalLon = newLocation.longitude;
      
      // If no coordinates provided, fetch from database
      if (!finalLat || !finalLon) {
        console.log('⚠️ [useLocation] No coordinates provided, fetching from area...');
        
        if (newLocation.areaId) {
          // Try fallback coordinates from code first
          const fallbackCoords = getAreaCoordinates(newLocation.areaId);
          if (fallbackCoords) {
            finalLat = fallbackCoords.latitude;
            finalLon = fallbackCoords.longitude;
            console.log(`✅ [useLocation] Using fallback coords for area ${newLocation.areaId}: ${finalLat}, ${finalLon}`);
          } else {
            // Fetch from database
            const { data: areaData, error: areaError } = await supabase
              .from('areas')
              .select('latitude, longitude')
              .eq('id', newLocation.areaId)
              .single();
            
            if (!areaError && areaData && areaData.latitude && areaData.longitude) {
              finalLat = parseFloat(areaData.latitude);
              finalLon = parseFloat(areaData.longitude);
              console.log(`✅ [useLocation] Using database coords for area: ${finalLat}, ${finalLon}`);
            }
          }
        }
      }
      
      if (!finalLat || !finalLon) {
        console.error('❌ [useLocation] Could not determine coordinates');
        setError('Failed to determine location coordinates');
        setLoading(false);
        return;
      }
      
      console.log('📍 [useLocation] Final coordinates (from AREA):', { finalLat, finalLon });

      // Try to update with 3-level location support
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          city_id: newLocation.cityId,
          city: newLocation.city,
          area_id: newLocation.areaId || null,
          area: newLocation.area || null,
          sub_area_id: newLocation.subAreaId || null,
          sub_area: newLocation.subArea || null,
          latitude: finalLat, // AREA coordinates for distance calculation
          longitude: finalLon, // AREA coordinates for distance calculation
          location_updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        // Handle missing sub_area columns (backward compatibility)
        if (updateError.code === 'PGRST204' || updateError.code === '42703') {
          console.warn('⚠️ [useLocation] sub_area columns not found, updating without them (2-level)');
          console.log('💡 [useLocation] To enable 3-level location, run /COMPLETE_3_LEVEL_LOCATION_SETUP.sql');
          
          // Retry without sub_area columns
          const { error: retryError } = await supabase
            .from('profiles')
            .update({
              city_id: newLocation.cityId,
              city: newLocation.city,
              area_id: newLocation.areaId || null,
              area: newLocation.area || null,
              latitude: finalLat,
              longitude: finalLon,
              location_updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
          
          if (retryError) {
            console.error('❌ [useLocation] Retry update failed:', retryError);
            setError('Failed to update location');
            setLoading(false);
            return;
          }
          
          console.log('✅ [useLocation] Location saved (2-level only, no sub-area)');
          
          // ✅ CRITICAL: Trigger storage event for other components/tabs
          localStorage.setItem('localfelo_location_version', Date.now().toString());
          
          setLocation({
            ...newLocation,
            subAreaId: undefined,
            subArea: undefined,
            latitude: finalLat,
            longitude: finalLon,
            updatedAt: new Date().toISOString(),
          });
          setLoading(false);
          return;
        }
        
        console.error('❌ [useLocation] Update failed:', updateError);
        setError('Failed to update location');
        setLoading(false);
        return;
      }

      console.log('✅ [useLocation] Location saved to database (3-level)');
      
      // ✅ CRITICAL: Trigger storage event for other components/tabs
      localStorage.setItem('localfelo_location_version', Date.now().toString());
      
      // ✅ CRITICAL: Trigger custom event for same-tab updates
      const updatedLocation = {
        ...newLocation,
        latitude: finalLat,
        longitude: finalLon,
        updatedAt: new Date().toISOString(),
      };
      window.dispatchEvent(new CustomEvent('locationChanged', { detail: updatedLocation }));
      
      setLocation(updatedLocation);
      setLoading(false);
    } catch (err) {
      console.error('❌ [useLocation] Exception:', err);
      setError('Failed to update location');
      setLoading(false);
    }
  };

  const clearLocation = async () => {
    if (!userId) {
      // Clear both old and new localStorage keys
      localStorage.removeItem('localfelo_guest_location');
      localStorage.removeItem('oldcycle_guest_location');
      setLocation(null);
      return;
    }

    try {
      setLoading(true);
      
      // Try with 3-level columns first
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          city_id: null,
          city: null,
          area_id: null,
          area: null,
          sub_area_id: null,
          sub_area: null,
          latitude: null,
          longitude: null,
          location_updated_at: null,
        })
        .eq('id', userId);

      if (updateError) {
        // Retry without sub_area columns
        if (updateError.code === 'PGRST204' || updateError.code === '42703') {
          const { error: retryError } = await supabase
            .from('profiles')
            .update({
              city_id: null,
              city: null,
              area_id: null,
              area: null,
              latitude: null,
              longitude: null,
              location_updated_at: null,
            })
            .eq('id', userId);
          
          if (retryError) {
            console.error('❌ [useLocation] Error clearing location:', retryError);
            setError('Failed to clear location');
            setLoading(false);
            return;
          }
        } else {
          console.error('❌ [useLocation] Error clearing location:', updateError);
          setError('Failed to clear location');
          setLoading(false);
          return;
        }
      }

      setLocation(null);
      setLoading(false);
    } catch (err) {
      console.error('❌ [useLocation] Exception:', err);
      setError('Failed to clear location');
      setLoading(false);
    }
  };

  return {
    location,
    loading,
    error,
    hasAttemptedLoad,
    updateLocation,
    clearLocation,
  };
}