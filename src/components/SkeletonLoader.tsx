import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-card border border-border animate-pulse">
      {/* Image Skeleton - Modern shimmer */}
      <div className="w-full pt-[75%] bg-input relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-input via-card to-input animate-shimmer" />
      </div>

      {/* Content Skeleton - Better spacing */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-input rounded-lg w-3/4" />
        <div className="h-6 bg-input rounded-lg w-1/2" />
        <div className="h-4 bg-input rounded-full w-2/3" />
        <div className="h-3 bg-input rounded-md w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonLoader({ count = 6 }: { count?: number }) {
  return (
    <div className="listing-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}