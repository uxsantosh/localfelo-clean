import React, { useEffect, useRef, useState } from 'react';
import { MapPin, X, Maximize2, Minimize2 } from 'lucide-react';

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  price?: number;
  type: 'wish' | 'task' | 'listing';
  categoryEmoji?: string;
  status?: string;
}

interface MapViewProps {
  markers: MapMarker[];
  onMarkerClick: (id: string) => void;
  onClose?: () => void;
  centerLat?: number;
  centerLng?: number;
  showClose?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
  allowPinDrag?: boolean;
  onPinDragEnd?: (lat: number, lng: number) => void;
}

export function MapView({ 
  markers, 
  onMarkerClick, 
  onClose, 
  centerLat, 
  centerLng,
  showClose = false,
  userLocation,
  allowPinDrag = false,
  onPinDragEnd,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const draggableMarkerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Dynamically load Leaflet CSS and JS
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
        
        if (!mapRef.current || mapInstanceRef.current) return;

        // Determine initial center - use user location if available, otherwise provided center or default
        const initialLat = userLocation?.latitude || centerLat || 28.6139;
        const initialLng = userLocation?.longitude || centerLng || 77.2090;

        // Create map
        const map = L.map(mapRef.current).setView([initialLat, initialLng], userLocation ? 13 : 6);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);

        // Add draggable pin if enabled
        if (allowPinDrag && userLocation && onPinDragEnd) {
          const dragIcon = L.divIcon({
            className: 'draggable-pin-marker',
            html: `
              <div class="relative flex flex-col items-center cursor-move" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));">
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
                <div class="mt-2 px-2 py-1 bg-black text-white text-xs font-bold rounded" style="white-space: nowrap;">
                  Drag to adjust
                </div>
              </div>
            `,
            iconSize: [56, 90],
            iconAnchor: [28, 70],
          });

          draggableMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
            icon: dragIcon,
            draggable: true,
          }).addTo(map);

          draggableMarkerRef.current.on('dragend', () => {
            const position = draggableMarkerRef.current.getLatLng();
            onPinDragEnd(position.lat, position.lng);
          });
        } else if (userLocation) {
          // Add regular user location marker
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute w-16 h-16 bg-blue-500/20 rounded-full animate-pulse"></div>
                <div class="relative z-10 w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div class="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
            .addTo(markersLayerRef.current);
        }

        setIsLoading(false);

        // Add markers (only if not in drag mode)
        if (!allowPinDrag) {
          updateMarkers(L);
        }
      } catch (error) {
        console.error('Failed to load map:', error);
        setIsLoading(false);
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

  useEffect(() => {
    const L = (window as any).L;
    if (L && mapInstanceRef.current) {
      updateMarkers(L);
    }
  }, [markers, userLocation]);

  const updateMarkers = (L: any) => {
    if (!markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Re-add user location marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-16 h-16 bg-blue-500/20 rounded-full animate-pulse"></div>
            <div class="relative z-10 w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <div class="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .addTo(markersLayerRef.current);
    }

    // Add new markers with LocalFelo branding as location pins
    markers.forEach((marker) => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer transform transition-transform hover:scale-110" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">
            <!-- Location Pin Shape with LocalFelo Branding -->
            <div class="relative">
              <!-- Pin Head (Circle with Logo) -->
              <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg flex items-center justify-center" style="background: #CDFF00;">
                <svg width="48" height="48" viewBox="0 0 180 180" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                  <path d="M95.9365 94.7373L138.624 133.494L124.546 149L81.5703 109.982L45.2422 148.536L30 134.173L77.0928 84.1973H37.6211V63.2539H125.604L95.9365 94.7373ZM149.356 85.4785L134.937 100.667L114.133 80.916L128.553 65.7266L149.356 85.4785ZM135.265 32C142.924 32.0002 149.133 38.2092 149.133 45.8682C149.133 53.5272 142.924 59.7361 135.265 59.7363C127.605 59.7363 121.396 53.5273 121.396 45.8682C121.396 38.209 127.605 32 135.265 32Z" fill="black"/>
                </svg>
              </div>
              <!-- Pin Tip (Triangle) -->
              <div class="absolute left-1/2 -translate-x-1/2 -bottom-2">
                <div style="
                  width: 0;
                  height: 0;
                  border-left: 8px solid transparent;
                  border-right: 8px solid transparent;
                  border-top: 12px solid #CDFF00;
                  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.15));
                "></div>
              </div>
              <!-- Ping Effect -->
              <div class="absolute inset-0 bg-[#CDFF00]/30 rounded-full animate-ping"></div>
            </div>
          </div>
        `,
        iconSize: [48, 60],
        iconAnchor: [24, 60],
        popupAnchor: [0, -60],
      });

      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon })
        .addTo(markersLayerRef.current);

      // Click on marker directly navigates to detail page
      leafletMarker.on('click', () => {
        onMarkerClick(marker.id);
      });
    });

    // Fit bounds to show all markers and user location
    if (markers.length > 0 && userLocation) {
      const allPoints = [
        ...markers.map(m => [m.latitude, m.longitude]),
        [userLocation.latitude, userLocation.longitude]
      ];
      const bounds = L.latLngBounds(allPoints);
      mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
      mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (userLocation) {
      // If no markers but user location exists, center on user
      mapInstanceRef.current?.setView([userLocation.latitude, userLocation.longitude], 13);
    }
  };

  return (
    <div 
      className={`${
        isMaximized 
          ? 'fixed inset-0 z-[9999] bg-white' 
          : 'relative w-full h-full'
      } transition-all duration-300`}
    >
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Control Buttons - Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
        {/* Maximize/Minimize Button */}
        <button
          onClick={() => {
            setIsMaximized(!isMaximized);
            // Invalidate map size after transition
            setTimeout(() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
              }
            }, 300);
          }}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          aria-label={isMaximized ? 'Minimize map' : 'Maximize map'}
        >
          {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Close Button (only when maximized or showClose is true) */}
        {(showClose || isMaximized) && onClose && (
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Close map"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Map Attribution Note */}
      <div className="absolute bottom-2 left-2 z-30 bg-white/90 px-2 py-1 rounded text-xs text-muted">
        <MapPin className="w-3 h-3 inline mr-1" />
        {markers.length} location{markers.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}