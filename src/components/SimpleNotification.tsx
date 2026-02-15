import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface SimpleNotificationProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function SimpleNotification({ type, message, onClose, duration = 4000 }: SimpleNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-300" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-300" />;
      case 'info':
      default:
        return <AlertCircle className="w-5 h-5 text-blue-300" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-black';
    }
  };

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[9999] max-w-md w-[calc(100%-2rem)] sm:w-full transition-all duration-300 ${
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0'
      }`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className={`${getBgColor()} rounded-lg shadow-2xl overflow-hidden`}>
        <div className="flex items-center gap-3 p-4">
          <div className="shrink-0">{getIcon()}</div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Manager component to handle multiple notifications
interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
}

export function useSimpleNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = (type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    console.log('🔔 [SimpleNotification] Adding notification:', { id, type, message });
    setNotifications(prev => {
      const updated = [...prev, { id, type, message }];
      console.log('🔔 [SimpleNotification] Updated notifications array:', updated);
      return updated;
    });
  };

  const removeNotification = (id: string) => {
    console.log('🔔 [SimpleNotification] Removing notification:', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const success = (message: string) => showNotification('success', message);
  const error = (message: string) => showNotification('error', message);
  const info = (message: string) => showNotification('info', message);
  const warning = (message: string) => showNotification('warning', message);

  // Debug: Log whenever notifications array changes
  useEffect(() => {
    console.log('🔔 [SimpleNotification] Current notifications:', notifications);
  }, [notifications]);

  return {
    notifications,
    removeNotification,
    success,
    error,
    info,
    warning,
  };
}

// Simple notification container component
interface SimpleNotificationContainerProps {
  notifications: NotificationItem[];
  onRemove: (id: string) => void;
}

export function SimpleNotificationContainer({ notifications, onRemove }: SimpleNotificationContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[9999] flex flex-col gap-2 pointer-events-none w-[calc(100%-2rem)] sm:w-auto max-w-md">
      {notifications.map((notification, index) => (
        <div key={notification.id} style={{ marginTop: index > 0 ? `${index * 80}px` : '0' }}>
          <SimpleNotification
            type={notification.type}
            message={notification.message}
            onClose={() => onRemove(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}