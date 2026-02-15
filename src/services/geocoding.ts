// Geoapify Geocoding & Autocomplete API
// High-quality geocoding with autocomplete support
// API Key: 2d400c06bcd844989e70bb38697a464b

export interface GeocodedAddress {
  latitude: number;
  longitude: number;
  address: string;
  locality?: string;
  city: string;
  state?: string;
  pincode?: string;
  country: string;
  accuracy?: 'high' | 'medium' | 'low'; // GPS (high), WiFi (medium), IP (low)
}

export interface SearchResult {
  lat: number;
  lon: number;
  display_name: string;
  address?: any;
  place_id?: string;
  properties?: any;
}

/**
 * Detect if device likely has GPS hardware
 */
export function isLikelyMobileDevice(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth < 768;
  
  return isMobile || (hasTouch && isSmallScreen);
}

/**
 * Check if geolocation is available and get permission state if possible
 */
export async function checkGeolocationAvailability(): Promise<{
  available: boolean;
  permission?: 'granted' | 'denied' | 'prompt';
  isMobile: boolean;
  message?: string;
}> {
  const isMobile = isLikelyMobileDevice();
  
  if (!navigator.geolocation) {
    return {
      available: false,
      isMobile,
      message: 'Your browser does not support location detection. Please use search.'
    };
  }
  
  // Check if HTTPS (required for geolocation)
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    return {
      available: false,
      isMobile,
      message: 'Location detection requires HTTPS. Please use search or access via HTTPS.'
    };
  }
  
  // Try to check permission (if browser supports it)
  try {
    if ('permissions' in navigator) {
      const result = await (navigator.permissions as any).query({ name: 'geolocation' });
      return {
        available: true,
        permission: result.state,
        isMobile,
        message: result.state === 'denied' 
          ? 'Location permission denied. Enable in browser settings or use search.'
          : undefined
      };
    }
  } catch (err) {
    // Permissions API not supported, that's okay
  }
  
  return {
    available: true,
    isMobile,
    message: isMobile 
      ? undefined 
      : 'On laptops: Your browser will ask for location permission. WiFi-based location may be less accurate than phone GPS.'
  };
}

// Get API key from environment variable
const getApiKey = () => {
  // Hardcoded API key (safe for client-side geocoding APIs)
  const API_KEY = '2d400c06bcd844989e70bb38697a464b';
  
  // Try to get from environment variable if available
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEOAPIFY_API_KEY) {
      return import.meta.env.VITE_GEOAPIFY_API_KEY;
    }
  } catch (e) {
    // Fall back to hardcoded key
  }
  
  return API_KEY;
};

const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1';

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // 100ms between requests (Geoapify allows higher rate)

async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => 
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
}

/**
 * Convert GPS coordinates to human-readable address (Reverse Geocoding)
 * Uses Geoapify Reverse Geocoding API
 */
