"use client";

import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  options: Option[];
  onChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  name,
  label,
  value,
  options,
  onChange,
  placeholder = "Buscar...",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(filter.toLowerCase())
  );

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      )}
      <div
        className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 bg-white cursor-pointer"
        onClick={() => setOpen((s) => !s)}
      >
        <div className="flex-1 text-sm text-gray-700">
          {selectedLabel || placeholder}
        </div>
        <div className="text-xs text-gray-500">▾</div>
      </div>

      {open && (
        <div className="absolute z-40 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg">
          <div className="p-2">
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-md border border-gray-200 px-2 py-1 focus:outline-none"
            />
          </div>
          <div className="max-h-48 overflow-auto">
            {filtered.length === 0 && (
              <div className="p-2 text-sm text-gray-500">No hay resultados</div>
            )}
            {filtered.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange && onChange(opt.value);
                  setOpen(false);
                  setFilter("");
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
