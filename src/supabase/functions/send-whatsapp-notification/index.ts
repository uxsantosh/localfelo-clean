// =====================================================
// Supabase Edge Function: Send WhatsApp Notification via Interakt
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  phoneNumber: string;
  templateName: string;
  variables: Record<string, string>;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Interakt API credentials from environment
    const INTERAKT_API_KEY = Deno.env.get('INTERAKT_API_KEY');
    const INTERAKT_BASE_URL = Deno.env.get('INTERAKT_BASE_URL') || 'https://api.interakt.ai/v1';

    if (!INTERAKT_API_KEY) {
      throw new Error('INTERAKT_API_KEY not configured in environment variables');
    }

    // Parse request body
    const body: WhatsAppRequest = await req.json();
    const { phoneNumber, templateName, variables, userId } = body;

    console.log('[WhatsApp] Processing notification:', {
      phone: phoneNumber,
      template: templateName,
      userId
    });

    // Validate phone number format (should be in international format without +)
    let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    
    // If phone starts with 91 (India) and has 12 digits, it's already formatted
    // If it has 10 digits, add 91 prefix
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }

    console.log('[WhatsApp] Formatted phone:', formattedPhone);

    // Prepare Interakt API request
    const interaktPayload = {
      countryCode: '+91',
      phoneNumber: formattedPhone,
      callbackData: userId || 'system',
      type: 'Template',
      template: {
        name: templateName,
        languageCode: 'en',
        bodyValues: Object.values(variables)
      }
    };

    console.log('[WhatsApp] Sending to Interakt:', interaktPayload);

    // Send request to Interakt API
    const interaktResponse = await fetch(`${INTERAKT_BASE_URL}/public/message/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${INTERAKT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interaktPayload)
    });

    const interaktData = await interaktResponse.json();

    if (!interaktResponse.ok) {
      console.error('[WhatsApp] Interakt API error:', interaktData);
      throw new Error(`Interakt API error: ${JSON.stringify(interaktData)}`);
    }

    console.log('[WhatsApp] Successfully sent via Interakt:', interaktData);

    // Log to database for tracking (optional)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store WhatsApp notification log
    await supabase.from('whatsapp_notifications').insert({
      user_id: userId,
      phone_number: formattedPhone,
      template_name: templateName,
      variables: variables,
      status: 'sent',
      interakt_response: interaktData,
      sent_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'WhatsApp notification sent successfully',
        interaktResponse: interaktData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('[WhatsApp] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send WhatsApp notification'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
