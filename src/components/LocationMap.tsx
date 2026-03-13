import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { reverseGeocode } from '../services/geocoding';

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

  useEffect(() => {
    const loadLeaflet = async () => {
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

    const initMap = async () => {
      try {
        const L = await loadLeaflet();
        
        if (!mapRef.current) {
          console.log('Map ref not ready');
          return;
        }
        
        if (mapInstanceRef.current) {
          console.log('Map already initialized');
          return;
        }

        console.log('Initializing map at:', center);

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
          html: `
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
          `,
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

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load map:', error);
        setIsLoading(false);
      }
    };

    const updateLocation = async (lat: number, lng: number) => {
      if (!onLocationChange) return;
      
      setIsUpdatingAddress(true);
      try {
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

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when center changes
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([center.lat, center.lng]);
      mapInstanceRef.current.setView([center.lat, center.lng], 15);
    }
  }, [center.lat, center.lng]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#CDFF00] animate-spin" />
            <p className="text-[14px] text-gray-600" style={{ fontWeight: '600' }}>
              Loading map...
            </p>
          </div>
        </div>
      )}

      {/* Updating Address Indicator */}
      {isUpdatingAddress && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white px-4 py-2 shadow-lg flex items-center gap-2" style={{ borderRadius: '20px' }}>
          <Loader2 className="w-4 h-4 text-[#CDFF00] animate-spin" />
          <span className="text-[13px] text-gray-700" style={{ fontWeight: '600' }}>
            Getting address...
          </span>
        </div>
      )}
    </div>
  );
}