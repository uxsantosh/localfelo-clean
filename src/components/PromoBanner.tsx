import React, { useState, useEffect } from 'react';
import { X, Sparkles, Gift, Megaphone, Bell, PartyPopper, Zap } from 'lucide-react';

interface PromoBannerProps {
  message: string;
  emoji?: string;
  type?: 'promo' | 'info' | 'success' | 'announcement';
  storageKey?: string;
  icon?: 'sparkles' | 'gift' | 'megaphone' | 'bell' | 'party' | 'zap';
}

export function PromoBanner({ 
  message, 
  emoji = '🎉', 
  type = 'promo',
  storageKey = 'promo-banner-dismissed',
  icon = 'sparkles'
}: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this banner
    const isDismissed = localStorage.getItem(storageKey);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  if (!isVisible) return null;

  const bgColors = {
    promo: 'bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10',
    info: 'bg-gradient-to-r from-info/10 via-tertiary-accent/10 to-info/10',
    success: 'bg-gradient-to-r from-accent/10 via-success/10 to-accent/10',
    announcement: 'bg-gradient-to-r from-secondary-accent/10 via-primary/10 to-secondary-accent/10',
  };

  const borderColors = {
    promo: 'border-primary/20',
    info: 'border-info/20',
    success: 'border-accent/20',
    announcement: 'border-secondary-accent/20',
  };

  const icons = {
    sparkles: <Sparkles className="w-4 h-4" />,
    gift: <Gift className="w-4 h-4" />,
    megaphone: <Megaphone className="w-4 h-4" />,
    bell: <Bell className="w-4 h-4" />,
    party: <PartyPopper className="w-4 h-4" />,
    zap: <Zap className="w-4 h-4" />,
  };

  return (
    <div 
      className={`relative ${bgColors[type]} border-b ${borderColors[type]} animate-fade-in`}
      style={{
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Message */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <span className="text-lg sm:text-xl flex-shrink-0 animate-bounce-slow">
              {emoji}
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-primary flex-shrink-0 hidden sm:block">
                {icons[icon]}
              </span>
              <p className="text-xs sm:text-sm text-body font-medium truncate sm:whitespace-normal m-0">
                {message}
              </p>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1.5 hover:bg-black/5 rounded-lg transition-all"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
