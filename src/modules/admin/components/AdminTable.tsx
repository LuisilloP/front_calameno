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

const pageSizeOptions: Array<{ value: number; label: string }> = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 500, label: "Todos (500)" },
];

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
      ? "border-[hsla(var(--success)/0.6)]"
      : "border-[hsla(var(--info)/0.6)]";
  const accentText =
    accent === "emerald"
      ? "text-[hsl(var(--success))]"
      : "text-[hsl(var(--info))]";

  const showSkeleton = isLoading && data.length === 0;
  const showEmpty = !isLoading && data.length === 0;

  return (
    <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-lg shadow-black/5 backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-[hsl(var(--border))] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[hsl(var(--muted))]">
            Admin
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[hsl(var(--foreground))]">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-[hsl(var(--muted))]">
              {description}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted))]" />
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por nombre"
              className="w-full rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-muted))] py-2 pl-9 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none md:w-64"
            />
          </div>
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition hover:bg-[hsla(var(--accent)/0.9)]"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[hsl(var(--border))]">
        <table className="min-w-full divide-y divide-[hsl(var(--border))]">
          <thead className="bg-[hsl(var(--surface-strong))] text-left text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-strong))]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`px-6 py-4 ${column.className ?? ""}`}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {showSkeleton ? (
              [...Array(Math.max(1, Math.min(pageSize, 5)))].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 ${column.className ?? ""}`}
                    >
                      <div className="h-4 rounded-full bg-[hsl(var(--surface-muted))]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : showEmpty ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-sm text-[hsl(var(--muted))]"
                >
                  {emptyState ? (
                    <div className="space-y-3">
                      <p className="text-base font-semibold text-[hsl(var(--foreground))]">
                        {emptyState.title}
                      </p>
                      {emptyState.description && (
                        <p className="text-sm text-[hsl(var(--muted))]">
                          {emptyState.description}
                        </p>
                      )}
                      {emptyState.action}
                    </div>
                  ) : (
                    "Sin registros en esta pagina."
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="bg-[hsl(var(--surface))] text-sm text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--surface-strong))]"
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
          <div className="border-t border-[hsl(var(--border))] px-6 py-4">
            {emptyState.action}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-muted))] px-4 py-3 text-sm text-[hsl(var(--muted))] md:flex-row md:items-center md:justify-between">
        <div className={`rounded-full border ${accentBorder} px-4 py-2 text-xs ${accentText}`}>
          Mostrando {from}-{to} de {total}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted))]">
              Limite
            </span>
            <select
              className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--accent))] focus:outline-none"
              value={pageSize}
              onChange={(event) => {
                const nextSize = Number(event.target.value);
                onPageSizeChange?.(nextSize);
              }}
            >
              {pageSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs text-[hsl(var(--foreground))] disabled:opacity-40"
              onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
              disabled={pageIndex === 0 || isLoading}
            >
              Anterior
            </button>
            <span className="text-xs text-[hsl(var(--muted))]">
              Pagina {pageIndex + 1} / {totalPages}
            </span>
            <button
              type="button"
              className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs text-[hsl(var(--foreground))] disabled:opacity-40"
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
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs text-[hsl(var(--muted))]">
          <Loader2 className="h-3 w-3 animate-spin" />
          Sincronizando datos...
        </div>
      )}
    </div>
  );
};
