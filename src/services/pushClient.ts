/**
 * Push Notification Client Service
 * ==================================
 * This service provides a fail-safe interface for push notification registration.
 * Currently returns stub implementations that safely log and resolve.
 * 
 * When ready to implement push notifications:
 * - Integrate with your push provider (e.g., OneSignal, Expo Push, FCM via web)
 * - Update these functions with actual implementation
 * - All functions are designed to never throw and never block
 */

import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from './auth';

/**
 * Request push notification permission from the user
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export async function requestPushPermission(): Promise<boolean> {
  try {
    console.log('[PushClient] requestPushPermission called (stub implementation)');
    
    // TODO: When implementing, check if Notification API is available
    // if (!('Notification' in window)) {
    //   console.log('[PushClient] Notification API not available');
    //   return false;
    // }
    
    // TODO: Request actual permission
    // const permission = await Notification.requestPermission();
    // return permission === 'granted';
    
    // Stub: Always return false (no permission)
    return false;
  } catch (error) {
    console.error('[PushClient] Error requesting push permission:', error);
    return false;
  }
}

/**
 * Register a push token for the current user
 * @param token - The push notification token from the provider
 * @returns Promise<boolean> - true if registration successful, false otherwise
 */
export async function registerPushToken(token: string): Promise<boolean> {
  try {
    console.log('[PushClient] registerPushToken called (stub implementation)', {
      tokenLength: token?.length || 0,
      tokenPreview: token?.substring(0, 10) + '...',
    });
    
    // TODO: When implementing, send token to backend
    // const response = await fetch('/api/push/register', {
    //   method: 'POST',
    //   body: JSON.stringify({ token, platform: 'web' }),
    // });
    // return response.ok;
    
    // Stub: Always return true (simulate success)
    return true;
  } catch (error) {
    console.error('[PushClient] Error registering push token:', error);
    return false;
  }
}

/**
 * Unregister the push token for the current user
 * @returns Promise<boolean> - true if unregistration successful, false otherwise
 */
export async function unregisterPushToken(): Promise<boolean> {
  try {
    console.log('[PushClient] unregisterPushToken called (stub implementation)');
    
    // TODO: When implementing, remove token from backend
    // const response = await fetch('/api/push/unregister', {
    //   method: 'DELETE',
    // });
    // return response.ok;
    
    // Stub: Always return true (simulate success)
    return true;
  } catch (error) {
    console.error('[PushClient] Error unregistering push token:', error);
    return false;
  }
}

/**
 * Check if push notifications are supported in the current environment
 * @returns boolean - true if push notifications are supported
 */
export function isPushSupported(): boolean {
  try {
    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext;
    
    // Check if Notification API is available
    const hasNotificationAPI = 'Notification' in window;
    
    // Check if Service Worker API is available (needed for web push)
    const hasServiceWorker = 'serviceWorker' in navigator;
    
    const supported = isSecureContext && hasNotificationAPI && hasServiceWorker;
    
    if (!supported) {
      console.log('[PushClient] Push notifications not supported:', {
        isSecureContext,
        hasNotificationAPI,
        hasServiceWorker,
      });
    }
    
    return supported;
  } catch (error) {
    console.error('[PushClient] Error checking push support:', error);
    return false;
  }
}

/**
 * Get the current push notification permission status
 * @returns 'granted' | 'denied' | 'default' | 'unavailable'
 */
export function getPushPermissionStatus(): 'granted' | 'denied' | 'default' | 'unavailable' {
  try {
    if (!('Notification' in window)) {
      return 'unavailable';
    }
    
    return Notification.permission as 'granted' | 'denied' | 'default';
  } catch (error) {
    console.error('[PushClient] Error getting permission status:', error);
    return 'unavailable';
  }
}

/**
 * Save push token from native layer (Android/iOS)
 * ==================================================
 * This function is called by native code to register push tokens.
 * It safely saves the token to Supabase without blocking the UI.
 * 
 * @param token - The push notification token from native layer
 * @param platform - The platform ('android' | 'ios')
 * @returns Promise<boolean> - true if saved successfully, false otherwise
 * 
 * Usage from native code:
 * ```javascript
 * // Android/iOS WebView
 * window.savePushToken('fcm_token_here', 'android');
 * ```
 * 
 * Features:
 * - Silently fails if user not logged in
 * - Never throws errors
 * - Never blocks UI
 * - Logs all operations for debugging
 */
export async function savePushToken(
  token: string,
  platform: 'android' | 'ios'
): Promise<boolean> {
  try {
    console.log('[PushClient] savePushToken called from native layer', {
      platform,
      tokenLength: token?.length || 0,
      tokenPreview: token?.substring(0, 20) + '...',
    });

    // Validate inputs
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      console.warn('[PushClient] Invalid token provided');
      return false;
    }

    if (platform !== 'android' && platform !== 'ios') {
      console.warn('[PushClient] Invalid platform provided:', platform);
      return false;
    }

    // Get current user (silently fail if not logged in)
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      console.log('[PushClient] No user logged in, skipping token save');
      return false;
    }

    console.log('[PushClient] Saving push token for user:', user.id);

    // Save token to Supabase
    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: user.id,
          token: token.trim(),
          platform,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'token', // Update if token already exists
        }
      );

    if (error) {
      console.error('[PushClient] Database error saving push token:', error);
      return false;
    }

    console.log('[PushClient] ✅ Push token saved successfully');
    return true;
  } catch (error) {
    // Never throw - just log and return false
    console.error('[PushClient] Error saving push token:', error);
    return false;
  }
}