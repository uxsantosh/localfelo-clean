// =====================================================
// Interakt WhatsApp Notification Service
// Handles all WhatsApp notifications via Interakt API
// =====================================================

import { supabase } from '../lib/supabaseClient';

export interface WhatsAppNotificationData {
  phoneNumber: string;
  templateName: string;
  variables: Record<string, string>;
  userId?: string;
}

/**
 * Send WhatsApp notification via Supabase Edge Function
 * This calls the send-whatsapp-notification edge function
 */
export async function sendWhatsAppNotification(data: WhatsAppNotificationData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[WhatsApp] Sending notification:', {
      phone: data.phoneNumber,
      template: data.templateName,
      variables: data.variables
    });

    const { data: result, error } = await supabase.functions.invoke('send-whatsapp-notification', {
      body: {
        phoneNumber: data.phoneNumber,
        templateName: data.templateName,
        variables: data.variables,
        userId: data.userId
      }
    });

    if (error) {
      console.error('[WhatsApp] Error sending notification:', error);
      
      // ✅ FIX: Check if edge function doesn't exist or API not configured
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        console.warn('[WhatsApp] ⚠️ Edge function not deployed yet - WhatsApp notifications disabled');
        return { success: false, error: 'Edge function not found' };
      }
      
      if (error.message?.includes('API') || error.message?.includes('credentials')) {
        console.warn('[WhatsApp] ⚠️ Interakt API not configured - WhatsApp notifications disabled');
        return { success: false, error: 'API not configured' };
      }
      
      // Generic error - don't throw, just log
      console.warn('[WhatsApp] ⚠️ WhatsApp notification failed (non-critical):', error.message);
      return { success: false, error: error.message };
    }

    console.log('[WhatsApp] Notification sent successfully:', result);
    return { success: true };
  } catch (error: any) {
    // ✅ FIX: Silently handle all errors - WhatsApp is optional
    console.warn('[WhatsApp] ⚠️ Exception sending notification (non-critical):', error?.message || error);
    return { success: false, error: error?.message || 'Failed to send WhatsApp notification' };
  }
}

// =====================================================
// TASK NOTIFICATIONS
// =====================================================

/**
 * Send WhatsApp notification when task is accepted
 */
export async function notifyTaskAccepted(params: {
  taskCreatorPhone: string;
  taskCreatorName: string;
  helperName: string;
  taskTitle: string;
  taskPrice: number;
  userId?: string;
}): Promise<void> {
  await sendWhatsAppNotification({
    phoneNumber: params.taskCreatorPhone,
    templateName: 'task_accepted',
    variables: {
      customer_name: params.taskCreatorName,
      helper_name: params.helperName,
      task_title: params.taskTitle
    },
    userId: params.userId
  });
}

/**
 * Send WhatsApp notification when task is cancelled
 */
export async function notifyTaskCancelled(params: {
  recipientPhone: string;
  recipientName: string;
  taskTitle: string;
  cancelledBy: string;
  userId?: string;
}): Promise<void> {
  await sendWhatsAppNotification({
    phoneNumber: params.recipientPhone,
    templateName: 'task_cancelled',
    variables: {
      customer_name: params.recipientName,
      task_title: params.taskTitle,
      cancelled_by: params.cancelledBy
    },
    userId: params.userId
  });
}

/**
 * Send WhatsApp notification when task is completed
 */
export async function notifyTaskCompleted(params: {
  taskCreatorPhone: string;
  taskCreatorName: string;
  helperName: string;
  taskTitle: string;
  taskPrice: number;
  userId?: string;
}): Promise<void> {
  await sendWhatsAppNotification({
    phoneNumber: params.taskCreatorPhone,
    templateName: 'task_completed',
    variables: {
      customer_name: params.taskCreatorName,
      helper_name: params.helperName,
      task_title: params.taskTitle
    },
    userId: params.userId
  });
}

// =====================================================
// CHAT NOTIFICATIONS
// =====================================================

/**
 * Send WhatsApp notification for first chat message
 */
export async function notifyFirstChatMessage(params: {
  recipientPhone: string;
  recipientName: string;
  senderName: string;
  listingTitle: string;
  messagePreview: string;
  listingType: 'task' | 'wish' | 'marketplace';
  userId?: string;
}): Promise<void> {
  const typeText = params.listingType === 'task' ? 'task' : params.listingType === 'wish' ? 'wish' : 'listing';
  
  await sendWhatsAppNotification({
    phoneNumber: params.recipientPhone,
    templateName: 'first_message',
    variables: {
      customer_name: params.recipientName,
      sender_name: params.senderName,
      listing_title: params.listingTitle,
      message_preview: params.messagePreview.substring(0, 100),
      listing_type: typeText
    },
    userId: params.userId
  });
}

/**
 * Send WhatsApp notification for new message after long gap
 */
