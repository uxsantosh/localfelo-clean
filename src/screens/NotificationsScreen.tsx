import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle, MessageCircle, Trash2, CheckCheck } from 'lucide-react';
import { Header } from '../components/Header';
import {
  Notification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
} from '../services/notifications';
import { getCurrentUser } from '../services/auth';
import { toast } from 'sonner';

interface NotificationsScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
  unreadCount?: number;
  notificationCount?: number;
  onNotificationCountChange?: (count: number) => void;
}

export function NotificationsScreen({
  onBack,
  onNavigate,
  isLoggedIn = false,
  isAdmin = false,
  userDisplayName,
  unreadCount = 0,
  notificationCount = 0,
  onNotificationCountChange,
}: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadNotifications();

    // Subscribe to real-time notifications
    if (currentUser) {
      const subscription = subscribeToNotifications(currentUser.id, () => {
        loadNotifications();
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUser?.id]);

  const loadNotifications = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    const data = await getNotifications(currentUser.id);
    setNotifications(data);
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    if (notificationCount > 0) {
      onNotificationCountChange?.(notificationCount - 1);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.id) return;
    await markAllAsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    onNotificationCountChange?.(0);
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    toast.success('Notification deleted');
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.related_type === 'task' && notification.related_id) {
      onNavigate?.('task-detail', { taskId: notification.related_id });
    } else if (notification.related_type === 'listing' && notification.related_id) {
      onNavigate?.('listing', { id: notification.related_id });
    } else if (notification.related_type === 'wish' && notification.related_id) {
      onNavigate?.('wish-detail', { wishId: notification.related_id });
    } else if (notification.related_type === 'chat' && notification.related_id) {
      onNavigate?.('chat', { conversationId: notification.related_id });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_accepted':
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'task_cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'task_completion_request':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'chat_message':
        return <MessageCircle className="w-5 h-5 text-primary" />;
      case 'info':
      case 'broadcast':
        return <Bell className="w-5 h-5 text-blue-600" />;
      case 'promotion':
        return <Bell className="w-5 h-5 text-purple-600" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'all' ? true : !n.is_read
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-6">
      <Header
        title="Notifications"
        showBack
        onBack={() => onNavigate?.('home')}
        currentScreen="notifications"
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userDisplayName={userDisplayName}
        unreadCount={unreadCount}
        notificationCount={notificationCount}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white text-body border border-border hover:bg-gray-50'
              }`}
            >
              All
              {notifications.length > 0 && (
                <span className="ml-2 text-xs opacity-75">({notifications.length})</span>
              )}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-black text-white'
                  : 'bg-white text-body border border-border hover:bg-gray-50'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {notifications.filter((n) => !n.is_read).length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notifications</h3>
            <p className="text-body">
              {filter === 'unread'
                ? "You're all caught up!"
                : 'Notifications will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  notification.is_read
                    ? 'border-gray-200'
                    : 'border-primary/30 bg-primary/5'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="p-4 flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{getIcon(notification.type)}</div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-heading text-sm mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-body leading-relaxed mb-2">
                      {notification.message}
                    </p>

                    {/* Task/Listing details if available */}
                    {notification.metadata?.taskTitle && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                        <p className="text-xs text-muted">
                          {notification.related_type === 'task' ? 'Task' : 'Item'}:
                        </p>
                        <p className="text-sm font-medium text-heading truncate">
                          {notification.metadata.taskTitle}
                        </p>
                        {notification.metadata.taskPrice && (
                          <p className="text-xs text-primary font-semibold mt-1">
                            ₹{notification.metadata.taskPrice.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted mt-2">
                      {formatTime(notification.created_at || notification.createdAt || '')}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-2 hover:bg-red-50 rounded transition-colors"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}