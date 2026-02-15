import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
  title: string;
  children: React.ReactNode;
  onViewAll?: () => void;
  showViewAll?: boolean;
}

export function HorizontalScroll({ title, children, onViewAll, showViewAll = true }: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
    scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  return (
    <div className="mb-5 sm:mb-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-[15px] sm:text-xl font-bold text-heading pr-2">{title}</h2>
        <div className="flex items-center gap-2 shrink-0">
          {/* Scroll Buttons - Desktop Only */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-muted" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-muted" />
            </button>
          </div>
          {/* View All Button */}
          {showViewAll && onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm font-semibold text-black hover:text-gray-700 transition-colors"
            >
              View All
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory', gap: '16px' }}
      >
        {children}
      </div>
    </div>
  );
}