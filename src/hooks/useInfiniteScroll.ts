import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchFunction: (page: number, limit: number) => Promise<{ data: T[]; totalCount: number }>;
  limit?: number;
  dependencies?: any[];
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  isRefreshing: boolean;
  totalCount: number;
}

/**
 * Custom hook for infinite scroll with automatic loading
 * Supports both mobile and web with optimized performance
 */
export function useInfiniteScroll<T>({
  fetchFunction,
  limit = 20,
  dependencies = [],
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch items for a specific page
  const fetchItems = async (pageNum: number, isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await fetchFunction(pageNum, limit);
      const newItems = result.data;
      const total = result.totalCount;

      if (isRefresh || pageNum === 1) {
        // Replace items on refresh or first load
        setItems(newItems);
        setPage(1);
      } else {
        // Append items on load more
        setItems(prev => [...prev, ...newItems]);
      }

      setTotalCount(total);
      setHasMore(items.length + newItems.length < total);
    } catch (error) {
      console.error('Error fetching items:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load more items
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchItems(nextPage);
    }
  }, [loading, hasMore, page]);

  // Refresh from beginning
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchItems(1, true);
  }, []);

  // Initial load and dependency changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setItems([]);
    fetchItems(1, true);
  }, dependencies);

  // Intersection Observer for automatic loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadMore]);

  return {
    items,
    loading,
    hasMore,
    loadMore,
    refresh,
    isRefreshing,
    totalCount,
  };
}
