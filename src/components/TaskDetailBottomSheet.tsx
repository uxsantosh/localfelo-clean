import React from 'react';
import { X, MapPin, IndianRupee, Clock, Phone, MessageCircle, Navigation } from 'lucide-react';
import { Task } from '../types';
import { formatDistanceToNow } from '../utils/dateFormatter';

interface TaskDetailBottomSheetProps {
  task: Task;
  onClose: () => void;
  onAccept?: () => void;
  onNegotiate?: () => void;
  onNavigate?: () => void;
  currentUserId?: string;
}

export function TaskDetailBottomSheet({
  task,
  onClose,
  onAccept,
  onNegotiate,
  onNavigate,
  currentUserId,
}: TaskDetailBottomSheetProps) {
  const isOwner = currentUserId === task.userId;
  const canInteract = !isOwner && task.status === 'open';

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-[#CDFF00] text-black';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Task Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(task.status)}`}>
              {task.status.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{task.categoryEmoji}</span>
              <h3 className="text-xl font-semibold">{task.title}</h3>
            </div>
            <span className="text-sm text-gray-500">{task.categoryName}</span>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Price */}
          <div className="bg-[#CDFF00]/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-gray-900">₹{task.price?.toLocaleString() || '0'}</div>
              {task.isNegotiable && (
                <span className="px-2 py-1 bg-black text-white text-xs rounded font-medium">Negotiable</span>
              )}
            </div>
          </div>

          {/* Budget Range (if available) */}
          {(task.budgetMin || task.budgetMax) && (
            <div className="bg-white border border-gray-200 p-4">
              <h4 className="font-medium text-gray-700 mb-1">Budget Range</h4>
              <div className="text-gray-600">
                {task.budgetMin && task.budgetMax 
                  ? `₹${task.budgetMin.toLocaleString()} - ₹${task.budgetMax.toLocaleString()}`
                  : task.budgetMin 
                  ? `₹${task.budgetMin.toLocaleString()}+`
                  : task.budgetMax
                  ? `Up to ₹${task.budgetMax.toLocaleString()}`
                  : null
                }
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Location</h4>
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <p>
                  {(() => {
                    // Filter out "Unknown" values
                    const areaName = task.areaName && task.areaName !== 'Unknown' ? task.areaName : '';
                    const cityName = task.cityName && task.cityName !== 'Unknown' ? task.cityName : '';
                    
                    if (areaName && cityName) {
                      return `${areaName}, ${cityName}`;
                    } else if (areaName) {
                      return areaName;
                    } else if (cityName) {
                      return cityName;
                    } else {
                      return 'Location not set';
                    }
                  })()}
                </p>
                {task.distance && (
                  <p className="text-sm text-primary font-medium mt-1">
                    {task.distance.toFixed(1)} km away
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Time Window */}
          {task.timeWindow && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Time Window</h4>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5 text-primary" />
                <span>{task.timeWindow}</span>
              </div>
            </div>
          )}

          {/* Posted By */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Posted By</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                {task.userName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium">{task.userName}</p>
                {task.userRatingCount && task.userRatingCount > 0 && (
                  <p className="text-sm text-gray-500">
                    ⭐ {task.userRating?.toFixed(1) || '0.0'} ({task.userRatingCount} ratings)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {canInteract && (
            <div className="space-y-2 pt-4">
              {onNavigate && task.latitude && task.longitude && (
                <button
                  onClick={onNavigate}
                  className="w-full bg-blue-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600"
                >
                  <Navigation className="w-5 h-5" />
                  Navigate to Location
                </button>
              )}
              
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800"
                >
                  Accept Task
                </button>
              )}

              {task.isNegotiable && onNegotiate && (
                <button
                  onClick={onNegotiate}
                  className="w-full bg-white border-2 border-black text-black py-3 rounded-xl font-medium hover:bg-gray-50"
                >
                  Negotiate Price
                </button>
              )}

              {/* Contact Buttons */}
              {task.phone && (
                <a
                  href={`tel:${task.phone}`}
                  className="w-full bg-green-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              )}

              {task.whatsapp && task.hasWhatsapp && (
                <a
                  href={`https://wa.me/91${task.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#20bd5a]"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}