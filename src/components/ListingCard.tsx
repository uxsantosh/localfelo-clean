import React, { useState, useEffect } from 'react';
import { MapPin, Heart } from 'lucide-react';
import { Listing } from '../types';
import { isInWishlist, toggleWishlist } from '../services/wishlist';

interface ListingCardProps {
  listing: Listing;
  onClick: (listing: Listing) => void;
  onWishlistChange?: () => void;
}

export function ListingCard({ listing, onClick, onWishlistChange }: ListingCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  // Debug: Log distance value
  console.log(`[ListingCard] "${listing.title}" - distance:`, listing.distance, 'lat:', listing.latitude, 'lon:', listing.longitude);

  // Function to check and update wishlist status
  const checkWishlistStatus = () => {
    setIsFavorited(isInWishlist(listing.id));
  };

  useEffect(() => {
    checkWishlistStatus();
  }, [listing.id]);

  // Listen for storage changes (login/logout/wishlist updates from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Check if wishlist or auth token changed
      if (e.key?.startsWith('oldcycle_wishlist') || e.key === 'oldcycle_token') {
        checkWishlistStatus();
      }
    };

    // Listen for custom wishlist update event (same tab)
    const handleWishlistUpdate = () => {
      checkWishlistStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, [listing.id]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleWishlist(listing.id);
    setIsFavorited(newState);
    
    // Dispatch custom event to notify other ListingCard instances
    window.dispatchEvent(new Event('wishlist-updated'));
    
    if (onWishlistChange) {
      onWishlistChange();
    }
  };

  return (
    <div
      onClick={() => onClick(listing)}
      className="bg-white border border-gray-200 overflow-hidden hover:border-gray-300 transition-all cursor-pointer relative group"
      style={{ borderRadius: '6px' }}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden" style={{ borderRadius: '6px 6px 0 0' }}>
        <img
          src={listing.images?.[0] || '/placeholder.png'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Wishlist Heart Button - Compact */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:scale-110 transition-all z-10 shadow-sm"
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-all ${
              isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      {/* Content - Ultra Compact */}
      <div className="p-2.5 min-w-0">
        {/* Title - Compact with max 1 line */}
        <h3 className="text-black m-0 mb-1 line-clamp-1 font-semibold text-[12px] sm:text-[13px] leading-tight w-full">
          {listing.title}
        </h3>
        
        {/* Price - Prominent */}
        <p className="m-0 mb-1.5 font-extrabold text-[13px] sm:text-[14px] leading-none text-black">
          ₹{(listing.price || 0).toLocaleString('en-IN')}
        </p>

        {/* Category - Minimal badge */}
        <div className="mb-1">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-[9px] sm:text-[10px] text-gray-700 font-medium">
            <span className="text-[10px]">{listing.categoryEmoji}</span>
            <span className="truncate max-w-[70px] sm:max-w-[100px]">{listing.categoryName}</span>
          </span>
        </div>

        {/* Location - Compact */}
        <div className="flex items-center gap-0.5 text-gray-500 min-w-0 mb-1">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="text-[10px] sm:text-[11px] truncate font-medium">
            {(() => {
              // Filter out "Unknown" values
              const areaName = listing.areaName && listing.areaName !== 'Unknown' ? listing.areaName : '';
              const cityName = listing.cityName && listing.cityName !== 'Unknown' ? listing.cityName : '';
              
              // First try area + city names (space separator, no comma)
              const location = [areaName, cityName].filter(Boolean).join(' ');
              if (location) return location;
              
              // Fall back to address (first 2 parts, space separator)
              if (listing.address) {
                const parts = listing.address.split(',').map(s => s.trim()).filter(Boolean);
                return parts.slice(0, 2).join(' ') || listing.address;
              }
              
              return 'Location not set';
            })()}
          </span>
        </div>

        {/* Distance - BOLD with background for visibility */}
        {listing.distance !== undefined && listing.distance !== null && (
          <div>
            <span 
              className="inline-block px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold" 
              style={{ backgroundColor: '#CDFF00', color: '#000000' }}
            >
              📍 {listing.distance.toFixed(1)} km away
            </span>
          </div>
        )}
      </div>
    </div>
  );
}