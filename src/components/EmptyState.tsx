import React from 'react';
import { Search, AlertCircle, Package, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  // New API (flexible)
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  
  // Old API (backwards compatible)
  type?: 'no-results' | 'error' | 'no-listings';
  message?: string;
}

export function EmptyState({ 
  type, 
  message, 
  icon: CustomIcon, 
  action,
  title: customTitle,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  // If using new API
  if (customTitle && CustomIcon) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="mb-6 p-6 bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl border border-primary/10">
          <CustomIcon className="w-16 h-16 text-muted" />
        </div>
        <h3 className="text-heading mb-3 font-bold text-[20px]">{customTitle}</h3>
        <p className="text-body mb-8 max-w-sm text-[15px] leading-relaxed">{description}</p>
        {actionText && onAction && (
          <button onClick={onAction} className="btn-primary max-w-xs">
            {actionText}
          </button>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }
  
  // Old API (backwards compatible)
  const config = {
    'no-results': {
      icon: <Search className="w-16 h-16 text-muted" />,
      title: 'No Results Found',
      defaultMessage: 'Try adjusting your filters or search query',
    },
    error: {
      icon: <AlertCircle className="w-16 h-16 text-destructive" />,
      title: 'Something Went Wrong',
      defaultMessage: 'Please try again later',
    },
    'no-listings': {
      icon: <Package className="w-16 h-16 text-muted" />,
      title: 'No Listings Yet',
      defaultMessage: 'Be the first to post an ad!',
    },
  };

  const currentConfig = config[type || 'no-listings'];
  const { icon, title, defaultMessage } = currentConfig;
  const displayIcon = CustomIcon ? <CustomIcon className="w-16 h-16 text-muted" /> : icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="mb-6 p-6 bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl border border-primary/10">{displayIcon}</div>
      <h3 className="text-heading mb-3 font-bold text-[20px]">{title}</h3>
      <p className="text-body mb-8 max-w-sm text-[15px] leading-relaxed">{message || defaultMessage}</p>
      {action && <div>{action}</div>}
      {actionText && onAction && (
        <button onClick={onAction} className="btn-primary max-w-xs">
          {actionText}
        </button>
      )}
    </div>
  );
}