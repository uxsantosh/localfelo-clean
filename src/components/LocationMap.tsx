import React, { useRef, useEffect, useState } from 'react';
import { LocalFeloLoader } from './LocalFeloLoader';
import { reverseGeocode } from '../services/geocoding';
import { shouldUseGoogleMaps, isDebugMapsEnabled, isGoogleMapsOnly } from '../config/maps';
import { loadGoogleMaps } from '../services/googleMaps';

interface LocationMapProps {
  center: {
    lat: number;
    lng: number;
  };
  onLocationChange?: (lat: number, lng: number, address: string, locationData?: { city?: string; locality?: string; state?: string; pincode?: string }) => void;
  allowPinDrag?: boolean;
  browseMode?: boolean;
}

export function LocationMap({ 
  center, 
  onLocationChange,
  allowPinDrag = true,
  browseMode = false
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>('leaflet');

  useEffect(() => {
    initializeMap();

    return () => {
      cleanupMap();
    };
  }, []);

  // Update marker and map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && !isLoading) {
      if (mapProvider === 'google') {
        // Google Maps
        markerRef.current.setPosition({ lat: center.lat, lng: center.lng });
        mapInstanceRef.current.setCenter({ lat: center.lat, lng: center.lng });
      } else {
        // Leaflet
        markerRef.current.setLatLng([center.lat, center.lng]);
        mapInstanceRef.current.setView([center.lat, center.lng], 15);
      }
    }
  }, [center.lat, center.lng, isLoading, mapProvider]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    // Determine which map provider to use
    const useGoogle = shouldUseGoogleMaps();
    
    if (isDebugMapsEnabled()) {
      console.log('🗺️ LocationMap: Initializing map provider:', useGoogle ? 'Google Maps' : 'Leaflet');
    }

    if (useGoogle) {
      await initGoogleMap();
    } else {
      await initLeafletMap();
    }
  };

  const initGoogleMap = async () => {
    try {
      console.log('🗺️ LocationMap: Starting Google Maps initialization...');
      
      const maps = await loadGoogleMaps();
      
      if (!mapRef.current || mapInstanceRef.current) return;

      console.log('✅ LocationMap: Google Maps loaded, creating map instance...');

      // Create Google Map
      const map = new maps.Map(mapRef.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Create draggable marker
      const marker = new maps.Marker({
        position: { lat: center.lat, lng: center.lng },
        map,
        draggable: allowPinDrag,
        icon: createGoogleMapsPinIcon(),
      });

      markerRef.current = marker;

      // Handle drag end
      if (allowPinDrag) {
        marker.addListener('dragend', async () => {
          const position = marker.getPosition();
          if (position) {
            await updateLocation(position.lat(), position.lng());
          }
        });
      }

      // Handle map click in browse mode
      if (browseMode) {
        map.addListener('click', async (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            marker.setPosition({ lat, lng });
            await updateLocation(lat, lng);
          }
        });
      }

      setMapProvider('google');
      setIsLoading(false);

      if (isDebugMapsEnabled()) {
        console.log('✅ LocationMap: Google Map initialized successfully');
      }
    } catch (error) {
      console.error('❌ LocationMap: Failed to load Google Maps:', error);
      
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
      console.log('🗺️ LocationMap: Starting Leaflet initialization...');
      
      const L = await loadLeaflet();
      
      if (!mapRef.current) {
        console.warn('⚠️ LocationMap: Map container ref not available');
        return;
      }
      
      if (mapInstanceRef.current) {
        console.log('LocationMap: Map already initialized');
        return;
      }

      console.log('🗺️ LocationMap: Creating Leaflet map at:', center);

      // Create map
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: false,
        touchZoom: true,
        dragging: true
      }).setView([center.lat, center.lng], 15);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Create draggable pin marker
      const pinIcon = L.divIcon({
        className: 'location-pin-marker',
        html: createLeafletPinHTML(),
        iconSize: [56, 80],
        iconAnchor: [28, 70],
      });

      markerRef.current = L.marker([center.lat, center.lng], {
        icon: pinIcon,
        draggable: allowPinDrag,
      }).addTo(map);

      // Handle drag end
      if (allowPinDrag) {
        markerRef.current.on('dragend', async () => {
          const position = markerRef.current.getLatLng();
          await updateLocation(position.lat, position.lng);
        });
      }

      // Handle map click in browse mode
      if (browseMode) {
        map.on('click', async (e: any) => {
          const { lat, lng } = e.latlng;
          markerRef.current.setLatLng([lat, lng]);
          await updateLocation(lat, lng);
        });
      }

      setMapProvider('leaflet');
      setIsLoading(false);

      if (isDebugMapsEnabled()) {
        console.log('✅ LocationMap: Leaflet map initialized successfully');
      }
    } catch (error) {
      console.error('❌ LocationMap: Failed to load Leaflet map:', error);
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
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return (window as any).L;
  };

  const updateLocation = async (lat: number, lng: number) => {
    if (!onLocationChange) return;
    
    setIsUpdatingAddress(true);
    try {
      // ✅ OPTIMIZATION: Start geocoding immediately without artificial delay
      const geocoded = await reverseGeocode(lat, lng);
      console.log('📍 LocationMap - Geocoded result:', geocoded);
      
      onLocationChange(
        lat, 
        lng, 
        geocoded?.address || '',
        {
          city: geocoded?.city,
          locality: geocoded?.locality,
          state: geocoded?.state,
          pincode: geocoded?.pincode
        }
      );
    } catch (error) {
      console.error('Failed to get address:', error);
      onLocationChange(lat, lng, '');
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const cleanupMap = () => {
    // Clean up marker
    if (markerRef.current) {
      try {
        if (mapProvider === 'google') {
          markerRef.current.setMap(null);
        } else if (typeof markerRef.current.remove === 'function') {
          markerRef.current.remove();
        }
      } catch (e) {
        console.warn('Error removing marker:', e);
      }
      markerRef.current = null;
    }

    // Clean up map instance
    if (mapInstanceRef.current) {
      try {
        // Check if it's a Leaflet map by checking for the remove method
        if (typeof mapInstanceRef.current.remove === 'function') {
          // It's a Leaflet map
          mapInstanceRef.current.remove();
        }
        // Google Maps instances don't need explicit cleanup
      } catch (e) {
        console.warn('Error cleaning up map:', e);
      }
      mapInstanceRef.current = null;
    }
  };

  // Helper: Create Google Maps pin icon
  const createGoogleMapsPinIcon = (): google.maps.Icon => {
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="56" height="80" viewBox="0 0 56 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Pin Head -->
          <circle cx="28" cy="28" r="26" fill="#CDFF00" stroke="white" stroke-width="3"/>
          <!-- LocalFelo Logo -->
          <g transform="translate(8, 8) scale(0.2)">
            <path d="M95.9365 94.7373L138.624 133.494L124.546 149L81.5703 109.982L45.2422 148.536L30 134.173L77.0928 84.1973H37.6211V63.2539H125.604L95.9365 94.7373ZM149.356 85.4785L134.937 100.667L114.133 80.916L128.553 65.7266L149.356 85.4785ZM135.265 32C142.924 32.0002 149.133 38.2092 149.133 45.8682C149.133 53.5272 142.924 59.7361 135.265 59.7363C127.605 59.7363 121.396 53.5273 121.396 45.8682C121.396 38.209 127.605 32 135.265 32Z" fill="black"/>
          </g>
          <!-- Pin Tip - Fixed to point DOWN -->
          <path d="M28 56 L21 68 L35 68 Z" fill="#CDFF00"/>
          <path d="M28 56 L21 68 L35 68 Z" fill="none" stroke="white" stroke-width="1.5"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(56, 80),
      anchor: new google.maps.Point(28, 68),
    };
  };

  // Helper: Create Leaflet pin HTML
  const createLeafletPinHTML = (): string => {
    return `
      <div class="relative flex flex-col items-center ${allowPinDrag ? 'cursor-move' : 'cursor-default'}" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));">
        <div class="relative">
          <div class="w-14 h-14 rounded-full overflow-hidden border-3 border-white shadow-xl flex items-center justify-center" style="background: #CDFF00;">
            <svg width="56" height="56" viewBox="0 0 180 180" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
              <path d="M95.9365 94.7373L138.624 133.494L124.546 149L81.5703 109.982L45.2422 148.536L30 134.173L77.0928 84.1973H37.6211V63.2539H125.604L95.9365 94.7373ZM149.356 85.4785L134.937 100.667L114.133 80.916L128.553 65.7266L149.356 85.4785ZM135.265 32C142.924 32.0002 149.133 38.2092 149.133 45.8682C149.133 53.5272 142.924 59.7361 135.265 59.7363C127.605 59.7363 121.396 53.5273 121.396 45.8682C121.396 38.209 127.605 32 135.265 32Z" fill="black"/>
            </svg>
          </div>
          <div class="absolute left-1/2 -translate-x-1/2 -bottom-2.5">
            <div style="
              width: 0;
              height: 0;
              border-left: 10px solid transparent;
              border-right: 10px solid transparent;
              border-top: 14px solid #CDFF00;
              filter: drop-shadow(0 3px 4px rgba(0,0,0,0.2));
            "></div>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-50">
          <LocalFeloLoader size="md" text="Loading map..." />
        </div>
      )}

      {/* Updating Address Indicator */}
      {isUpdatingAddress && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white px-4 py-2 shadow-lg flex items-center gap-2" style={{ borderRadius: '20px' }}>
          <div className="scale-50">
            <LocalFeloLoader size="sm" text="" />
          </div>
          <span className="text-[13px] text-gray-700" style={{ fontWeight: '600' }}>
            Getting address...
          </span>
        </div>
      )}

      {/* Map Provider Badge (Debug Mode) */}
      {isDebugMapsEnabled() && !isLoading && (
        <div className="absolute bottom-2 right-2 z-30 bg-[#CDFF00] px-2 py-1 rounded text-xs font-bold text-black">
          {mapProvider === 'google' ? 'Google Maps' : 'Leaflet'}
        </div>
      )}
    </div>
  );
}