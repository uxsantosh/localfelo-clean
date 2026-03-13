// =====================================================
// PHONE OTP AUTHENTICATION SERVICE - LocalFelo
// Real implementation using 2Factor API via edge functions
// WhatsApp notifications will be added later
// =====================================================

import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
// import { sendWhatsAppOTP } from './interaktWhatsApp'; // ✅ DISABLED: Will enable when ready for WhatsApp

export interface PhoneAuthResult {
  isNewUser: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Format phone number for display and storage
 */
export function formatPhone(phone: string): { display: string; clean: string } {
  const clean = phone.replace(/\D/g, '');
  
  if (clean.length === 10) {
    return {
      display: `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`,
      clean: clean,
    };
  }
  
  return { display: phone, clean: phone };
}

/**
 * Validate Indian phone number (10 digits)
 */
export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/\D/g, '');
  return /^\d{10}$/.test(clean);
}

/**
 * Send OTP to phone number via edge function AND WhatsApp
 * Returns sessionId for verification
 */
export async function sendOTP(phone: string, userName?: string): Promise<{
  sessionId: string;
  isNewUser: boolean;
  expiresIn: number;
}> {
  const formatted = formatPhone(phone);
  
  if (!validatePhone(formatted.clean)) {
    throw new Error('Invalid phone number. Please enter a valid 10-digit number.');
  }

  try {
    console.log('📞 Sending OTP via SMS to:', formatted.display);
    console.log('🎯 OTP Purpose: New registration or forgot password flow only');
    
    // Call send-otp edge function (SMS via 2Factor)
    const { data, error } = await supabase.functions.invoke('send-otp', {
      body: { phone: formatted.clean }
    });

    if (error) {
      console.error('❌ Send OTP edge function error:', error);
      throw new Error('Failed to send OTP. Please try again.');
    }

    if (!data || !data.success) {
      console.error('❌ Send OTP failed:', data?.error);
      throw new Error(data?.error || 'Failed to send OTP. Please try again.');
    }

    console.log('✅ SMS OTP sent successfully, session:', data.sessionId);
    
    // ✅ DISABLED: WhatsApp OTP notifications (will enable later)
    // Also send WhatsApp OTP via Interakt (non-blocking)
    // Uncomment when ready to use WhatsApp notifications:
    /*
    try {
      console.log('📱 Also sending OTP via WhatsApp...');
      await sendWhatsAppOTP({
        phoneNumber: formatted.clean,
        userName: userName || 'User',
        otp: data.otp || '******', // Use actual OTP if available
      });
      console.log('✅ WhatsApp OTP sent successfully');
    } catch (whatsappError: any) {
      // Don't fail the entire flow if WhatsApp fails - it's optional
      console.warn('⚠️ WhatsApp OTP delivery skipped (non-critical):', whatsappError?.message || whatsappError);
    }
    */
    
    return {
      sessionId: data.sessionId,
      isNewUser: data.isNewUser,
      expiresIn: data.expiresIn || 600, // Default 10 minutes
    };
  } catch (error: any) {
    console.error('❌ Send OTP error:', error);
    throw new Error(error.message || 'Failed to send OTP. Please try again.');
  }
}

/**
 * Verify OTP code via edge function
 * Returns user data and session tokens
 * NOTE: If name is not provided, just verifies OTP without creating user
 */
export async function verifyOTP(
  sessionId: string,
  otp: string,
  phone: string,
  name?: string // Optional - if not provided, just verifies OTP
): Promise<PhoneAuthResult | { verified: true }> {
  const formatted = formatPhone(phone);
  
  try {
    console.log('🔐 Verifying OTP for session:', sessionId);
    
    // Call verify-otp edge function
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { 
        sessionId, 
        otp, 
        phone: formatted.clean,
        name: name?.trim()
      }
    });

    if (error) {
      console.error('❌ Verify OTP edge function error:', error);
      throw new Error('Failed to verify OTP. Please try again.');
    }

    if (!data || !data.success) {
      console.error('❌ Verify OTP failed:', data?.error);
      throw new Error(data?.error || 'Invalid OTP. Please check and try again.');
    }

    console.log('✅ OTP verified successfully');

    // If no name provided, just return verification success
    // (Frontend will collect name and password, then create user manually)
    if (!name) {
      return { verified: true };
    }

    // Set Supabase session with the returned tokens
    console.log('🔐 [AuthPhone] About to set session with tokens...');
    console.log('   Access Token:', data.accessToken ? `✅ Present (${data.accessToken.length} chars)` : '❌ Missing');
    console.log('   Refresh Token:', data.refreshToken ? `✅ Present (${data.refreshToken.length} chars)` : '❌ Missing');
    
    if (data.accessToken && data.refreshToken) {
      console.log('🔐 [AuthPhone] Calling supabase.auth.setSession()...');
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
      });

      if (sessionError) {
        console.error('❌ [AuthPhone] Failed to set session:', sessionError);
        // Don't throw - continue with user data
      } else {
        console.log('✅ [AuthPhone] Supabase session set successfully!');
        console.log('   Session data:', sessionData ? 'Present' : 'Missing');
        if (sessionData?.session) {
          console.log('   Session user:', sessionData.session.user?.id);
        }
      }
    } else {
      console.warn('⚠️ [AuthPhone] Tokens missing, cannot set session');
    }

    return {
      isNewUser: data.isNewUser,
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error);
    throw new Error(error.message || 'Failed to verify OTP. Please try again.');
  }
}

/**
 * Resend OTP (wrapper around sendOTP)
 */
export async function resendOTP(phone: string, userName?: string): Promise<{
  sessionId: string;
  isNewUser: boolean;
  expiresIn: number;
}> {
  return sendOTP(phone, userName);
}