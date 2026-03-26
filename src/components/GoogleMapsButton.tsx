// =====================================================
// Google Maps Button - Simple Deep Link Navigation
// Works on Android & iOS without API keys
// =====================================================

import { Navigation } from 'lucide-react';

interface GoogleMapsButtonProps {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GoogleMapsButton({
  latitude,
  longitude,
  label = 'Open in Google Maps',
  className = '',
  size = 'md',
}: GoogleMapsButtonProps) {
  const handleOpenMaps = () => {
    // Simple Google Maps URL that works on all platforms
    // No API key needed, no SDK, works on Android & iOS
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(mapsUrl, '_blank');
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={handleOpenMaps}
      className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[4px] font-medium transition-colors ${sizeClasses[size]} ${className}`}
    >
      <Navigation className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{label}</span>
    </button>
  );
}
