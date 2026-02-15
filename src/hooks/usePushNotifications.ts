import { useEffect, useRef, useState } from 'react';
import { requestPushPermission, registerPushToken, isPushSupported, getPushPermissionStatus } from '../services/pushClient';
import { supabase } from '../lib/supabaseClient';

/**
 * Push Notifications Hook
 * ========================
 * Safely manages push notification registration for logged-in users.
 * 
 * Features:
 * - Only activates when userId is provided
 * - Never blocks rendering or throws errors
 * - Automatically handles permission requests
 * - Stores tokens in Supabase push_tokens table
 * - Cleans up on unmount or user change
 * 
 * Usage:
 * ```tsx
 * const pushStatus = usePushNotifications(user?.id);
 * ```
 * 
 * Database schema (assumed to exist):
 * ```sql
 * CREATE TABLE push_tokens (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
 *   token TEXT NOT NULL UNIQUE,
 *   platform TEXT NOT NULL, -- 'web', 'ios', 'android'
 *   is_active BOOLEAN NOT NULL DEFAULT TRUE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * ```
 */

interface PushNotificationStatus {
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
 * Hook to manage push notifications for a user
 * @param userId - The current user's ID (null if not logged in)
 * @returns PushNotificationStatus - Current status of push notifications
 */
export function usePushNotifications(userId: string | null | undefined): PushNotificationStatus {
  const [status, setStatus] = useState<PushNotificationStatus>({
    isSupported: false,
    permission: 'unavailable',
    isRegistered: false,
    isLoading: false,
  });

  // Track if we've already attempted registration this session
  const hasAttemptedRegistration = useRef(false);
  
  // Track the current user ID to detect changes
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    // Safety check: Do nothing if no user is logged in
    if (!userId) {
      console.log('[usePushNotifications] No userId provided, skipping');
      hasAttemptedRegistration.current = false;
      currentUserId.current = null;
      setStatus({
        isSupported: false,
        permission: 'unavailable',
        isRegistered: false,
        isLoading: false,
      });
      return;
    }

    // Check if user has changed
    if (currentUserId.current && currentUserId.current !== userId) {
      console.log('[usePushNotifications] User changed, resetting registration');
      hasAttemptedRegistration.current = false;
    }
    currentUserId.current = userId;

    // Check support first
    const supported = isPushSupported();
    const permission = getPushPermissionStatus();

    setStatus(prev => ({
      ...prev,
      isSupported: supported,
      permission,
    }));

    // If not supported or already attempted, don't proceed
    if (!supported || hasAttemptedRegistration.current) {
      return;
    }

    // Mark as attempted to prevent duplicate requests
    hasAttemptedRegistration.current = true;

    // Attempt registration in background (non-blocking)
    attemptPushRegistration(userId, setStatus);

    // Cleanup function (runs on unmount or userId change)
    return () => {
      console.log('[usePushNotifications] Cleanup');
    };
  }, [userId]);

  return status;
}

/**
 * Internal function to attempt push notification registration
 * This runs asynchronously and never blocks the UI
 */
async function attemptPushRegistration(
  userId: string,
  setStatus: React.Dispatch<React.SetStateAction<PushNotificationStatus>>
): Promise<void> {
  try {
    console.log('[usePushNotifications] Attempting push registration for user:', userId);
    
    setStatus(prev => ({ ...prev, isLoading: true }));

    // Step 1: Request permission (this is a stub currently)
    const permissionGranted = await requestPushPermission();
    
    setStatus(prev => ({
      ...prev,
      permission: permissionGranted ? 'granted' : getPushPermissionStatus(),
    }));

    if (!permissionGranted) {
      console.log('[usePushNotifications] Permission not granted, skipping registration');
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Step 2: Get push token from provider (would be implemented when adding push service)
    const pushToken = await getPushTokenFromProvider();
    
    if (!pushToken) {
      console.log('[usePushNotifications] No push token available');
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Step 3: Register token with backend service
    const registered = await registerPushToken(pushToken);
    
    if (!registered) {
      console.log('[usePushNotifications] Failed to register token with backend');
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Step 4: Store token in Supabase
    const stored = await storePushTokenInDatabase(userId, pushToken);
    
    setStatus(prev => ({
      ...prev,
      isRegistered: stored,
      isLoading: false,
    }));

    if (stored) {
      console.log('[usePushNotifications] ✅ Push notifications registered successfully');
    }
  } catch (error) {
    // Never throw - just log and update status
    console.error('[usePushNotifications] Error during registration:', error);
    setStatus(prev => ({
      ...prev,
      isLoading: false,
      isRegistered: false,
    }));
  }
}

/**
 * Get push token from the push notification provider
 * @returns Promise<string | null> - The push token or null if unavailable
 */
async function getPushTokenFromProvider(): Promise<string | null> {
  try {
    // TODO: Implement actual push token retrieval when adding push service
    // Example for OneSignal:
    // const token = await window.OneSignal?.getDeviceId();
    // return token || null;
    
    // Example for FCM Web Push:
    // const messaging = getMessaging();
    // const token = await getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY' });
    // return token;
    
    console.log('[usePushNotifications] getPushTokenFromProvider (stub implementation)');
    return null; // Stub: Return null until implemented
  } catch (error) {
    console.error('[usePushNotifications] Error getting push token:', error);
    return null;
  }
}

/**
 * Store push token in Supabase database
 * @param userId - The user's ID
 * @param token - The push notification token
 * @returns Promise<boolean> - true if stored successfully
 */
async function storePushTokenInDatabase(userId: string, token: string): Promise<boolean> {
  try {
    console.log('[usePushNotifications] Storing push token in database');
    
    // Upsert token (insert or update if exists)
    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          platform: 'web',
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'token', // Update if token already exists
        }
      );

    if (error) {
      // Don't throw - just log
      console.error('[usePushNotifications] Database error:', error);
      return false;
    }

    console.log('[usePushNotifications] ✅ Token stored in database');
    return true;
  } catch (error) {
    console.error('[usePushNotifications] Error storing token:', error);
    return false;
  }
}