export async function reverseGeocode(
  lat: number, 
  lng: number
): Promise<GeocodedAddress | null> {
  try {
    await rateLimit();
    
    const apiKey = getApiKey();
    const response = await fetch(
      `${GEOAPIFY_BASE_URL}/geocode/reverse?` +
      `lat=${lat}&lon=${lng}&apiKey=${apiKey}&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    if (!data || !data.results || data.results.length === 0) {
      return null;
    }
    
    const result = data.results[0];
    const props = result.properties || {};
    
    // IMPORTANT: Use the original GPS coordinates (lat, lng parameters)
    // NOT the reverse geocoded coordinates (result.lat, result.lon)
    // The API returns coordinates of nearest address/POI which may be slightly off
    // We want the address INFO but keep the exact GPS coordinates from the device
    return {
      latitude: lat,  // Use original GPS lat
      longitude: lng, // Use original GPS lng
      address: result.formatted || props.formatted || '',
      locality: props.suburb || props.neighbourhood || props.district || props.street,
      city: props.city || props.town || props.village || props.county || '',
      state: props.state,
      pincode: props.postcode,
      country: props.country || 'India'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Search for locations by query using Geoapify Autocomplete API
 * This provides better autocomplete suggestions than regular geocoding
 */
export async function searchLocations(
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    await rateLimit();
    
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    console.log('🔍 Searching for:', query);
    
    const apiKey = getApiKey();
    
    // Try primary search with Bangalore bias
    let response = await fetch(
      `${GEOAPIFY_BASE_URL}/geocode/autocomplete?` +
      `text=${encodeURIComponent(query)}&` +
      `filter=countrycode:in&` + // India only
      `bias=proximity:77.5946,12.9716&` + // Bias to Bangalore center
      `limit=${limit}&` +
      `apiKey=${apiKey}&` +
      `lang=en&` +
      `format=json`
    );
    
    if (!response.ok) {
      console.log('⚠️ Primary search failed with status:', response.status);
      throw new Error('Search failed');
    }
    
    const data = await response.json();
    console.log('✅ Found', data?.results?.length || 0, 'results');
    
    // If no results and query looks like it might be BTM/Bangalore area, try broader search
    if ((!data?.results || data.results.length === 0) && 
        (query.toLowerCase().includes('btm') || 
         query.toLowerCase().includes('bangalore') ||
         query.toLowerCase().includes('bengaluru'))) {
      console.log('🔄 Trying broader search for BTM/Bangalore area...');
      
      // Extract just area name (e.g., "BTM 2nd Stage" from "8th cross btm 2nd stage")
      let simplifiedQuery = query;
      if (query.toLowerCase().includes('btm')) {
        // Extract BTM stage info
        const btmMatch = query.match(/btm\s*(\d+(?:st|nd|rd|th)?)\s*stage/i);
        if (btmMatch) {
          simplifiedQuery = `BTM ${btmMatch[1]} Stage Bangalore`;
        } else {
          simplifiedQuery = 'BTM Layout Bangalore';
        }
        
        console.log('🔄 Simplified query to:', simplifiedQuery);
        
        const fallbackResponse = await fetch(
          `${GEOAPIFY_BASE_URL}/geocode/autocomplete?` +
          `text=${encodeURIComponent(simplifiedQuery)}&` +
          `filter=countrycode:in&` +
          `limit=${limit}&` +
          `apiKey=${apiKey}&` +
          `lang=en&` +
          `format=json`
        );
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData?.results?.length > 0) {
            console.log('✅ Fallback search found', fallbackData.results.length, 'results');
            return fallbackData.results.map((result: any) => ({
              lat: result.lat,
              lon: result.lon,
              display_name: result.formatted || result.properties?.formatted || 'Unknown',
              address: result.properties || {},
              place_id: result.place_id,
              properties: result.properties
            }));
          }
        }
      }
    }
    
    if (!data || !data.results || data.results.length === 0) {
      console.log('⚠️ No results found');
      return [];
    }
    
    // Transform Geoapify results to our SearchResult format
    return data.results.map((result: any) => ({
      lat: result.lat,
      lon: result.lon,
      display_name: result.formatted || result.properties?.formatted || 'Unknown',
      address: result.properties || {},
      place_id: result.place_id,
      properties: result.properties
    }));
  } catch (error) {
    console.error('❌ Search error:', error);
    return [];
  }
}

/**
 * Get current GPS position from browser
 */
export async function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        // Provide specific error messages
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access or use search.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try search instead.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or use search.';
            break;
        }
        
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).code = error.code;
        reject(enhancedError);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Auto-detect user location (GPS + Reverse Geocoding)
 */
export async function detectUserLocation(): Promise<GeocodedAddress | null> {
  try {
    console.log('📍 Getting GPS coordinates from device...');
    const position = await getCurrentPosition();
    
    const gpsLat = position.coords.latitude;
    const gpsLng = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    
    console.log(`✅ GPS coordinates obtained:`, {
      latitude: gpsLat,
      longitude: gpsLng,
      accuracy: `${Math.round(accuracy)}m`
    });
    
    console.log('🔄 Getting address for GPS coordinates...');
    const address = await reverseGeocode(gpsLat, gpsLng);
    
    if (address) {
      console.log('✅ Location detected successfully:', {
        coordinates: { lat: address.latitude, lng: address.longitude },
        address: address.address,
        city: address.city
      });
    }
    
    return address;
  } catch (error: any) {
    // Location detection failed - user can use search or browse map instead
    console.log('❌ GPS not available:', error.message);
    throw error;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}