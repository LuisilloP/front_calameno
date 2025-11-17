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
                  ? "border-sky-500/80 bg-sky-500/15 text-white shadow-[0_10px_25px_rgba(14,165,233,0.25)]"
                  : "border-slate-800/70 bg-slate-950/30 text-slate-400 hover:border-slate-600 hover:text-white"
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
                ? "border-sky-500/60 bg-sky-500/10 text-white shadow-[0_10px_25px_rgba(14,165,233,0.25)]"
                : "border-slate-800/70 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-white"
            }`}
          >
            <span>{cat.nombre}</span>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleCheckboxChange(cat.id, e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-0"
            />
          </label>
        );
      })}
    </div>
  );
};
