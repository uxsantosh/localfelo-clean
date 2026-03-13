// =====================================================
// PHONE-ONLY AUTHENTICATION SCREEN - LocalFelo
// New User: Phone → OTP → Name + Password → Login
// Returning User: Phone → Password → Login
// Forgot Password: Phone → OTP → Show/Reset Password
// =====================================================

import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '../components/Header';
import { ConfettiCelebration } from '../components/ConfettiCelebration';
import { OTPVerificationScreen } from './OTPVerificationScreen';
import { authenticateUser, createUser, updatePassword } from '../services/auth';
import { sendOTP, verifyOTP } from '../services/authPhone';
import { supabase } from '../lib/supabaseClient';
import { storage } from '../utils/storage';
import { fireConfetti } from '../utils/confetti';
import { toast } from 'sonner';
import { formatPhoneNumber, validatePhoneNumber } from '../utils/validators';
import { hashPassword, verifyPassword } from '../utils/passwordHash';
import logoSvg from '../assets/logo.svg';
import { AvatarUploader } from '../components/AvatarUploader'; // ✅ ADD: Avatar upload during signup
import { uploadAvatar } from '../services/avatarUpload'; // ✅ ADD: Avatar upload service
import { LocalFeloLoader } from '../components/LocalFeloLoader'; // ✅ ADD: Branded loader

interface PhoneAuthScreenProps {
  onSuccess: (user: any) => void;
  onClose: () => void;
}

type AuthStep = 
  | 'enter-phone'           // Step 1: Enter phone number
  | 'verify-otp'            // Step 2: Verify OTP (new users only)
  | 'enter-password'        // Step 3a: Returning users enter password
  | 'set-password'          // Step 3b: New users set name + password
  | 'forgot-password-otp'   // Forgot flow: Verify OTP
  | 'reset-password';       // Forgot flow: Set new password

