// =====================================================
// WhatsApp Provider Abstraction Layer
// Provider-agnostic WhatsApp messaging
// =====================================================

/**
 * WhatsApp Provider Types
 * Add new providers as needed
 */
export type WhatsAppProviderType = 'interakt' | 'twilio' | 'gupshup' | 'none';

/**
 * WhatsApp Message Request
 */
export interface WhatsAppMessageRequest {
  phone: string;
  template: string;
  variables?: Record<string, string>;
  userId?: string; // For logging/tracking
}

/**
 * WhatsApp Message Response
 */
export interface WhatsAppMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

/**
 * WhatsApp Configuration
 * Read from environment variables or Supabase
 */
interface WhatsAppConfig {
  provider: WhatsAppProviderType;
  apiUrl?: string;
  apiKey?: string;
  enabled: boolean;
}

/**
 * Get WhatsApp configuration from environment or Supabase
 * Future: Can be enhanced to read from Supabase Edge Function config
 */
function getWhatsAppConfig(): WhatsAppConfig {
  // Check environment variables
  const provider = (import.meta.env.VITE_WHATSAPP_PROVIDER || 'none') as WhatsAppProviderType;
  const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL;
  const apiKey = import.meta.env.VITE_WHATSAPP_API_KEY;
  
  const enabled = provider !== 'none' && !!apiUrl && !!apiKey;
  
  if (enabled) {
    console.log(`📱 [WhatsApp] Provider configured: ${provider}`);
  } else {
    console.log('📱 [WhatsApp] No provider configured - WhatsApp notifications disabled');
  }
  
  return {
    provider,
    apiUrl,
    apiKey,
    enabled,
  };
}

/**
 * ✅ STEP 2: Send WhatsApp message
 * Provider-agnostic abstraction layer
 * 
 * This function provides a clean interface for sending WhatsApp messages
 * without coupling to any specific provider's API
 */
