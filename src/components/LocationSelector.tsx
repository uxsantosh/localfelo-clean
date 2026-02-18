import React, { useState, useEffect } from 'react';
import { Navigation, Search, X, Loader2 } from 'lucide-react';
import { detectUserLocation, GeocodedAddress, searchLocations, SearchResult } from '../services/geocoding';
import { LocationMap } from './LocationMap';

interface LocationSelectorProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    locality?: string;
    city: string;
    state?: string;
    pincode?: string;
  }) => void;
  onClose: () => void;
  currentLocation?: {
    latitude: number;
    longitude: number;
    city: string;
  } | null;
}

export function LocationSelector({ 
  onLocationSelect, 
  onClose,
  currentLocation
}: LocationSelectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GeocodedAddress | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Initialize with current location or India center
  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: '',
        city: currentLocation.city,
        country: 'India'
      });
    } else {
      // Default to India center
      setSelectedLocation({
        latitude: 20.5937,
        longitude: 78.9629,
        address: 'India',
        city: 'India',
        country: 'India'
      });
    }
  }, []);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    
    try {
      console.log('📍 [LocationSelector] Starting auto-detect...');
      
      const location = await detectUserLocation();
      
      if (location) {
        console.log('🗺️ LocationSelector - Auto-detect successful:', location);
        setSelectedLocation(location);
        // Force re-render by updating state in next tick
        setTimeout(() => {
          setSelectedLocation(prev => prev ? {...prev} : null);
        }, 0);
      } else {
        console.log('⚠️ [LocationSelector] No location returned');
      }
    } catch (err: any) {
      console.error('❌ [LocationSelector] GPS detection failed:', err);
      
      // Show user-friendly error message
      alert(err.message || 'Unable to detect location. Please use search or drag the map pin.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleMapChange = (lat: number, lng: number, address: string, locationData?: { city?: string; locality?: string; state?: string; pincode?: string }) => {
    console.log('🗺️ LocationSelector - handleMapChange called:', { lat, lng, address, locationData });
    
    // Extract city from address if not provided by geocoding
    let city = locationData?.city || selectedLocation?.city;
    
    // If still no city, try to extract from address
    if (!city) {
      // Try to extract city name from address
      // Address format from Geoapify: "Street, Area, City, State Pincode, Country"
      const parts = address.split(',').map(s => s.trim()).filter(Boolean);
      
      // Usually city is the 2nd or 3rd part (after street and area/locality)
      if (parts.length >= 3) {
        // Try third part (typical city position)
        city = parts[2];
      } else if (parts.length >= 2) {
        // Fall back to second part
        city = parts[1];
      }
      
      console.log('🔍 Extracted city from address:', city);
    }
    
    setSelectedLocation({
      latitude: lat,
      longitude: lng,
      address: address || selectedLocation?.address || '',
      city: city || '',
      locality: locationData?.locality,
      state: locationData?.state,
      pincode: locationData?.pincode,
      country: 'India'
    });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: selectedLocation.address,
        locality: selectedLocation.locality,
        city: selectedLocation.city,
        state: selectedLocation.state,
        pincode: selectedLocation.pincode
      });
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(searchQuery, 8);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearchSelect = (result: SearchResult) => {
    const city = result.address?.city || 
                 result.address?.town || 
                 result.address?.village || 
                 result.address?.county || 
                 '';

    setSelectedLocation({
      latitude: result.lat,
      longitude: result.lon,
      address: result.display_name,
      locality: result.address?.suburb || result.address?.neighbourhood,
      city: city,
      state: result.address?.state,
      pincode: result.address?.postcode,
      country: 'India'
    });

    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header with Search */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors flex-shrink-0"
            style={{ borderRadius: '50%' }}
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search BTM, Koramangala, Indiranagar..."
                className="w-full pl-11 pr-4 py-3 bg-gray-100 border-none text-black placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#CDFF00]"
                style={{ 
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-lg z-50 max-h-80 overflow-y-auto"
                style={{ borderRadius: '12px' }}
              >
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.place_id}-${index}`}
                    onClick={() => handleSearchSelect(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <p className="text-[14px] text-black" style={{ fontWeight: '600' }}>
                      {result.address?.suburb || result.address?.neighbourhood || result.address?.road || 'Location'}
                    </p>
                    <p className="text-[12px] text-gray-600 mt-0.5 line-clamp-1" style={{ fontWeight: '500' }}>
                      {result.display_name}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {showSearchResults && !isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-lg p-4 z-50"
                style={{ borderRadius: '12px' }}
              >
                <p className="text-[13px] text-gray-600 text-center" style={{ fontWeight: '600' }}>
                  No results found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Auto-Detect Button */}
        <div className="px-4 pb-3">
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full py-3 px-4 bg-[#CDFF00] text-black hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ 
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '15px'
            }}
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
              </>
            )}
            <span>Current Location</span>
          </button>
        </div>
      </div>

      {/* Map - Takes remaining space */}
      <div className="flex-1 relative">
        {selectedLocation && (
          <LocationMap
            center={{
              lat: selectedLocation.latitude,
              lng: selectedLocation.longitude
            }}
            onLocationChange={handleMapChange}
            allowPinDrag={true}
            browseMode={true}
          />
        )}
      </div>

      {/* Bottom Bar with Address and Confirm */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4">
        {/* Address Display */}
        {selectedLocation?.address && (
          <div className="mb-3 p-3 bg-gray-50" style={{ borderRadius: '10px' }}>
            <p className="text-[13px] text-gray-600" style={{ fontWeight: '600' }}>
              Selected Location:
            </p>
            <p className="text-[14px] text-black mt-1 line-clamp-2" style={{ fontWeight: '600' }}>
              {selectedLocation.address}
            </p>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedLocation}
          className="w-full py-4 px-4 bg-[#CDFF00] text-black hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '16px'
          }}
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}