import { useState, useEffect, useRef } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

// Helper functions
function isPushSupported(): boolean {
  // Push notifications only work on native platforms
  return Capacitor.isNativePlatform();
}

function getPushPermissionStatus(): 'granted' | 'denied' | 'prompt' {
  // On web, we'd check Notification.permission, but on native it's always 'prompt' initially
  if (!Capacitor.isNativePlatform()) {
    return 'denied';
  }
  return 'prompt'; // Native platforms handle permission differently
}

export interface PushNotificationState {
  status: 'idle' | 'checking-permission' | 'requesting-permission' | 'registering' | 'registered' | 'error' | 'not-supported';
  isSupported: boolean;
  permission: 'granted' | 'denied' | 'prompt';
  isLoading: boolean;
  isRegistered: boolean;
}

export type PushNotificationStatus = 
  | 'idle'
  | 'checking-permission'
  | 'requesting-permission'
  | 'registering'
  | 'registered'
  | 'error'
  | 'not-supported';

/**
 * Push Notifications Hook
 * ========================
 * Safely manages push notification registration for logged-in users.
 * 
 * Features:
 * - Only activates when userId is provided
 * - Never blocks rendering or throws errors
 * - Automatically handles permission requests
 * - Stores tokens in Supabase device_tokens table
 * - Cleans up on unmount or user change
 * 
 * Usage:
 * ```tsx
 * const pushStatus = usePushNotifications(user?.id);
 * ```
 * 
 * Database schema (device_tokens table):
 * ```sql
 * CREATE TABLE device_tokens (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
 *   device_token TEXT NOT NULL UNIQUE,
 *   platform TEXT NOT NULL, -- 'web', 'ios', 'android'
 *   device_name TEXT,
 *   device_model TEXT,
 *   is_enabled BOOLEAN DEFAULT TRUE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   last_used_at TIMESTAMPTZ
 * );
 * 
 * -- RLS Policy (critical for token storage to work):
 * CREATE POLICY "Users can insert own tokens"
 *   ON device_tokens
 *   FOR INSERT
 *   WITH CHECK (auth.uid() = user_id);
 * ```
 */

/**
 * Hook to manage push notifications for a user
 * @param userId - The current user's ID (null if not logged in)
 * @returns PushNotificationStatus - Current status of push notifications
 */
export function usePushNotifications(userId: string | null | undefined): PushNotificationStatus {
  const [status, setStatus] = useState<PushNotificationStatus>('idle');

  // 🔍 DEBUG: Log every time hook is called
  console.log('[usePushNotifications] Hook called with userId:', userId ? userId.substring(0, 8) + '...' : 'NULL/UNDEFINED');

  // Track if we've already attempted registration this session
  const hasAttemptedRegistration = useRef(false);
  
  // Track the current user ID to detect changes
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    console.log('[usePushNotifications] useEffect triggered, userId:', userId ? userId.substring(0, 8) + '...' : 'NULL/UNDEFINED');
    
    // Safety check: Do nothing if no user is logged in
    if (!userId) {
      console.log('[usePushNotifications] No userId provided, skipping');
      hasAttemptedRegistration.current = false;
      currentUserId.current = null;
      setStatus('idle');
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
    
    console.log('[usePushNotifications] Push support check:', { supported, permission, userId: userId.substring(0, 8) + '...' });

    // If not supported or already attempted, don't proceed
    if (!supported) {
      console.log('[usePushNotifications] Push not supported on this platform');
      setStatus('not-supported');
      return;
    }
    
    if (hasAttemptedRegistration.current) {
      console.log('[usePushNotifications] Already attempted registration, skipping');
      return;
    }

    // Mark as attempted to prevent duplicate requests
    hasAttemptedRegistration.current = true;
    setStatus('checking-permission');

    // Start registration immediately
    console.log('[usePushNotifications] User is authenticated, starting registration');
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
    
    setStatus('requesting-permission');

    // Step 1: Get push token from provider
    const pushToken = await getPushTokenFromProvider();
    
    if (!pushToken) {
      console.log('[usePushNotifications] No push token available');
      setStatus('error');
      return;
    }

    // Step 2: Store token in Supabase
    setStatus('registering');
    const stored = await storePushTokenInDatabase(userId, pushToken);
    
    if (stored) {
      console.log('[usePushNotifications] ✅ Push notifications registered successfully');
      setStatus('registered');
    } else {
      console.error('[usePushNotifications] Failed to store token in database');
      setStatus('error');
    }
  } catch (error) {
    // Never throw - just log and update status
    console.error('[usePushNotifications] Error during registration:', error);
    setStatus('error');
  }
}

/**
 * Get push token from the push notification provider
 * @returns Promise<string | null> - The push token or null if unavailable
 */
