// =====================================================
// VERIFY OTP EDGE FUNCTION - LocalFelo
// Verifies OTP via 2Factor API and creates/logs in user
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOTPRequest {
  sessionId: string;
  otp: string;
  name?: string; // Required for new users
  phone: string; // Required to fetch session
}

interface TwoFactorVerifyResponse {
  Status: 'Success' | 'Error';
  Details: string;
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
    const { sessionId, otp, name, phone }: VerifyOTPRequest = await req.json();

    console.log(`🔐 Verifying OTP for session: ${sessionId}`);

    // Validate inputs
    if (!sessionId || !otp || !phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OTP session from database
    const { data: otpSession, error: sessionError } = await supabaseClient
      .from('otp_verifications')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (sessionError || !otpSession) {
      console.error('❌ OTP session not found:', sessionId);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired OTP session' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP has expired
    if (new Date(otpSession.expires_at) < new Date()) {
      console.log('⏰ OTP expired, cleaning up session');
      await supabaseClient.from('otp_verifications').delete().eq('session_id', sessionId);
      return new Response(
        JSON.stringify({ success: false, error: 'OTP has expired. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if max attempts exceeded
    if (otpSession.attempts >= otpSession.max_attempts) {
      console.log('🚫 Max attempts exceeded, cleaning up session');
      await supabaseClient.from('otp_verifications').delete().eq('session_id', sessionId);
      return new Response(
        JSON.stringify({ success: false, error: 'Too many incorrect attempts. Please request a new OTP.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify OTP with 2Factor API
    const twoFactorApiKey = Deno.env.get('TWOFACTOR_API_KEY');
    if (!twoFactorApiKey) {
      console.error('❌ TWOFACTOR_API_KEY not configured');
      throw new Error('SMS service not configured');
    }

    const verifyUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/SMS/VERIFY/${otpSession.two_factor_session_id}/${otp}`;
    
    console.log(`🔄 Verifying OTP with 2Factor...`);
    
    const verifyResponse = await fetch(verifyUrl);
    const verifyData: TwoFactorVerifyResponse = await verifyResponse.json();

    console.log(`📡 2Factor verify response: ${verifyData.Status}`);

    if (verifyData.Status !== 'Success') {
      console.log('❌ Invalid OTP, incrementing attempts');
      // Increment attempts counter
      await supabaseClient
        .from('otp_verifications')
        .update({ attempts: otpSession.attempts + 1 })
        .eq('session_id', sessionId);

      const remainingAttempts = otpSession.max_attempts - otpSession.attempts - 1;
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ OTP verified successfully with 2Factor');

    // OTP is valid - now handle user creation/login
    const cleanPhone = phone.replace(/\D/g, '');
    const dbPhone = `+91${cleanPhone}`;
    const fakeEmail = `${cleanPhone}@localfelo.app`; // Fake email for phone-only auth

    let userId: string;
    let isNewUser = false;

    // Check if user already exists
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('phone', dbPhone)
      .maybeSingle();

    if (!existingProfile) {
      // ========================================
      // NEW USER - Create auth user and profile
      // ========================================
      isNewUser = true;
      console.log('👤 New user detected, creating account');

      if (!name || !name.trim()) {
        return new Response(
          JSON.stringify({ success: false, error: 'Name is required for new users' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate a random password (user doesn't need to know it - phone auth only)
      const randomPassword = `pass_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: fakeEmail,
        password: randomPassword,
        email_confirm: true, // Auto-confirm since we verified via OTP
        user_metadata: {
          display_name: name,
          phone: dbPhone,
          auth_method: 'phone_otp',
        },
      });

      if (authError || !authData.user) {
        console.error('❌ Failed to create auth user:', authError);
        throw new Error('Failed to create account. Please try again.');
      }

      userId = authData.user.id;
      console.log(`✅ Auth user created: ${userId}`);

      // Create profile in profiles table
      const clientToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
      const ownerToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;

      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: userId,
          phone: dbPhone,
          name: name.trim(),
          display_name: name.trim(),
          client_token: clientToken,
          owner_token: ownerToken,
          whatsapp_same: true,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('❌ Failed to create profile:', profileError);
        // Clean up auth user if profile creation fails
        await supabaseClient.auth.admin.deleteUser(userId);
        throw new Error('Failed to create profile. Please try again.');
      }

      console.log(`✅ Profile created for user: ${userId}`);
    } else {
      // ========================================
      // EXISTING USER - Just log them in
      // ========================================
      userId = existingProfile.id;
      console.log(`👤 Existing user logging in: ${userId}`);
    }

    // Generate session tokens for the user
    const { data: sessionData, error: sessionCreateError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: fakeEmail,
    });

    if (sessionCreateError || !sessionData.properties) {
      console.error('❌ Failed to generate session:', sessionCreateError);
      throw new Error('Failed to create login session. Please try again.');
    }

    console.log('🔑 Session tokens generated');

    // Clean up OTP session (no longer needed)
    await supabaseClient.from('otp_verifications').delete().eq('session_id', sessionId);
    console.log('🧹 OTP session cleaned up');

    // Get full profile data to return
    const { data: fullProfile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log(`✅ OTP verification complete for ${dbPhone} - ${isNewUser ? 'NEW USER' : 'EXISTING USER'}`);

    // Return success response with user data and tokens
    return new Response(
      JSON.stringify({
        success: true,
        isNewUser: isNewUser,
        user: {
          id: userId,
          phone: dbPhone,
          name: fullProfile?.name || fullProfile?.display_name || name,
          email: fullProfile?.email || undefined,
          clientToken: fullProfile?.client_token,
          profilePic: fullProfile?.avatar_url,
          whatsappSame: fullProfile?.whatsapp_same ?? true,
        },
        accessToken: sessionData.properties.access_token,
        refreshToken: sessionData.properties.refresh_token,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ verify-otp error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error. Please try again.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/* =====================================================
 * TESTING THIS FUNCTION:
 * =====================================================
 * 
 * 1. Deploy: npx supabase functions deploy verify-otp
 * 2. Test after receiving OTP:
 * 
 * curl -X POST http://localhost:54321/functions/v1/verify-otp \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "sessionId": "session_1234567890_abc123",
 *     "otp": "123456",
 *     "phone": "9876543210",
 *     "name": "Test User"
 *   }'
 * 
 * Expected response (new user):
 * {
 *   "success": true,
 *   "isNewUser": true,
 *   "user": {
 *     "id": "uuid-here",
 *     "phone": "+919876543210",
 *     "name": "Test User",
 *     "clientToken": "token_xxx"
 *   },
 *   "accessToken": "eyJhbGc...",
 *   "refreshToken": "xxx"
 * }
 * 
 * =====================================================
 */
