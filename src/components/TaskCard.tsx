import React from 'react';
import { MapPin, Clock, IndianRupee, Briefcase } from 'lucide-react';
import { Task } from '../types';
import { formatDistanceToNow } from '../utils/dateFormatter';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onChatClick?: () => void;
  currentUserId?: string | null; // Add userId for privacy checks
}

export function TaskCard({ task, onClick, onChatClick }: TaskCardProps) {
  // Debug: Log task data
  console.log(`[TaskCard] "${task.title}":`, {
    price: task.price,
    isNegotiable: task.isNegotiable,
    distance: task.distance,
    lat: task.latitude,
    lon: task.longitude
  });
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'negotiating': return 'bg-blue-50 text-blue-700';
      case 'open': return 'bg-[#CDFF00] text-black';
      case 'accepted': return 'bg-blue-50 text-blue-700';
      case 'in_progress': return 'bg-[#CDFF00]/60 text-black';
      case 'completed': return 'bg-gray-50 text-gray-700';
      case 'closed': return 'bg-red-50 text-red-700';
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
      {/* Header - Title + Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-bold text-gray-900 text-base leading-tight flex-1 line-clamp-2">
          {task.title}
        </h3>
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${getStatusClass(task.status)}`}>
          OPEN
        </span>
      </div>

      {/* Price/Earnings - Prominent with bright green */}
      <div className="mb-3">
        {task.price !== undefined && task.price !== null && task.price > 0 ? (
          <div className="inline-flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-700">Earn</span>
            <span 
              className="text-base font-black px-2.5 py-1 rounded"
              style={{ backgroundColor: '#CDFF00', color: '#000000' }}
            >
              ₹{task.price.toLocaleString('en-IN')}
            </span>
          </div>
        ) : (
          <span className="text-sm font-semibold text-gray-600">
            {task.isNegotiable ? 'Negotiable' : 'Price not specified'}
          </span>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 mb-3">
        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-xs text-gray-600 truncate">
          {(() => {
            // Filter out "Unknown" values
            const areaName = task.areaName && task.areaName !== 'Unknown' ? task.areaName : '';
            const cityName = task.cityName && task.cityName !== 'Unknown' ? task.cityName : '';
            
            // First try area + city names
            const location = [areaName, cityName].filter(Boolean).join(', ');
            if (location) return location;
            
            // Fall back to address (first 2 parts)
            if (task.address) {
              const parts = task.address.split(',').map(s => s.trim()).filter(Boolean);
              return parts.slice(0, 2).join(', ') || task.address;
            }
            
            return 'Location not set';
          })()}
        </span>
      </div>

      {/* Bottom Row - Distance + Time */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-gray-100">
        <div>
          {task.distance !== undefined && task.distance !== null && (
            <span className="text-xs font-bold text-black">
              📍 {task.distance.toFixed(1)} km
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{formatTime(new Date(task.createdAt))}</span>
        </div>
      </div>
    </div>
  );
}