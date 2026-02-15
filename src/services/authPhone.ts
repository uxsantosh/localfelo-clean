// =====================================================
// PHONE OTP AUTHENTICATION SERVICE - LocalFelo
// Real implementation using 2Factor API via edge functions
// =====================================================

import { supabase } from '../lib/supabaseClient';
import { User } from '../types';

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
 * Send OTP to phone number via edge function
 * Returns sessionId for verification
 */
export async function sendOTP(phone: string): Promise<{
  sessionId: string;
  isNewUser: boolean;
  expiresIn: number;
}> {
  const formatted = formatPhone(phone);
  
  if (!validatePhone(formatted.clean)) {
    throw new Error('Invalid phone number. Please enter a valid 10-digit number.');
  }

  try {
    console.log('📞 Sending OTP to:', formatted.display);
    
    // Call send-otp edge function
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

    console.log('✅ OTP sent successfully, session:', data.sessionId);
    
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
    if (data.accessToken && data.refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
      });

      if (sessionError) {
        console.error('❌ Failed to set session:', sessionError);
        // Don't throw - continue with user data
      } else {
        console.log('✅ Supabase session set');
      }
    }

    // Map response to User type
    const user: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      whatsappSame: data.user.whatsappSame ?? true,
      authUserId: data.user.id,
      clientToken: data.user.clientToken,
      profilePic: data.user.profilePic,
    };

    // Store user data in localStorage for backward compatibility
    localStorage.setItem('oldcycle_user', JSON.stringify(user));
    localStorage.setItem('oldcycle_token', data.user.clientToken);

    console.log('✅ User logged in via phone OTP:', user.id);

    return {
      isNewUser: data.isNewUser,
      user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error);
    throw error;
  }
}

/**
 * Check if phone number is already registered
 */
export async function checkPhoneExists(phone: string): Promise<boolean> {
  const formatted = formatPhone(phone);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', `+91${formatted.clean}`)
      .maybeSingle();

    if (error) {
      console.error('Error checking phone:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Exception checking phone:', error);
    return false;
  }
}

/**
 * Get current user from localStorage (for backward compatibility)
 */
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('oldcycle_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    // Sign out from Supabase Auth
    await supabase.auth.signOut();
    
    // Clear localStorage
    localStorage.removeItem('oldcycle_user');
    localStorage.removeItem('oldcycle_token');
    
    console.log('✅ User logged out');
  } catch (error) {
    console.error('❌ Logout error:', error);
  }
}