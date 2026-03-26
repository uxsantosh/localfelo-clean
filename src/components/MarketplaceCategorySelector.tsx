// =====================================================
// MARKETPLACE CATEGORY SELECTOR - SINGLE SELECTION
// =====================================================
// For individual listings - select one main category + one subcategory

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../services/productCategories';

interface MarketplaceCategorySelectorProps {
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  onSelect: (categoryId: string, subcategoryId: string) => void;
  onClose: () => void;
}

export function MarketplaceCategorySelector({
  selectedCategoryId,
  selectedSubcategoryId,
  onSelect,
  onClose,
}: MarketplaceCategorySelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    selectedCategoryId || null
  );

  const toggleExpand = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleSubcategorySelect = (categoryId: string, subcategoryId: string) => {
    onSelect(categoryId, subcategoryId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-black">Select Category</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {PRODUCT_CATEGORIES.map((category) => {
            const isExpanded = expandedCategory === category.id;
            const isCategorySelected = selectedCategoryId === category.id;

            return (
              <div
                key={category.id}
                className={`border-2 rounded-xl transition-all ${
                  isCategorySelected
                    ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Category Header - Click to expand subcategories */}
                <button
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors rounded-xl"
                  onClick={() => toggleExpand(category.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{category.emoji}</span>
                      <div className="flex-1">
                        <div className="font-bold text-black text-base">
                          {category.name}
                        </div>
                        {isCategorySelected && selectedSubcategoryId && (
                          <div className="text-xs text-gray-600 mt-1">
                            {category.subcategories.find(sub => sub.id === selectedSubcategoryId)?.name}
                          </div>
                        )}
                      </div>
                    </div>
                    {category.subcategories.length > 0 && (
                      <div className="p-2">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    )}
                  </div>
                </button>

                {/* Subcategories */}
                {isExpanded && category.subcategories.length > 0 && (
                  <div className="px-4 pb-4 space-y-2 border-t border-gray-200">
                    <div className="pt-3 space-y-2">
                      {category.subcategories.map((sub) => {
                        const isSelected = 
                          selectedCategoryId === category.id && 
                          selectedSubcategoryId === sub.id;

                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategorySelect(category.id, sub.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                              isSelected
                                ? 'bg-[#CDFF00] text-black'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                            type="button"
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'border-black bg-black'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <Check className="w-3 h-3 text-[#CDFF00]" />
                              )}
                            </div>
                            <span className={`text-sm ${
                              isSelected ? 'font-bold' : 'font-medium'
                            }`}>
                              {sub.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer with info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-600 text-center">
            Select the best category for your item to help buyers find it easily
          </p>
        </div>
      </div>
    </div>
  );
}
