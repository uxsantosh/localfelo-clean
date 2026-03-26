import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  categoryEmoji?: string;
  title?: string;
}

export function ImageCarousel({ images, categoryEmoji, title = 'Image' }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Safety check: ensure images is always an array
  const safeImages = images || [];
  const hasImages = safeImages.length > 0;
  const hasMultipleImages = safeImages.length > 1;

  // ✅ Optimized with useCallback to prevent re-creation
  const goToPrevious = useCallback(() => {
    if (isTransitioning) return; // Prevent rapid clicks
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 150); // Short delay
  }, [isTransitioning, safeImages.length]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return; // Prevent rapid clicks
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 150); // Short delay
  }, [isTransitioning, safeImages.length]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 150);
  }, [isTransitioning]);

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
  }, [hasMultipleImages, goToPrevious, goToNext]);

  // ✅ Preload adjacent images for instant navigation
  useEffect(() => {
    if (!hasMultipleImages) return;

    const preloadImage = (src: string) => {
      const img = new Image();
      img.src = src;
    };

    // Preload previous and next images
    const prevIndex = currentIndex === 0 ? safeImages.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === safeImages.length - 1 ? 0 : currentIndex + 1;

    preloadImage(safeImages[prevIndex]);
    preloadImage(safeImages[nextIndex]);
  }, [currentIndex, safeImages, hasMultipleImages]);

  return (
    <div
      ref={carouselRef}
      className="relative w-full bg-input overflow-hidden cursor-pointer"
      style={{ height: '280px', maxWidth: '100%' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {hasImages ? (
        <>
          {/* Main Image - with fade transition */}
          <img
            key={currentIndex} // ✅ Force re-render with key for smoother transition
            src={safeImages[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            loading="eager" // ✅ Changed from lazy to eager for instant display
            className="w-full h-full object-contain bg-input transition-opacity duration-200"
            style={{ 
              maxWidth: '100%',
              willChange: 'opacity', // ✅ GPU acceleration hint
              opacity: isTransitioning ? 0.7 : 1
            }}
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
        // Placeholder when no images - Show LocalFelo logo symbol
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <svg
            width="120"
            height="120"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.15 }}
            className="text-gray-400"
          >
            <path d="M277.733 260.882L422.578 392.385L374.81 445L228.989 312.609L105.72 443.426L54 394.69L213.792 225.115H79.8604V154.05H378.403L277.733 260.882ZM458.997 229.461L410.066 280.999L339.476 213.979L388.404 162.44L458.997 229.461ZM411.179 48C437.167 48.0002 458.235 69.0681 458.235 95.0566C458.235 121.045 437.167 142.113 411.179 142.113C385.19 142.113 364.121 121.045 364.121 95.0566C364.121 69.068 385.19 48 411.179 48Z" fill="currentColor"/>
          </svg>
        </div>
      )}
    </div>
  );
}