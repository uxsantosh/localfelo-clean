import React, { useEffect, useState } from 'react';
import { X, MessageCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Notification } from '../services/notifications';

interface NotificationPopupProps {
  notification: Notification;
  onClose: () => void;
  onAction?: (actionType: string, notification: Notification) => void;
}

export function NotificationPopup({ notification, onClose, onAction }: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close after 8 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const handleActionClick = (actionType: string) => {
    onAction?.(actionType, notification);
    handleClose();
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'task_accepted':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'task_cancelled':
        return <XCircle className="w-5 h-5 text-red-300" />;
      case 'task_completion_request':
        return <AlertCircle className="w-5 h-5 text-white" />;
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'chat_message':
        return <MessageCircle className="w-5 h-5 text-white" />;
      default:
        return <AlertCircle className="w-5 h-5 text-white" />;
    }
  };

  // Determine background color based on notification type
  const getBgColor = () => {
    if (notification.type === 'task_cancelled' || notification.type.includes('rejected')) {
      return 'bg-red-600';
    }
    return 'bg-black';
  };

  // Get action buttons based on notification type
  const getActions = () => {
    switch (notification.type) {
      case 'task_accepted':
        return (
          <button
            onClick={() => handleActionClick('chat')}
            className="px-4 py-2 bg-[#CDFF00] text-black rounded-lg hover:bg-[#b8e600] transition-colors text-sm font-medium"
          >
            💬 Chat Now
          </button>
        );
      
      case 'task_completion_request':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleActionClick('mark_complete')}
              className="px-4 py-2 bg-[#CDFF00] text-black rounded-lg hover:bg-[#b8e600] transition-colors text-sm font-medium"
            >
              ✓ Mark Complete
            </button>
            <button
              onClick={() => handleActionClick('chat')}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              💬 Chat
            </button>
          </div>
        );
      
      case 'task_cancelled':
        return (
          <button
            onClick={() => handleActionClick('view_task')}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            View Details
          </button>
        );
      
      case 'chat_message':
        return (
          <button
            onClick={() => handleActionClick('chat')}
            className="px-4 py-2 bg-[#CDFF00] text-black rounded-lg hover:bg-[#b8e600] transition-colors text-sm font-medium"
          >
            Reply
          </button>
        );
      
      default:
        return (
          <button
            onClick={() => handleActionClick('view')}
            className="px-4 py-2 bg-[#CDFF00] text-black rounded-lg hover:bg-[#b8e600] transition-colors text-sm font-medium"
          >
            View
          </button>
        );
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] max-w-md w-full transition-all duration-300 ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className={`${getBgColor()} rounded-lg shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className="flex items-start gap-3 p-4">
          <div className="shrink-0 mt-0.5">{getIcon()}</div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-white leading-relaxed">
              {notification.message}
            </p>
            
            {/* Task details if available */}
            {notification.metadata?.taskTitle && (
              <div className="mt-2 p-2 bg-white/10 rounded border border-white/20">
                <p className="text-xs text-gray-300">Task:</p>
                <p className="text-sm font-medium text-white truncate">
                  {notification.metadata.taskTitle}
                </p>
                {notification.metadata.taskPrice && (
                  <p className="text-xs text-white font-semibold mt-1">
                    ₹{notification.metadata.taskPrice.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-4 pt-2 flex justify-end gap-2">
          {getActions()}
        </div>
      </div>
    </div>
  );
}