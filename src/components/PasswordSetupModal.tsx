import React, { useState } from 'react';
import { Modal } from './Modal';
import { InputField } from './InputField';
import { toast } from 'sonner';
import { Lock, CheckCircle } from 'lucide-react';
import { setNewPassword, loginWithPassword } from '../services/auth.ts';
import { supabase } from '../lib/supabaseClient';

interface PasswordSetupModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function PasswordSetupModal({ isOpen, onSuccess }: PasswordSetupModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Get current user email before updating
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;

      if (!userEmail) {
        throw new Error('User email not found');
      }

      console.log('🔐 Setting password for:', userEmail);

      // Set the new password
      await setNewPassword(password);
      
      console.log('✅ Password set successfully, logging in...');

      // Automatically log in with the new password
      await loginWithPassword(userEmail, password);

      toast.success('Password set successfully! 🎉');
      onSuccess();
    } catch (error: any) {
      console.error('Password setup error:', error);
      toast.error(error.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {}} // Can't close - must set password
      title="Set Your Password"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#CDFF00] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-lg mb-2 text-black font-semibold">Email Verified! ✅</h3>
          <p className="text-gray-600 text-sm">
            Set a password to secure your account
          </p>
        </div>

        <InputField
          label="Create Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 6 characters"
          required
          disabled={loading}
        />

        <InputField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter password"
          required
          disabled={loading}
        />

        <button 
          type="submit" 
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Setting Password...' : 'Set Password & Continue'}
        </button>
      </form>
    </Modal>
  );
}