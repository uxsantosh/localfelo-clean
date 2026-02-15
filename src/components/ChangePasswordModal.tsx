import React, { useState } from 'react';
import { Modal } from './Modal';
import { InputField } from './InputField';
import { toast } from 'sonner';
import { Lock, Shield } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangePasswordModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully! 🔒');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Change Password"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#CDFF00] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-lg mb-2 text-black font-semibold">Update Your Password</h3>
          <p className="text-gray-600 text-sm">
            Enter a new password to secure your account
          </p>
        </div>

        <InputField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="At least 6 characters"
          required
          disabled={loading}
        />

        <InputField
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter new password"
          required
          disabled={loading}
        />

        <div className="bg-[#CDFF00]/20 border border-[#CDFF00]/40 rounded-lg p-3">
          <p className="text-sm text-black">
            🔒 <strong>Security Tip:</strong> Use a strong password with letters, numbers, and symbols
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="btn-outline flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary flex-1"
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}