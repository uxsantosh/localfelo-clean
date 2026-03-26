// =====================================================
// Scrollable Container with Arrow Navigation
// For horizontal scrolling on desktop with arrow buttons
// =====================================================

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollableContainerProps {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
}

export function ScrollableContainer({ 
  children, 
  className = '',
  showArrows = true 
}: ScrollableContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 300;
    const targetScroll = direction === 'left' 
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;
    
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Left Arrow - Hidden on mobile */}
      {showArrows && showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white border border-border rounded-full shadow-lg hover:bg-input transition-all ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ marginLeft: '-16px' }}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className={`overflow-x-auto ${className}`}
        onScroll={checkScroll}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <style>{`
          .overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {children}
      </div>

      {/* Right Arrow - Hidden on mobile */}
      {showArrows && showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white border border-border rounded-full shadow-lg hover:bg-input transition-all ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ marginRight: '-16px' }}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
