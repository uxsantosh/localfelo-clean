import React from 'react';
import { X, User, LogOut, Shield, Bell, MapPin, LogIn, FileText, AlertTriangle, Ban, Mail, Download, Smartphone } from 'lucide-react';

interface MobileMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userDisplayName?: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
  onLocationClick?: () => void;
  locationText?: string;
  onLoginClick?: () => void;
  onContactClick?: () => void;
  appDownloadUrl?: string;
  appDownloadEnabled?: boolean;
}

export function MobileMenuSheet({
  isOpen,
  onClose,
  isLoggedIn,
  isAdmin,
  userDisplayName,
  onNavigate,
  onLogout,
  onNotificationClick,
  notificationCount = 0,
  onLocationClick,
  locationText,
  onLoginClick,
  onContactClick,
  appDownloadUrl,
  appDownloadEnabled = true,
}: MobileMenuSheetProps) {
  if (!isOpen) return null;

  console.log('📱 [MobileMenuSheet] Props:', { appDownloadEnabled, appDownloadUrl });

  const handleNavigate = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 sm:hidden"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 sm:hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-heading">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-heading" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col py-2">
          {isLoggedIn ? (
            <>
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#CDFF00]" />
                  </div>
                  <div>
                    <p className="font-semibold text-heading">{userDisplayName}</p>
                    <p className="text-sm text-body">Welcome back!</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              {onLocationClick && (
                <button
                  onClick={() => {
                    onLocationClick();
                    onClose();
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-primary" />
                  <div className="flex-1 text-left">
                    <span className="text-heading block">{locationText || 'Set Location'}</span>
                    {locationText && (
                      <span className="text-xs text-body">Tap to change</span>
                    )}
                  </div>
                </button>
              )}

              {/* Notifications */}
              <button
                onClick={() => {
                  onNavigate('notifications');
                  onClose();
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="relative">
                  <Bell className="w-5 h-5 text-heading" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </div>
                <span className="text-heading">Notifications</span>
              </button>

              {/* Profile */}
              <button
                onClick={() => handleNavigate('profile')}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <User className="w-5 h-5 text-heading" />
                <span className="text-heading">My Profile</span>
              </button>

              {/* Admin - Only if admin */}
              {isAdmin && (
                <button
                  onClick={() => handleNavigate('admin')}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Shield className="w-5 h-5 text-heading" />
                  <span className="text-heading">Admin Panel</span>
                </button>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-200 mt-2"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="text-red-500 font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Login Prompt */}
              <div className="px-4 py-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-heading font-medium mb-1">Not logged in</p>
                <p className="text-sm text-body mb-4">Login to access all features</p>
              </div>

              {/* Login/Register Button */}
              <div className="px-4">
                <button
                  onClick={() => {
                    if (onLoginClick) onLoginClick();
                    onClose();
                  }}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login / Register</span>
                </button>
              </div>
            </>
          )}

          {/* Policy Links - Always visible */}
          <div className="mt-4 border-t border-gray-200 pt-2">
            <p className="px-4 py-2 text-xs font-semibold text-muted uppercase">Legal & Safety</p>
            
            <button
              onClick={() => handleNavigate('safety')}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full"
            >
              <Shield className="w-4 h-4 text-body" />
              <span className="text-sm text-body">Safety & Community Guidelines</span>
            </button>

            <button
              onClick={() => handleNavigate('terms')}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full"
            >
              <FileText className="w-4 h-4 text-body" />
              <span className="text-sm text-body">Terms & Conditions</span>
            </button>

            <button
              onClick={() => handleNavigate('privacy')}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full"
            >
              <Shield className="w-4 h-4 text-body" />
              <span className="text-sm text-body">Privacy Policy</span>
            </button>

            <button
              onClick={() => handleNavigate('prohibited')}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full"
            >
              <Ban className="w-4 h-4 text-body" />
              <span className="text-sm text-body">Prohibited Items</span>
            </button>

            <button
              onClick={() => {
                if (onContactClick) onContactClick();
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full"
            >
              <Mail className="w-4 h-4 text-body" />
              <span className="text-sm text-body">Contact Us</span>
            </button>
          </div>

          {/* App Download Link */}
          {appDownloadEnabled && appDownloadUrl && (
            <div className="mt-4 border-t border-gray-200 pt-2">
              <p className="px-4 py-2 text-xs font-semibold text-muted uppercase">Download App</p>
              
              <a
                href={appDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full"
              >
                <Smartphone className="w-4 h-4 text-body" />
                <span className="text-sm text-body">Download LocalFelo App</span>
              </a>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-center text-body">
            LocalFelo v1.0
          </p>
        </div>
      </div>
    </>
  );
}