export async function notifyMessageAfterGap(params: {
  recipientPhone: string;
  recipientName: string;
  senderName: string;
  listingTitle: string;
  messagePreview: string;
  userId?: string;
}): Promise<void> {
  await sendWhatsAppNotification({
    phoneNumber: params.recipientPhone,
    templateName: 'message_after_gap',
    variables: {
      customer_name: params.recipientName,
      sender_name: params.senderName,
      listing_title: params.listingTitle,
      message_preview: params.messagePreview.substring(0, 100)
    },
    userId: params.userId
  });
}

// =====================================================
// AUTH NOTIFICATIONS
// =====================================================

/**
 * Send WhatsApp OTP for authentication
 * IMPORTANT: Uses Meta's default AUTHENTICATION template with positional variables
 * Template format: "{{1}} is your verification code. For your security, do not share this code."
 */
export async function sendWhatsAppOTP(params: {
  phoneNumber: string;
  userName: string;
  otp: string;
  userId?: string;
}): Promise<void> {
  await sendWhatsAppNotification({
    phoneNumber: params.phoneNumber,
    templateName: 'otp_verification',
    variables: {
      '1': params.otp  // Meta's AUTHENTICATION template uses positional {{1}}
    },
    userId: params.userId
  });
}

/**
 * Send WhatsApp notification for password reset
 */
export async function sendPasswordResetWhatsApp(params: {
  phoneNumber: string;
  userName: string;
  resetCode: string;
  userId?: string;
}): Promise<void> {
  await sendWhatsAppNotification({
    phoneNumber: params.phoneNumber,
    templateName: 'password_reset',
    variables: {
      customer_name: params.userName,
      reset_code: params.resetCode,
      validity: '30 minutes'
    },
    userId: params.userId
  });
}

// =====================================================
// MARKETPLACE NOTIFICATIONS
// =====================================================

/**
 * Send WhatsApp notification for first message on marketplace listing
 * Template: listing_interest
 */
export async function notifyListingInterest(params: {
  sellerPhone: string;
  sellerName: string;
  buyerName: string;
  listingTitle: string;
  messagePreview: string;
  userId?: string;
}): Promise<void> {
  await sendWhatsAppNotification({
    phoneNumber: params.sellerPhone,
    templateName: 'listing_interest',
    variables: {
      seller_name: params.sellerName,
      buyer_name: params.buyerName,
      listing_title: params.listingTitle,
      message_preview: params.messagePreview.substring(0, 100)
    },
    userId: params.userId
  });
}

// =====================================================
// WISH RESPONSE NOTIFICATIONS
// =====================================================

/**
 * Send WhatsApp notification when someone responds to a wish
 * Template: wish_response
 */
export async function notifyWishResponse(params: {
  wishCreatorPhone: string;
  wishCreatorName: string;
  sellerName: string;
  wishTitle: string;
  messagePreview: string;
  userId?: string;
}): Promise<void> {
  await sendWhatsAppNotification({
    phoneNumber: params.wishCreatorPhone,
    templateName: 'wish_response',
    variables: {
      customer_name: params.wishCreatorName,
      seller_name: params.sellerName,
      wish_title: params.wishTitle,
      message_preview: params.messagePreview.substring(0, 100)
    },
    userId: params.userId
  });
}

// =====================================================
// UNREAD MESSAGE REMINDERS
// =====================================================

/**
 * Send WhatsApp reminder for unread messages (6 hours after last message)
 * Template: unread_reminder
 */
export async function notifyUnreadReminder(params: {
  recipientPhone: string;
  recipientName: string;
  unreadCount: number;
  senderName: string;
  messagePreview: string;
  userId?: string;
}): Promise<void> {
  await sendWhatsAppNotification({
    phoneNumber: params.recipientPhone,
    templateName: 'unread_reminder',
    variables: {
      customer_name: params.recipientName,
      unread_count: params.unreadCount.toString(),
      sender_name: params.senderName,
      message_preview: params.messagePreview.substring(0, 100)
    },
    userId: params.userId
  });
}

// =====================================================
// DEPRECATED FUNCTIONS (Backward Compatibility)
// =====================================================

/**
 * DEPRECATED: Use notifyListingInterest instead
 * Kept for backward compatibility
 */
export async function notifyMarketplaceFirstMessage(params: {
  sellerPhone: string;
  sellerName: string;
  buyerName: string;
  listingTitle: string;
  messagePreview: string;
  userId?: string;
}): Promise<void> {
  await notifyListingInterest(params);
}

/**
 * DEPRECATED: Use notifyWishResponse instead
 * Kept for backward compatibility
 */
export async function notifyWishFirstMessage(params: {
  wishCreatorPhone: string;
  wishCreatorName: string;
  senderName: string;
  wishTitle: string;
  messagePreview: string;
  userId?: string;
}): Promise<void> {
  await notifyWishResponse({
    wishCreatorPhone: params.wishCreatorPhone,
    wishCreatorName: params.wishCreatorName,
    sellerName: params.senderName,
    wishTitle: params.wishTitle,
    messagePreview: params.messagePreview,
    userId: params.userId
  });
}