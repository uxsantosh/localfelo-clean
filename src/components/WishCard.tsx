import React from 'react';
import { MapPin, IndianRupee, Clock, Heart } from 'lucide-react';
import { Wish } from '../types';
import { formatDistanceToNow } from '../utils/dateFormatter';

interface WishCardProps {
  wish: Wish;
  onClick: () => void;
  onChatClick?: ((wish: Wish) => void) | ((wish: Wish) => Promise<void>);
}

export function WishCard({ wish, onClick, onChatClick }: WishCardProps) {
  // Debug: Log distance value
  console.log(`[WishCard] "${wish.title}" - distance:`, wish.distance, 'lat:', wish.latitude, 'lon:', wish.longitude);
  
  const getUrgencyBadgeClass = (urgency: string) => {
    switch (urgency) {
      case 'asap': return 'bg-red-50 text-red-700';
      case 'today': return 'bg-[#CDFF00]/60 text-black';
      case 'flexible': return 'bg-[#CDFF00] text-black';
      default: return 'bg-gray-50 text-gray-700';
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
      style={{ minHeight: '160px', borderRadius: '8px' }}
    >
      {/* Header - Title + Urgency Badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-bold text-gray-900 text-base leading-tight flex-1 line-clamp-2">
          {wish.title}
        </h3>
        {wish.urgency && (
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${getUrgencyBadgeClass(wish.urgency)}`}>
            {wish.urgency}
          </span>
        )}
      </div>

      {/* Budget */}
      <div className="mb-3">
        {(wish.budgetMin || wish.budgetMax) ? (
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-bold text-black text-sm">
              {(wish.budgetMin !== undefined && wish.budgetMin !== null) && (wish.budgetMax !== undefined && wish.budgetMax !== null)
                ? `₹${wish.budgetMin.toLocaleString('en-IN')}-${wish.budgetMax.toLocaleString('en-IN')}`
                : (wish.budgetMin !== undefined && wish.budgetMin !== null)
                ? `₹${wish.budgetMin.toLocaleString('en-IN')}+`
                : (wish.budgetMax !== undefined && wish.budgetMax !== null)
                ? `Up to ₹${wish.budgetMax.toLocaleString('en-IN')}`
                : ''}
            </span>
          </div>
        ) : (
          <span className="text-sm font-semibold text-gray-600">Budget not specified</span>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 mb-3">
        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-xs text-gray-600 truncate">
          {(() => {
            // Filter out "Unknown" values
            const areaName = wish.areaName && wish.areaName !== 'Unknown' ? wish.areaName : '';
            const cityName = wish.cityName && wish.cityName !== 'Unknown' ? wish.cityName : '';
            
            // First try area + city names
            const location = [areaName, cityName].filter(Boolean).join(', ');
            if (location) return location;
            
            // Fall back to address (first 2 parts)
            if (wish.address) {
              const parts = wish.address.split(',').map(s => s.trim()).filter(Boolean);
              return parts.slice(0, 2).join(', ') || wish.address;
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