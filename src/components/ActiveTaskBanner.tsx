import React, { useEffect, useState, useRef } from 'react';
import { Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ActiveTaskBannerProps {
  onNavigate: (screen: string) => void;
  activeTasksCount: number;
  onOpenModal: () => void;
}

export function ActiveTaskBanner({ onNavigate, activeTasksCount, onOpenModal }: ActiveTaskBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState('Active Tasks');
  const [message, setMessage] = useState('Tap to view details');
  const [imageUrl, setImageUrl] = useState('');
  
  // Draggable state for mobile
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBannerSettings();
    // Load saved position from localStorage
    const savedPosition = localStorage.getItem('activeTasksPillPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  useEffect(() => {
    // Show banner whenever there are active tasks
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

  const handleClick = () => {
    if (!isDragging) {
      onOpenModal(); // Open the active tasks modal only if not dragging
    }
  };

  // Touch handlers for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
    setIsDragging(false); // Reset drag state
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    // Get pill dimensions and screen bounds
    if (pillRef.current) {
      const pillWidth = pillRef.current.offsetWidth;
      const pillHeight = pillRef.current.offsetHeight;
      const maxX = window.innerWidth - pillWidth - 24; // 24px padding
      const maxY = window.innerHeight - pillHeight - 72; // 72px for bottom nav + padding

      // Constrain to screen bounds
      const constrainedX = Math.max(-maxX, Math.min(0, newX));
      const constrainedY = Math.max(-maxY, Math.min(0, newY));

      setPosition({ x: constrainedX, y: constrainedY });
      setIsDragging(true); // Mark as dragging
    }
  };

  const handleTouchEnd = () => {
    // Save position to localStorage
    localStorage.setItem('activeTasksPillPosition', JSON.stringify(position));
    
    // Small delay to prevent click event if dragged
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  if (!isVisible || activeTasksCount === 0) {
    return null;
  }

  // Get singular or plural title
  const displayTitle = activeTasksCount === 1 
    ? title.replace('Tasks', 'Task') 
    : title;

  return (
    <>
      {/* Mobile: Above bottom navigation - DRAGGABLE BIGGER PILL */}
      <div className="sm:hidden fixed bottom-[60px] left-0 right-0 z-40 px-3 pb-2 pointer-events-none">
        <div
          ref={pillRef}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          className="bg-black rounded-full shadow-lg cursor-pointer hover:bg-gray-800 inline-flex items-center gap-2 px-4 py-2.5 ml-auto pointer-events-auto touch-none"
        >
          {imageUrl ? (
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="bg-[#CDFF00] rounded-full p-1.5">
              <Briefcase className="w-3.5 h-3.5 text-black" />
            </div>
          )}
          <span className="text-white font-semibold" style={{ fontSize: '14px', color: '#FFFFFF' }}>
            {activeTasksCount} {displayTitle}
          </span>
        </div>
      </div>

      {/* Desktop: Bottom right sticky */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-40">
        <div
          onClick={handleClick}
          className="bg-black rounded-lg shadow-lg cursor-pointer hover:bg-gray-800 transition-all animate-slide-up"
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
              <p className="text-white font-semibold whitespace-nowrap" style={{ fontSize: '14px', color: '#FFFFFF' }}>
                {activeTasksCount} {displayTitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}