export async function sendWhatsAppMessage(
  request: WhatsAppMessageRequest
): Promise<WhatsAppMessageResponse> {
  try {
    const config = getWhatsAppConfig();
    
    // ✅ STEP 7: Fail-safe - Skip if WhatsApp not configured
    if (!config.enabled) {
      console.log('📱 [WhatsApp] Skipped - Provider not configured');
      return {
        success: false,
        error: 'WhatsApp provider not configured',
      };
    }
    
    // ✅ STEP 5: Check if user has opted out of WhatsApp
    if (request.userId) {
      const { supabase } = await import('../lib/supabaseClient');
      const { data: profile } = await supabase
        .from('profiles')
        .select('whatsapp_enabled')
        .eq('id', request.userId)
        .single();
      
      if (profile && profile.whatsapp_enabled === false) {
        console.log('📱 [WhatsApp] Skipped - User opted out (STOP received)');
        return {
          success: false,
          error: 'User opted out of WhatsApp notifications',
        };
      }
    }
    
    // Validate phone number
    if (!request.phone || request.phone.length < 10) {
      console.log('📱 [WhatsApp] Skipped - Invalid phone number');
      return {
        success: false,
        error: 'Invalid phone number',
      };
    }
    
    // ✅ STEP 8: Logging - WhatsApp triggered
    console.log('📱 [WhatsApp] Sending message:', {
      provider: config.provider,
      phone: request.phone.substring(0, 6) + '****', // Masked for privacy
      template: request.template,
      userId: request.userId,
    });
    
    // ✅ Provider-specific implementation
    let response: WhatsAppMessageResponse;
    
    switch (config.provider) {
      case 'interakt':
        response = await sendViaInterakt(request, config);
        break;
        
      case 'twilio':
        response = await sendViaTwilio(request, config);
        break;
        
      case 'gupshup':
        response = await sendViaGupshup(request, config);
        break;
        
      default:
        response = {
          success: false,
          error: `Unknown provider: ${config.provider}`,
        };
    }
    
    // ✅ STEP 8: Logging - Success/failure
    if (response.success) {
      console.log('✅ [WhatsApp] Message sent successfully:', response.messageId);
      
      // Log to database (optional)
      if (request.userId) {
        await logWhatsAppMessage(request, response, 'sent');
      }
    } else {
      console.error('❌ [WhatsApp] Message failed:', response.error);
      
      // Log failure to database (optional)
      if (request.userId) {
        await logWhatsAppMessage(request, response, 'failed');
      }
    }
    
    return response;
    
  } catch (error: any) {
    // ✅ STEP 7: Fail-safe - Log error but don't throw
    console.error('❌ [WhatsApp] Exception:', error.message);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Send via Interakt API
 * Placeholder implementation - activate when credentials are available
 */
async function sendViaInterakt(
  request: WhatsAppMessageRequest,
  config: WhatsAppConfig
): Promise<WhatsAppMessageResponse> {
  try {
    // PLACEHOLDER: Real implementation to be added when credentials are configured
    console.log('📱 [Interakt] Placeholder - Real API call would happen here');
    
    // Future implementation:
    // const response = await fetch(config.apiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${config.apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     countryCode: '+91',
    //     phoneNumber: request.phone,
    //     templateName: request.template,
    //     variables: request.variables,
    //   }),
    // });
    
    return {
      success: false,
      error: 'Interakt API not yet configured - placeholder only',
      provider: 'interakt',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      provider: 'interakt',
    };
  }
}

/**
 * Send via Twilio API
 * Placeholder implementation - activate when credentials are available
 */
async function sendViaTwilio(
  request: WhatsAppMessageRequest,
  config: WhatsAppConfig
): Promise<WhatsAppMessageResponse> {
  try {
    console.log('📱 [Twilio] Placeholder - Real API call would happen here');
    
    // Future implementation:
    // const response = await fetch(config.apiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${btoa(config.apiKey)}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     To: `whatsapp:+91${request.phone}`,
    //     From: 'whatsapp:YOUR_TWILIO_NUMBER',
    //     Body: formatTemplateMessage(request.template, request.variables),
    //   }),
    // });
    
    return {
      success: false,
      error: 'Twilio API not yet configured - placeholder only',
      provider: 'twilio',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      provider: 'twilio',
    };
  }
}

/**
 * Send via Gupshup API
 * Placeholder implementation - activate when credentials are available
 */
async function sendViaGupshup(
  request: WhatsAppMessageRequest,
  config: WhatsAppConfig
): Promise<WhatsAppMessageResponse> {
  try {
    console.log('📱 [Gupshup] Placeholder - Real API call would happen here');
    
    // Future implementation would go here
    
    return {
      success: false,
      error: 'Gupshup API not yet configured - placeholder only',
      provider: 'gupshup',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      provider: 'gupshup',
    };
  }
}

/**
 * Helper: Format template message with variables
 * Used by providers that don't support native templates
 */
function formatTemplateMessage(
  template: string,
  variables?: Record<string, string>
): string {
  if (!variables) return template;
  
  let message = template;
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, value);
  });
  
  return message;
}

/**
 * Validate phone number format
 * Supports Indian numbers (10 digits)
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Remove spaces, dashes, etc.
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Indian phone numbers: 10 digits
  const indianPattern = /^[6-9]\d{9}$/;
  
  // With country code: +91 followed by 10 digits
  const withCountryCode = /^\+91[6-9]\d{9}$/;
  
  return indianPattern.test(cleaned) || withCountryCode.test(cleaned);
}

/**
 * Normalize phone number to standard format
 * Ensures consistent format for API calls
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove country code if present
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  
  // Return 10-digit number
  return cleaned;
}

/**
 * Log WhatsApp message to database
 * Optional function to log sent/failed messages
 */
async function logWhatsAppMessage(
  request: WhatsAppMessageRequest,
  response: WhatsAppMessageResponse,
  status: 'sent' | 'failed'
): Promise<void> {
  const { supabase } = await import('../lib/supabaseClient');
  await supabase
    .from('whatsapp_logs')
    .insert({
      user_id: request.userId,
      phone: request.phone,
      template: request.template,
      variables: request.variables,
      provider: response.provider,
      message_id: response.messageId,
      status,
      error: response.error,
    });
}