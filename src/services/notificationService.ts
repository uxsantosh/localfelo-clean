// =====================================================
// Unified Notification Service
// Handles both in-app and WhatsApp notifications
// =====================================================

import { supabase } from '../lib/supabaseClient';
import { sendWhatsAppMessage, isValidPhoneNumber, normalizePhoneNumber } from './whatsappProvider';
import { formatWhatsAppMessage } from '../config/whatsappTemplates';

/**
 * Notification Channel Types
 */
export type NotificationChannel = 'in_app' | 'whatsapp' | 'push';

/**
 * Notification Type
 */
export type NotificationType = 
  | 'task'
  | 'wish'
  | 'listing'
  | 'shop_match'
  | 'chat'
  | 'offer'
  | 'match_found'
  | 'task_response'
  | 'wish_accepted';

/**
 * ✅ STEP 1: Unified Notification Request
 */
export interface NotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    relatedId?: string;
    relatedType?: string;
    actionUrl?: string;
    whatsappTemplate?: string;
    whatsappVariables?: Record<string, string>;
    [key: string]: any;
  };
  channels?: NotificationChannel[];
}

/**
 * Notification Response
 */
export interface NotificationResponse {
  success: boolean;
  inAppSent: boolean;
  whatsappSent: boolean;
  error?: string;
}

/**
 * ✅ STEP 1: Send Notification
 * Unified function that handles all notification channels
 * 
 * @param request - Notification request with user, type, and channels
 * @returns Promise<NotificationResponse>
 */
export async function sendNotification(
  request: NotificationRequest
): Promise<NotificationResponse> {
  console.log('🔔 [Notification Service] Sending notification:', {
    userId: request.userId,
    type: request.type,
    channels: request.channels || ['in_app'],
  });
  
  const response: NotificationResponse = {
    success: false,
    inAppSent: false,
    whatsappSent: false,
  };
  
  // Default to in-app if no channels specified
  const channels = request.channels || ['in_app'];
  
  try {
    // ✅ STEP 1: ALWAYS send in-app notification
    if (channels.includes('in_app')) {
      const inAppResult = await sendInAppNotification(request);
      response.inAppSent = inAppResult;
      
      if (inAppResult) {
        console.log('✅ [Notification Service] In-app notification sent');
      } else {
        console.error('❌ [Notification Service] In-app notification failed');
      }
    }
    
    // ✅ WhatsApp is optional channel
    if (channels.includes('whatsapp')) {
      const whatsappResult = await sendWhatsAppNotification(request);
      response.whatsappSent = whatsappResult;
      
      if (whatsappResult) {
        console.log('✅ [Notification Service] WhatsApp notification sent');
      } else {
        console.log('⚠️ [Notification Service] WhatsApp notification skipped or failed');
      }
    }
    
    // Success if at least one channel succeeded
    response.success = response.inAppSent || response.whatsappSent;
    
  } catch (error: any) {
    console.error('❌ [Notification Service] Error:', error.message);
    response.error = error.message;
  }
  
  return response;
}

/**
 * Send in-app notification
 */
