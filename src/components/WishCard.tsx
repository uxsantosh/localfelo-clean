import React, { useState, useEffect } from 'react';
import { MapPin, IndianRupee, Clock, Heart } from 'lucide-react';
import { Wish } from '../types';
import { formatDistanceToNow } from '../utils/dateFormatter';
import { getProductCategoryPath } from '../services/productCategories';

interface WishCardProps {
  wish: Wish;
  onClick: () => void;
  onChatClick?: ((wish: Wish) => void) | ((wish: Wish) => Promise<void>);
}

export function WishCard({ wish, onClick, onChatClick }: WishCardProps) {
  // ✅ NEW: Load product category path
  const [categoryPath, setCategoryPath] = useState<string>('');
  
  useEffect(() => {
    if (wish.subcategoryId) {
      getProductCategoryPath(wish.categoryId, wish.subcategoryId)
        .then(path => setCategoryPath(path))
        .catch(err => console.error('Failed to load category path:', err));
    }
  }, [wish.categoryId, wish.subcategoryId]);
  
  // Debug: Log distance value
  console.log(`[WishCard] "${wish.title}" - distance:`, wish.distance, 'lat:', wish.latitude, 'lon:', wish.longitude);
  
  const getUrgencyBadgeClass = (urgency: string) => {
    switch (urgency) {
      case 'asap': return 'bg-red-100 text-red-800 border border-red-200';
      case 'today': return 'bg-[#CDFF00] text-black border border-[#CDFF00]';
      case 'flexible': return 'bg-blue-50 text-blue-700 border border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'asap': return 'ASAP';
      case 'today': return 'TODAY';
      case 'flexible': return 'FLEXIBLE';
      default: return 'FLEXIBLE';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <div 
      className="bg-white border border-gray-200 p-4 cursor-pointer hover:border-black hover:shadow-sm transition-all flex flex-col"
      onClick={onClick}
      style={{ minHeight: '180px', borderRadius: '8px' }}
    >
      {/* Header - Title + Urgency Badge - 2 lines with proper spacing */}
      <div className="flex items-start justify-between gap-3 mb-3" style={{ minHeight: '48px' }}>
        <h3 className="font-bold text-gray-900 text-base leading-snug flex-1 line-clamp-2">
          {wish.title}
        </h3>
        {wish.urgency && (
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 h-fit ${getUrgencyBadgeClass(wish.urgency)}`}>
            {getUrgencyLabel(wish.urgency)}
          </span>
        )}
      </div>

      {/* Budget */}
      <div className="mb-3">
        {(wish.budgetMin || wish.budgetMax) ? (
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-bold text-black text-sm">
              {(() => {
                const min = wish.budgetMin;
                const max = wish.budgetMax;
                
                // ✅ FIX: Don't show range if min and max are the same
                if (min !== undefined && min !== null && max !== undefined && max !== null) {
                  if (min === max) {
                    return `₹${min.toLocaleString('en-IN')}`;
                  } else {
                    return `₹${min.toLocaleString('en-IN')}-${max.toLocaleString('en-IN')}`;
                  }
                } else if (min !== undefined && min !== null) {
                  return `₹${min.toLocaleString('en-IN')}+`;
                } else if (max !== undefined && max !== null) {
                  return `Up to ₹${max.toLocaleString('en-IN')}`;
                }
                return '';
              })()}
            </span>
          </div>
        ) : (
          <span className="text-sm font-semibold text-gray-600">Budget not specified</span>
        )}
      </div>

      {/* ✅ NEW: Product Category Pill */}
      {categoryPath && (
        <div className="mb-3">
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#CDFF00] border border-black rounded text-xs font-medium">
            {categoryPath}
            {wish.productName && <span> • {wish.productName}</span>}
          </div>
        </div>
      )}

      {/* Location */}
      <div className="flex items-center gap-1.5 mb-3">
        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-xs text-gray-600 truncate">
          {(() => {
            // ✅ FIX: Improved location display logic
            // Priority: 1. areaName + cityName, 2. area + city, 3. address
            const areaName = wish.areaName && wish.areaName !== 'Unknown' && wish.areaName !== 'unknown' ? wish.areaName : '';
            const cityName = wish.cityName && wish.cityName !== 'Unknown' && wish.cityName !== 'unknown' ? wish.cityName : '';
            const area = wish.area && wish.area !== 'Unknown' && wish.area !== 'unknown' ? wish.area : '';
            const city = wish.city && wish.city !== 'Unknown' && wish.city !== 'unknown' ? wish.city : '';
            
            // Try areaName + cityName first
            if (areaName && cityName) {
              return `${areaName}, ${cityName}`;
            }
            
            // Try area + city
            if (area && city) {
              return `${area}, ${city}`;
            }
            
            // Try just cityName or city
            if (cityName) return cityName;
            if (city) return city;
            
            // Fall back to address (first 2 parts)
            if (wish.address) {
              const parts = wish.address.split(',').map(s => s.trim()).filter(Boolean);
              if (parts.length > 0) {
                return parts.slice(0, 2).join(', ');
              }
            }
            
            return 'Location not set';
          })()}
        </span>
      </div>

      {/* Bottom Row - Distance + Time */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-gray-100">
        <div>
          {wish.distance !== undefined && wish.distance !== null && (
            <span className="text-xs font-bold text-black">
              📍 {wish.distance.toFixed(1)} km
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{formatTime(new Date(wish.createdAt))}</span>
        </div>
      </div>
    </div>
  );
}