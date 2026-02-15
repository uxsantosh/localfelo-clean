// =====================================================
// Location Helper - Google Maps Deep Links Only
// No SDK, No Autocomplete, No Fancy UI
// =====================================================

import { LocationData } from '../types';

/**
 * Get current location on mobile (auto-detect)
 * Returns null on desktop or if permission denied
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
  // Check if geolocation is available
  if (!navigator.geolocation) {
    console.log('📍 Geolocation not supported on this device');
    return null;
  }

  return new Promise((resolve) => {
    console.log('📍 Requesting location permission...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('✅ Location detected:', latitude.toFixed(4), longitude.toFixed(4));
        
        resolve({
          latitude,
          longitude,
          isManual: false,
        });
      },
      (error) => {
        // Silently handle common permission errors without alarming logs
        if (error.code === error.PERMISSION_DENIED) {
          console.log('📍 Location permission not granted (user may have declined)');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          console.log('📍 Location unavailable (device may not have GPS)');
        } else if (error.code === error.TIMEOUT) {
          console.log('📍 Location request timed out');
        } else {
          console.log('📍 Location detection skipped');
        }
        resolve(null);
      },
      {
        enableHighAccuracy: false, // Use network location for faster response
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 300000, // Allow cached location up to 5 minutes old
      }
    );
  });
}

/**
 * Create a Google Maps deep link from coordinates
 * Works on all devices - opens Google Maps app or web
 */
export function createMapsDeepLink(latitude: number, longitude: number, label?: string): string {
  const coords = `${latitude},${longitude}`;
  const encodedLabel = label ? encodeURIComponent(label) : '';
  
  // Universal Google Maps URL that works on all platforms
  // Opens app on mobile, web on desktop
  if (encodedLabel) {
    return `https://www.google.com/maps/search/?api=1&query=${coords}&query_place_id=${encodedLabel}`;
  }
  
  return `https://www.google.com/maps/search/?api=1&query=${coords}`;
}

/**
 * Create navigation deep link to a location
 * Opens Google Maps with navigation ready
 */
export function createNavigationLink(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

/**
 * Parse coordinates from a Google Maps deep link
 */
export function parseDeepLink(deepLink: string): { latitude: number; longitude: number } | null {
  try {
    // Extract query parameter
    const url = new URL(deepLink);
    const query = url.searchParams.get('query') || url.searchParams.get('destination');
    
    if (!query) return null;
    
    // Parse coordinates
    const [lat, lng] = query.split(',').map(parseFloat);
    
    if (isNaN(lat) || isNaN(lng)) return null;
    
    return {
      latitude: lat,
      longitude: lng,
    };
  } catch (error) {
    console.error('Failed to parse deep link:', error);
    return null;
  }
}

/**
 * Manual location entry - user enters coordinates
 * For desktop users
 */
export function validateCoordinates(latitude: string, longitude: string): boolean {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Format location display text (showing only area, not exact coords)
 */
export function formatLocationDisplay(areaName: string, cityName: string): string {
  return `${areaName}, ${cityName}`;
}