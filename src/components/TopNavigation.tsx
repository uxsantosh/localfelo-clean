import React from 'react';
import { Home, Briefcase, Heart, ShoppingBag, Users } from 'lucide-react';

interface TopNavigationProps {
  currentScreen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'professionals';
  onNavigate: (screen: 'home' | 'marketplace' | 'wishes' | 'tasks' | 'professionals') => void;
}

export function TopNavigation({ currentScreen, onNavigate }: TopNavigationProps) {
  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'tasks' as const, icon: Briefcase, label: 'Tasks Nearby' },
    { id: 'wishes' as const, icon: Heart, label: 'Wishes Nearby' },
    { id: 'marketplace' as const, icon: ShoppingBag, label: 'Buy & Sell' },
    { id: 'professionals' as const, icon: Users, label: 'Professionals' },
  ];

  return (
    <nav className="hidden md:block bg-white border-b border-gray-200 sticky top-14 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentScreen === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                  isActive
                    ? 'border-[#CDFF00] text-black font-bold'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
