import React from 'react';
import { Category } from '../types';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: string | number;
  selectedId?: string | number;
  onCategoryChange?: (categoryId: string) => void;
  error?: string;
  label?: string;
  value?: string | number;
  onChange?: (categoryId: string) => void;
  required?: boolean;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  selectedId,
  onCategoryChange,
  error,
  label,
  value,
  onChange,
  required = false,
}: CategorySelectorProps) {
  // Support both prop patterns
  const currentValue = String(value || selectedCategoryId || selectedId || '');
  const handleChange = onChange || onCategoryChange || (() => {});

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-heading">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleChange(String(category.id))}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              currentValue === String(category.id)
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="text-3xl">{category.emoji}</span>
            <span className="text-sm text-center">{category.name}</span>
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-destructive m-0">{error}</p>}
    </div>
  );
}