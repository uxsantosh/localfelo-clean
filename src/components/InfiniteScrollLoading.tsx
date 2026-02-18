import { Loader2 } from 'lucide-react';

interface InfiniteScrollLoadingProps {
  isLoading: boolean;
  hasMore: boolean;
  className?: string;
}

/**
 * Loading indicator for infinite scroll
 * Shows at the bottom of lists when loading more items
 */
export function InfiniteScrollLoading({ isLoading, hasMore, className = '' }: InfiniteScrollLoadingProps) {
  if (!isLoading && !hasMore) {
    return (
      <div className={`text-center py-8 px-4 ${className}`}>
        <p className="text-sm text-gray-500">
          ✅ All items loaded
        </p>
      </div>
    );
  }

  if (!isLoading) return null;

  return (
    <div className={`flex items-center justify-center py-8 px-4 ${className}`}>
      <Loader2 className="w-6 h-6 text-[#CDFF00] animate-spin mr-3" />
      <span className="text-sm text-gray-600">Loading more...</span>
    </div>
  );
}
