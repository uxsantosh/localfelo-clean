import React, { useState } from 'react';
import { X, Gift, Sparkles, Zap, PartyPopper, Megaphone, Bell } from 'lucide-react';

interface FloatingPromoBadgeProps {
  message: string;
  emoji?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  storageKey?: string;
  icon?: 'sparkles' | 'gift' | 'megaphone' | 'bell' | 'party' | 'zap';
}

export function FloatingPromoBadge({ 
  message, 
  emoji = '🎁',
  position = 'bottom-right',
  storageKey = 'floating-badge-dismissed',
  icon = 'gift'
}: FloatingPromoBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(storageKey) === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(storageKey, 'true');
  };

  if (isDismissed) return null;

  const positionClasses = {
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'bottom-right': 'bottom-24 right-6',
    'bottom-left': 'bottom-24 left-6',
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
    <div className={`fixed ${positionClasses[position]} z-40`}>
      {isExpanded ? (
        // Expanded card
        <div className="bg-card border border-primary/20 rounded-xl shadow-2xl p-4 animate-scale-in max-w-xs">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white animate-pulse-slow">
              {icons[icon]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-heading m-0 mb-1">
                {emoji} Special Offer!
              </p>
              <p className="text-xs text-body m-0">
                {message}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 hover:bg-background rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-muted" />
            </button>
          </div>
        </div>
      ) : (
        // Collapsed badge
        <button
          onClick={() => setIsExpanded(true)}
          className="relative bg-gradient-to-br from-primary to-accent text-white rounded-full p-3 shadow-xl hover:shadow-2xl transition-all hover:scale-110 animate-bounce-gentle"
          aria-label="View promotion"
        >
          <span className="text-xl">{emoji}</span>
          
          {/* Pulse ring effect */}
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
          
          {/* Notification dot */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-card animate-pulse" />
        </button>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
