import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  categoryEmoji: string;
  title: string;
}

export function ImageCarousel({ images, categoryEmoji, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Safety check: ensure images is always an array
  const safeImages = images || [];
  const hasImages = safeImages.length > 0;
  const hasMultipleImages = safeImages.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Handle touch swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left - go to next
      goToNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right - go to previous
      goToPrevious();
    }

    // Reset
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasMultipleImages) return;

      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultipleImages, safeImages.length]);

  return (
    <div
      ref={carouselRef}
      className="relative w-full bg-input overflow-hidden"
      style={{ height: '400px', maxWidth: '100%' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {hasImages ? (
        <>
          {/* Main Image */}
          <img
            src={safeImages[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            loading="lazy"
            className="w-full h-full object-contain bg-input"
            style={{ maxWidth: '100%' }}
          />

          {/* Navigation Arrows (Desktop) */}
          {hasMultipleImages && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-all active:scale-95 shadow-lg z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-heading" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-all active:scale-95 shadow-lg z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-heading" />
              </button>
            </>
          )}

          {/* Pagination Dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {safeImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all rounded-full ${
                    index === currentIndex
                      ? 'w-7 h-2.5 bg-primary shadow-md'
                      : 'w-2.5 h-2.5 bg-card/80 hover:bg-card'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Image Counter (Desktop) */}
          {hasMultipleImages && (
            <div className="hidden sm:block absolute top-4 right-4 px-3 py-1.5 bg-card/95 backdrop-blur-sm rounded-full shadow-md z-10">
              <span className="text-xs text-heading font-semibold">
                {currentIndex + 1} / {safeImages.length}
              </span>
            </div>
          )}
        </>
      ) : (
        // Placeholder when no images
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-8xl opacity-30">{categoryEmoji}</span>
        </div>
      )}
    </div>
  );
}