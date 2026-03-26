// =====================================================
// ROLE CARD COMPONENT - 2026 CLEAN DESIGN
// =====================================================
// Modern, minimal card design for professional roles

import { Briefcase } from 'lucide-react';
import { useState } from 'react';
import type { Role } from '../services/roles';

interface RoleCardProps {
  role: Role;
  onClick: () => void;
}

export function RoleCard({ role, onClick }: RoleCardProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = role.image_url && !imageError;

  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-2xl hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
    >
      {/* Hover effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#CDFF00]/0 to-[#CDFF00]/0 group-hover:from-[#CDFF00]/10 group-hover:to-[#B8E600]/10 transition-all duration-300 rounded-2xl" />
      
      {/* Icon/Image - Full Width */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-[#CDFF00]/20 to-[#B8E600]/20 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
        {showImage ? (
          <img
            src={role.image_url}
            alt={role.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Briefcase className="w-12 h-12 text-black" />
        )}
      </div>

      {/* Role Name */}
      <div className="relative z-10 p-4">
        <h3 className="font-bold text-black text-base group-hover:text-black transition-colors">
          {role.name}
        </h3>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#CDFF00] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
}