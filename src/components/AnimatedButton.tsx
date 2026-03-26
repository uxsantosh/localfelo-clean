import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedButtonProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function AnimatedButton({ 
  icon: Icon, 
  title, 
  subtitle, 
  onClick, 
  variant = 'primary' 
}: AnimatedButtonProps) {
  const bgColor = variant === 'primary' 
    ? 'bg-gradient-to-br from-primary via-primary-light to-primary' 
    : 'bg-gradient-to-br from-purple-500 via-purple-400 to-purple-500';

  return (
    <button
      onClick={onClick}
      className="relative group w-full overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Animated Background */}
      <div className={`${bgColor} p-8 relative`}>
        {/* Rotating Flare Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-xl animate-flare" />
          </div>
        </div>

        {/* Sparkle Effects */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full animate-sparkle-1" />
        <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white/60 rounded-full animate-sparkle-2" />
        <div className="absolute top-1/2 right-8 w-1 h-1 bg-white/60 rounded-full animate-sparkle-3" />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
            <p className="text-white/90 text-sm">{subtitle}</p>
          </div>
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </div>

      {/* Border Glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className={`absolute inset-0 rounded-xl blur-md ${bgColor} opacity-50`} />
      </div>
    </button>
  );
}
