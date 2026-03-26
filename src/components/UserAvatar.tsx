import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

/**
 * Displays user avatar with fallback to initials
 * Shows profile photo if available, otherwise shows first letter of name
 */
export function UserAvatar({ 
  name, 
  avatarUrl, 
  size = 'md', 
  onClick,
  className = '' 
}: UserAvatarProps) {
  const initials = name?.charAt(0)?.toUpperCase() || '?';

  if (avatarUrl) {
    return (
      <button
        onClick={onClick}
        disabled={!onClick}
        className={`
          ${sizeClasses[size]} 
          rounded-full overflow-hidden flex-shrink-0 
          ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-[#CDFF00] transition-all' : 'cursor-default'}
          ${className}
        `}
      >
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        ${sizeClasses[size]} 
        rounded-full bg-[#CDFF00] flex items-center justify-center font-bold text-black flex-shrink-0
        ${onClick ? 'cursor-pointer hover:bg-[#b8e600] transition-all' : 'cursor-default'}
        ${className}
      `}
    >
      {initials}
    </button>
  );
}