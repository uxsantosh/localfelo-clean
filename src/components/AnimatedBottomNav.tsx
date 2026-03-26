import React, { useState, useEffect } from 'react';
import { Home, MessageCircle, Briefcase, Heart, ShoppingBag, Users, ChevronUp, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimatedBottomNavProps {
  currentScreen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'chat' | 'profile' | 'professionals' | 'shops';
  onNavigate: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'chat' | 'professionals' | 'shops') => void;
  chatUnreadCount?: number;
}

type FeatureTab = 'tasks' | 'wishes' | 'marketplace' | 'professionals' | 'shops';

const FEATURE_TABS: Array<{
  id: FeatureTab;
  icon: React.ComponentType<any>;
  label: string;
  shortLabel: string;
}> = [
  { id: 'tasks', icon: Briefcase, label: 'Tasks', shortLabel: 'Tasks' },
  { id: 'wishes', icon: Heart, label: 'Wishes', shortLabel: 'Wishes' },
  { id: 'marketplace', icon: ShoppingBag, label: 'Buy & Sell', shortLabel: 'Buy&Sell' },
  { id: 'professionals', icon: Users, label: 'Find Professionals', shortLabel: 'Professionals' },
  { id: 'shops', icon: Store, label: 'Local Shops', shortLabel: 'Shops' },
];

export function AnimatedBottomNav({
  currentScreen,
  onNavigate,
  chatUnreadCount = 0,
}: AnimatedBottomNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animatingText, setAnimatingText] = useState(0);
  
  // Auto-rotate text when collapsed
  useEffect(() => {
    if (!isExpanded) {
      const interval = setInterval(() => {
        setAnimatingText((prev) => (prev + 1) % FEATURE_TABS.length);
      }, 2000); // Change every 2 seconds
      
      return () => clearInterval(interval);
    }
  }, [isExpanded]);

  // Determine active feature tab
  const activeFeatureTab = (['tasks', 'wishes', 'marketplace', 'professionals', 'shops'] as FeatureTab[]).find(
    (tab) => currentScreen === tab
  );

  const handleFeatureClick = (featureId: FeatureTab) => {
    onNavigate(featureId);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        {/* Main Nav Bar */}
        <div className="bg-white border-t border-gray-200 px-2 pb-safe" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
          <div className="flex items-stretch justify-between gap-1">
            {/* Left Side: Fixed Tabs */}
            <div className={`flex items-stretch gap-1 ${!activeFeatureTab ? 'flex-1' : ''}`}>
              {/* Home Tab */}
              <button
                onClick={() => onNavigate('home')}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all ${!activeFeatureTab ? 'flex-1' : 'min-w-[70px]'} ${
                  currentScreen === 'home'
                    ? 'bg-[#CDFF00] text-black'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Home className={`w-5 h-5 mb-0.5 ${currentScreen === 'home' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                <span className={`text-[10px] leading-tight ${currentScreen === 'home' ? 'font-bold' : 'font-medium'}`}>
                  Home
                </span>
              </button>

              {/* Chat Tab */}
              <button
                onClick={() => onNavigate('chat')}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all ${!activeFeatureTab ? 'flex-1' : 'min-w-[70px]'} relative ${
                  currentScreen === 'chat'
                    ? 'bg-[#CDFF00] text-black'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <MessageCircle className={`w-5 h-5 mb-0.5 ${currentScreen === 'chat' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  {chatUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                      {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] leading-tight ${currentScreen === 'chat' ? 'font-bold' : 'font-medium'}`}>
                  Chat
                </span>
              </button>

              {/* Active Feature Tab (if one is selected) */}
              {activeFeatureTab && (
                <button
                  onClick={() => handleFeatureClick(activeFeatureTab)}
                  className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-[#CDFF00] text-black transition-all flex-1"
                >
                  {(() => {
                    const tab = FEATURE_TABS.find(t => t.id === activeFeatureTab);
                    if (!tab) return null;
                    const Icon = tab.icon;
                    return (
                      <>
                        <Icon className="w-5 h-5 mb-0.5 stroke-[2.5]" />
                        <span className="text-[10px] leading-tight font-bold truncate max-w-full">
                          {tab.shortLabel}
                        </span>
                      </>
                    );
                  })()}
                </button>
              )}
            </div>

            {/* Right Side: Feature Menu Button - Fluid Width */}
            <div className="relative flex-1 max-w-[130px]">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full h-full flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all ${
                  isExpanded
                    ? 'bg-black text-white'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="mb-0.5"
                >
                  <ChevronUp className={`w-5 h-5 ${isExpanded ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                </motion.div>
                
                {/* Animated Text */}
                {!isExpanded && (
                  <div className="h-[15px] overflow-hidden w-full">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={animatingText}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-[11px] leading-tight font-semibold block text-center"
                      >
                        {FEATURE_TABS[animatingText].shortLabel}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
                
                {isExpanded && (
                  <span className="text-[11px] leading-tight font-bold">Menu</span>
                )}
              </button>

              {/* Expanded Menu */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute bottom-full right-0 mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden min-w-[280px]"
                  >
                    {FEATURE_TABS.map((tab, index) => {
                      const Icon = tab.icon;
                      const isActive = currentScreen === tab.id;
                      
                      return (
                        <motion.button
                          key={tab.id}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleFeatureClick(tab.id)}
                          className={`w-full flex items-center gap-4 px-6 py-5 transition-all ${
                            isActive
                              ? 'bg-[#CDFF00] text-black'
                              : 'text-gray-700 hover:bg-gray-50'
                          } ${index > 0 ? 'border-t border-gray-100' : ''}`}
                        >
                          <Icon className={`w-7 h-7 flex-shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                          <span className={`text-lg ${isActive ? 'font-bold' : 'font-medium'}`}>
                            {tab.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}