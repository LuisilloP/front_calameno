"use client";

import React, { useEffect, useRef, useState } from "react";

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
    const onDoc = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(filter.toLowerCase())
  );

  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id || name}
          className="mb-1 block text-sm font-semibold text-[hsl(var(--muted-strong))]"
        >
          {label}
        </label>
      )}
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-left text-sm text-[hsl(var(--foreground))] shadow-sm transition hover:border-[hsl(var(--accent))]"
        onClick={() => setOpen((state) => !state)}
        aria-haspopup="listbox"
        aria-expanded={open}
        id={id}
        name={name}
      >
        <span className="flex-1 truncate">
          {selectedLabel || <span className="text-[hsl(var(--muted))]">{placeholder}</span>}
        </span>
        <span className="text-xs text-[hsl(var(--muted))]">▾</span>
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xl shadow-black/10">
          <div className="p-3">
            <input
              autoFocus
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-muted))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:border-[hsl(var(--accent))] focus:outline-none"
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filtered.length === 0 && (
              <div className="px-3 pb-3 text-sm text-[hsl(var(--muted))]">
                No hay resultados
              </div>
            )}
            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                  setFilter("");
                }}
                className="flex w-full items-start px-3 py-2 text-left text-sm text-[hsl(var(--foreground))] transition hover:bg-[hsla(var(--accent)/0.08)]"
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
