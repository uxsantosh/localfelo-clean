import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface LocationFieldProps {
  currentLocation: {
    city: string;
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  userAddress: string;
  onAddressChange: (address: string) => void;
  onChangeLocation: () => void;
  required?: boolean;
}

export function LocationField({
  currentLocation,
  userAddress,
  onAddressChange,
  onChangeLocation,
  required = true
}: LocationFieldProps) {
  const openInGoogleMaps = () => {
    if (currentLocation?.latitude && currentLocation?.longitude) {
      const url = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-3">
      {/* Current Location Display */}
      <div>
        <label className="block text-[14px] text-black mb-2" style={{ fontWeight: '700' }}>
          Location {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="bg-gray-50 p-3 border border-gray-200" style={{ borderRadius: '8px' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <MapPin className="w-5 h-5 text-[#CDFF00] flex-shrink-0 mt-0.5" style={{ fill: '#CDFF00' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-black" style={{ fontWeight: '700' }}>
                  {currentLocation?.city || 'No location selected'}
                </p>
                {currentLocation?.address && (
                  <p className="text-[12px] text-gray-600 mt-0.5 line-clamp-2" style={{ fontWeight: '500' }}>
                    {currentLocation.address}
                  </p>
                )}
              </div>
            </div>
            
            <button
              type="button"
              onClick={onChangeLocation}
              className="px-3 py-1.5 bg-[#CDFF00] text-black hover:bg-[#b8e600] transition-colors flex-shrink-0"
              style={{ 
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '700'
              }}
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Address Input Field */}
      <div>
        <label className="block text-[14px] text-black mb-2" style={{ fontWeight: '700' }}>
          Full Address (Building, Floor, Street)
        </label>
        <textarea
          value={userAddress}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="E.g., Shop #12, 2nd Floor, MG Road..."
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-[#CDFF00] transition-colors resize-none"
          style={{ 
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '500',
            minHeight: '80px'
          }}
          rows={3}
        />
        <p className="text-[12px] text-gray-500 mt-1.5" style={{ fontWeight: '600' }}>
          Add specific details to help people find you
        </p>
      </div>

      {/* View on Google Maps Button */}
      {currentLocation?.latitude && currentLocation?.longitude && (
        <button
          type="button"
          onClick={openInGoogleMaps}
          className="w-full py-2.5 px-4 bg-white border-2 border-gray-200 text-black hover:border-[#CDFF00] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          style={{ 
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '700'
          }}
        >
          <ExternalLink className="w-4 h-4" />
          <span>View on Google Maps</span>
        </button>
      )}
    </div>
  );
}
