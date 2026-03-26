import React from 'react';
import { MapPin, Clock, IndianRupee, Briefcase } from 'lucide-react';
import { Task } from '../types';
import { formatDistanceToNow } from '../utils/dateFormatter';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onChatClick?: () => void;
  currentUserId?: string | null;
}

// ⚡ UNIFIED TASKS SCREEN UPDATE - v3.1 - WITH THUMBNAIL ALWAYS
export function TaskCard({ task, onClick, onChatClick }: TaskCardProps) {
  const hasImage = task.images && task.images.length > 0;

  return (
    <div 
      className="bg-white border border-gray-200 p-3 cursor-pointer hover:border-black hover:shadow-sm transition-all flex gap-3"
      onClick={onClick}
      style={{ borderRadius: '8px', minHeight: '130px' }}
    >
      {/* ⚡ THUMBNAIL SECTION - ALWAYS VISIBLE - 70x70px */}
      <div 
        className="shrink-0 rounded overflow-hidden flex items-center justify-center"
        style={{ 
          width: '70px', 
          height: '70px',
          backgroundColor: hasImage ? '#f3f4f6' : '#f9fafb'
        }}
      >
        {hasImage ? (
          <img
            src={task.images![0]}
            alt={task.title}
            className="w-full h-full object-cover"
          />
        ) : (
          // LocalFelo logo placeholder
          <svg 
            width="36" 
            height="36" 
            viewBox="0 0 512 512" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.15 }}
          >
            <path d="M277.733 260.882L422.578 392.385L374.81 445L228.989 312.609L105.72 443.426L54 394.69L213.792 225.115H79.8604V154.05H378.403L277.733 260.882ZM458.997 229.461L410.066 280.999L339.476 213.979L388.404 162.44L458.997 229.461ZM411.179 48C437.167 48.0002 458.235 69.0681 458.235 95.0566C458.235 121.045 437.167 142.113 411.179 142.113C385.19 142.113 364.121 121.045 364.121 95.0566C364.121 69.068 385.19 48 411.179 48Z" fill="currentColor"/>
          </svg>
        )}
      </div>

      {/* CONTENT SECTION - Right Side */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* Title */}
        <div className="mb-2">
          <h3 className="font-bold text-gray-900 text-[15px] line-clamp-2 leading-tight">
            {task.title}
          </h3>
        </div>

        {/* Price */}
        {task.price !== undefined && task.price !== null && task.price > 0 ? (
          <div className="mb-1.5">
            <span 
              className="text-sm font-bold px-2 py-1 rounded inline-block"
              style={{ backgroundColor: '#CDFF00', color: '#000' }}
            >
              ₹{task.price.toLocaleString('en-IN')}
            </span>
          </div>
        ) : (
          <div className="text-xs font-medium text-gray-600 mb-1.5">
            {task.isNegotiable ? 'Negotiable' : 'Price not specified'}
          </div>
        )}

        {/* Location + Distance */}
        <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mt-auto">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate text-[11px]">
              {(() => {
                const areaName = task.areaName && task.areaName !== 'Unknown' ? task.areaName : '';
                const cityName = task.cityName && task.cityName !== 'Unknown' ? task.cityName : '';
                const location = [areaName, cityName].filter(Boolean).join(', ');
                if (location) return location;
                if (task.address) {
                  const parts = task.address.split(',').map(s => s.trim()).filter(Boolean);
                  return parts.slice(0, 2).join(', ') || task.address;
                }
                return 'Location not set';
              })()}
            </span>
          </div>
          {task.distance !== undefined && task.distance !== null && (
            <span className="font-bold text-black shrink-0 text-[11px]">
              📍 {task.distance.toFixed(1)} km
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
