import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface GreetingToastProps {
  userName?: string;
  customMessage?: string;
}

export function GreetingToast({ userName, customMessage }: GreetingToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if greeting was already shown in this session
    const greetingShown = sessionStorage.getItem('greeting-shown');
    
    if (!greetingShown) {
      // Show greeting after a short delay
      setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('greeting-shown', 'true');
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }, 1000);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const getGreeting = () => {
    if (customMessage) return customMessage;
    
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour >= 5 && hour < 12) {
      greeting = 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good Evening';
    } else {
      greeting = 'Good Night';
    }
    
    return userName ? `${greeting}, ${userName}! 👋` : `${greeting}! Welcome to LocalFelo 👋`;
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-in-up"
      style={{
        animation: 'slideInUp 0.4s ease-out'
      }}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
          <span className="text-xl">👋</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-heading m-0">
            {getGreeting()}
          </p>
          <p className="text-xs text-muted m-0 mt-1">
            Find great deals near you
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-background rounded-lg transition-colors"
          aria-label="Dismiss greeting"
        >
          <X className="w-4 h-4 text-muted" />
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      <div className="h-1 bg-background rounded-b-xl overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent animate-progress"
          style={{
            animation: 'progress 5s linear'
          }}
        />
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}