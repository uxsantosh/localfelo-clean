// =====================================================
// Notification Panel - Dropdown from bell icon
// =====================================================

import React from 'react';
import { Notification } from '../services/notifications';
import { Bell, Check, Trash2, X, Package, Heart, Briefcase, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateFormatter';

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose,
  onNotificationClick,
}: NotificationPanelProps) {
  const getIcon = (type: string) => {
    if (type.includes('task')) return <Briefcase className="w-4 h-4 text-black" />;
    if (type.includes('wish')) return <Heart className="w-4 h-4 text-black" />;
    if (type.includes('chat')) return <MessageCircle className="w-4 h-4 text-black" />;
    return <Package className="w-4 h-4 text-black" />;
  };

  const getNotificationBgColor = (notification: Notification) => {
    if (!notification.is_read) {
      // Negative/cancelled notifications get red background
      if (notification.type === 'task_cancelled' || notification.type.includes('rejected')) {
        return 'bg-red-600';
      }
      // All other unread notifications get black background
      return 'bg-black';
    }
    return ''; // Read notifications have no special background
  };

  return (
    <div className="fixed inset-0 z-[9999] sm:relative sm:inset-auto">
      {/* Mobile backdrop */}
      <div className="sm:hidden fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Panel - Fixed positioning for desktop */}
      <div className="fixed inset-x-0 bottom-0 sm:fixed sm:top-14 sm:right-4 sm:left-auto sm:bottom-auto bg-white sm:rounded-lg sm:shadow-xl border-t sm:border border-gray-200 w-full sm:w-96 max-h-[80vh] sm:max-h-[500px] flex flex-col sm:mt-2 rounded-t-3xl sm:rounded-t-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-primary hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Bell className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-600">No notifications yet</p>
              <p className="text-sm text-gray-500 mt-1">
                We'll notify you about tasks, wishes, and messages
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
                    getNotificationBgColor(notification)
                  }`}
                  onClick={() => onNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`font-medium text-sm ${
                            !notification.is_read ? 'text-white' : 'text-black'
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-[#CDFF00] rounded-full shrink-0 mt-1" />
                        )}
                      </div>
                      <p
                        className={`text-sm mt-0.5 ${
                          !notification.is_read ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`text-xs ${
                            !notification.is_read ? 'text-gray-300' : 'text-gray-500'
                          }`}
                        >
                          {formatDistanceToNow(new Date(notification.created_at))}
                        </span>
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(notification.id);
                              }}
                              className="text-xs text-white hover:underline font-medium"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notification.id);
                            }}
                            className={`text-xs hover:underline font-medium ${
                              !notification.is_read ? 'text-red-400' : 'text-red-600'
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}