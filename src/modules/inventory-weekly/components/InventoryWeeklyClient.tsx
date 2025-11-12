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

const toCsvValue = (value: string | number) =>
  `"${String(value).replace(/"/g, '""')}"`;

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
    const header = ["Producto", ...weekDays.map((day) => day.iso)];
    const rows = weeklyData.map((row) => [
      row.productoNombre,
      ...row.dias.map((day) => `${day.stock} (${day.estado})`),
    ]);
    const csv = [header, ...rows]
      .map((line) => line.map(toCsvValue).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventario-semanal-${weekStart}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeCategory = categories.find(
    (category) => category.id === primaryCategoryId
  );

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Calameno Insights
          </p>
          <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-semibold text-white">
              Inventario Semanal
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {stockFetching && (
                <span className="flex items-center gap-2 rounded-full border border-slate-800/70 px-3 py-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
                  Actualizando datos
                </span>
              )}
              <button
                type="button"
                onClick={() => refetchStock()}
                className="flex items-center gap-2 rounded-full border border-slate-800/70 px-3 py-1 font-semibold uppercase tracking-wide text-slate-200 transition hover:border-sky-500/60 hover:text-sky-100"
              >
                <RefreshCcwIcon size={14} />
                Recargar
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={!weeklyData.length}
                className="flex items-center gap-2 rounded-full border border-emerald-500/60 px-3 py-1 font-semibold uppercase tracking-wide text-emerald-100 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <DownloadIcon size={14} />
                Exportar a Excel
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-400 md:w-3/4">
            Visualiza el stock disponible por dia de la semana y detecta riesgos
            criticos antes de que impacten a las operaciones.
          </p>
        </div>
        {categoriesError && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-50">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span>No se pudieron cargar las categorias.</span>
              <button
                type="button"
                onClick={() => refetchCategories()}
                className="rounded-full border border-rose-400/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
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
            <p className="text-sm font-semibold text-slate-200">
              Categoria principal
            </p>
            <p className="text-xs text-slate-400">
              {activeCategory?.nombre ?? "Selecciona una categoria"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {normalizedSelection.map((categoryId) => {
              const category = categories.find(
                (item) => item.id === categoryId
              );
              return (
                <span
                  key={categoryId}
                  className={`rounded-full border px-3 py-1 ${
                    categoryId === primaryCategoryId
                      ? "border-sky-500/60 bg-sky-500/10 text-sky-50"
                      : "border-slate-800/70 bg-slate-900/30"
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
