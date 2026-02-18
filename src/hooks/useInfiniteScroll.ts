import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number; // Distance from bottom in pixels
}

/**
 * Custom hook for infinite scroll functionality
 * Detects when user scrolls near bottom and triggers load more
 * Works on both mobile and desktop
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  loading,
  threshold = 300, // Load more when 300px from bottom
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Scroll event handler for fallback
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    // Check if user is near bottom
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      console.log('📜 [useInfiniteScroll] Near bottom, loading more...');
      onLoadMore();
    }
  }, [loading, hasMore, threshold, onLoadMore]);

  // Intersection Observer for better performance
  useEffect(() => {
    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Only set up if we have more items to load
    if (!hasMore || loading) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          console.log('👁️ [useInfiniteScroll] Sentinel visible, loading more...');
          onLoadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: `${threshold}px`, // Trigger before reaching sentinel
        threshold: 0.1,
      }
    );

    // Observe sentinel element
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, threshold, onLoadMore]);

  // Fallback scroll listener for older browsers
  useEffect(() => {
    // Only add scroll listener if IntersectionObserver is not supported
    if (!('IntersectionObserver' in window)) {
      console.log('⚠️ [useInfiniteScroll] Using scroll fallback (no IntersectionObserver)');
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return { sentinelRef };
}