async function getPushTokenFromProvider(): Promise<string | null> {
  try {
    // Check if running in Capacitor (Android/iOS)
    const { Capacitor } = await import('@capacitor/core');
    const isNative = Capacitor.isNativePlatform();
    
    if (!isNative) {
      // Running in web browser - no native push notifications
      console.log('[usePushNotifications] Running in web browser, skipping native push');
      return null;
    }
    
    // Import PushNotifications plugin (only available on native platforms)
    const { PushNotifications } = await import('@capacitor/push-notifications');
    
    console.log('[usePushNotifications] Registering for push notifications on native platform');
    
    // Request permission
    const permResult = await PushNotifications.requestPermissions();
    
    if (permResult.receive !== 'granted') {
      console.log('[usePushNotifications] Push permission not granted:', permResult.receive);
      return null;
    }
    
    // Register with FCM/APNs
    await PushNotifications.register();
    
    // Wait for registration token
    return new Promise<string | null>((resolve) => {
      // Set timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.warn('[usePushNotifications] Token registration timeout');
        resolve(null);
      }, 10000); // 10 second timeout
      
      // Listen for registration success
      PushNotifications.addListener('registration', (token) => {
        clearTimeout(timeout);
        console.log('[usePushNotifications] ✅ FCM token received:', token.value.substring(0, 20) + '...');
        resolve(token.value);
      });
      
      // Listen for registration error
      PushNotifications.addListener('registrationError', (error) => {
        clearTimeout(timeout);
        console.error('[usePushNotifications] Registration error:', error);
        resolve(null);
      });
    });
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
    console.log('[usePushNotifications] Input:', {
      userId: userId.substring(0, 8) + '...',
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...',
    });
    
    // ✅ CRITICAL FIX: Wait for Supabase session to load
    console.log('[usePushNotifications] Checking Supabase session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[usePushNotifications] ❌ Session error:', sessionError);
      toast.error('Session error - please log in again');
      return false;
    }
    
    if (!sessionData?.session) {
      console.error('[usePushNotifications] ❌ No active Supabase session found!');
      console.error('[usePushNotifications] auth.uid() will be null, RLS will block insert');
      console.error('[usePushNotifications] User needs to log in again to create proper session');
      toast.error('No active session - please log in again');
      return false;
    }
    
    const authUserId = sessionData.session.user.id;
    console.log('[usePushNotifications] ✅ Active session found:', {
      authUserId: authUserId.substring(0, 8) + '...',
      providedUserId: userId.substring(0, 8) + '...',
      match: authUserId === userId ? '✅ MATCH' : '❌ MISMATCH',
      expiresAt: sessionData.session.expires_at,
    });
    
    if (authUserId !== userId) {
      console.error('[usePushNotifications] ❌ Session user ID does not match provided user ID!');
      toast.error('Session mismatch - please log in again');
      return false;
    }
    
    // Detect platform
    const { Capacitor } = await import('@capacitor/core');
    const platform = Capacitor.getPlatform(); // 'android', 'ios', or 'web'
    
    // Get device info if available
    let deviceName: string | undefined;
    let deviceModel: string | undefined;
    
    try {
      const { Device } = await import('@capacitor/device');
      const info = await Device.getInfo();
      deviceModel = info.model || undefined;
      deviceName = info.name || undefined;
    } catch (e) {
      // Device info not available, continue without it
      console.log('[usePushNotifications] Device info not available');
    }
    
    const insertData = {
      user_id: userId,
      device_token: token,
      platform: platform as 'android' | 'ios' | 'web',
      device_name: deviceName,
      device_model: deviceModel,
      is_enabled: true,
      last_used_at: new Date().toISOString(),
    };
    
    console.log('[usePushNotifications] Attempting upsert with data:', {
      ...insertData,
      device_token: token.substring(0, 20) + '...',
      user_id: userId.substring(0, 8) + '...',
    });
    
    // 🔍 EXTREME DEBUG: Try a manual SELECT first to test RLS
    console.log('[usePushNotifications] 🔍 Testing SELECT permission...');
    const { data: testSelect, error: selectError } = await supabase
      .from('device_tokens')
      .select('*')
      .eq('user_id', userId)
      .limit(1);
    
    if (selectError) {
      console.error('[usePushNotifications] ❌ SELECT test failed - RLS blocks SELECT:', selectError);
    } else {
      console.log('[usePushNotifications] ✅ SELECT permission OK, found rows:', testSelect?.length || 0);
    }
    
    // Upsert token (insert or update if exists)
    // ✅ IMPORTANT: Uses device_tokens table
    // Session must be loaded first (done above) so auth.uid() is available for RLS
    console.log('[usePushNotifications] 🔍 Executing upsert...');
    const { error, data } = await supabase
      .from('device_tokens')
      .upsert(insertData, {
        onConflict: 'device_token', // Update if token already exists
      })
      .select(); // ✅ CRITICAL: Add .select() to verify insert/update and get detailed errors

    if (error) {
      // Log full error details for debugging
      console.error('[usePushNotifications] ❌ Database error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error),
      });
      
      toast.error(`Database Error: ${error.message} (Code: ${error.code})`);
      
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error('[usePushNotifications] ❌ No data returned from upsert - row may not have been inserted/updated');
      console.error('[usePushNotifications] This usually means:');
      console.error('  1. RLS policy blocks SELECT (can\'t return inserted row)');
      console.error('  2. Upsert silently failed due to constraint');
      console.error('  3. onConflict column doesn\'t match UNIQUE constraint');
      
      toast.error('No Data Returned - Row may not have been inserted/updated. Likely RLS SELECT policy issue.');
      
      return false;
    }

    console.log('[usePushNotifications] ✅ Token stored in device_tokens table:', {
      platform,
      rowId: data[0]?.id,
      isEnabled: data[0]?.is_enabled,
      createdAt: data[0]?.created_at,
    });
    
    toast.success(`Push notifications enabled! Platform: ${platform}`);
    
    return true;
  } catch (error) {
    console.error('[usePushNotifications] ❌ Unexpected error storing token:', error);
    if (error instanceof Error) {
      console.error('[usePushNotifications] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    
    toast.error(error instanceof Error ? error.message : String(error));
    
    return false;
  }
}