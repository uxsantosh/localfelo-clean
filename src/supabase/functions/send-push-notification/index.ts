// =====================================================
// Supabase Edge Function: send-push-notification
// =====================================================
// This is a STUB implementation for sending push notifications.
// When ready to implement, integrate with Firebase Cloud Messaging,
// OneSignal, or your preferred push notification service.
//
// Deploy: supabase functions deploy send-push-notification
// Test: supabase functions serve send-push-notification
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Request body interface
interface PushNotificationRequest {
  user_id?: string;
  user_ids?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  platform?: 'android' | 'ios' | 'web' | 'all';
}

// Response interface
interface PushNotificationResponse {
  success: boolean;
  message: string;
  sent_count?: number;
  failed_count?: number;
  errors?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData: PushNotificationRequest = await req.json();

    // Validate required fields
    if (!requestData.title || !requestData.body) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required fields: title and body are required',
        } as PushNotificationResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate user_id or user_ids
    if (!requestData.user_id && !requestData.user_ids) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required field: user_id or user_ids is required',
        } as PushNotificationResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine target user IDs
    const targetUserIds = requestData.user_ids || [requestData.user_id!];
    const platform = requestData.platform || 'all';

    console.log('[PushNotification] Processing request:', {
      title: requestData.title,
      targetUsers: targetUserIds.length,
      platform,
    });

    // Fetch active push tokens for target users
    let query = supabase
      .from('push_tokens')
      .select('*')
      .in('user_id', targetUserIds)
      .eq('is_active', true);

    // Filter by platform if specified
    if (platform !== 'all') {
      query = query.eq('platform', platform);
    }

    const { data: tokens, error: fetchError } = await query;

    if (fetchError) {
      console.error('[PushNotification] Error fetching tokens:', fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to fetch push tokens',
          errors: [fetchError.message],
        } as PushNotificationResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log('[PushNotification] No active tokens found for users');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active push tokens found for target users',
          sent_count: 0,
          failed_count: 0,
        } as PushNotificationResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[PushNotification] Found ${tokens.length} active tokens`);

    // =====================================================
    // STUB IMPLEMENTATION
    // =====================================================
    // TODO: When ready to implement, add your push service integration here
    //
    // For Firebase Cloud Messaging (FCM):
    // - Use Firebase Admin SDK
    // - Call admin.messaging().sendMulticast()
    //
    // For OneSignal:
    // - Use OneSignal REST API
    // - POST to https://onesignal.com/api/v1/notifications
    //
    // For Expo Push:
    // - Use Expo Push API
    // - POST to https://exp.host/--/api/v2/push/send
    //
    // Example FCM implementation:
    // ```typescript
    // import * as admin from 'firebase-admin';
    // 
    // const messages = tokens.map(token => ({
    //   notification: {
    //     title: requestData.title,
    //     body: requestData.body,
    //   },
    //   data: requestData.data || {},
    //   token: token.token,
    // }));
    // 
    // const response = await admin.messaging().sendEachForMulticast({
    //   tokens: tokens.map(t => t.token),
    //   notification: {
    //     title: requestData.title,
    //     body: requestData.body,
    //   },
    //   data: requestData.data || {},
    // });
    // 
    // // Handle failed tokens
    // const failedTokens = [];
    // response.responses.forEach((resp, idx) => {
    //   if (!resp.success) {
    //     failedTokens.push(tokens[idx].token);
    //     // Mark token as inactive if permanently failed
    //     if (resp.error?.code === 'messaging/invalid-registration-token') {
    //       await supabase
    //         .from('push_tokens')
    //         .update({ is_active: false })
    //         .eq('token', tokens[idx].token);
    //     }
    //   }
    // });
    // ```
    // =====================================================

    // STUB: Log what would be sent
    console.log('[PushNotification] STUB: Would send notifications to:', {
      token_count: tokens.length,
      platforms: [...new Set(tokens.map(t => t.platform))],
      title: requestData.title,
      body: requestData.body,
      data: requestData.data,
    });

    // STUB: Simulate success
    const response: PushNotificationResponse = {
      success: true,
      message: 'Push notifications queued successfully (STUB)',
      sent_count: tokens.length,
      failed_count: 0,
    };

    console.log('[PushNotification] STUB response:', response);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[PushNotification] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as PushNotificationResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
