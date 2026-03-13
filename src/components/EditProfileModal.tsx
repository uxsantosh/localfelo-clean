import React, { useState } from 'react';
import { Modal } from './Modal';
import { InputField } from './InputField';
import { toast } from 'sonner';
import { User as UserIcon, Upload } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { AvatarUploader } from './AvatarUploader';
import { uploadAvatar, updateUserAvatar, updateUserGender } from '../services/avatarUpload';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentName: string;
  currentAvatar?: string;
  currentGender?: 'male' | 'female' | 'other' | null;
  user: User;
}

export function EditProfileModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  currentName,
  currentAvatar,
  currentGender,
  user
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(currentAvatar);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>(currentGender || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        throw new Error('User not found');
      }

      let avatarUrl = currentAvatar;

      // Upload new avatar if changed
      if (avatarBase64 && avatarBase64 !== currentAvatar) {
        console.log('🔵 [EDIT PROFILE] New avatar detected, attempting upload...');
        console.log('🔵 [EDIT PROFILE] Avatar base64 length:', avatarBase64.length);
        console.log('🔵 [EDIT PROFILE] Avatar preview:', avatarBase64.substring(0, 50) + '...');
        try {
          avatarUrl = await uploadAvatar(user.id, avatarBase64);
          console.log('✅ [EDIT PROFILE] Upload successful! URL:', avatarUrl);
        } catch (uploadError: any) {
          // Storage upload failed - silently fall back to base64
          console.error('❌ [EDIT PROFILE] Storage upload failed:', uploadError);
          console.warn('⚠️ [EDIT PROFILE] Falling back to base64 (will save to database)');
          avatarUrl = avatarBase64;
        }
      } else {
        console.log('🔵 [EDIT PROFILE] No avatar change detected');
      }

      console.log('💾 [EDIT PROFILE] Saving to database...');
      console.log('   Name:', name.trim());
      console.log('   Avatar URL type:', avatarUrl?.startsWith('data:') ? 'BASE64' : avatarUrl?.startsWith('http') ? 'URL' : 'NULL');
      console.log('   Avatar URL length:', avatarUrl?.length || 0);
      console.log('   Gender:', gender || 'null');
      console.log('   User ID:', user.id);

      // Update user profile in database
      const { data: updateData, error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          avatar_url: avatarUrl || null,
          gender: gender || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select();

      console.log('💾 [EDIT PROFILE] Database response:', { data: updateData, error });

      if (error) {
        console.error('❌ [EDIT PROFILE] Database update failed:', error);
        console.error('❌ [EDIT PROFILE] Error details:', JSON.stringify(error, null, 2));
        toast.error(`Database error: ${error.message}`);
        throw error;
      }
      
      console.log('✅ [EDIT PROFILE] Database updated successfully');
      console.log('✅ [EDIT PROFILE] Updated rows:', updateData);

      // Update localStorage
      const updatedUser = {
        ...user,
        name: name.trim(),
        avatar_url: avatarUrl,
        gender: gender || null,
      };
      localStorage.setItem('oldcycle_user', JSON.stringify(updatedUser));

      // Dispatch event to notify App.tsx to reload user
      window.dispatchEvent(new CustomEvent('userProfileUpdated'));

      toast.success('Profile updated successfully!');
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <AvatarUploader
          currentAvatar={avatarBase64}
          onAvatarChange={setAvatarBase64}
          disabled={loading}
        />

        <InputField
          label="Display Name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Enter your name"
          required
          disabled={loading}
        />

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-bold text-black mb-2">
            Gender (Optional)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'male', label: 'Male', emoji: '👨' },
              { value: 'female', label: 'Female', emoji: '👩' },
              { value: 'other', label: 'Other', emoji: '🧑' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGender(option.value as any)}
                disabled={loading}
                className={`p-3 rounded-lg border-2 transition-all ${
                  gender === option.value
                    ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-xs font-semibold text-black">{option.label}</div>
              </button>
            ))}
          </div>
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
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}