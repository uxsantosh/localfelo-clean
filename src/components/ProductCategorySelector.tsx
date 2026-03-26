// =====================================================
// PRODUCT CATEGORY SELECTOR - MOBILE-FRIENDLY
// =====================================================
// Large touch targets for mobile, subcategory auto-selection logic

import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { PRODUCT_CATEGORIES, ProductCategory } from '../services/productCategories';

interface ProductCategorySelectorProps {
  selectedCategories: string[]; // Category IDs
  selectedSubcategories: string[]; // Subcategory IDs
  onCategoryToggle: (categoryId: string) => void;
  onSubcategoryToggle: (categoryId: string, subcategoryId: string) => void;
  onClose: () => void;
}

export function ProductCategorySelector({
  selectedCategories,
  selectedSubcategories,
  onCategoryToggle,
  onSubcategoryToggle,
  onClose,
}: ProductCategorySelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleExpand = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-bold text-lg">Select Categories</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {PRODUCT_CATEGORIES.map((category) => {
            const isExpanded = expandedCategory === category.id;
            const isCategorySelected = selectedCategories.includes(category.id);
            const selectedSubsInCategory = category.subcategories.filter(sub =>
              selectedSubcategories.includes(sub.id)
            ).length;
            const hasSelectedSubs = selectedSubsInCategory > 0;

            return (
              <div
                key={category.id}
                className={`border-2 rounded-xl transition-all ${
                  isCategorySelected || hasSelectedSubs
                    ? 'border-[#CDFF00] bg-[#CDFF00]/10'
                    : 'border-gray-200'
                }`}
              >
                {/* Category Header - Click to expand dropdown */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <div className="font-bold text-black">
                          {category.emoji} {category.name}
                        </div>
                        {hasSelectedSubs && (
                          <div className="text-xs text-gray-600 mt-1">
                            {selectedSubsInCategory} subcategory selected
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
                </div>

                {/* Subcategories */}
                {isExpanded && category.subcategories.length > 0 && (
                  <div className="px-4 pb-4 pt-0 space-y-2 border-t border-gray-200 mt-2">
                    <div className="pt-3 space-y-2">
                      {category.subcategories.map((sub) => (
                        <label
                          key={sub.id}
                          className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubcategories.includes(sub.id)}
                            onChange={() => onSubcategoryToggle(category.id, sub.id)}
                            className="w-5 h-5 rounded border-gray-300 text-[#CDFF00] focus:ring-[#CDFF00] cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">{sub.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-black text-[#CDFF00] rounded-xl font-bold hover:bg-gray-900 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}