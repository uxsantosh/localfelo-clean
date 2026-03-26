// =====================================================
// SEND OTP EDGE FUNCTION - LocalFelo
// Sends OTP via 2Factor SMS API for phone authentication
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOTPRequest {
  phone: string; // 10-digit Indian phone number (without +91)
}

interface TwoFactorOTPResponse {
  Status: 'Success' | 'Error';
  Details: string; // Session ID on success, error message on failure
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { phone }: SendOTPRequest = await req.json();

    // Validate phone number (must be 10 digits)
    if (!phone || !/^\d{10}$/.test(phone)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid phone number format. Please enter a 10-digit number.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📞 Sending OTP to phone: ${phone}`);

    // Get 2Factor API key from environment
    const twoFactorApiKey = Deno.env.get('TWOFACTOR_API_KEY');
    if (!twoFactorApiKey) {
      console.error('❌ TWOFACTOR_API_KEY not configured in Supabase secrets');
      throw new Error('SMS OTP service not configured');
    }

    // Call 2Factor SMS OTP API (AUTOGEN - 2Factor generates and stores OTP)
    // SMS OTP endpoint format: https://2factor.in/API/V1/{API_KEY}/SMS/{PHONE}/AUTOGEN
    const otpUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/SMS/+91${phone}/AUTOGEN`;
    
    console.log(`🔄 Calling 2Factor SMS API`);
    
    // 2Factor SMS OTP uses simple GET request
    const otpResponse = await fetch(otpUrl, {
      method: 'GET',
    });
    
    const otpData: TwoFactorOTPResponse = await otpResponse.json();

    console.log(`📡 2Factor response status: ${otpData.Status}`);

    if (otpData.Status !== 'Success') {
      console.error('❌ 2Factor SMS OTP failed:', otpData.Details);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send OTP. Please try again or check your phone number.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const twoFactorSessionId = otpData.Details; // This is the session ID from 2Factor
    console.log(`✅ 2Factor session ID: ${twoFactorSessionId}`);

    // Check if user already exists (for returning isNewUser flag)
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('phone', `+91${phone}`)
      .maybeSingle();

    const isNewUser = !existingProfile;
    console.log(`👤 User status: ${isNewUser ? 'NEW USER' : 'EXISTING USER'}`);

    // Generate our own session ID for frontend tracking
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store OTP session in database
    const { error: insertError } = await supabaseClient
      .from('otp_verifications')
      .insert({
        phone: `+91${phone}`,
        session_id: sessionId,
        two_factor_session_id: twoFactorSessionId,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        attempts: 0,
        max_attempts: 3,
      });

    if (insertError) {
      console.error('❌ Failed to store OTP session:', insertError);
      // Don't fail the request - OTP was sent successfully
      // Just log the error for monitoring
    } else {
      console.log(`💾 OTP session stored: ${sessionId}`);
    }

    console.log(`✅ SMS OTP sent successfully to ${phone}`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        sessionId: sessionId,
        twoFactorSessionId: twoFactorSessionId,
        isNewUser: isNewUser,
        message: 'OTP sent successfully via SMS. Please check your messages.',
        expiresIn: 600, // 10 minutes in seconds
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ send-otp error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error. Please try again.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/* =====================================================
 * TESTING THIS FUNCTION:
 * =====================================================
 * 
 * 1. Deploy: npx supabase functions deploy send-otp
 * 2. Set secret: npx supabase secrets set TWOFACTOR_API_KEY=your_key
 * 3. Test locally:
 * 
 * curl -X POST http://localhost:54321/functions/v1/send-otp \
 *   -H "Content-Type: application/json" \
 *   -d '{"phone":"9876543210"}'
 * 
 * Expected response:
 * {
 *   "success": true,
 *   "sessionId": "session_1234567890_abc123",
 *   "twoFactorSessionId": "12345678-1234-1234-1234-123456789012",
 *   "isNewUser": true,
 *   "message": "OTP sent successfully via SMS. Please check your messages."
 * }
 * 
 * =====================================================
 */