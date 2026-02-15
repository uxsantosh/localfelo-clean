/**
 * Centralized Promo & Notification Configuration
 * Update messages here to change across the app
 */

export interface PromoConfig {
  // Banner configuration
  banner: {
    enabled: boolean;
    message: string;
    emoji: string;
    type: 'promo' | 'info' | 'success' | 'announcement';
    icon: 'sparkles' | 'gift' | 'megaphone' | 'bell';
    storageKey: string; // Change this to show banner again to all users
  };
  
  // Greeting toast configuration
  greeting: {
    enabled: boolean;
    customMessage?: string; // Leave empty for time-based greeting
  };
  
  // Floating badge configuration
  floatingBadge: {
    enabled: boolean;
    message: string;
    emoji: string;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    icon: 'gift' | 'sparkles' | 'zap' | 'party';
    storageKey: string; // Change this to show badge again to all users
  };
  
  // Ticker configuration (currently not implemented but can be added)
  ticker: {
    enabled: boolean;
    messages: string[];
    speed: 'slow' | 'medium' | 'fast';
  };
}

// 🎯 EDIT THIS TO CHANGE PROMOS
export const promoConfig: PromoConfig = {
  // Top Banner
  banner: {
    enabled: true,
    message: 'Welcome to LocalFelo! 🎉 Buy & Sell locally with zero commission!',
    emoji: '🚀',
    type: 'promo',
    icon: 'sparkles',
    storageKey: 'welcome-banner-v1', // Change to 'v2' to show again
  },
  
  // Greeting Toast
  greeting: {
    enabled: true,
    customMessage: undefined, // Auto greeting based on time
  },
  
  // Floating Badge (currently disabled - enable if needed)
  floatingBadge: {
    enabled: false,
    message: 'Get 20% off on featured listings! Limited time offer.',
    emoji: '🎁',
    position: 'bottom-right',
    icon: 'gift',
    storageKey: 'promo-badge-diwali-2024',
  },
  
  // Ticker (currently not used but can be enabled)
  ticker: {
    enabled: false,
    messages: [
      'Free to post! No hidden charges',
      'Connect directly with buyers & sellers',
      'New items added every day',
      'Chat with sellers instantly',
    ],
    speed: 'medium',
  },
};

// 📅 SEASONAL PROMOS - Uncomment and use when needed

// Diwali Special
export const diwaliPromo: PromoConfig = {
  banner: {
    enabled: true,
    message: 'Happy Diwali! 🪔 Celebrate by buying & selling locally on OldCycle!',
    emoji: '🪔',
    type: 'success',
    icon: 'sparkles',
    storageKey: 'diwali-banner-2024',
  },
  greeting: {
    enabled: true,
    customMessage: 'Happy Diwali! 🪔 Find amazing deals near you!',
  },
  floatingBadge: {
    enabled: true,
    message: 'Diwali Sale! Great deals on Electronics, Furniture & more!',
    emoji: '🪔',
    position: 'bottom-right',
    icon: 'party',
    storageKey: 'diwali-badge-2024',
  },
  ticker: {
    enabled: false,
    messages: [],
    speed: 'medium',
  },
};

// New Year Special
export const newYearPromo: PromoConfig = {
  banner: {
    enabled: true,
    message: 'Happy New Year 2025! 🎊 Start fresh - sell old, buy new on OldCycle!',
    emoji: '🎊',
    type: 'announcement',
    icon: 'megaphone',
    storageKey: 'newyear-banner-2025',
  },
  greeting: {
    enabled: true,
    customMessage: 'Happy New Year! 🎊 New deals await you!',
  },
  floatingBadge: {
    enabled: false,
    message: '',
    emoji: '',
    position: 'bottom-right',
    icon: 'gift',
    storageKey: '',
  },
  ticker: {
    enabled: false,
    messages: [],
    speed: 'medium',
  },
};

// Holi Special
export const holiPromo: PromoConfig = {
  banner: {
    enabled: true,
    message: 'Happy Holi! 🎨 Add colors to your home with great deals on OldCycle!',
    emoji: '🎨',
    type: 'success',
    icon: 'sparkles',
    storageKey: 'holi-banner-2025',
  },
  greeting: {
    enabled: true,
    customMessage: 'Happy Holi! 🎨 Celebrate with amazing local deals!',
  },
  floatingBadge: {
    enabled: false,
    message: '',
    emoji: '',
    position: 'bottom-right',
    icon: 'gift',
    storageKey: '',
  },
  ticker: {
    enabled: false,
    messages: [],
    speed: 'medium',
  },
};