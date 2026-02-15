// =====================================================
// PHONE-ONLY AUTHENTICATION SCREEN - LocalFelo
// New User: Phone → OTP → Name + Password → Login
// Returning User: Phone → Password → Login
// Forgot Password: Phone → OTP → Show/Reset Password
// =====================================================

import { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, KeyRound, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OTPVerificationScreen } from './OTPVerificationScreen';
import { sendOTP, verifyOTP, validatePhone, formatPhone } from '../services/authPhone';
import { supabase } from '../lib/supabaseClient';
import logoSvg from '../assets/logo.svg';
import { toast } from 'sonner';
import { fireConfetti } from '../utils/confetti';

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

  // =====================================================
  // STEP 1: ENTER PHONE NUMBER
  // =====================================================
  const handlePhoneContinue = async () => {
    setError('');
    
    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const formatted = formatPhone(phone);
      const dbPhone = `+91${formatted.clean}`;

      console.log('🔍 Checking phone:', dbPhone);

      // Check if user exists - try both 'phone' and 'phone_number' columns
      let profile = null;
      let profileError = null;

      // Try 'phone' column first
      const { data: data1, error: error1 } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', dbPhone)
        .maybeSingle();

      if (data1) {
        profile = data1;
        console.log('✅ Found user by phone column:', profile);
      } else if (!error1 || error1.code === 'PGRST116') {
        // Try 'phone_number' column as fallback
        const { data: data2, error: error2 } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone_number', dbPhone)
          .maybeSingle();

        if (data2) {
          profile = data2;
          console.log('✅ Found user by phone_number column:', profile);
        } else {
          profileError = error2;
        }
      } else {
        profileError = error1;
      }

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      console.log('📋 Profile check result:', { 
        exists: !!profile, 
        hasPassword: !!profile?.password_hash,
        hasPasswordValue: profile?.password_hash ? 'YES (length: ' + profile.password_hash.length + ')' : 'NO',
        phone: profile?.phone || profile?.phone_number,
        name: profile?.name || profile?.display_name,
        clientToken: profile?.client_token ? 'EXISTS' : 'MISSING',
        profileId: profile?.id,
        allFields: profile ? Object.keys(profile) : []
      });

      // DETAILED DEBUG: Show exact profile data (remove after debugging)
      if (profile) {
        console.log('🔍 FULL PROFILE DATA:', JSON.stringify({
          id: profile.id,
          phone: profile.phone,
          phone_number: profile.phone_number,
          name: profile.name,
          display_name: profile.display_name,
          has_password_hash: !!profile.password_hash,
          password_hash_preview: profile.password_hash ? profile.password_hash.substring(0, 20) + '...' : 'NULL',
          client_token: profile.client_token ? 'EXISTS' : 'NULL',
          created_at: profile.created_at
        }, null, 2));
      }

      if (profile && profile.password_hash) {
        // EXISTING USER with password → Go to password entry
        console.log('✅ Returning user - showing password screen');
        console.log('   Password hash exists:', profile.password_hash.substring(0, 20) + '...');
        setExistingProfile(profile);
        setIsNewUser(false);
        setStep('enter-password');
        setLoading(false);
      } else if (profile && !profile.password_hash) {
        // LEGACY USER without password → Send OTP to set password
        console.log('⚠️ Legacy user without password - sending OTP');
        setExistingProfile(profile);
        setIsNewUser(false);
        
        // Send OTP
        const result = await sendOTP(formatted.clean);
        setOtpSessionId(result.sessionId);
        setStep('verify-otp');
        setLoading(false);
        toast.success('OTP sent! Check your SMS.');
      } else {
        // NEW USER → Send OTP for verification
        console.log('🆕 New user - sending OTP');
        const result = await sendOTP(formatted.clean);
        setOtpSessionId(result.sessionId);
        setIsNewUser(true);
        setStep('verify-otp');
        setLoading(false);
        toast.success('OTP sent! Check your SMS.');
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
      const formatted = formatPhone(phone);
      
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
    const formatted = formatPhone(phone);
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
      // Verify password with bcrypt
      const { verifyPassword } = await import('../utils/passwordHash');
      const isValid = await verifyPassword(password, existingProfile.password_hash);

      if (!isValid) {
        setError('Incorrect password');
        setLoading(false);
        return;
      }

      // Password correct - login user
      setLoading(false);
      
      // Store user data
      const user = {
        id: existingProfile.id,
        name: existingProfile.name || existingProfile.display_name,
        phone: existingProfile.phone,
        clientToken: existingProfile.client_token,
        profilePic: existingProfile.avatar_url,
      };

      localStorage.setItem('oldcycle_user', JSON.stringify(user));
      localStorage.setItem('oldcycle_token', existingProfile.client_token);

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
      const formatted = formatPhone(phone);
      const dbPhone = `+91${formatted.clean}`;
      
      // Hash password
      const { hashPassword } = await import('../utils/passwordHash');
      const passwordHash = await hashPassword(password);
      
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

        localStorage.setItem('oldcycle_user', JSON.stringify(user));
        localStorage.setItem('oldcycle_token', existingProfile.client_token);

        setLoading(false);
        toast.success('Password set successfully!');
        onSuccess(user);
      } else {
        // NEW USER - Create new profile
        console.log('🆕 Creating new user...');
        
        const clientToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
        const ownerToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
        const userId = crypto.randomUUID();

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            phone: dbPhone,
            phone_number: dbPhone, // ✅ Add phone_number for constraint
            email: `${formatted.clean}@localfelo.app`, // ✅ Add email for constraint
            name: name.trim(),
            display_name: name.trim(),
            password_hash: passwordHash,
            client_token: clientToken,
            owner_token: ownerToken,
            whatsapp_same: true,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Profile creation error:', insertError);
          throw new Error('Failed to create account. Please try again.');
        }

        // Auto-login
        const user = {
          id: userId,
          name: name.trim(),
          phone: dbPhone,
          clientToken: clientToken,
          profilePic: undefined,
        };

        localStorage.setItem('oldcycle_user', JSON.stringify(user));
        localStorage.setItem('oldcycle_token', clientToken);

        setLoading(false);
        toast.success('Account created successfully!');
        fireConfetti();
        onSuccess(user);
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
      const formatted = formatPhone(phone);
      const result = await sendOTP(formatted.clean);
      setOtpSessionId(result.sessionId);
      setStep('forgot-password-otp');
      setLoading(false);
      toast.success('OTP sent! Check your SMS.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      setLoading(false);
    }
  };

  const handleForgotPasswordOTPVerify = async (otp: string) => {
    setLoading(true);
    try {
      const formatted = formatPhone(phone);
      
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
      const formatted = formatPhone(phone);
      const dbPhone = `+91${formatted.clean}`;
      
      // Hash new password
      const { hashPassword } = await import('../utils/passwordHash');
      const passwordHash = await hashPassword(password);

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
        phone={formatPhone(phone).display}
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
        phone={formatPhone(phone).display}
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
                    <Loader2 className="auth-icon animate-spin mx-auto" />
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
                    {formatPhone(phone).display}
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
                    <Loader2 className="auth-icon animate-spin mx-auto" />
                  ) : (
                    'Login'
                  )}
                </button>

                {/* Forgot Password */}
                <div className="text-center">
                  <button
                    onClick={handleForgotPassword}
                    className="text-sm text-primary hover:underline"
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
                    <Loader2 className="auth-icon animate-spin mx-auto" />
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
                    <Loader2 className="auth-icon animate-spin mx-auto" />
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