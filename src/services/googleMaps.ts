// =====================================================
// Google Maps API Integration
// =====================================================
// Maps JavaScript API, Places API, Geocoding API
// =====================================================

import { importLibrary } from '@googlemaps/js-api-loader';
import { getGoogleMapsApiKey, getGoogleGeocodingApiKey } from '../config/maps';
import type { SearchResult, GeocodedAddress } from './geocoding';

// Track if Google Maps script has been loaded
let googleMapsLoaded = false;
let googleMapsLoading = false;
let loadPromise: Promise<typeof google.maps> | null = null;
let placesLibraryLoaded = false;

/**
 * Load Google Maps API using new functional API
 */
export async function loadGoogleMaps(): Promise<typeof google.maps> {
  // Return cached if already loaded
  if (googleMapsLoaded && window.google?.maps) {
    console.log('✅ Google Maps already loaded (cached)');
    return window.google.maps;
  }
  
  // Return existing promise if currently loading
  if (googleMapsLoading && loadPromise) {
    console.log('⏳ Google Maps already loading, waiting...');
    return loadPromise;
  }
  
  try {
    googleMapsLoading = true;
    const apiKey = getGoogleMapsApiKey();
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }
    
    console.log('🔄 Loading Google Maps API with key:', apiKey.substring(0, 20) + '...');
    
    // Load the Google Maps script dynamically
    if (!window.google?.maps) {
      // Add the script tag manually
      await new Promise<void>((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector(
          `script[src*=\"maps.googleapis.com/maps/api/js\"]`
        );
        
        if (existingScript) {
          console.log('📜 Google Maps script already in DOM');
          if (window.google?.maps) {
            resolve();
            return;
          }
          // Wait for it to load
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')));
          return;
        }
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding,marker&v=weekly&loading=async`;
        script.async = true;
        script.defer = true;
        
        script.addEventListener('load', () => {
          console.log('✅ Google Maps script loaded successfully');
          resolve();
        });
        
        script.addEventListener('error', () => {
          reject(new Error('Failed to load Google Maps script'));
        });
        
        document.head.appendChild(script);
        console.log('📜 Added Google Maps script to document');
      });
    }
    
    // Wait for google.maps to be available
    let attempts = 0;
    while (!window.google?.maps && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.google?.maps) {
      throw new Error('Google Maps failed to initialize after loading script');
    }
    
    // Wait for places library to be available
    attempts = 0;
    while (!window.google?.maps?.places && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.google?.maps?.places) {
      console.warn('⚠️ Google Places library not available, some features may be limited');
    } else {
      placesLibraryLoaded = true;
      console.log('✅ Google Places library loaded');
    }
    
    googleMapsLoaded = true;
    googleMapsLoading = false;
    console.log('✅ Google Maps fully loaded and ready');
    
    return window.google.maps;
  } catch (error) {
    googleMapsLoading = false;
    loadPromise = null;
    console.error('❌ Failed to load Google Maps:', error);
    throw error;
  }
}

/**
 * Create Google Map instance
 */
export async function createGoogleMap(
  container: HTMLElement,
  options: google.maps.MapOptions
): Promise<google.maps.Map> {
  const maps = await loadGoogleMaps();
  return new maps.Map(container, options);
}

/**
 * Search locations using Google Places Autocomplete
 */
export async function searchGooglePlaces(
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const maps = await loadGoogleMaps();
    
    // Check if places library is available
    if (!maps.places || !maps.places.AutocompleteService) {
      console.warn('⚠️ Google Places library not available');
      throw new Error('Google Places library not loaded');
    }
    
    const service = new maps.places.AutocompleteService();
    
    // ✅ FIX: Remove types to search EVERYTHING (addresses AND businesses)
    // When types is omitted, Google Places searches for all types including:
    // - Geocodes (addresses, areas, neighborhoods, streets)
    // - Establishments (businesses, shops, restaurants, landmarks)
    // - All POIs (ATMs, hospitals, parks, etc.)
    // This makes search work exactly like Google Maps
    const request: google.maps.places.AutocompletionRequest = {
      input: query,
      componentRestrictions: { country: 'in' }, // India only
      // types property omitted = search ALL types (most comprehensive)
    };
    
    return new Promise((resolve, reject) => {
      service.getPlacePredictions(request, async (predictions, status) => {
        if (status !== maps.places.PlacesServiceStatus.OK || !predictions) {
          if (status === maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
          return;
        }
        
        // Get place details for each prediction
        const results: SearchResult[] = [];
        const geocoder = new maps.Geocoder();
        
        for (const prediction of predictions.slice(0, limit)) {
          try {
            const geocodeResult = await new Promise<google.maps.GeocoderResult | null>(
              (resolveGeocode) => {
                geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
                  if (status === 'OK' && results && results.length > 0) {
                    resolveGeocode(results[0]);
                  } else {
                    resolveGeocode(null);
                  }
                });
              }
            );
            
            if (geocodeResult) {
              const location = geocodeResult.geometry.location;
              
              // Extract address components
              const addressComponents = geocodeResult.address_components || [];
              const getComponent = (type: string) => {
                const comp = addressComponents.find(c => c.types.includes(type));
                return comp?.long_name || '';
              };
              
              results.push({
                lat: location.lat(),
                lon: location.lng(),
                display_name: geocodeResult.formatted_address || prediction.description,
                address: {
                  city: getComponent('locality'),
                  town: getComponent('sublocality_level_1'),
                  village: getComponent('sublocality_level_2'),
                  suburb: getComponent('sublocality_level_3'),
                  neighbourhood: getComponent('neighborhood'),
                  road: getComponent('route'),
                  postcode: getComponent('postal_code'),
                  state: getComponent('administrative_area_level_1'),
                  country: getComponent('country'),
                },
                place_id: prediction.place_id,
                properties: {
                  formatted: geocodeResult.formatted_address,
                },
              });
            }
          } catch (error) {
            console.warn('Failed to geocode prediction:', prediction.description, error);
          }
        }
        
        resolve(results);
      });
    });
  } catch (error) {
    console.error('❌ Google Places search error:', error);
    throw error;
  }
}

/**
 * Reverse geocode coordinates to address using Google Geocoding API
 */
export async function reverseGeocodeGoogle(
  lat: number,
  lng: number
): Promise<GeocodedAddress | null> {
  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();
    
    const result = await new Promise<google.maps.GeocoderResult | null>(
      (resolve) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              resolve(results[0]);
            } else {
              resolve(null);
            }
          }
        );
      }
    );
    
    if (!result) {
      return null;
    }
    
    // Extract address components
    const addressComponents = result.address_components || [];
    const getComponent = (type: string) => {
      const comp = addressComponents.find(c => c.types.includes(type));
      return comp?.long_name || undefined;
    };
    
    return {
      latitude: lat, // Use original GPS coordinates
      longitude: lng,
      address: result.formatted_address || '',
      locality: getComponent('sublocality_level_1') || 
                getComponent('sublocality') || 
                getComponent('neighborhood'),
      city: getComponent('locality') || 
            getComponent('administrative_area_level_2') || '',
      state: getComponent('administrative_area_level_1'),
      pincode: getComponent('postal_code'),
      country: getComponent('country') || 'India',
      accuracy: 'high', // GPS-based
    };
  } catch (error) {
    console.error('❌ Google reverse geocoding error:', error);
    return null;
  }
}

/**
 * Create Google Maps marker
 */
export function createGoogleMarker(
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  options?: Partial<google.maps.MarkerOptions>
): google.maps.Marker {
  return new google.maps.Marker({
    map,
    position,
    ...options,
  });
}

/**
 * Create custom HTML marker using AdvancedMarkerElement (if available)
 */
export async function createCustomGoogleMarker(
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  htmlContent: string,
  options?: Partial<google.maps.MarkerOptions>
): Promise<google.maps.Marker> {
  const maps = await loadGoogleMaps();
  
  // Check if AdvancedMarkerElement is available (newer API)
  if ((maps.marker as any)?.AdvancedMarkerElement) {
    const content = document.createElement('div');
    content.innerHTML = htmlContent;
    
    return new (maps.marker as any).AdvancedMarkerElement({
      map,
      position,
      content,
      ...options,
    });
  }
  
  // Fallback to regular marker
  return createGoogleMarker(map, position, options);
}

/**
 * Fit map bounds to show all markers
 */
export function fitBoundsGoogle(
  map: google.maps.Map,
  positions: google.maps.LatLngLiteral[],
  padding: number = 50
): void {
  if (positions.length === 0) return;
  
  const bounds = new google.maps.LatLngBounds();
  positions.forEach(pos => bounds.extend(pos));
  
  map.fitBounds(bounds, padding);
}