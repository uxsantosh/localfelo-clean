// =====================================================
// Notifications Hook - Real-time updates
// =====================================================

import { useState, useEffect } from "react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  Notification,
} from "../services/notifications";

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    loadNotifications();
  }, [userId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;

    const subscription = subscribeToNotifications(userId, () => {
      // Reload notifications when there's a change
      loadNotifications();
    });

    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        getNotifications(userId),
        getUnreadCount(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? {
                ...n,
                is_read: true,
              }
            : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    
    try {
      await markAllAsRead(userId);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
        })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    const notification = notifications.find(
      (n) => n.id === notificationId,
    );
    
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId),
      );
      if (notification && !notification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    refresh: loadNotifications,
  };
}