"use client";

import { ReactNode } from "react";
import { Loader2, Search } from "lucide-react";

export type AdminTableColumn<T> = {
  key: string;
  label: string;
  className?: string;
  render: (item: T) => ReactNode;
};

type HeaderAction = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
};

type EmptyState = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export type AdminTableProps<T> = {
  title: string;
  description?: string;
  data: T[];
  columns: AdminTableColumn<T>[];
  isLoading?: boolean;
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  primaryAction?: HeaderAction;
  emptyState?: EmptyState;
  accent?: "emerald" | "sky";
};

const pageSizeOptions = [10, 25, 50];

export const AdminTable = <T,>({
  title,
  description,
  data,
  columns,
  isLoading = false,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  primaryAction,
  emptyState,
  accent = "emerald",
}: AdminTableProps<T>) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(total, (pageIndex + 1) * pageSize);

  const accentBorder =
    accent === "emerald"
      ? "border-emerald-500/30"
      : "border-sky-500/30";
  const accentText =
    accent === "emerald" ? "text-emerald-300" : "text-sky-300";

  const showSkeleton = isLoading && data.length === 0;
  const showEmpty = !isLoading && data.length === 0;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Admin
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          )}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por nombre"
              className="w-full rounded-full border border-slate-700 bg-slate-950/60 py-2 pl-9 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-300 focus:outline-none md:w-64"
            />
          </div>
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950/40 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`px-6 py-4 ${column.className ?? ""}`}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {showSkeleton ? (
              [...Array(Math.max(1, Math.min(pageSize, 5)))].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 ${column.className ?? ""}`}
                    >
                      <div className="h-4 rounded-full bg-slate-800/80" />
                    </td>
                  ))}
                </tr>
              ))
            ) : showEmpty ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-sm text-slate-400"
                >
                  {emptyState ? (
                    <div className="space-y-3">
                      <p className="text-base font-semibold text-white">
                        {emptyState.title}
                      </p>
                      {emptyState.description && (
                        <p className="text-sm text-slate-400">
                          {emptyState.description}
                        </p>
                      )}
                      {emptyState.action}
                    </div>
                  ) : (
                    "Sin registros en esta página."
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="bg-slate-900/40 text-sm text-slate-100 transition hover:bg-slate-900/70"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 ${column.className ?? ""}`}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {showEmpty && emptyState?.action ? (
          <div className="border-t border-slate-800 px-6 py-4">
            {emptyState.action}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-800/70 bg-slate-950/30 px-4 py-3 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div className={`rounded-full border ${accentBorder} px-4 py-2 text-xs ${accentText}`}>
          Mostrando {from}-{to} de {total}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Límite
            </span>
            <select
              className="rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-sm text-white focus:border-slate-300 focus:outline-none"
              value={pageSize}
              onChange={(event) => {
                const nextSize = Number(event.target.value);
                onPageSizeChange?.(nextSize);
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-200 disabled:opacity-40"
              onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
              disabled={pageIndex === 0 || isLoading}
            >
              Anterior
            </button>
            <span className="text-xs">
              Página {pageIndex + 1} / {totalPages}
            </span>
            <button
              type="button"
              className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-200 disabled:opacity-40"
              onClick={() =>
                onPageChange(Math.min(totalPages - 1, pageIndex + 1))
              }
              disabled={pageIndex + 1 >= totalPages || isLoading}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
      {isLoading && data.length > 0 && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-800/80 px-3 py-1 text-xs text-slate-300">
          <Loader2 className="h-3 w-3 animate-spin" />
          Sincronizando datos...
        </div>
      )}
    </div>
  );
};
