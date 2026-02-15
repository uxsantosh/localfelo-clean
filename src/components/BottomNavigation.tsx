import React from 'react';
import { Heart, Briefcase, ShoppingBag, MessageCircle, User, Home, Menu } from 'lucide-react';

interface BottomNavigationProps {
  currentScreen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'chat' | 'profile';
  onNavigate: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'chat' | 'profile') => void;
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
    { id: 'marketplace' as const, icon: ShoppingBag, label: 'Market' },
    { id: 'wishes' as const, icon: Heart, label: 'Wishes' },
    { id: 'tasks' as const, icon: Briefcase, label: 'Tasks' },
    { id: 'chat' as const, icon: MessageCircle, label: 'Chat' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 z-40 sm:hidden">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;
          const badgeCount = tab.id === 'chat' ? chatUnreadCount : tab.id === 'tasks' ? activeTasksCount : 0;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                isActive ? 'text-black' : 'text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#CDFF00] text-black text-[10px] font-black rounded-full flex items-center justify-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
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