import { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, X } from 'lucide-react';
import { HELPER_CATEGORIES_EXPANDED, POPULAR_CATEGORIES } from '../constants/helperCategoriesExpanded';

interface TaskFilterChipsProps {
  selectedCategories: string[];
  onToggle: (slug: string) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
  distance?: number;
  minBudget?: number;
  onQuickSettings?: () => void;
}

export function TaskFilterChips({
  selectedCategories,
  onToggle,
  showAll,
  onToggleShowAll,
  distance = 10,
  minBudget = 100,
  onQuickSettings,
}: TaskFilterChipsProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Show popular categories first, then rest
  const popularCats = HELPER_CATEGORIES_EXPANDED.filter(cat => 
    POPULAR_CATEGORIES.includes(cat.slug as any)
  );
  const otherCats = HELPER_CATEGORIES_EXPANDED.filter(cat => 
    !POPULAR_CATEGORIES.includes(cat.slug as any)
  );
  
  const orderedCategories = [...popularCats, ...otherCats];
  
  const displayCount = expanded ? orderedCategories.length : 8;
  const visibleCategories = orderedCategories.slice(0, displayCount);
  const remaining = orderedCategories.length - displayCount;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      {/* Top row - Quick settings */}
      <div className="flex items-center justify-between px-4 py-2 text-sm border-b border-gray-100">
        <span className="text-gray-600">
          📍 Within {distance} km · Min ₹{minBudget}
        </span>
        {onQuickSettings && (
          <button
            onClick={onQuickSettings}
            className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700"
          >
            <Settings className="w-4 h-4" />
            Quick Settings
          </button>
        )}
      </div>
      
      {/* Filter chips */}
      <div className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {/* Show All chip */}
          <button
            onClick={onToggleShowAll}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
              showAll
                ? 'bg-[#CDFF00] text-black border-2 border-black shadow-sm'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <span className="text-base">✨</span>
            All Tasks
            {showAll && (
              <X className="w-3 h-3 ml-1" />
            )}
          </button>
          
          {/* Category chips */}
          {visibleCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.slug);
            return (
              <button
                key={category.slug}
                onClick={() => onToggle(category.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#CDFF00] text-black shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-base">{category.emoji}</span>
                {category.name}
                {isSelected && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </button>
            );
          })}
          
          {/* Expand/Collapse button */}
          {remaining > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 border border-gray-300"
            >
              {expanded ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  +{remaining} More <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Selected count & clear all */}
        {!showAll && selectedCategories.length > 0 && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Showing {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'}
            </span>
            <button 
              onClick={() => {
                selectedCategories.forEach(onToggle);
              }}
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>
        )}
        
        {/* Show all message */}
        {showAll && (
          <div className="mt-2 text-xs text-gray-500">
            Showing all tasks · Tap a category to filter
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile-optimized version with bottom sheet
export function TaskFilterBottomSheet({
  isOpen,
  onClose,
  selectedCategories,
  onToggle,
  showAll,
  onToggleShowAll,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onToggle: (slug: string) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-in fade-in">
      <div className="bg-white rounded-t-2xl max-h-[80vh] w-full overflow-y-auto animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Filter Tasks</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Show all option */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => {
              onToggleShowAll();
              onClose();
            }}
            className={`w-full p-4 rounded-lg border-2 text-left ${
              showAll
                ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <span className="font-bold">Show All Tasks</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  See every task nearby (maximum opportunities)
                </p>
              </div>
              {showAll && (
                <div className="w-6 h-6 bg-[#CDFF00] rounded-full flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              )}
            </div>
          </button>
        </div>
        
        {/* Categories grid */}
        <div className="p-4">
          <h3 className="font-bold mb-3">Or select categories:</h3>
          <div className="grid grid-cols-2 gap-3">
            {HELPER_CATEGORIES_EXPANDED.map((category) => {
              const isSelected = selectedCategories.includes(category.slug);
              return (
                <button
                  key={category.slug}
                  onClick={() => onToggle(category.slug)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{category.emoji}</div>
                  <div className="text-sm font-medium">{category.name}</div>
                  {isSelected && (
                    <div className="mt-1 text-xs text-gray-600">✓ Selected</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={() => {
              selectedCategories.forEach(onToggle);
            }}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#CDFF00] rounded-lg font-bold hover:bg-[#CDFF00]/90"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