export function PhoneAuthScreen({ onSuccess, onClose }: PhoneAuthScreenProps) {
  const [step, setStep] = useState<AuthStep>('enter-phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP-related state
  const [otpSessionId, setOtpSessionId] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);

  // ✅ Avatar & Gender state for signup
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);

  // =====================================================
  // STEP 1: ENTER PHONE NUMBER
  // =====================================================
  const handlePhoneContinue = async () => {
    setError('');
    
    if (!validatePhoneNumber(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const formatted = formatPhoneNumber(phone);
      const dbPhone = `+91${formatted.clean}`; // e.g., "+919876543210"
      const cleanPhone = formatted.clean; // e.g., "9876543210"

      console.log('🔍 Checking phone number in database:');
      console.log('  Input:', phone);
      console.log('  Clean (10-digit):', cleanPhone);
      console.log('  With +91:', dbPhone);
      console.log('  Without +91:', formatted.clean);

      // ✅ OPTIMIZED: Single query with OR conditions instead of 6 sequential queries
      const phoneVariants = [
        dbPhone,           // +919876543210
        cleanPhone,        // 9876543210
        `91${cleanPhone}`, // 919876543210
      ];

      console.log('🔍 Searching for phone in these formats:', phoneVariants);

      // Single optimized query checking all formats at once
      const { data: profiles, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .or(`phone.in.(${phoneVariants.join(',')}),phone_number.in.(${phoneVariants.join(',')})`)
        .limit(1);

      const profile = profiles?.[0] || null;
      
      console.log(`📊 Query result: data=${profile ? 'FOUND' : 'NULL'}, error=${queryError ? queryError.message : 'none'}`);
      if (profile) {
        console.log(`📋 Found profile:`, JSON.stringify(profile, null, 2));
      }

      // ✅ ENHANCED DEBUG LOGGING
      console.log('🔍 ===== USER CHECK RESULTS =====');
      console.log('Profile found?', profile ? 'YES' : 'NO');
      if (profile) {
        console.log('Profile ID:', profile.id);
        console.log('Profile phone:', profile.phone || profile.phone_number);
        console.log('Password hash exists?', profile.password_hash ? 'YES' : 'NO');
        console.log('Password hash value:', profile.password_hash ? `"${profile.password_hash.substring(0, 20)}..." (${profile.password_hash.length} chars)` : 'NULL/UNDEFINED');
        console.log('Password hash type:', typeof profile.password_hash);
        console.log('Password hash truthiness:', !!profile.password_hash);
      }
      console.log('🔍 ==============================');

      if (profile && profile.password_hash) {
        // EXISTING USER with password → Go to password entry (NO OTP)
        console.log('✅ Returning user - showing password screen (NO OTP sent)');
        console.log('📋 Profile data:', JSON.stringify(profile, null, 2));
        setExistingProfile(profile);
        setIsNewUser(false);
        setStep('enter-password');
        setLoading(false);
      } else if (profile && !profile.password_hash) {
        // ✅ FIX: LEGACY USER without password → Auto-send OTP to set password
        // Treat like new user registration but pre-fill name
        console.log('⚠️ Legacy user without password - auto-sending OTP to set password');
        console.log('📋 Profile data:', JSON.stringify(profile, null, 2));
        
        // Pre-fill name from existing profile
        setName(profile.name || profile.display_name || '');
        setExistingProfile(profile);
        setIsNewUser(false); // Not a new user, but needs password
        
        // Send OTP for password setup
        const result = await sendOTP(formatted.clean, profile.name || profile.display_name);
        setOtpSessionId(result.sessionId);
        setStep('verify-otp');
        setLoading(false);
        toast.success('OTP sent! Please verify to set your password.');
      } else {
        // NEW USER → Send OTP for verification (ONLY place for new registration OTP)
        console.log('🆕 New user - sending OTP for registration');
        console.log('🆕 This is the ONLY place OTP is sent (new user registration)');
        const result = await sendOTP(formatted.clean);
        setOtpSessionId(result.sessionId);
        setIsNewUser(true);
        setStep('verify-otp');
        setLoading(false);
        toast.success('OTP sent via WhatsApp! Please check your messages.');
      }
    } catch (err: any) {
      console.error('❌ Phone continue error:', err);
      setError(err.message || 'Failed to continue. Please try again.');
      setLoading(false);
    }
  };

  // =====================================================
  // STEP 2: VERIFY OTP (New Users Only)
  // =====================================================
  const handleOTPVerify = async (otp: string) => {
    setLoading(true);
    setError('');

    try {
      const formatted = formatPhoneNumber(phone);
      
      // Verify OTP (without name - we'll collect it in next step)
      const result = await verifyOTP(
        otpSessionId,
        otp,
        formatted.clean,
        undefined // Don't create user yet - just verify phone
      );

      // OTP verified - now collect name and password
      setLoading(false);
      setStep('set-password');
    } catch (err: any) {
      setLoading(false);
      throw err; // OTPVerificationScreen will show the error
    }
  };

  const handleOTPResend = async () => {
    const formatted = formatPhoneNumber(phone);
    const result = await sendOTP(formatted.clean);
    setOtpSessionId(result.sessionId);
    toast.success('New OTP sent!');
  };

  // =====================================================
  // STEP 3A: RETURNING USER - ENTER PASSWORD
  // =====================================================
  const handlePasswordLogin = async () => {
    setError('');

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      // Verify password (trim to remove any whitespace)
      const trimmedPassword = password.trim();
      
      console.log('🔐 [Login] Password entered:', `"${password}" (length: ${password.length})`);
      console.log('🔐 [Login] Password trimmed:', `"${trimmedPassword}" (length: ${trimmedPassword.length})`);
      console.log('🔐 [Login] Stored hash from DB:', existingProfile.password_hash ? existingProfile.password_hash : 'NULL/UNDEFINED');
      console.log('🔐 [Login] Stored hash length:', existingProfile.password_hash?.length || 0);
      
      // Generate hash from entered password to compare
      const enteredHash = await hashPassword(trimmedPassword);
      console.log('🔐 [Login] Hash from entered password:', enteredHash);
      console.log('🔐 [Login] Hashes match?', enteredHash === existingProfile.password_hash ? '✅ YES' : '❌ NO');
      
      const hashesMatch = enteredHash === existingProfile.password_hash;
      
      if (enteredHash !== existingProfile.password_hash) {
        console.log('🔍 [Login] Hash comparison details:');
        console.log('  Entered hash:', enteredHash);
        console.log('  Stored hash:', existingProfile.password_hash);
        console.log('  Length match?', enteredHash.length === (existingProfile.password_hash?.length || 0));
      }
      
      const isValid = await verifyPassword(trimmedPassword, existingProfile.password_hash);
      
      console.log('🔐 [Login] Password verification result:', isValid ? 'VALID ✅' : 'INVALID ❌');

      if (!isValid) {
        setError('Incorrect password');
        setLoading(false);
        return;
      }

      // Password correct - login user
      setLoading(false);
      
      // ✅ FIX: Create Supabase session for returning users
      // We need to get proper auth tokens - use the verify-otp endpoint
      // by sending a special "password-verified" flag
      console.log('🔐 [Password Login] Creating Supabase session for returning user...');
      
      try {
        // Call verify-otp endpoint with a special flag to generate tokens
        const { data: authData, error: authError } = await supabase.functions.invoke('verify-otp', {
          body: { 
            userId: existingProfile.id,
            phone: existingProfile.phone,
            skipOtpCheck: true, // Special flag: password already verified
          }
        });

        if (authError || !authData?.success) {
          console.error('❌ Failed to get auth tokens:', authError || authData?.error);
          // Continue without session - localStorage auth works as fallback
        } else if (authData.accessToken && authData.refreshToken) {
          console.log('🔐 Setting Supabase session with tokens...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: authData.accessToken,
            refresh_token: authData.refreshToken,
          });

          if (sessionError) {
            console.error('❌ Failed to set session:', sessionError);
          } else {
            console.log('✅ Supabase session created successfully for returning user!');
          }
        }
      } catch (err) {
        console.error('⚠️ Session creation failed (non-critical):', err);
        // Continue - localStorage auth is enough as fallback
      }
      
      // Store user data
      const user = {
        id: existingProfile.id,
        name: existingProfile.name || existingProfile.display_name,
        phone: existingProfile.phone,
        email: existingProfile.email,
        whatsappSame: existingProfile.whatsapp_same ?? true,
        authUserId: existingProfile.id,
        clientToken: existingProfile.client_token,
        profilePic: existingProfile.avatar_url,
        avatar_url: existingProfile.avatar_url, // ✅ ADD: Avatar URL
        gender: existingProfile.gender, // ✅ ADD: Gender
      };

      // 🔍 DEBUG: Log what we're storing
      console.log('🔍 [LOGIN DEBUG] existingProfile from database:', existingProfile);
      console.log('🔍 [LOGIN DEBUG] avatar_url from DB:', existingProfile.avatar_url);
      console.log('🔍 [LOGIN DEBUG] gender from DB:', existingProfile.gender);
      console.log('🔍 [LOGIN DEBUG] user object to be stored:', user);

      // ✅ FIX: Use Capacitor storage
      await storage.setItem('oldcycle_user', JSON.stringify(user));
      await storage.setItem('oldcycle_token', existingProfile.client_token);
      await storage.setItem('userId', user.id);
      await storage.setItem('clientToken', existingProfile.client_token);

      toast.success('Welcome back!');
      onSuccess(user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  // =====================================================
  // STEP 3B: NEW USER - SET NAME + PASSWORD
  // =====================================================
  const handleSetPassword = async () => {
    setError('');

    // Validate name
    if (!name || name.trim().length < 2) {
      setError('Please enter your name (minimum 2 characters)');
      return;
    }

    // Validate password
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const formatted = formatPhoneNumber(phone);
      const dbPhone = `+91${formatted.clean}`;
      
      // Hash password (trim to remove any whitespace)
      const trimmedPassword = password.trim();
      const passwordHash = await hashPassword(trimmedPassword);
      
      console.log('🔐 Password entered:', `"${password}" (length: ${password.length})`);
      console.log('🔐 Password trimmed:', `"${trimmedPassword}" (length: ${trimmedPassword.length})`);
      console.log('🔐 Password hash generated:', passwordHash.substring(0, 20) + '...');
      console.log('🔐 Password hash length:', passwordHash.length);
      
      if (existingProfile) {
        // LEGACY USER - Update existing profile with password
        console.log('🔄 Updating legacy user with password...');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            password_hash: passwordHash,
            name: name.trim(),
            display_name: name.trim(),
          })
          .eq('id', existingProfile.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
          throw new Error('Failed to update account. Please try again.');
        }

        // Auto-login with existing tokens
        const user = {
          id: existingProfile.id,
          name: name.trim(),
          phone: dbPhone,
          clientToken: existingProfile.client_token,
          profilePic: existingProfile.avatar_url,
        };

        // ✅ FIX: Use Capacitor storage
        await storage.setItem('oldcycle_user', JSON.stringify(user));
        await storage.setItem('oldcycle_token', existingProfile.client_token);
        await storage.setItem('userId', user.id);
        await storage.setItem('clientToken', existingProfile.client_token);

        setLoading(false);
        toast.success('Password set successfully!');
        onSuccess(user);
      } else {
        // NEW USER - Create new profile
        console.log('🆕 Creating new user...');
        
        const formatted = formatPhoneNumber(phone);
        const dbPhone = `+91${formatted.clean}`;
        
        // ✅ STEP 1: Create Supabase Auth user using edge function
        console.log('🔐 [New User] Creating Supabase Auth user via edge function...');
        console.log('🔐 [New User] Password hash length:', passwordHash.length);
        console.log('🔐 [New User] Password hash preview:', passwordHash.substring(0, 30) + '...');
        
        try {
          // Call verify-otp endpoint with name AND password hash
          // Edge function will save password using service role (bypasses RLS)
          const { data: authData, error: authError } = await supabase.functions.invoke('verify-otp', {
            body: { 
              phone: formatted.clean,
              name: name.trim(),
              passwordHash: passwordHash, // ✅ CRITICAL: Pass password hash to edge function
              skipOtpCheck: true, // Special flag: OTP already verified
              createUser: true, // Flag to create user even with skipOtpCheck
            }
          });

          if (authError || !authData?.success) {
            console.error('❌ Failed to create user via edge function:', authError || authData?.error);
            throw new Error('Failed to create account. Please try again.');
          }

          console.log('✅ User created successfully via edge function!');
          console.log('📋 Auth data received:', JSON.stringify(authData, null, 2));
          console.log('✅ Password hash saved by edge function (bypasses RLS)!');
          
          // ✅ SET SUPABASE SESSION with returned tokens
          if (authData.accessToken && authData.refreshToken) {
            console.log('🔐 [New User] Setting Supabase session...');
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: authData.accessToken,
              refresh_token: authData.refreshToken,
            });

            if (sessionError) {
              console.error('❌ [New User] Failed to set session:', sessionError);
            } else {
              console.log('✅ [New User] Supabase session set successfully!');
              if (sessionData?.session) {
                console.log('   Session user:', sessionData.session.user?.id);
                console.log('   Session expires at:', new Date(sessionData.session.expires_at! * 1000).toLocaleString());
              }
              
              // Verify session is active
              const { data: { session: verifySession } } = await supabase.auth.getSession();
              console.log('✅ [New User] Session verification:', !!verifySession ? 'ACTIVE ✅' : 'FAILED ❌');
            }
          } else {
            console.warn('⚠️ [New User] No tokens returned - storage uploads will fail!');
          }
          
          // Wait a moment for DB to fully commit
          await new Promise(resolve => setTimeout(resolve, 500));

          // Verify password was saved correctly
          console.log('🔍 [VERIFICATION] Reading back profile with password hash...');
          console.log('🔍 [VERIFICATION] User ID:', authData.user.id);
          console.log('🔍 [VERIFICATION] Phone:', authData.user.phone);
          
          const { data: checkProfile, error: checkError } = await supabase
            .from('profiles')
            .select('id, phone, password_hash, client_token')
            .eq('id', authData.user.id)
            .maybeSingle();
          
          if (checkError) {
            console.error('❌ [VERIFICATION] Error reading profile:', checkError);
          } else if (!checkProfile) {
            console.error('❌ [VERIFICATION] Profile not found! Searching by phone...');
            const { data: profileByPhone } = await supabase
              .from('profiles')
              .select('*')
              .eq('phone', authData.user.phone)
              .maybeSingle();
            console.log('📱 [VERIFICATION] Profile by phone:', profileByPhone);
          } else {
            console.log('✅ [VERIFICATION] Profile found:', checkProfile);
            console.log('🔐 [VERIFICATION] Password hash exists?', !!checkProfile.password_hash);
            console.log('🔐 [VERIFICATION] Hash preview:', checkProfile.password_hash?.substring(0, 20) + '...');
            console.log('🔐 [VERIFICATION] Hash length:', checkProfile.password_hash?.length);
            console.log('🔐 [VERIFICATION] Original hash:', passwordHash.substring(0, 20) + '...');
            console.log('✅ [VERIFICATION] Match?', checkProfile.password_hash === passwordHash ? 'YES ✅' : 'NO ❌');
          }

          // Auto-login with user data from edge function
          const user = {
            id: authData.user.id,
            name: authData.user.name,
            phone: authData.user.phone,
            clientToken: authData.user.clientToken,
            profilePic: authData.user.profilePic,
          };

          // ✅ CRITICAL FIX: Use Capacitor storage
          await storage.setItem('oldcycle_user', JSON.stringify(user));
          await storage.setItem('oldcycle_token', authData.user.clientToken);
          await storage.setItem('userId', user.id);
          await storage.setItem('clientToken', authData.user.clientToken);

          setLoading(false);
          fireConfetti();
          toast.success('Account created successfully!');
          
          // 🔍 CRITICAL DEBUG: Log what we're passing to onSuccess
          console.log('🔍🔍🔍 [PhoneAuthScreen] About to call onSuccess with user:', {
            id: user.id,
            name: user.name,
            phone: user.phone,
            clientToken: user.clientToken ? 'Present' : 'Missing'
          });
          
          onSuccess(user);
        } catch (err: any) {
          console.error('❌ User creation error:', err);
          setError(err.message || 'Failed to create account. Please try again.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error('Set password error:', err);
      setError(err.message || 'Failed to save password. Please try again.');
      setLoading(false);
    }
  };

  // =====================================================
  // FORGOT PASSWORD FLOW
  // =====================================================
  const handleForgotPassword = async () => {
    setError('');
    setLoading(true);

    try {
      const formatted = formatPhoneNumber(phone);
      const result = await sendOTP(formatted.clean);
      setOtpSessionId(result.sessionId);
      setStep('forgot-password-otp');
      setLoading(false);
      toast.success('OTP sent via WhatsApp! Please check your messages.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      setLoading(false);
    }
  };

  const handleForgotPasswordOTPVerify = async (otp: string) => {
    setLoading(true);
    try {
      const formatted = formatPhoneNumber(phone);
      
      // Just verify OTP (don't create user)
      await verifyOTP(otpSessionId, otp, formatted.clean, undefined);
      
      setLoading(false);
      setStep('reset-password');
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  };

  const handleResetPassword = async () => {
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const formatted = formatPhoneNumber(phone);
      const dbPhone = `+91${formatted.clean}`;
      
      // Hash new password (trim to remove any whitespace)
      const trimmedPassword = password.trim();
      const passwordHash = await hashPassword(trimmedPassword);

      // Update password in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ password_hash: passwordHash })
        .eq('phone', dbPhone);

      if (updateError) throw updateError;

      setLoading(false);
      toast.success('Password updated successfully!');
      
      // Go back to password login
      setStep('enter-password');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError('Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER OTP VERIFICATION SCREEN
  // =====================================================
  if (step === 'verify-otp') {
    return (
      <OTPVerificationScreen
        phone={formatPhoneNumber(phone).display}
        onVerify={handleOTPVerify}
        onResend={handleOTPResend}
        onBack={() => setStep('enter-phone')}
        onClose={onClose}
        isLoading={loading}
        isEmail={false}
      />
    );
  }

  if (step === 'forgot-password-otp') {
    return (
      <OTPVerificationScreen
        phone={formatPhoneNumber(phone).display}
        onVerify={handleForgotPasswordOTPVerify}
        onResend={handleOTPResend}
        onBack={() => setStep('enter-password')}
        onClose={onClose}
        isLoading={loading}
        isEmail={false}
      />
    );
  }

  // =====================================================
  // MAIN AUTH SCREEN
  // =====================================================
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <img src={logoSvg} alt="LocalFelo" className="h-12 w-28 sm:h-14 sm:w-32 object-contain object-left" />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: ENTER PHONE */}
            {step === 'enter-phone' && (
              <motion.div
                key="enter-phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold mb-2">Welcome! 👋</h3>
                  <p className="text-gray-600 text-sm">
                    Enter your phone number to continue
                  </p>
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-sm sm:text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 auth-icon text-gray-400" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="auth-input-field w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      maxLength={10}
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handlePhoneContinue()}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    10-digit Indian mobile number
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePhoneContinue}
                  disabled={loading || phone.length !== 10}
                  className="auth-button w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LocalFeloLoader size="sm" text="" />
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Continue <ArrowRight className="auth-icon" />
                    </span>
                  )}
                </button>
              </motion.div>
            )}

            {/* STEP 3A: ENTER PASSWORD (Returning User) */}
            {step === 'enter-password' && (
              <motion.div
                key="enter-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold mb-2">Welcome back! 👋</h3>
                  <p className="text-gray-600 text-sm">
                    {formatPhoneNumber(phone).display}
                  </p>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 auth-icon text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-input-field has-right-icon w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handlePasswordLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="auth-icon" /> : <Eye className="auth-icon" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePasswordLogin}
                  disabled={loading || !password}
                  className="auth-button w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LocalFeloLoader size="sm" text="" />
                    </div>
                  ) : (
                    'Login'
                  )}
                </button>

                {/* Forgot Password */}
                <div className="text-center">
                  <button
                    onClick={handleForgotPassword}
                    className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Back Button */}
                <button
                  onClick={() => setStep('enter-phone')}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm"
                >
                  ← Back to phone number
                </button>
              </motion.div>
            )}

            {/* STEP 3B: SET NAME + PASSWORD (New User) */}
            {step === 'set-password' && (
              <motion.div
                key="set-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold mb-2">Create Account 🎉</h3>
                  <p className="text-gray-600 text-sm">
                    Just a few more details...
                  </p>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 auth-icon text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="auth-input-field w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Set Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 auth-icon text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-input-field has-right-icon w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="auth-icon" /> : <Eye className="auth-icon" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 auth-icon text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="auth-input-field has-right-icon w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSetPassword()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="auth-icon" /> : <Eye className="auth-icon" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSetPassword}
                  disabled={loading || !name || !password || !confirmPassword}
                  className="auth-button w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LocalFeloLoader size="sm" text="" />
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </motion.div>
            )}

            {/* RESET PASSWORD (Forgot Password Flow) */}
            {step === 'reset-password' && (
              <motion.div
                key="reset-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold mb-2">Reset Password 🔑</h3>
                  <p className="text-gray-600 text-sm">
                    Enter your new password
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 auth-icon text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-input-field has-right-icon w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="auth-icon" /> : <Eye className="auth-icon" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 auth-icon text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="auth-input-field has-right-icon w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="auth-icon" /> : <Eye className="auth-icon" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleResetPassword}
                  disabled={loading || !password || !confirmPassword}
                  className="auth-button w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <LocalFeloLoader className="auth-icon animate-spin mx-auto" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}