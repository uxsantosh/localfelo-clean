import React from 'react';
import { Share2 } from 'lucide-react';
import { Listing } from '../types';
import { toast } from 'sonner';

interface ShareButtonProps {
  listing: Listing;
  className?: string;
}

export function ShareButton({ listing, className = '' }: ShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${listing.title} for ₹${listing.price.toLocaleString('en-IN')} on LocalFelo`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={className}
      aria-label="Share listing"
    >
      <Share2 className="w-5 h-5 text-primary" />
    </button>
  );
}