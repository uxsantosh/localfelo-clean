import React, { useRef, useEffect, useState } from 'react';
import { Navigation, Loader2 } from 'lucide-react';
import { LocalFeloLoader } from './LocalFeloLoader';
import { reverseGeocode } from '../services/geocoding';
import { shouldUseGoogleMaps, isDebugMapsEnabled, isGoogleMapsOnly } from '../config/maps';
import { loadGoogleMaps } from '../services/googleMaps';

interface LocationMapNativeProps {
  center: {
    lat: number;
    lng: number;
  };
  onLocationChange?: (lat: number, lng: number, address: string, locationData?: { city?: string; locality?: string; state?: string; pincode?: string }) => void;
  onCurrentLocationClick?: () => void;
  currentLocationLoading?: boolean;
}

/**
 * Native-app style location picker (Swiggy/Ola/Uber UX)
 * - Pin is FIXED in the center of the screen
 * - Map moves underneath the pin
 * - On drag end, reverse geocode the center position
 * - Smooth animations and transitions
 */
export function LocationMapNative({ 
  center, 
  onLocationChange,
  onCurrentLocationClick,
  currentLocationLoading = false
}: LocationMapNativeProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>('leaflet');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    initializeMap();

    return () => {
      cleanupMap();
    };
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      if (mapProvider === 'google') {
        // Google Maps - use panTo for smooth animation
        mapInstanceRef.current.panTo({ lat: center.lat, lng: center.lng });
      } else {
        // Leaflet - use setView with current zoom and smooth animation
        const currentZoom = mapInstanceRef.current.getZoom();
        mapInstanceRef.current.setView([center.lat, center.lng], currentZoom, {
          animate: true,
          duration: 0.5
        });
      }
    }
  }, [center.lat, center.lng, isLoading, mapProvider]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    // Determine which map provider to use
    const useGoogle = shouldUseGoogleMaps();
    
    if (isDebugMapsEnabled()) {
      console.log('🗺️ LocationMapNative: Initializing map provider:', useGoogle ? 'Google Maps' : 'Leaflet');
    }

    if (useGoogle) {
      await initGoogleMap();
    } else {
      await initLeafletMap();
    }
  };

  const initGoogleMap = async () => {
    try {
      console.log('🗺️ LocationMapNative: Starting Google Maps initialization...');
      
      const maps = await loadGoogleMaps();
      
      if (!mapRef.current || mapInstanceRef.current) return;

      console.log('✅ LocationMapNative: Google Maps loaded, creating map instance...');

      // Create Google Map
      const map = new maps.Map(mapRef.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: 'greedy', // Allow single-finger drag
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Listen to drag events
      map.addListener('dragstart', () => {
        setIsDragging(true);
      });

      map.addListener('dragend', async () => {
        setIsDragging(false);
        const center = map.getCenter();
        if (center) {
          await updateLocation(center.lat(), center.lng());
        }
      });

      // Also update on zoom change (center might shift slightly)
      map.addListener('zoom_changed', async () => {
        if (!isDragging) {
          const center = map.getCenter();
          if (center) {
            await updateLocation(center.lat(), center.lng());
          }
        }
      });

      setMapProvider('google');
      setIsLoading(false);

      if (isDebugMapsEnabled()) {
        console.log('✅ LocationMapNative: Google Map initialized successfully');
      }
    } catch (error) {
      console.error('❌ LocationMapNative: Failed to load Google Maps:', error);
      
      // Only fallback to Leaflet if Google Maps Only mode is disabled
      const googleOnly = isGoogleMapsOnly();
      if (googleOnly) {
        console.error('⚠️ Google Maps Only mode - cannot fallback to Leaflet');
        setIsLoading(false);
        return;
      }
      
      console.log('📍 Falling back to Leaflet...');
      await initLeafletMap();
    }
  };

  const initLeafletMap = async () => {
    try {
      console.log('🗺️ LocationMapNative: Starting Leaflet initialization...');
      
      const L = await loadLeaflet();
      
      if (!mapRef.current) {
        console.warn('⚠️ LocationMapNative: Map container ref not available');
        setIsLoading(false);
        return;
      }
      
      if (mapInstanceRef.current) {
        console.log('LocationMapNative: Map already initialized');
        return;
      }

      console.log('🗺️ LocationMapNative: Creating Leaflet map at:', center);

      // Create map
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: false,
        touchZoom: true,
        dragging: true,
        tap: true,
        tapTolerance: 15,
      }).setView([center.lat, center.lng], 16);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Listen to drag events
      map.on('dragstart', () => {
        setIsDragging(true);
      });

      map.on('dragend', async () => {
        setIsDragging(false);
        const center = map.getCenter();
        await updateLocation(center.lat, center.lng);
      });

      // Also update on zoom change
      map.on('zoomend', async () => {
        if (!isDragging) {
          const center = map.getCenter();
          await updateLocation(center.lat, center.lng);
        }
      });

      setMapProvider('leaflet');
      setIsLoading(false);

      if (isDebugMapsEnabled()) {
        console.log('✅ LocationMapNative: Leaflet map initialized successfully');
      }
    } catch (error) {
      console.error('❌ LocationMapNative: Failed to load Leaflet map:', error);
      setIsLoading(false);
    }
  };

  const loadLeaflet = async (): Promise<any> => {
    // ⚠️ CRITICAL: Prevent Leaflet from loading if Google Maps Only mode is enabled
    if (isGoogleMapsOnly()) {
      console.warn('⚠️ Leaflet loading blocked - Google Maps Only mode is enabled');
      throw new Error('Leaflet is disabled in Google Maps Only mode');
    }

    // Load CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Load JS
    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }

    return (window as any).L;
  };

  const updateLocation = async (lat: number, lng: number) => {
    if (!onLocationChange) return;

    setIsUpdatingAddress(true);
    
    try {
      const result = await reverseGeocode(lat, lng);
      console.log('📍 Reverse geocode result:', result);
      
      onLocationChange(lat, lng, result.address, {
        city: result.city,
        locality: result.locality,
        state: result.state,
        pincode: result.pincode,
      });
    } catch (error) {
      console.error('Failed to reverse geocode:', error);
      onLocationChange(lat, lng, 'Location selected', {});
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const cleanupMap = () => {
    if (mapInstanceRef.current) {
      // Check if it's a Google Maps instance by checking for panTo method
      if (typeof mapInstanceRef.current.panTo === 'function') {
        // Google Maps cleanup
        try {
          if (typeof google !== 'undefined' && google.maps?.event) {
            google.maps.event.clearInstanceListeners(mapInstanceRef.current);
          }
        } catch (e) {
          console.warn('Failed to clean up Google Maps:', e);
        }
      } else if (typeof mapInstanceRef.current.remove === 'function') {
        // Leaflet cleanup
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Failed to clean up Leaflet map:', e);
        }
      }
      mapInstanceRef.current = null;
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Center Pin (Fixed in center, animates when dragging) - ALWAYS VISIBLE */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none z-[9999]">
        <div 
          className="transition-all duration-150"
          style={{ 
            filter: isDragging 
              ? 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))' 
              : 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3))',
            transform: isDragging ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          <svg width="64" height="80" viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shadow */}
            <ellipse cx="32" cy="74" rx="14" ry="5" fill="black" opacity="0.3" />
            
            {/* Pin body - Bright green with black border */}
            <path
              d="M32 0C17.64 0 6 11.64 6 26C6 42 32 70 32 70C32 70 58 42 58 26C58 11.64 46.36 0 32 0Z"
              fill="#CDFF00"
              stroke="#000000"
              strokeWidth="3"
            />
            
            {/* Inner circle - Black dot */}
            <circle cx="32" cy="26" r="10" fill="#000000" />
            <circle cx="32" cy="26" r="5" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
          <LocalFeloLoader size="lg" text="Loading map..." />
        </div>
      )}

      {/* Address Loading Indicator */}
      {isUpdatingAddress && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-20 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-black">Updating address...</span>
        </div>
      )}

      {/* Current Location Button */}
      {onCurrentLocationClick && (
        <button
          onClick={onCurrentLocationClick}
          disabled={currentLocationLoading}
          className="absolute bottom-20 right-4 bg-white hover:bg-gray-50 text-black p-3 rounded-full shadow-lg z-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Go to current location"
        >
          {currentLocationLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <Navigation className="w-6 h-6 text-primary" />
          )}
        </button>
      )}
    </div>
  );
}