import React from 'react';
import { Heart, Briefcase, ShoppingBag, MessageCircle, User, Home, Menu, Users } from 'lucide-react';

interface BottomNavigationProps {
  currentScreen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'chat' | 'profile' | 'professionals';
  onNavigate: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'chat' | 'profile' | 'professionals') => void;
  unreadCount?: number;
  chatUnreadCount?: number;
  activeTasksCount?: number;
  onMenuClick?: () => void;
}

export function BottomNavigation({ 
  currentScreen, 
  onNavigate, 
  unreadCount = 0, 
  chatUnreadCount = 0,
  activeTasksCount = 0,
  onMenuClick 
}: BottomNavigationProps) {
  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'tasks' as const, icon: Briefcase, label: 'Tasks' },
    { id: 'wishes' as const, icon: Heart, label: 'Wishes' },
    { id: 'marketplace' as const, icon: ShoppingBag, label: 'Buy&Sell' },
    { id: 'professionals' as const, icon: Users, label: 'Pros' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 z-40 sm:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-16 md:h-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;
          const badgeCount = tab.id === 'chat' ? chatUnreadCount : tab.id === 'tasks' ? activeTasksCount : 0;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${\n                isActive ? 'text-black' : 'text-gray-600'\n              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-[#CDFF00] text-black text-[10px] font-black rounded-full flex items-center justify-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </div>
              <span className={`text-xs leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
        
        {/* Hamburger Menu Button */}
      </div>
    </nav>
  );
}