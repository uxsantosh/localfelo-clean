import React, { useEffect, useState } from 'react';
import { Briefcase, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ActiveTaskBannerProps {
  onNavigate: (screen: string) => void;
  activeTasksCount: number;
}

export function ActiveTaskBanner({ onNavigate, activeTasksCount }: ActiveTaskBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [title, setTitle] = useState('Active Tasks');
  const [message, setMessage] = useState('Tap to view details');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    loadBannerSettings();
  }, []);

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem('activeTaskBannerDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Show banner if there are active tasks
    if (activeTasksCount > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [activeTasksCount]);

  const loadBannerSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('title, message, image_url')
        .eq('id', 'active_task_banner')
        .single();

      if (data) {
        setTitle(data.title || 'Active Tasks');
        setMessage(data.message || 'Tap to view details');
        setImageUrl(data.image_url || '');
      }
    } catch (error) {
      console.error('Error loading banner settings:', error);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('activeTaskBannerDismissed', 'true');
  };

  const handleClick = () => {
    onNavigate('tasks'); // Navigate to tasks screen where active tasks are shown
  };

  if (!isVisible || isDismissed || activeTasksCount === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile: Above bottom navigation */}
      <div className="sm:hidden fixed bottom-[60px] left-0 right-0 z-40 px-3 pb-2">
        <div
          onClick={handleClick}
          className="bg-black text-white rounded-lg shadow-lg cursor-pointer hover:bg-gray-800 transition-all animate-slide-up"
        >
          <div className="flex items-center gap-2 px-3 py-2">
            {imageUrl ? (
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="bg-[#CDFF00] rounded-full p-1.5">
                <Briefcase className="w-3.5 h-3.5 text-black" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">
                {activeTasksCount} {title}
              </p>
              <p className="text-[10px] text-white/70">{message}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: Bottom right sticky */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-40">
        <div
          onClick={handleClick}
          className="bg-black text-white rounded-lg shadow-lg cursor-pointer hover:bg-gray-800 transition-all animate-slide-up"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            {imageUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="bg-[#CDFF00] rounded-full p-2">
                <Briefcase className="w-4 h-4 text-black" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold whitespace-nowrap">
                {activeTasksCount} {title}
              </p>
              <p className="text-xs text-white/70">{message}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}