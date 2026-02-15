/**
 * Push Notification Type Definitions
 * ===================================
 * Type-safe interfaces for push notification system
 */

/**
 * Platform types for push notifications
 */
export type PushPlatform = 'android' | 'ios' | 'web';

/**
 * Push token database record
 */
export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  platform: PushPlatform;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Request payload for sending push notifications
 */
export interface SendPushNotificationRequest {
  /** Single user ID to send to */
  user_id?: string;
  /** Multiple user IDs to send to */
  user_ids?: string[];
  /** Notification title */
  title: string;
  /** Notification body text */
  body: string;
  /** Optional custom data payload */
  data?: Record<string, any>;
  /** Target platform (default: 'all') */
  platform?: PushPlatform | 'all';
}

/**
 * Response from send push notification endpoint
 */
export interface SendPushNotificationResponse {
  success: boolean;
  message: string;
  sent_count?: number;
  failed_count?: number;
  errors?: string[];
}

/**
 * Push notification status (from hook)
 */
export interface PushNotificationStatus {
  /** Whether push notifications are supported in this environment */
  isSupported: boolean;
  /** Current permission status */
  permission: 'granted' | 'denied' | 'default' | 'unavailable';
  /** Whether a token has been successfully registered */
  isRegistered: boolean;
  /** Whether registration is currently in progress */
  isLoading: boolean;
}

/**
 * Push notification payload (what the user receives)
 */
export interface PushNotificationPayload {
  /** Notification title */
  title: string;
  /** Notification body */
  body: string;
  /** Optional icon URL */
  icon?: string;
  /** Optional image URL */
  image?: string;
  /** Optional badge count */
  badge?: number;
  /** Custom data payload */
  data?: Record<string, any>;
  /** Deep link URL */
  url?: string;
}
