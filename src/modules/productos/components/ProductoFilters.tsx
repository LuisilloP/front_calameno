"use client";

import { Search } from "lucide-react";

type ProductoFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export const ProductoFilters = ({
  searchValue,
  onSearchChange,
}: ProductoFiltersProps) => {
  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Filtros
          </p>
          <h3 className="text-lg font-semibold text-white">
            Buscar productos
          </h3>
          <p className="text-sm text-slate-400">
            Filtra por nombre o SKU para acelerar tu flujo.
          </p>
        </div>
        <label className="relative w-full sm:w-72" htmlFor="productos-search">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            id="productos-search"
            className="w-full rounded-full border border-slate-800 bg-slate-950/50 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-300 focus:outline-none"
            placeholder="Ej. Laptop o SKU LPX-001"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Buscar productos por nombre o SKU"
          />
        </label>
      </div>
    </div>
  );
};
