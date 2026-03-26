/**
 * Push Notification Dispatcher
 * =============================
 * Central service for sending push notifications via Supabase Edge Function.
 * 
 * Features:
 * - Fire-and-forget (non-blocking)
 * - Calls existing send-push-notification Edge Function
 * - Structured payload for deep linking
 * - Multi-user support
 * - Safe error handling (failures don't break app)
 * 
 * Usage:
 * ```typescript
 * import { notifyUser, notifyMultipleUsers } from './pushNotificationDispatcher';
 * 
 * // Single user
 * notifyUser({
 *   userId: 'uuid-here',
 *   title: 'Task Accepted',
 *   body: 'John accepted your task',
 *   data: {
 *     type: 'task',
 *     entity_id: 'task-uuid',
 *     action: 'accepted',
 *     sender_id: 'sender-uuid'
 *   }
 * });
 * 
 * // Multiple users
 * notifyMultipleUsers({
 *   userIds: ['uuid1', 'uuid2'],
 *   title: 'New message',
 *   body: 'You have a new message',
 *   data: { type: 'chat', entity_id: 'conv-uuid', action: 'message' }
 * });
 * ```
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Push notification data payload structure
 * This will be used for deep linking in the Android app
 */
export interface PushNotificationData {
  /** Type of notification */
  type: 'task' | 'chat' | 'wish' | 'marketplace' | 'system';
  /** Entity ID (taskId, conversationId, wishId, listingId) */
  entity_id: string;
  /** Action that triggered notification */
  action: 'accepted' | 'rejected' | 'cancelled' | 'message' | 'completed' | 'completion_request' | string;
  /** ID of user who triggered the action */
  sender_id?: string;
  /** Additional context */
  [key: string]: any;
}

/**
 * Single user notification params
 */
export interface NotifyUserParams {
  /** Target user ID */
  userId: string;
  /** Notification title */
  title: string;
  /** Notification body message */
  body: string;
  /** Structured data payload */
  data?: PushNotificationData;
  /** Target platform (default: 'all') */
  platform?: 'android' | 'ios' | 'web' | 'all';
}

/**
 * Multiple users notification params
 */
export interface NotifyMultipleUsersParams {
  /** Array of target user IDs */
  userIds: string[];
  /** Notification title */
  title: string;
  /** Notification body message */
  body: string;
  /** Structured data payload */
  data?: PushNotificationData;
  /** Target platform (default: 'all') */
  platform?: 'android' | 'ios' | 'web' | 'all';
}

/**
 * Send push notification to a single user
 * Non-blocking, fire-and-forget
 * 
 * @param params - Notification parameters
 * @returns Promise<void> - Always resolves (never throws)
 */
export async function notifyUser(params: NotifyUserParams): Promise<void> {
  try {
    const { userId, title, body, data, platform = 'all' } = params;

    // Validate required fields
    if (!userId || !title || !body) {
      console.warn('[PushDispatcher] Missing required fields:', { userId, title, body });
      return;
    }

    console.log('[PushDispatcher] Sending push notification:', {
      userId,
      title,
      platform,
      dataType: data?.type,
    });

    // Call Supabase Edge Function
    const { data: response, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        user_id: userId,
        title,
        body,
        data: data || {},
        platform,
      },
    });

    if (error) {
      // Edge Function doesn't exist or failed - this is expected in development
      // Just log at debug level and continue silently
      if (error.message?.includes('Failed to send a request') || error.message?.includes('FunctionsFetchError')) {
        console.debug('[PushDispatcher] Edge function not available (expected in development)');
      } else {
        console.error('[PushDispatcher] Edge function error:', error);
      }
      return; // Fail silently
    }

    if (response?.success) {
      console.log('[PushDispatcher] ✅ Push notification sent:', {
        userId,
        sent_count: response.sent_count,
      });
    } else {
      console.warn('[PushDispatcher] ⚠️ Push notification not sent:', response?.message);
    }
  } catch (error) {
    // Never throw - log and continue
    console.error('[PushDispatcher] Exception:', error);
  }
}

/**
 * Send push notification to multiple users
 * Non-blocking, fire-and-forget
 * 
 * @param params - Notification parameters
 * @returns Promise<void> - Always resolves (never throws)
 */
export async function notifyMultipleUsers(params: NotifyMultipleUsersParams): Promise<void> {
  try {
    const { userIds, title, body, data, platform = 'all' } = params;

    // Validate required fields
    if (!userIds || userIds.length === 0 || !title || !body) {
      console.warn('[PushDispatcher] Missing required fields:', { userIds, title, body });
      return;
    }

    console.log('[PushDispatcher] Sending push notifications to multiple users:', {
      userCount: userIds.length,
      title,
      platform,
      dataType: data?.type,
    });

    // Call Supabase Edge Function with user_ids array
    const { data: response, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        user_ids: userIds,
        title,
        body,
        data: data || {},
        platform,
      },
    });

    if (error) {
      // Edge Function doesn't exist or failed - this is expected in development
      // Just log at debug level and continue silently
      if (error.message?.includes('Failed to send a request') || error.message?.includes('FunctionsFetchError')) {
        console.debug('[PushDispatcher] Edge function not available (expected in development)');
      } else {
        console.error('[PushDispatcher] Edge function error:', error);
      }
      return; // Fail silently
    }

    if (response?.success) {
      console.log('[PushDispatcher] ✅ Push notifications sent:', {
        userCount: userIds.length,
        sent_count: response.sent_count,
        failed_count: response.failed_count,
      });
    } else {
      console.warn('[PushDispatcher] ⚠️ Push notifications not sent:', response?.message);
    }
  } catch (error) {
    // Never throw - log and continue
    console.error('[PushDispatcher] Exception:', error);
  }
}

/**
 * Convenience function: Send task notification
 */
export function notifyTaskUpdate(params: {
  recipientId: string;
  taskId: string;
  action: 'accepted' | 'rejected' | 'cancelled' | 'completed' | 'completion_request';
  title: string;
  body: string;
  senderId?: string;
}): Promise<void> {
  return notifyUser({
    userId: params.recipientId,
    title: params.title,
    body: params.body,
    data: {
      type: 'task',
      entity_id: params.taskId,
      action: params.action,
      sender_id: params.senderId,
    },
  });
}

/**
 * Convenience function: Send chat message notification
 */
export function notifyChatMessage(params: {
  recipientId: string;
  conversationId: string;
  senderName: string;
  messagePreview: string;
  senderId: string;
  relatedType?: 'task' | 'wish' | 'marketplace';
  relatedId?: string;
}): Promise<void> {
  return notifyUser({
    userId: params.recipientId,
    title: `New message from ${params.senderName}`,
    body: params.messagePreview,
    data: {
      type: 'chat',
      entity_id: params.conversationId,
      action: 'message',
      sender_id: params.senderId,
      related_type: params.relatedType,
      related_id: params.relatedId,
    },
  });
}

/**
 * Convenience function: Send wish notification
 */
export function notifyWishUpdate(params: {
  recipientId: string;
  wishId: string;
  action: string;
  title: string;
  body: string;
  senderId?: string;
}): Promise<void> {
  return notifyUser({
    userId: params.recipientId,
    title: params.title,
    body: params.body,
    data: {
      type: 'wish',
      entity_id: params.wishId,
      action: params.action,
      sender_id: params.senderId,
    },
  });
}