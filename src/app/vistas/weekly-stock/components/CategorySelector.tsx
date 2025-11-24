"use client";

import React from "react";
import { Category } from "../types";

interface CategorySelectorProps {
  categories: Category[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  mode?: "tabs" | "multi";
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedIds,
  onSelectionChange,
  mode = "tabs",
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

  if (mode === "tabs") {
    return (
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => handleTabClick(cat.id)}
              className={`group relative overflow-hidden rounded-2xl border px-5 py-2 text-sm font-semibold tracking-wide transition ${
                isSelected
                  ? "border-[hsl(var(--accent))] bg-[hsla(var(--accent)/0.15)] text-[hsl(var(--foreground))] shadow-[0_10px_25px_rgba(0,0,0,0.12)]"
                  : "border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] text-[hsl(var(--muted-strong))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              <span className="relative">{cat.nombre}</span>
              {isSelected && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-500/20 via-transparent to-transparent opacity-60"
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {categories.map((cat) => {
        const isSelected = selectedIds.includes(cat.id);
        return (
          <label
            key={cat.id}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              isSelected
                ? "border-[hsl(var(--accent))] bg-[hsla(var(--accent)/0.12)] text-[hsl(var(--foreground))] shadow-[0_10px_25px_rgba(0,0,0,0.1)]"
                : "border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] text-[hsl(var(--muted-strong))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <span>{cat.nombre}</span>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleCheckboxChange(cat.id, e.target.checked)}
              className="h-4 w-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))] focus:ring-offset-0"
            />
          </label>
        );
      })}
    </div>
  );
};
