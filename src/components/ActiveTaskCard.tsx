// =====================================================
// Active Task Card - Shows tasks user is involved in
// Version: 2.0 - Added thumbnail support with logo placeholder
// =====================================================

import React from 'react';
import { Task } from '../types';
import { Clock, IndianRupee, MapPin, MessageCircle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateFormatter';

interface ActiveTaskCardProps {
  task: Task;
  onClick: () => void;
}

export function ActiveTaskCard({ task, onClick }: ActiveTaskCardProps) {
  const hasImage = task.images && task.images.length > 0;
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'negotiating':
        return {
          label: 'Negotiating',
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: MessageCircle,
          description: 'Discussing terms with poster'
        };
      case 'accepted':
        return {
          label: 'Accepted',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: CheckCircle2,
          description: 'Ready to start work'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: Clock,
          description: 'Work in progress'
        };
      default:
        return {
          label: 'Open',
          color: 'bg-green-50 border-green-200 text-green-800',
          icon: Clock,
          description: 'Available for acceptance'
        };
    }
  };

  const statusInfo = getStatusInfo(task.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-[#CDFF00] p-3 sm:p-4 cursor-pointer hover:border-black transition-all"
    >
      {/* Active Badge */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2 h-2 rounded-full bg-[#CDFF00] animate-pulse" />
          <span className="text-[10px] sm:text-xs font-semibold text-black uppercase tracking-wider">
            Active Task
          </span>
        </div>
        <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-[4px] text-[10px] sm:text-xs font-medium border ${statusInfo.color}`}>
          <StatusIcon className="w-3 h-3" />
          <span>{statusInfo.label}</span>
        </div>
      </div>

      {/* Task Info with Image */}
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Thumbnail - Always show (image or logo placeholder) */}
        <div 
          className="shrink-0 rounded overflow-hidden flex items-center justify-center"
          style={{ 
            width: '50px', 
            height: '50px',
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
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 512 512" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ opacity: 0.15 }}
            >
              <path d="M277.733 260.882L422.578 392.385L374.81 445L228.989 312.609L105.72 443.426L54 394.69L213.792 225.115H79.8604V154.05H378.403L277.733 260.882ZM458.997 229.461L410.066 280.999L339.476 213.979L388.404 162.44L458.997 229.461ZM411.179 48C437.167 48.0002 458.235 69.0681 458.235 95.0566C458.235 121.045 437.167 142.113 411.179 142.113C385.19 142.113 364.121 121.045 364.121 95.0566C364.121 69.068 385.19 48 411.179 48Z" fill="currentColor"/>
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate mb-0.5 sm:mb-1 text-sm sm:text-base">{task.title}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 line-clamp-2">{task.description}</p>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1 text-black font-bold">
              <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>₹{task.acceptedPrice || task.price}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-sm">{task.areaName}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs">{formatDistanceToNow(new Date(task.acceptedAt || task.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action prompt */}
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
        <p className="text-[10px] sm:text-xs text-gray-500">{statusInfo.description} • Tap to open chat</p>
      </div>
    </div>
  );
}