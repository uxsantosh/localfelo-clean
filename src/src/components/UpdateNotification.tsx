import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { versionManager } from '../utils/version-manager';

/**
 * UpdateNotification Component
 * Shows a notification when a new version is available
 */
export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Start version checking when component mounts
    try {
      versionManager.startVersionCheck(() => {
        setShowUpdate(true);
      });
    } catch (error) {
      console.warn('Failed to start version check:', error);
    }

    // Cleanup on unmount
    return () => {
      try {
        versionManager.stopVersionCheck();
      } catch (error) {
        console.warn('Failed to stop version check:', error);
      }
    };
  }, []);

  const handleUpdate = () => {
    setIsRefreshing(true);
    try {
      versionManager.reloadApp();
    } catch (error) {
      console.error('Failed to reload app:', error);
      setIsRefreshing(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Show again after 30 minutes if user dismisses
    try {
      setTimeout(() => {
        setShowUpdate(true);
      }, 30 * 60 * 1000);
    } catch (error) {
      console.warn('Failed to set reminder:', error);
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white border-2 border-[#CDFF00] rounded-lg shadow-lg max-w-md mx-auto">
        <div className="flex items-start gap-3 p-4">
          <div className="flex-shrink-0 w-10 h-10 bg-[#CDFF00] rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-black" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-black">
              New Version Available
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              A new version of LocalFelo is available. Please update to get the latest features and improvements.
            </p>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUpdate}
                disabled={isRefreshing}
                className="px-4 py-2 bg-[#CDFF00] hover:bg-[#CDFF00]/90 text-black rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Now'
                )}
              </button>
              
              <button
                onClick={handleDismiss}
                disabled={isRefreshing}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            disabled={isRefreshing}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}