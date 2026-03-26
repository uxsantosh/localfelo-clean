import React from 'react';
import { Category } from '../types';

interface ListingCategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  error?: string;
}

export function ListingCategorySelector({
  categories,
  selectedCategoryId,
  onCategoryChange,
  error,
}: ListingCategorySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategoryId === String(category.id);
          
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(String(category.id))}
              style={{
                border: isSelected ? '2px solid #CDFF00' : '2px solid #E0E0E0',
                backgroundColor: isSelected ? 'rgba(205, 255, 0, 0.1)' : '#FFFFFF',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              className={`transition-all ${
                !isSelected ? 'hover:border-[#CDFF00]/50' : ''
              }`}
            >
              <div className="text-2xl mb-2">{category.emoji}</div>
              <div className="text-sm font-medium text-foreground">
                {category.name}
              </div>
            </button>
          );
        })}
      </div>
      
      {error && (
        <p className="text-xs text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}