async function sendInAppNotification(
  request: NotificationRequest
): Promise<boolean> {
  try {
    const notificationData: any = {
      user_id: request.userId,
      title: request.title,
      message: request.message,
      type: request.type,
      is_read: false,
    };
    
    // Add optional fields
    if (request.data?.relatedId) {
      notificationData.related_id = request.data.relatedId;
    }
    if (request.data?.relatedType) {
      notificationData.related_type = request.data.relatedType;
    }
    if (request.data?.actionUrl) {
      notificationData.action_url = request.data.actionUrl;
    }
    
    const { error } = await supabase
      .from('notifications')
      .insert(notificationData);
    
    if (error) {
      console.error('❌ [In-App] Failed to create notification:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ [In-App] Exception:', error);
    return false;
  }
}

/**
 * ✅ STEP 4: Send WhatsApp notification (with phone validation)
 */
async function sendWhatsAppNotification(
  request: NotificationRequest
): Promise<boolean> {
  try {
    // ✅ STEP 4: Get user phone number
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', request.userId)
      .single();
    
    if (error || !profile) {
      console.log('⚠️ [WhatsApp] User profile not found');
      return false;
    }
    
    // ✅ STEP 4: Validate phone number
    if (!profile.phone || !isValidPhoneNumber(profile.phone)) {
      console.log('⚠️ [WhatsApp] Invalid or missing phone number');
      return false;
    }
    
    const phoneNumber = normalizePhoneNumber(profile.phone);
    
    // Get WhatsApp template and variables
    const template = request.data?.whatsappTemplate;
    const variables = request.data?.whatsappVariables || {};
    
    if (!template) {
      console.log('⚠️ [WhatsApp] No template specified - using fallback message');
      // Fallback: use the in-app message (not ideal, but works)
      const result = await sendWhatsAppMessage({
        phone: phoneNumber,
        template: 'fallback',
        variables: {
          message: request.message,
        },
        userId: request.userId,
      });
      
      return result.success;
    }
    
    // Send using template
    const result = await sendWhatsAppMessage({
      phone: phoneNumber,
      template,
      variables,
      userId: request.userId,
    });
    
    return result.success;
    
  } catch (error: any) {
    // ✅ STEP 7: Fail-safe - Don't break if WhatsApp fails
    console.error('❌ [WhatsApp] Exception:', error.message);
    return false;
  }
}

/**
 * ✅ Batch send notifications to multiple users
 * Useful for matching notifications
 */
export async function sendBatchNotifications(
  requests: NotificationRequest[]
): Promise<NotificationResponse[]> {
  console.log(`🔔 [Notification Service] Sending ${requests.length} notifications in batch`);
  
  const results = await Promise.all(
    requests.map(request => sendNotification(request))
  );
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ [Notification Service] Batch complete: ${successCount}/${requests.length} sent`);
  
  return results;
}

/**
 * ✅ Helper: Create task notification
 */
export function createTaskNotification(
  userId: string,
  taskId: string,
  taskTitle: string,
  subcategory: string,
  location: string,
  includeWhatsApp: boolean = false
): NotificationRequest {
  return {
    userId,
    type: 'task',
    title: 'New Task Available',
    message: `New task: ${taskTitle}`,
    data: {
      relatedId: taskId,
      relatedType: 'task',
      actionUrl: `/tasks/${taskId}`,
      whatsappTemplate: 'new_task',
      whatsappVariables: {
        subcategory,
        location,
      },
    },
    channels: includeWhatsApp ? ['in_app', 'whatsapp'] : ['in_app'],
  };
}

/**
 * ✅ Helper: Create wish notification
 */
export function createWishNotification(
  userId: string,
  wishId: string,
  wishTitle: string,
  subcategory: string,
  location: string,
  includeWhatsApp: boolean = false
): NotificationRequest {
  return {
    userId,
    type: 'wish',
    title: 'New Customer Looking',
    message: `Customer looking for ${subcategory}`,
    data: {
      relatedId: wishId,
      relatedType: 'wish',
      actionUrl: `/wishes/${wishId}`,
      whatsappTemplate: 'new_wish_product',
      whatsappVariables: {
        subcategory,
        location,
      },
    },
    channels: includeWhatsApp ? ['in_app', 'whatsapp'] : ['in_app'],
  };
}

/**
 * ✅ Helper: Create match notification
 */
export function createMatchNotification(
  userId: string,
  listingId: string,
  listingTitle: string,
  price: string,
  matchCount: number = 1,
  includeWhatsApp: boolean = false
): NotificationRequest {
  return {
    userId,
    type: 'match_found',
    title: '🎯 Match Found!',
    message: `Found ${matchCount} matching item(s)`,
    data: {
      relatedId: listingId,
      relatedType: 'listing',
      actionUrl: `/listing/${listingId}`,
      whatsappTemplate: 'match_found',
      whatsappVariables: {
        count: matchCount.toString(),
      },
    },
    channels: includeWhatsApp ? ['in_app', 'whatsapp'] : ['in_app'],
  };
}

/**
 * ✅ Helper: Create chat notification
 */
export function createChatNotification(
  userId: string,
  conversationId: string,
  senderName: string,
  subject: string,
  includeWhatsApp: boolean = false
): NotificationRequest {
  return {
    userId,
    type: 'chat',
    title: 'New Message',
    message: `${senderName} sent you a message`,
    data: {
      relatedId: conversationId,
      relatedType: 'conversation',
      actionUrl: `/chat/${conversationId}`,
      whatsappTemplate: 'new_message',
      whatsappVariables: {
        sender_name: senderName,
        subject,
      },
    },
    channels: includeWhatsApp ? ['in_app', 'whatsapp'] : ['in_app'],
  };
}

/**
 * ✅ Helper: Create offer notification
 */
export function createOfferNotification(
  userId: string,
  offerId: string,
  senderName: string,
  subject: string,
  includeWhatsApp: boolean = false
): NotificationRequest {
  return {
    userId,
    type: 'offer',
    title: 'New Response',
    message: `${senderName} responded to your request`,
    data: {
      relatedId: offerId,
      relatedType: 'offer',
      actionUrl: `/offers/${offerId}`,
      whatsappTemplate: 'new_offer',
      whatsappVariables: {
        sender_name: senderName,
        subject,
      },
    },
    channels: includeWhatsApp ? ['in_app', 'whatsapp'] : ['in_app'],
  };
}
