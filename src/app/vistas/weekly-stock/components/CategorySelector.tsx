"use client";

import React from 'react';
import { Category } from '../types';

interface CategorySelectorProps {
  categories: Category[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  mode?: 'tabs' | 'multi';
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedIds,
  onSelectionChange,
  mode = 'tabs',
}) => {
  const handleTabClick = (id: number) => {
    onSelectionChange([id]);
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    }
  };

  if (mode === 'tabs') {
    return (
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => handleTabClick(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.nombre}
            </button>
          );
        })}
      </div>
    );
  }

  // Multi-select mode
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground mb-2">
        Selecciona categorías:
      </div>
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <label
              key={cat.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleCheckboxChange(cat.id, e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-sm text-foreground">{cat.nombre}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
