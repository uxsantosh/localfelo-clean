import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, X, MapPin } from 'lucide-react';
import { LocalFeloLoader } from './LocalFeloLoader';
import { shouldUseGoogleMaps, isDebugMapsEnabled, isGoogleMapsOnly } from '../config/maps';
import { loadGoogleMaps, createGoogleMarker, fitBoundsGoogle } from '../services/googleMaps';

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
  const googleMarkersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>('leaflet');

  useEffect(() => {
    initializeMap();

    return () => {
      cleanupMap();
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      updateMarkers();
    }
  }, [markers, userLocation]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    // Determine which map provider to use
    const useGoogle = shouldUseGoogleMaps();
    const googleOnly = isGoogleMapsOnly();
    
    if (isDebugMapsEnabled()) {
      console.log('🗺️ MapView: Initializing map provider:', useGoogle ? 'Google Maps' : 'Leaflet');
      console.log('🗺️ Google Maps Only mode:', googleOnly);
      console.log('🗺️ API Key available:', !!import.meta.env?.VITE_GOOGLE_MAPS_API_KEY);
      console.log('🗺️ API Key value:', import.meta.env?.VITE_GOOGLE_MAPS_API_KEY?.substring(0, 20) + '...');
    }

    if (useGoogle) {
      await initGoogleMap();
    } else {
      // Only load Leaflet if Google Maps Only mode is NOT enabled
      if (googleOnly) {
        console.warn('⚠️ Google Maps Only mode enabled - Leaflet fallback disabled');
        setIsLoading(false);
        return;
      }
      await initLeafletMap();
    }
  };

  const initGoogleMap = async () => {
    try {
      console.log('🗺️ initGoogleMap: Starting Google Maps initialization...');
      
      if (isDebugMapsEnabled()) {
        console.log('🗺️ Loading Google Maps JavaScript API...');
      }

      const maps = await loadGoogleMaps();
      
      console.log('✅ Google Maps API loaded successfully!', maps);
      
      if (!mapRef.current || mapInstanceRef.current) return;

      // Determine initial center
      const initialLat = userLocation?.latitude || centerLat || 28.6139;
      const initialLng = userLocation?.longitude || centerLng || 77.2090;
      const initialZoom = userLocation ? 13 : 6;

      if (isDebugMapsEnabled()) {
        console.log('✅ Google Maps loaded, creating map instance...');
      }

      // Create Google Map
      const map = new maps.Map(mapRef.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: initialZoom,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: maps.ControlPosition.TOP_RIGHT,
        },
        streetViewControl: true,
        fullscreenControl: false, // We have our own maximize button
        zoomControl: true,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapInstanceRef.current = map;
      setMapProvider('google');
      setIsLoading(false);

      // Add draggable marker if enabled
      if (allowPinDrag && userLocation && onPinDragEnd) {
        const marker = new maps.Marker({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map,
          draggable: true,
          icon: createLocalFeloPinIcon(),
        });

        draggableMarkerRef.current = marker;

        marker.addListener('dragend', () => {
          const position = marker.getPosition();
          if (position) {
            onPinDragEnd(position.lat(), position.lng());
          }
        });
      }

      // ✅ Call Google-specific update directly (state hasn't updated yet)
      updateGoogleMarkers();

      if (isDebugMapsEnabled()) {
        console.log('✅ Google Map initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to load Google Maps:', error);
      
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
      console.log('🗺️ initLeafletMap: Starting Leaflet initialization...');
      
      const L = await loadLeaflet();
      
      if (!mapRef.current) {
        console.warn('⚠️ Map container ref not available');
        return;
      }
      
      if (mapInstanceRef.current) {
        console.warn('⚠️ Map instance already exists, cleaning up...');
        // Clean up existing instance
        try {
          if (mapProvider === 'leaflet' && typeof mapInstanceRef.current.remove === 'function') {
            mapInstanceRef.current.remove();
          }
        } catch (e) {
          console.warn('Error cleaning up old map:', e);
        }
        mapInstanceRef.current = null;
      }

      // Determine initial center
      const initialLat = userLocation?.latitude || centerLat || 28.6139;
      const initialLng = userLocation?.longitude || centerLng || 77.2090;

      console.log('🗺️ Creating Leaflet map at:', initialLat, initialLng);

      // Create map
      const map = L.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: userLocation ? 13 : 6,
        zoomControl: true,
        attributionControl: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      setMapProvider('leaflet');
      setIsLoading(false);

      // Add draggable pin if enabled
      if (allowPinDrag && userLocation && onPinDragEnd) {
        // ✅ Validate coordinates before creating draggable marker
        if (userLocation.latitude && userLocation.longitude &&
            typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number' &&
            !isNaN(userLocation.latitude) && !isNaN(userLocation.longitude)) {
          const dragIcon = L.divIcon({
            className: 'draggable-pin-marker',
            html: createDraggableLeafletMarkerHTML(),
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
        } else {
          console.warn('⚠️ [MapView] Cannot create draggable marker - invalid user location:', userLocation);
        }
      }

      // ✅ Call Leaflet-specific update directly (state hasn't updated yet)
      updateLeafletMarkers();

      if (isDebugMapsEnabled()) {
        console.log('✅ Leaflet map initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to load Leaflet map:', error);
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

  const updateMarkers = () => {
    console.log('🗺️ [MapView] updateMarkers called, provider:', mapProvider);
    console.log('🗺️ [MapView] Markers to display:', markers.length);
    console.log('🗺️ [MapView] mapInstanceRef.current exists:', !!mapInstanceRef.current);
    
    if (mapProvider === 'google') {
      updateGoogleMarkers();
    } else {
      updateLeafletMarkers();
    }
  };

  const updateGoogleMarkers = () => {
    if (!mapInstanceRef.current) {
      console.log('⚠️ [MapView] updateGoogleMarkers: No map instance');
      return;
    }

    const map = mapInstanceRef.current as google.maps.Map;

    console.log('🗺️ [MapView] updateGoogleMarkers called');
    console.log('🗺️ [MapView] Clearing', googleMarkersRef.current.length, 'existing markers');

    // Clear existing markers
    googleMarkersRef.current.forEach(marker => marker.setMap(null));
    googleMarkersRef.current = [];

    // Add user location marker
    if (userLocation && !allowPinDrag) {
      console.log('🔍 [MapView] Validating user location:', userLocation);
      console.log('🔍 [MapView] userLocation.latitude:', userLocation.latitude, 'type:', typeof userLocation.latitude);
      console.log('🔍 [MapView] userLocation.longitude:', userLocation.longitude, 'type:', typeof userLocation.longitude);
      
      // ✅ Validate coordinates before creating user location marker (fixed to handle 0 values)
      const isValidLat = typeof userLocation.latitude === 'number' && !isNaN(userLocation.latitude) && 
                        userLocation.latitude >= -90 && userLocation.latitude <= 90;
      const isValidLng = typeof userLocation.longitude === 'number' && !isNaN(userLocation.longitude) &&
                        userLocation.longitude >= -180 && userLocation.longitude <= 180;
      
      console.log('🔍 [MapView] isValidLat:', isValidLat, 'isValidLng:', isValidLng);
      
      if (isValidLat && isValidLng) {
        console.log('🗺️ [MapView] Adding user location marker at:', userLocation);
        const userMarker = new google.maps.Marker({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
          zIndex: 1000,
        });
        googleMarkersRef.current.push(userMarker);
      } else {
        console.warn('⚠️ [MapView] Cannot create user location marker - invalid coordinates:', {
          lat: userLocation.latitude,
          lng: userLocation.longitude
        });
      }
    }

    // Add listing/task/wish markers
    if (!allowPinDrag) {
      console.log('🗺️ [MapView] Adding', markers.length, 'content markers');
      markers.forEach((marker, index) => {
        // ✅ Validate coordinates before creating marker (fixed to handle 0 values)
        const isValidLat = typeof marker.latitude === 'number' && !isNaN(marker.latitude) && 
                          marker.latitude >= -90 && marker.latitude <= 90;
        const isValidLng = typeof marker.longitude === 'number' && !isNaN(marker.longitude) &&
                          marker.longitude >= -180 && marker.longitude <= 180;
        
        if (!isValidLat || !isValidLng) {
          console.warn('⚠️ [MapView] Skipping marker with invalid coordinates:', marker.id, marker.latitude, marker.longitude);
          return;
        }

        console.log(`🗺️ [MapView] Creating marker ${index + 1}:`, {
          id: marker.id,
          lat: marker.latitude,
          lng: marker.longitude,
          title: marker.title,
          type: marker.type
        });
        
        const mapMarker = new google.maps.Marker({
          position: { lat: marker.latitude, lng: marker.longitude },
          map,
          icon: createLocalFeloPinIcon(),
          title: marker.title,
          zIndex: 100,
        });

        // Click handler
        mapMarker.addListener('click', () => {
          console.log('🗺️ [MapView] Marker clicked:', marker.id);
          onMarkerClick(marker.id);
        });

        googleMarkersRef.current.push(mapMarker);
      });
      console.log('✅ [MapView] Total Google markers created:', googleMarkersRef.current.length);
    }

    // Fit bounds to show all markers
    fitGoogleMapBounds();
  };

  const updateLeafletMarkers = () => {
    if (!markersLayerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add user location marker
    if (userLocation && !allowPinDrag) {
      // ✅ Validate coordinates before creating user location marker
      if (userLocation.latitude && userLocation.longitude &&
          typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number' &&
          !isNaN(userLocation.latitude) && !isNaN(userLocation.longitude)) {
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
      } else {
        console.warn('⚠️ [MapView] Cannot create user location marker - invalid coordinates:', userLocation);
      }
    }

    // Add listing/task/wish markers
    if (!allowPinDrag) {
      markers.forEach((marker) => {
        // ✅ Validate coordinates before creating marker (fixed to handle 0 values)
        const isValidLat = typeof marker.latitude === 'number' && !isNaN(marker.latitude) && 
                          marker.latitude >= -90 && marker.latitude <= 90;
        const isValidLng = typeof marker.longitude === 'number' && !isNaN(marker.longitude) &&
                          marker.longitude >= -180 && marker.longitude <= 180;
        
        if (!isValidLat || !isValidLng) {
          console.warn('⚠️ [MapView] Skipping marker with invalid coordinates:', marker.id, marker.latitude, marker.longitude);
          return;
        }

        const icon = L.divIcon({
          className: 'custom-marker',
          html: createLeafletMarkerHTML(),
          iconSize: [48, 60],
          iconAnchor: [24, 60],
          popupAnchor: [0, -60],
        });

        const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon })
          .addTo(markersLayerRef.current);

        leafletMarker.on('click', () => {
          onMarkerClick(marker.id);
        });
      });
    }

    // Fit bounds to show all markers
    fitLeafletMapBounds();
  };

  const fitGoogleMapBounds = () => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current as google.maps.Map;
    const positions: google.maps.LatLngLiteral[] = [];

    if (userLocation) {
      positions.push({ lat: userLocation.latitude, lng: userLocation.longitude });
    }

    markers.forEach(marker => {
      positions.push({ lat: marker.latitude, lng: marker.longitude });
    });

    console.log('🗺️ [MapView] fitGoogleMapBounds called with', positions.length, 'positions');
    console.log('🗺️ [MapView] User location:', userLocation);
    console.log('🗺️ [MapView] Markers count:', markers.length);

    if (positions.length > 0) {
      fitBoundsGoogle(map, positions, 50);
    } else if (userLocation) {
      // If no markers but user location exists, center on user
      map.setCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
      map.setZoom(13);
      console.log('🗺️ [MapView] No markers - centering on user location with zoom 13');
    }
  };

  const fitLeafletMapBounds = () => {
    if (!mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const allPoints: [number, number][] = [];

    // ✅ Validate user location before adding to bounds
    if (userLocation && 
        userLocation.latitude && userLocation.longitude &&
        typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number' &&
        !isNaN(userLocation.latitude) && !isNaN(userLocation.longitude)) {
      allPoints.push([userLocation.latitude, userLocation.longitude]);
    }

    // ✅ Validate each marker's coordinates before adding to bounds
    markers.forEach(m => {
      if (m.latitude && m.longitude &&
          typeof m.latitude === 'number' && typeof m.longitude === 'number' &&
          !isNaN(m.latitude) && !isNaN(m.longitude)) {
        allPoints.push([m.latitude, m.longitude]);
      }
    });

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (userLocation && 
               userLocation.latitude && userLocation.longitude &&
               typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number' &&
               !isNaN(userLocation.latitude) && !isNaN(userLocation.longitude)) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 13);
    }
  };

  const cleanupMap = () => {
    // Clean up Google Maps markers
    if (googleMarkersRef.current && googleMarkersRef.current.length > 0) {
      googleMarkersRef.current.forEach(marker => {
        try {
          marker.setMap(null);
        } catch (e) {
          console.warn('Error removing Google marker:', e);
        }
      });
      googleMarkersRef.current = [];
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
        // They're automatically cleaned up when the DOM element is removed
      } catch (e) {
        console.warn('Error cleaning up map:', e);
      }
      mapInstanceRef.current = null;
    }
    
    // Clean up markers layer (Leaflet)
    if (markersLayerRef.current) {
      try {
        markersLayerRef.current.clearLayers();
      } catch (e) {
        console.warn('Error clearing markers layer:', e);
      }
      markersLayerRef.current = null;
    }
    
    // Clean up draggable marker
    if (draggableMarkerRef.current) {
      try {
        if (mapProvider === 'google') {
          draggableMarkerRef.current.setMap(null);
        } else if (typeof draggableMarkerRef.current.remove === 'function') {
          draggableMarkerRef.current.remove();
        }
      } catch (e) {
        console.warn('Error removing draggable marker:', e);
      }
      draggableMarkerRef.current = null;
    }
  };

  const handleMaximizeToggle = () => {
    setIsMaximized(!isMaximized);
    
    // Invalidate/resize map after transition
    setTimeout(() => {
      if (mapInstanceRef.current) {
        if (mapProvider === 'google') {
          google.maps.event.trigger(mapInstanceRef.current, 'resize');
        } else {
          mapInstanceRef.current.invalidateSize();
        }
      }
    }, 300);
  };

  // Helper: Create LocalFelo pin icon for Google Maps
  const createLocalFeloPinIcon = (): google.maps.Icon => {
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="48" height="60" viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg">
          <!-- Pin Head -->
          <circle cx="24" cy="24" r="22" fill="#CDFF00" stroke="white" stroke-width="2"/>
          <!-- LocalFelo Logo -->
          <g transform="translate(9, 9) scale(0.17)">
            <path d="M95.9365 94.7373L138.624 133.494L124.546 149L81.5703 109.982L45.2422 148.536L30 134.173L77.0928 84.1973H37.6211V63.2539H125.604L95.9365 94.7373ZM149.356 85.4785L134.937 100.667L114.133 80.916L128.553 65.7266L149.356 85.4785ZM135.265 32C142.924 32.0002 149.133 38.2092 149.133 45.8682C149.133 53.5272 142.924 59.7361 135.265 59.7363C127.605 59.7363 121.396 53.5273 121.396 45.8682C121.396 38.209 127.605 32 135.265 32Z" fill="black"/>
          </g>
          <!-- Pin Tip - Fixed to point DOWN -->
          <path d="M24 48 L18 58 L30 58 Z" fill="#CDFF00"/>
          <path d="M24 48 L18 58 L30 58 Z" fill="none" stroke="white" stroke-width="1"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(48, 60),
      anchor: new google.maps.Point(24, 58),
    };
  };

  // Helper: Create Leaflet marker HTML
  const createLeafletMarkerHTML = (): string => {
    return `
      <div class="relative flex flex-col items-center cursor-pointer transform transition-transform hover:scale-110" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">
        <div class="relative">
          <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg flex items-center justify-center" style="background: #CDFF00;">
            <svg width="48" height="48" viewBox="0 0 180 180" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
              <path d="M95.9365 94.7373L138.624 133.494L124.546 149L81.5703 109.982L45.2422 148.536L30 134.173L77.0928 84.1973H37.6211V63.2539H125.604L95.9365 94.7373ZM149.356 85.4785L134.937 100.667L114.133 80.916L128.553 65.7266L149.356 85.4785ZM135.265 32C142.924 32.0002 149.133 38.2092 149.133 45.8682C149.133 53.5272 142.924 59.7361 135.265 59.7363C127.605 59.7363 121.396 53.5273 121.396 45.8682C121.396 38.209 127.605 32 135.265 32Z" fill="black"/>
            </svg>
          </div>
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
          <div class="absolute inset-0 bg-[#CDFF00]/30 rounded-full animate-ping"></div>
        </div>
      </div>
    `;
  };

  // Helper: Create draggable Leaflet marker HTML
  const createDraggableLeafletMarkerHTML = (): string => {
    return `
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
    `;
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
          <LocalFeloLoader size="md" text="Loading map..." />
        </div>
      )}

      {/* Control Buttons - Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
        {/* Maximize/Minimize Button */}
        <button
          onClick={handleMaximizeToggle}
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
      <div className="absolute bottom-2 left-2 z-30 bg-white/90 px-2 py-1 rounded text-xs text-muted flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        <span>{markers.length} location{markers.length !== 1 ? 's' : ''}</span>
        {isDebugMapsEnabled() && (
          <span className="ml-2 px-1.5 py-0.5 bg-[#CDFF00] text-black rounded font-bold">
            {mapProvider === 'google' ? 'Google' : 'Leaflet'}
          </span>
        )}
      </div>
    </div>
  );
}