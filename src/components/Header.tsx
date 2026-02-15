import React from 'react';
import { ArrowLeft, Home, PlusCircle, User, Shield, List, MapPin, Search, Menu, MessageCircle, ChevronDown, Heart, Briefcase, Package, Bell, Sparkles } from 'lucide-react';
import logoSvg from '../assets/logo.svg';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  
  // Desktop navigation props
  currentScreen?: string;
  onNavigate?: (screen: 'home' | 'create' | 'profile' | 'admin' | 'listing' | 'edit' | 'chat' | 'about' | 'safety' | 'terms' | 'privacy' | 'contact' | 'diagnostic' | 'create-wish' | 'create-task' | 'tasks' | 'wishes' | 'marketplace') => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userDisplayName?: string;
  
  // Global location props (replaces old location selector)
  showGlobalLocation?: boolean;
  globalLocationArea?: string;
  globalLocationCity?: string;
  onLocationClick?: () => void;
  
  // Search props (desktop only)
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  
  // Menu button handler
  onMenuClick?: () => void;
  
  // Chat unread count
  unreadCount?: number;
  
  // Notification props
  notificationCount?: number;
  onNotificationClick?: () => void;
  
  // Global search modal handler
  onGlobalSearchClick?: () => void;
}

export function Header({
  title = 'LocalFelo',
  currentScreen = 'home',
  showBack = false,
  onBack,
  onNavigate,
  rightAction,
  onLocationClick,
  showGlobalLocation = false,
  globalLocationArea,
  globalLocationCity,
  isLoggedIn = false,
  isAdmin = false,
  userDisplayName,
  showSearch = false,
  searchQuery = '',
  onSearchChange,
  onMenuClick,
  unreadCount,
  notificationCount,
  onNotificationClick,
  onGlobalSearchClick,
}: HeaderProps) {
  const isMainScreen = ['home', 'create', 'profile', 'admin', 'chat', 'tasks', 'wishes', 'marketplace'].includes(currentScreen);
  const isHomeScreen = currentScreen === 'home';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3 sm:gap-4 h-14 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 max-w-[1400px] mx-auto md:pb-2">
        {/* Left Section - Logo/Back Button */}
        <div className="flex items-center gap-3 shrink-0">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
          )}
          {/* Logo - Always clickable to navigate home */}
          <button 
            onClick={onNavigate ? () => onNavigate('home') : undefined}
            className="hover:opacity-80 transition-opacity active:scale-95 ml-0.5 sm:ml-1"
            aria-label="Go to home"
          >
            <img src={logoSvg} alt="LocalFelo" className="h-6 sm:h-7" />
          </button>
          {/* Title - Only show on non-main screens when showBack is true */}
          {!isMainScreen && showBack && (
            <h1 className="text-black m-0 font-bold text-[18px] tracking-tight">{title}</h1>
          )}
        </div>

        {/* Global Location Display - Compact Style (Swiggy-like) */}
        {showGlobalLocation && (
          <button
            onClick={onLocationClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-gray-100 rounded transition-all min-w-0 max-w-[160px] sm:max-w-[220px]"
          >
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-black truncate font-medium">
              {(() => {
                // Filter out "Unknown" values and empty strings
                const area = globalLocationArea && globalLocationArea !== 'Unknown' && globalLocationArea.trim() !== '' 
                  ? globalLocationArea.trim() 
                  : '';
                const city = globalLocationCity && globalLocationCity !== 'Unknown' && globalLocationCity.trim() !== '' 
                  ? globalLocationCity.trim() 
                  : '';
                
                console.log('🗺️ Header Location Debug:', { 
                  rawArea: globalLocationArea, 
                  rawCity: globalLocationCity,
                  processedArea: area,
                  processedCity: city
                });
                
                if (area && city) {
                  return `${area}, ${city}`;
                } else if (area) {
                  return area;
                } else if (city) {
                  return city;
                } else {
                  return 'Select location';
                }
              })()}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
          </button>
        )}

        {/* Global Search Button - Always visible on all screens */}
        {onGlobalSearchClick && (
          <button
            onClick={onGlobalSearchClick}
            className="p-2 hover:bg-gray-100 rounded active:scale-95 transition-all"
            aria-label="Search"
            title="Search everything"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right Section - Desktop Navigation (hidden on mobile) */}
        {isMainScreen && onNavigate && (
          <nav className="hidden sm:flex items-center gap-2">
            {/* Quick Action Buttons - Only when logged in and NOT on Home Screen */}
            {!isHomeScreen && isLoggedIn && (
              <>
                <button
                  onClick={() => onNavigate('create')}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium whitespace-nowrap"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden md:inline">Sell Item</span>
                  <span className="md:hidden">Sell</span>
                </button>
                <button
                  onClick={() => onNavigate('create-wish')}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 border-2 border-black text-black rounded-lg hover:bg-gray-50 transition-all text-sm font-medium whitespace-nowrap"
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden lg:inline">Post a Wish</span>
                  <span className="lg:hidden">Wish</span>
                </button>
                <button
                  onClick={() => onNavigate('create-task')}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 border-2 border-black text-black rounded-lg hover:bg-gray-50 transition-all text-sm font-medium whitespace-nowrap"
                >
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden lg:inline">Post a Task</span>
                  <span className="lg:hidden">Task</span>
                </button>
              </>
            )}
            
            {/* Profile */}
            <button
              onClick={() => onNavigate('profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium text-sm ${
                currentScreen === 'profile'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Profile</span>
            </button>

            {/* Admin - Only if admin and NOT on admin screen */}
            {isAdmin && currentScreen !== 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium text-sm text-gray-700 hover:bg-gray-100"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* Chat - Only if logged in */}
            {isLoggedIn && (
              <button
                onClick={() => onNavigate('chat')}
                className={`flex relative items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium text-sm ${
                  currentScreen === 'chat'
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="relative inline-flex">
                  <MessageCircle className="w-4 h-4" />
                  {unreadCount !== undefined && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px] h-[18px] border-2 border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline">Chat</span>
              </button>
            )}
            
            {/* Notifications - Only if logged in */}
            {isLoggedIn && (
              <button
                onClick={onNotificationClick}
                className={`flex relative items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium text-sm ${
                  currentScreen === 'notifications'
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="relative inline-flex">
                  <Bell className="w-4 h-4" />
                  {notificationCount !== undefined && notificationCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px] h-[18px] border-2 border-white">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline">Notifications</span>
              </button>
            )}
          </nav>
        )}

        {/* Custom Right Action (for non-main screens) */}
        {!isMainScreen && rightAction && <div>{rightAction}</div>}

        {/* Mobile-only Notification Bell - visible on mobile for logged in users */}
        {isLoggedIn && onNotificationClick && (
          <button
            onClick={onNotificationClick}
            className="sm:hidden p-2 hover:bg-gray-100 rounded active:scale-95 transition-all relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-black" />
            {notificationCount !== undefined && notificationCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px] h-[18px]">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        )}

        {/* Menu Button - visible on mobile, hidden on desktop when nav is shown */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className={`p-2 hover:bg-gray-100 rounded active:scale-95 transition-all ${isMainScreen ? 'sm:hidden' : ''}`}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-black" />
          </button>
        )}
      </div>

      {/* Secondary Navigation Bar - Web View Only (Home, Tasks, Wishes, Marketplace) */}
      {isMainScreen && onNavigate && (
        <div className="hidden md:block border-t border-gray-200 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
            <nav className="flex items-center gap-1">
              <button
                onClick={() => onNavigate('home')}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  currentScreen === 'home'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('tasks')}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  currentScreen === 'tasks'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Tasks Nearby
              </button>
              <button
                onClick={() => onNavigate('wishes')}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  currentScreen === 'wishes'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Wishes Nearby
              </button>
              <button
                onClick={() => onNavigate('marketplace')}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  currentScreen === 'marketplace'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Marketplace
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}