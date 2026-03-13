import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { getAllServiceCategories, getSubcategoriesByCategoryId, type ServiceCategory } from '../services/serviceCategories';

interface CategorySelectorProps {
  selectedCategories: string[]; // Category IDs
  selectedSubcategories: string[]; // Subcategory IDs
  onCategoriesChange: (categoryIds: string[]) => void;
  onSubcategoriesChange: (subcategoryIds: string[]) => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  multiSelect?: boolean; // Allow selecting multiple categories
  showSubcategories?: boolean; // Show subcategory expansion
}

export function CategorySelector({
  selectedCategories,
  selectedSubcategories,
  onCategoriesChange,
  onSubcategoriesChange,
  onClose,
  title = 'Select Categories',
  subtitle = 'Choose what tasks you want to see',
  multiSelect = true,
  showSubcategories = true,
}: CategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const allCategories = getAllServiceCategories();

  // Filter categories by search
  const filteredCategories = allCategories.filter(cat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(query) ||
      cat.subcategories.some(sub => sub.name.toLowerCase().includes(query))
    );
  });

  const handleCategoryToggle = (categoryId: string) => {
    if (multiSelect) {
      if (selectedCategories.includes(categoryId)) {
        // Remove category and its subcategories
        onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
        const categorySubIds = getSubcategoriesByCategoryId(categoryId).map(sub => sub.id);
        onSubcategoriesChange(
          selectedSubcategories.filter(id => !categorySubIds.includes(id))
        );
      } else {
        // Add category
        onCategoriesChange([...selectedCategories, categoryId]);
      }
    } else {
      // Single select - replace selection
      onCategoriesChange([categoryId]);
      onSubcategoriesChange([]);
    }
  };

  const handleSubcategoryToggle = (categoryId: string, subcategoryId: string) => {
    if (selectedSubcategories.includes(subcategoryId)) {
      // Remove subcategory
      onSubcategoriesChange(selectedSubcategories.filter(id => id !== subcategoryId));
    } else {
      // Add subcategory (ensure parent category is selected)
      if (!selectedCategories.includes(categoryId)) {
        onCategoriesChange([...selectedCategories, categoryId]);
      }
      onSubcategoriesChange([...selectedSubcategories, subcategoryId]);
    }
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-black">{title}</h2>
            <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#CDFF00] focus:ring-2 focus:ring-[#CDFF00]/20 text-sm"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto">
          {filteredCategories.map((category) => {
            const isCategorySelected = selectedCategories.includes(category.id);
            const isExpanded = expandedCategory === category.id;
            const subcategories = category.subcategories;
            const hasSubcategories = subcategories.length > 0 && showSubcategories;

            return (
              <div key={category.id}>
                {/* Category Row */}
                <div
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isCategorySelected ? 'bg-[#CDFF00]/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 px-4 py-4">
                    {/* Checkbox */}
                    <div
                      onClick={() => handleCategoryToggle(category.id)}
                      className="flex-shrink-0 cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          isCategorySelected
                            ? 'bg-[#CDFF00] border-[#CDFF00]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isCategorySelected && (
                          <svg
                            className="w-4 h-4 text-black"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Emoji */}
                    <div className="text-3xl flex-shrink-0">{category.emoji}</div>

                    {/* Category Info */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      <h3 className="font-bold text-black text-base leading-tight">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 leading-tight mt-0.5 line-clamp-1">
                        {/* Show first 2-3 subcategories as description */}
                        {subcategories.length > 0
                          ? subcategories.slice(0, 3).map(sub => sub.name).join(', ')
                          : 'Various services'}
                      </p>
                    </div>

                    {/* Expand Button */}
                    {hasSubcategories && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(category.id);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Yellow Highlight Bar */}
                  {isCategorySelected && (
                    <div className="h-1 bg-[#CDFF00] w-full"></div>
                  )}
                </div>

                {/* Subcategories (Expanded) */}
                {isExpanded && hasSubcategories && (
                  <div className="bg-gray-50 border-b border-gray-200">
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Select specific skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {subcategories.map((sub) => {
                          const isSelected = selectedSubcategories.includes(sub.id);
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleSubcategoryToggle(category.id, sub.id)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-[#CDFF00] text-black border-2 border-black'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {sub.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No categories found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer - Selection Count */}
        {multiSelect && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-black">{selectedCategories.length}</span>{' '}
                {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                {selectedSubcategories.length > 0 && (
                  <>
                    {' • '}
                    <span className="font-semibold text-black">{selectedSubcategories.length}</span>{' '}
                    specific skills
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
