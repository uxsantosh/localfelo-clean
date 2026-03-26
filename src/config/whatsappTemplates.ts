// =====================================================
// WhatsApp Message Templates
// Template-based messaging system
// =====================================================

/**
 * ✅ STEP 6: WhatsApp Template Definitions
 * 
 * These templates are used to format WhatsApp messages
 * Each template has a unique key and variable placeholders
 * 
 * ✅ STEP 5: All messages include opt-out footer
 */

export interface WhatsAppTemplate {
  key: string;
  message: string;
  variables: string[];
}

/**
 * ✅ STEP 5: Standard footer for all WhatsApp messages
 * Allows users to opt-out via STOP command
 */
const WHATSAPP_FOOTER = '\n\nReply STOP to disable WhatsApp updates';

/**
 * All available WhatsApp templates
 */
export const WHATSAPP_TEMPLATES: Record<string, WhatsAppTemplate> = {
  
  // ✅ STEP 5.1: Task Created - To Professionals
  NEW_TASK: {
    key: 'new_task',
    message: `New task available: {subcategory} near {location}. Tap to view details.${WHATSAPP_FOOTER}`,
    variables: ['subcategory', 'location'],
  },
  
  // ✅ STEP 5.2: Wish Created (Product) - To Shops
  NEW_WISH_PRODUCT: {
    key: 'new_wish_product',
    message: `New customer looking for {subcategory} near you in {location}. Tap to respond.${WHATSAPP_FOOTER}`,
    variables: ['subcategory', 'location'],
  },
  
  // ✅ STEP 5.3: Match Found - To Users
  MATCH_FOUND: {
    key: 'match_found',
    message: `🎯 Found {count} matches for your request near you. Check now!${WHATSAPP_FOOTER}`,
    variables: ['count'],
  },
  
  // ✅ STEP 5.4: Chat Initiated - New Message
  NEW_MESSAGE: {
    key: 'new_message',
    message: `New message from {sender_name} about "{subject}". Reply now!${WHATSAPP_FOOTER}`,
    variables: ['sender_name', 'subject'],
  },
  
  // ✅ STEP 5.5: Offer/Response Received
  NEW_OFFER: {
    key: 'new_offer',
    message: `{sender_name} responded to your request: "{subject}". View offer!${WHATSAPP_FOOTER}`,
    variables: ['sender_name', 'subject'],
  },
  
  // Additional templates
  WISH_ACCEPTED: {
    key: 'wish_accepted',
    message: `{helper_name} wants to help with your wish: "{wish_title}". Start chatting!${WHATSAPP_FOOTER}`,
    variables: ['helper_name', 'wish_title'],
  },
  
  TASK_RESPONSE: {
    key: 'task_response',
    message: `{professional_name} is interested in your task: "{task_title}". View profile!${WHATSAPP_FOOTER}`,
    variables: ['professional_name', 'task_title'],
  },
  
  LISTING_MATCH: {
    key: 'listing_match',
    message: `Perfect match! "{listing_title}" matches your wish. Only ₹{price}!${WHATSAPP_FOOTER}`,
    variables: ['listing_title', 'price'],
  },
  
  SHOP_MATCH: {
    key: 'shop_match',
    message: `A customer is looking for products you sell in {category}. Respond quickly!${WHATSAPP_FOOTER}`,
    variables: ['category'],
  },
};

/**
 * Get template by key
 */
export function getWhatsAppTemplate(key: string): WhatsAppTemplate | null {
  const template = Object.values(WHATSAPP_TEMPLATES).find(t => t.key === key);
  if (!template) {
    console.warn(`⚠️ [WhatsApp] Template not found: ${key}`);
  }
  return template || null;
}

/**
 * Format template with variables
 */
export function formatWhatsAppMessage(
  templateKey: string,
  variables: Record<string, string>
): string | null {
  const template = getWhatsAppTemplate(templateKey);
  if (!template) return null;
  
  let message = template.message;
  
  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
  });
  
  return message;
}