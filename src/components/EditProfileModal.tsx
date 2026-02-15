import React, { useState } from 'react';
import { Modal } from './Modal';
import { InputField } from './InputField';
import { toast } from 'sonner';
import { User, Upload } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getCurrentUser } from '../services/auth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentName: string;
  currentAvatar?: string;
}

export function EditProfileModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  currentName,
  currentAvatar 
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error('User not found');
      }

      // Update user profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          avatar: avatar || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update localStorage
      const updatedUser = {
        ...user,
        name: name.trim(),
        avatar: avatar || undefined,
      };
      localStorage.setItem('oldcycle_user', JSON.stringify(updatedUser));

      toast.success('Profile updated successfully! 🎉');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Edit Profile"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-[#CDFF00] rounded-full flex items-center justify-center mx-auto mb-4">
            {avatar ? (
              <img 
                src={avatar} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-black" />
            )}
          </div>
          <p className="text-sm text-gray-600">
            Update your display name and photo
          </p>
        </div>

        <InputField
          label="Display Name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Enter your name"
          required
          disabled={loading}
        />

        <InputField
          label="Avatar URL (optional)"
          type="url"
          value={avatar}
          onChange={setAvatar}
          placeholder="https://example.com/avatar.jpg"
          disabled={loading}
        />

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
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}