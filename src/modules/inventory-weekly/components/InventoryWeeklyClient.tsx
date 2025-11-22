"use client";

import { useEffect, useMemo, useState } from "react";
import { DownloadIcon, RefreshCcwIcon } from "lucide-react";
import { InventoryCategory, WeeklyStockRequest } from "../types";
import { useInventoryCategories, useWeeklyStock } from "../hooks";
import { WeekPicker } from "./WeekPicker";
import { CategoryTabs } from "./CategoryTabs";
import { CategoryMultiSelect } from "./CategoryMultiSelect";
import { WeeklyGrid } from "./WeeklyGrid";
import { getWeekDates, normalizeIsoToMonday } from "../utils/date";
import * as XLSX from "xlsx";

type InventoryWeeklyClientProps = {
  initialCategories: InventoryCategory[];
  initialWeekStart: string;
};

const ensureSelection = (
  primaryId: number | null,
  selected: number[]
): number[] => {
  const unique = Array.from(new Set(selected));
  if (!primaryId) return unique;
  if (!unique.includes(primaryId)) {
    return [primaryId, ...unique];
  }
  return unique;
};

export const InventoryWeeklyClient = ({
  initialCategories,
  initialWeekStart,
}: InventoryWeeklyClientProps) => {
  const [weekStart, setWeekStart] = useState(
    normalizeIsoToMonday(initialWeekStart)
  );
  const [primaryCategoryId, setPrimaryCategoryId] = useState<number | null>(
    initialCategories[0]?.id ?? null
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    initialCategories[0] ? [initialCategories[0].id] : []
  );

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useInventoryCategories(initialCategories);

  useEffect(() => {
    if (!primaryCategoryId && categories.length > 0) {
      setPrimaryCategoryId(categories[0].id);
      setSelectedCategoryIds([categories[0].id]);
    }
  }, [categories, primaryCategoryId]);

  const normalizedSelection = useMemo(
    () => ensureSelection(primaryCategoryId, selectedCategoryIds),
    [primaryCategoryId, selectedCategoryIds]
  );

  const weeklyParams: WeeklyStockRequest | null =
    normalizedSelection.length > 0
      ? { categories: normalizedSelection, weekStart }
      : null;

  const {
    data: weeklyData = [],
    isLoading: stockLoading,
    isFetching: stockFetching,
    isError: stockError,
    refetch: refetchStock,
  } = useWeeklyStock(weeklyParams, {
    enabled: normalizedSelection.length > 0,
  });

  const weekDays = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const handleTabChange = (categoryId: number) => {
    setPrimaryCategoryId(categoryId);
    setSelectedCategoryIds((prev) => {
      const filtered = prev.filter((id) => id !== categoryId);
      return [categoryId, ...filtered];
    });
  };

  const handleMultiSelectChange = (ids: number[]) => {
    if (primaryCategoryId && ids.length === 0) {
      setSelectedCategoryIds([primaryCategoryId]);
      return;
    }
    setSelectedCategoryIds(
      primaryCategoryId
        ? ensureSelection(primaryCategoryId, ids)
        : ids
    );
  };

  const handleWeekChange = (nextWeek: string) => {
    setWeekStart(nextWeek);
  };

  const handleExport = () => {
    if (!weeklyData.length) return;
    const categoryById = new Map(
      categories.map((category) => [category.id, category.nombre])
    );

    const header = [
      "Categoria",
      "Producto",
      "Stock inicial",
      ...weekDays.map((day) => day.weekday || day.label || day.iso),
      "Stock final",
    ];

    const rows = weeklyData.map((row) => {
      const firstDay = row.dias[0];
      const lastDay = row.dias[row.dias.length - 1];
      return [
        categoryById.get(row.categoriaId) ?? `Categoria #${row.categoriaId}`,
        row.productoNombre,
        firstDay?.stock ?? "",
        ...row.dias.map((day) => day.stock ?? ""),
        lastDay?.stock ?? "",
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario semanal");
    XLSX.writeFile(workbook, `inventario-semanal-${weekStart}.xlsx`);
  };

  const activeCategory = categories.find(
    (category) => category.id === primaryCategoryId
  );

  return (
    <section className="space-y-8 text-[hsl(var(--foreground))]">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[hsl(var(--muted-strong))]">
            Calameno Insights
          </p>
          <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
              Inventario Semanal
            </h1>
            <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted))]">
              {stockFetching && (
                <span className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-3 py-1 text-[hsl(var(--foreground))]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--accent))]" />
                  Actualizando datos
                </span>
              )}
              <button
                type="button"
                onClick={() => refetchStock()}
                className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-3 py-1 font-semibold uppercase tracking-wide text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
              >
                <RefreshCcwIcon size={14} />
                Recargar
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={!weeklyData.length}
                className="flex items-center gap-2 rounded-full border border-[hsl(var(--success))] px-3 py-1 font-semibold uppercase tracking-wide text-[hsl(var(--success))] transition hover:bg-[hsla(var(--success)/0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--success))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <DownloadIcon size={14} />
                Exportar a Excel
              </button>
            </div>
          </div>
          <p className="text-sm text-[hsl(var(--muted))] md:w-3/4">
            Visualiza el stock disponible por dia de la semana y detecta riesgos
            criticos antes de que impacten a las operaciones.
          </p>
        </div>
        {categoriesError && (
          <div className="rounded-2xl border border-[hsl(var(--danger))] bg-[hsla(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span>No se pudieron cargar las categorias.</span>
              <button
                type="button"
                onClick={() => refetchCategories()}
                className="rounded-full border border-[hsl(var(--danger))] px-3 py-1 text-xs font-semibold uppercase tracking-wide hover:bg-[hsla(var(--danger)/0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--danger))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
      </header>
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <WeekPicker weekStart={weekStart} onWeekChange={handleWeekChange} />
        <CategoryMultiSelect
          categories={categories}
          value={normalizedSelection}
          onChange={handleMultiSelectChange}
          disabled={categoriesLoading}
        />
      </div>
      <div className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Categoria principal
            </p>
            <p className="text-xs text-[hsl(var(--muted))]">
              {activeCategory?.nombre ?? "Selecciona una categoria"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-[hsl(var(--muted))]">
            {normalizedSelection.map((categoryId) => {
              const category = categories.find(
                (item) => item.id === categoryId
              );
              return (
                <span
                  key={categoryId}
                  className={`rounded-full border px-3 py-1 ${
                    categoryId === primaryCategoryId
                      ? "border-[hsl(var(--accent))] bg-[hsla(var(--accent)/0.2)] text-[hsl(var(--foreground))]"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] text-[hsl(var(--muted))]"
                  }`}
                >
                  {category?.nombre ?? `#${categoryId}`}
                </span>
              );
            })}
          </div>
        </div>
        <CategoryTabs
          categories={categories}
          activeId={primaryCategoryId}
          onChange={handleTabChange}
          isLoading={categoriesLoading}
        />
      </div>
      <WeeklyGrid
        data={weeklyData}
        weekDays={weekDays}
        isLoading={stockLoading}
        isError={stockError}
        onRetry={() => refetchStock()}
      />
    </section>
  );
};
