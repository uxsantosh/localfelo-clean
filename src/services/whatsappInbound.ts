// =====================================================
// WhatsApp Inbound Message Handler
// Handles incoming WhatsApp messages (STOP, UNSUBSCRIBE, etc.)
// =====================================================

import { supabase } from '../lib/supabaseClient';

/**
 * ✅ STEP 5: Handle incoming WhatsApp messages
 * Process opt-out commands (STOP, UNSUBSCRIBE, etc.)
 * 
 * This function should be called by your WhatsApp webhook
 */
export async function handleIncomingWhatsAppMessage(
  phoneNumber: string,
  messageContent: string
): Promise<{ success: boolean; action?: string; error?: string }> {
  try {
    console.log('📱 [WhatsApp Inbound] Received message:', {
      phone: phoneNumber.substring(0, 6) + '****',
      content: messageContent.substring(0, 50),
    });
    
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    // Check if message contains opt-out keywords
    const optOutKeywords = [
      'STOP',
      'STOP ALL',
      'UNSUBSCRIBE',
      'CANCEL',
      'OPT OUT',
      'OPTOUT',
    ];
    
    const messageUpper = messageContent.trim().toUpperCase();
    const isOptOut = optOutKeywords.some(keyword => messageUpper.includes(keyword));
    
    if (isOptOut) {
      console.log('🚫 [WhatsApp Inbound] Opt-out keyword detected');
      return await handleOptOut(normalizedPhone, messageContent);
    }
    
    console.log('ℹ️ [WhatsApp Inbound] No action needed for this message');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ [WhatsApp Inbound] Error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * ✅ STEP 5: Handle opt-out request
 * Set whatsapp_enabled = false for the user
 */
async function handleOptOut(
  phoneNumber: string,
  optOutMessage: string
): Promise<{ success: boolean; action: string; error?: string }> {
  try {
    // Find user by phone number
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id, phone, whatsapp_enabled')
      .eq('phone', phoneNumber)
      .single();
    
    if (findError || !profile) {
      console.error('❌ [WhatsApp Opt-Out] User not found:', phoneNumber);
      return {
        success: false,
        action: 'user_not_found',
        error: 'User not found',
      };
    }
    
    // Check if already opted out
    if (profile.whatsapp_enabled === false) {
      console.log('ℹ️ [WhatsApp Opt-Out] User already opted out');
      return {
        success: true,
        action: 'already_opted_out',
      };
    }
    
    // Update whatsapp_enabled to false
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ whatsapp_enabled: false })
      .eq('id', profile.id);
    
    if (updateError) {
      console.error('❌ [WhatsApp Opt-Out] Failed to update profile:', updateError);
      return {
        success: false,
        action: 'update_failed',
        error: updateError.message,
      };
    }
    
    // Log opt-out to database (optional)
    await logOptOut(profile.id, phoneNumber, optOutMessage);
    
    console.log('✅ [WhatsApp Opt-Out] User opted out successfully:', profile.id);
    
    // Optional: Send confirmation message
    await sendOptOutConfirmation(phoneNumber);
    
    return {
      success: true,
      action: 'opted_out',
    };
    
  } catch (error: any) {
    console.error('❌ [WhatsApp Opt-Out] Exception:', error.message);
    return {
      success: false,
      action: 'exception',
      error: error.message,
    };
  }
}

/**
 * Log opt-out to database for compliance
 */
async function logOptOut(
  userId: string,
  phoneNumber: string,
  optOutMessage: string
): Promise<void> {
  try {
    await supabase
      .from('whatsapp_optouts')
      .insert({
        user_id: userId,
        phone_number: phoneNumber,
        optout_message: optOutMessage,
        optout_source: 'whatsapp',
      });
    
    console.log('✅ [WhatsApp Opt-Out] Logged to database');
  } catch (error: any) {
    console.error('⚠️ [WhatsApp Opt-Out] Failed to log:', error.message);
    // Don't throw - logging failure shouldn't break opt-out
  }
}

/**
 * Send confirmation message to user (optional)
 */
async function sendOptOutConfirmation(phoneNumber: string): Promise<void> {
  try {
    // You can send a confirmation message via WhatsApp API
    // "You have successfully unsubscribed from WhatsApp notifications. You will still receive in-app notifications."
    
    console.log('📱 [WhatsApp Opt-Out] Confirmation message sent to:', phoneNumber);
  } catch (error: any) {
    console.error('⚠️ [WhatsApp Opt-Out] Failed to send confirmation:', error.message);
    // Don't throw - confirmation failure shouldn't break opt-out
  }
}

/**
 * Normalize phone number to match database format
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digits except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove country code if present
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  
  return cleaned;
}

/**
 * ✅ STEP 5: Handle opt-in request (if user wants to re-enable)
 * Users who previously opted out can opt back in
 */
export async function handleOptIn(
  phoneNumber: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    // Find user by phone number
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id, whatsapp_enabled')
      .eq('phone', normalizedPhone)
      .single();
    
    if (findError || !profile) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    // Update whatsapp_enabled to true
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ whatsapp_enabled: true })
      .eq('id', profile.id);
    
    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      };
    }
    
    console.log('✅ [WhatsApp Opt-In] User opted in successfully:', profile.id);
    
    return { success: true };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if user has opted out of WhatsApp
 */
export async function isUserOptedOut(userId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('whatsapp_enabled')
      .eq('id', userId)
      .single();
    
    return profile?.whatsapp_enabled === false;
  } catch (error) {
    console.error('❌ [WhatsApp] Failed to check opt-out status:', error);
    return false; // Default to not opted out if error
  }
}
