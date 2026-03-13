import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { UserAvatar } from './UserAvatar';
import { Star, MapPin, CheckCircle, Shield, Phone, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  phone?: string;
  city?: string;
  area?: string;
  created_at: string;
  helper_rating_avg?: number;
  helper_rating_count?: number;
  task_owner_rating_avg?: number;
  task_owner_rating_count?: number;
  is_verified?: boolean;
  is_trusted?: boolean;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onContactClick?: (phone: string) => void;
}

export function UserProfileModal({ 
  isOpen, 
  onClose, 
  userId,
  onContactClick 
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleContactClick = () => {
    if (profile?.phone && onContactClick) {
      onContactClick(profile.phone);
    }
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#CDFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      </Modal>
    );
  }

  if (!profile) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
        <div className="text-center py-12">
          <p className="text-muted">Profile not found</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
      <div className="space-y-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center text-center">
          <UserAvatar 
            name={profile.name} 
            avatarUrl={profile.avatar_url}
            size="xl"
          />
          <div className="mt-4">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-xl font-bold text-black m-0">{profile.name}</h3>
              {profile.is_verified && (
                <CheckCircle className="w-5 h-5 text-blue-600" title="Verified" />
              )}
              {profile.is_trusted && (
                <Shield className="w-5 h-5 text-green-600" title="Trusted" />
              )}
            </div>
            {profile.gender && (
              <p className="text-sm text-muted mt-1">
                {profile.gender === 'male' ? '👨 Male' : profile.gender === 'female' ? '👩 Female' : '🧑 Other'}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        {(profile.area || profile.city) && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-black m-0">Location</p>
              <p className="text-sm text-gray-600 m-0">
                {profile.area && profile.city ? `${profile.area}, ${profile.city}` : profile.city || profile.area}
              </p>
            </div>
          </div>
        )}

        {/* Ratings */}
        <div className="grid grid-cols-2 gap-3">
          {/* Helper Rating */}
          <div className="p-4 bg-[#CDFF00]/10 border-2 border-[#CDFF00]/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <p className="text-xs font-semibold text-black m-0">As Helper</p>
            </div>
            {profile.helper_rating_count && profile.helper_rating_count > 0 ? (
              <>
                <p className="text-2xl font-bold text-black m-0">
                  {profile.helper_rating_avg?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-gray-600 m-0">
                  {profile.helper_rating_count} rating{profile.helper_rating_count > 1 ? 's' : ''}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 m-0">No ratings yet</p>
            )}
          </div>

          {/* Task Owner Rating */}
          <div className="p-4 bg-[#CDFF00]/10 border-2 border-[#CDFF00]/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <p className="text-xs font-semibold text-black m-0">As Task Owner</p>
            </div>
            {profile.task_owner_rating_count && profile.task_owner_rating_count > 0 ? (
              <>
                <p className="text-2xl font-bold text-black m-0">
                  {profile.task_owner_rating_avg?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-gray-600 m-0">
                  {profile.task_owner_rating_count} rating{profile.task_owner_rating_count > 1 ? 's' : ''}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 m-0">No ratings yet</p>
            )}
          </div>
        </div>

        {/* Member Since */}
        <div className="text-center pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 m-0">
            Member since {formatDate(profile.created_at)}
          </p>
        </div>

        {/* Action Buttons */}
        {onContactClick && profile.phone && (
          <div className="flex gap-3">
            <button
              onClick={handleContactClick}
              className="flex-1 py-3 px-4 bg-[#CDFF00] text-black font-bold rounded-lg hover:bg-[#b8e600] transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Contact
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
