import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';

interface OTPVerificationScreenProps {
  phone: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  onClose: () => void;
  isLoading?: boolean;
  isEmail?: boolean; // New prop to indicate if this is email OTP
}

export function OTPVerificationScreen({
  phone,
  onVerify,
  onResend,
  onBack,
  onClose,
  isLoading = false,
  isEmail = false,
}: OTPVerificationScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only allow 6-digit numbers
    if (!/^\d{6}$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp(newOtp);
    setError('');
    
    // Focus last input
    inputRefs.current[5]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    try {
      setError('');
      await onVerify(otpCode);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      setError('');
      setOtp(['', '', '', '', '', '']);
      await onResend();
      setResendCountdown(30);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  const isComplete = otp.every((digit) => digit !== '');
  const formattedContact = isEmail 
    ? phone // Email doesn't need formatting
    : `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`; // Format phone number
  const contactIcon = isEmail ? '📧' : '📱';
  const contactType = isEmail ? 'email' : 'phone';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-heading">Verify OTP</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Icon */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">{contactIcon}</span>
            </div>
            <p className="text-body text-sm">
              We've sent a 6-digit OTP to your {contactType}
            </p>
            <p className="text-heading mt-1 break-all px-4">{formattedContact}</p>
          </div>

          {/* OTP Input */}
          <div>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors"
                  disabled={isLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {error && (
              <p className="text-xs text-rose-500 text-center mt-3">{error}</p>
            )}
          </div>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-muted mb-2">
              Didn't receive OTP?
            </p>
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-muted">
                Resend in {resendCountdown}s
              </p>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!isComplete || isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}