import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OfflineRibbonProps {
  onRefresh?: () => void;
}

export function OfflineRibbon({ onRefresh }: OfflineRibbonProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Internet connection restored');
      setIsOnline(true);
      setJustReconnected(true);
      
      // Auto-refresh when connection is restored (wait 1 second for stability)
      setTimeout(() => {
        if (onRefresh) {
          console.log('🔄 Auto-refreshing after reconnection...');
          onRefresh();
        }
      }, 1000);
      
      // Hide reconnected message after 3 seconds
      setTimeout(() => {
        setJustReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      console.log('📡 Internet connection lost');
      setIsOnline(false);
      setJustReconnected(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onRefresh]);

  const handleRefresh = () => {
    if (!navigator.onLine) {
      console.log('⚠️ Cannot refresh - still offline');
      return;
    }

    setIsRefreshing(true);
    
    console.log('🔄 Manual refresh triggered');
    
    // Call parent's refresh function if provided
    if (onRefresh) {
      onRefresh();
    } else {
      // Default: reload the page
      window.location.reload();
    }
    
    // Stop refreshing animation after 1 second
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {/* Offline Ribbon */}
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg"
        >
          <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <WifiOff className="size-5 animate-pulse" />
              <div>
                <p className="font-bold text-sm">No Internet Connection</p>
                <p className="text-xs text-white/90">Please check your network settings</p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Retry</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Reconnected Ribbon (Shows briefly when connection restored) */}
      {justReconnected && isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
        >
          <div className="flex items-center justify-center gap-3 px-4 py-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <p className="font-bold text-sm">Back Online!</p>
              <p className="text-xs text-white/90 hidden sm:inline">Connection restored</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}