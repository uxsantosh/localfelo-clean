import React from 'react';
import { Category } from '../types';

interface CategoryPillProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryPill({ category, isActive, onClick }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={`category-pill ${isActive ? 'active' : ''}`}
    >
      <span>{category.emoji}</span>
      <span>{category.name}</span>
    </button>
  );
}