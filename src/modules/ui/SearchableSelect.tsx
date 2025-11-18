"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, XIcon } from "lucide-react";

export type SearchableOption = {
  value: string;
  label: string;
  description?: string;
};

export type SearchableSelectProps = {
  label?: string;
  placeholder?: string;
  options: SearchableOption[];
  selected: string[];
  onChange?: (values: string[]) => void;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
};

export const SearchableSelect = ({
  label,
  placeholder = "Buscar...",
  options,
  selected,
  onChange,
  emptyText = "Sin coincidencias",
  disabled,
  className = "",
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const toggleOption = (value: string) => {
    if (!onChange) return;
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!query) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [options, query]);

  const selectedLabel = useMemo(() => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      const option = options.find((opt) => opt.value === selected[0]);
      return option?.label ?? placeholder;
    }
    return `${selected.length} categorias`;
  }, [options, placeholder, selected]);

  const clearSelection = () => {
    if (disabled) return;
    onChange?.([]);
  };

  return (
    <div
      className={`flex flex-col gap-1 ${className} [button:cursor-pointer] [input:cursor-pointer]`}
      ref={containerRef}
    >
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 py-2 text-left text-sm text-slate-100 transition hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">{selectedLabel}</span>
        <div className="flex items-center gap-1 text-slate-500">
          {selected.length > 0 && !disabled && (
            <XIcon
              aria-hidden
              size={14}
              className="hover:text-slate-200"
              onClick={(event) => {
                event.stopPropagation();
                clearSelection();
              }}
            />
          )}
          <ChevronDownIcon size={16} aria-hidden />
        </div>
      </button>
      {open && (
        <div className="z-30 mt-2 rounded-2xl border border-slate-800/70 bg-slate-900/95 p-3 shadow-2xl backdrop-blur">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="mb-3 w-full rounded-xl border border-slate-800/60 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-slate-600 focus:outline-none"
          />
          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {filteredOptions.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-800/60 px-3 py-4 text-center text-xs text-slate-500">
                {emptyText}
              </div>
            )}
            {filteredOptions.map((option) => {
              const active = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
                      : "border-slate-800/70 bg-slate-900/40 text-slate-100 hover:border-slate-700"
                  }`}
                >
                  <div className="text-sm font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-slate-400">
                      {option.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
