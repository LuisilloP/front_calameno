"use client";

import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Category, WeeklyStockResponse } from "./types";
import { WeeklyStockService } from "./service";
import { getMonday, formatDate } from "./utils";
import { CategorySelector } from "./components/CategorySelector";
import { WeekPicker } from "./components/WeekPicker";
import { WeeklyStockTable } from "./components/WeeklyStockTable";

const weekLabelFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function WeeklyStockPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [weekStart, setWeekStart] = useState<string>("");
  const [data, setData] = useState<WeeklyStockResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectorMode, setSelectorMode] = useState<"tabs" | "multi">("tabs");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWeekStart(formatDate(getMonday(new Date())));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadCategories();
    }
  }, [mounted]);

  const loadCategories = async () => {
    try {
      const cats = await WeeklyStockService.getCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategoryIds([cats[0].id]);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error cargando categorias";
      setError(message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await WeeklyStockService.getWeeklyStock(
        weekStart,
        selectedCategoryIds,
      );
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error cargando datos";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && selectedCategoryIds.length > 0 && weekStart) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, selectedCategoryIds, mounted]);

  const handleExportCSV = () => {
    WeeklyStockService.downloadCSV(weekStart, selectedCategoryIds);
  };

  const formattedWeekLabel = weekStart
    ? weekLabelFormatter.format(new Date(`${weekStart}T00:00:00`))
    : "Semana sin seleccionar";

  const selectedCategoriesCount = selectedCategoryIds.length;
  const totalProducts =
    data?.categories.reduce(
      (sum, category) => sum + category.products.length,
      0,
    ) ?? 0;

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-200">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-950/50 px-6 py-4 shadow-lg shadow-slate-950/40">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
          <span className="text-sm tracking-wide text-slate-400">
            Preparando vista...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col gap-8 text-slate-100">
      <header className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/85 via-slate-950/70 to-slate-900/40 p-6 shadow-[0_20px_45px_rgba(2,6,23,0.45)] ring-1 ring-white/5 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Vista semanal
            </p>
            <div>
              <h1 className="text-3xl font-semibold text-white">
                Stock semanal
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Explora la rotacion diaria y la disponibilidad consolidada por
                categoria para entender el pulso de la semana.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1">
                Semana base:{" "}
                <span className="font-semibold text-slate-200">
                  {formattedWeekLabel}
                </span>
              </span>
              <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1">
                Categorias activas:{" "}
                <span className="font-semibold text-slate-200">
                  {selectedCategoriesCount || "-"}
                </span>
              </span>
              {data && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                  Productos listados:{" "}
                  <span className="font-semibold text-white">
                    {totalProducts}
                  </span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={!data || loading}
            className="group inline-flex items-center gap-2 rounded-2xl border border-sky-500/40 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-sky-100 shadow-[0_15px_35px_rgba(14,165,233,0.25)] transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4 transition group-hover:scale-105" />
            Exportar CSV
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Semana seleccionada
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Cambia de semana para ver la evolucion diaria.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-3">
              <WeekPicker selectedWeek={weekStart} onChange={setWeekStart} />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Categorias
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Elige una o mas categorias para comparar.
                </p>
              </div>
              <button
                onClick={() =>
                  setSelectorMode(
                    selectorMode === "tabs" ? "multi" : "tabs",
                  )
                }
                className="rounded-full border border-slate-800/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 transition hover:border-slate-600 hover:text-white"
              >
                {selectorMode === "tabs" ? "Multi select" : "Tabs"}
              </button>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-4">
              <CategorySelector
                categories={categories}
                selectedIds={selectedCategoryIds}
                onSelectionChange={setSelectedCategoryIds}
                mode={selectorMode}
              />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-100 shadow-[0_15px_30px_rgba(190,18,60,0.2)]">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/30 px-6 py-12 text-center shadow-[0_18px_40px_rgba(15,23,42,0.45)]">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Cargando datos...</p>
        </div>
      )}

      {!loading && data && data.categories.length === 0 && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/30 px-6 py-12 text-center text-slate-400 shadow-[0_18px_40px_rgba(15,23,42,0.45)]">
          No hay datos para las categorias seleccionadas.
        </div>
      )}

      {!loading && data && data.categories.length > 0 && (
        <div className="space-y-8">
          {data.categories.map((category) => (
            <section
              key={category.category_id}
              className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4 shadow-[0_18px_35px_rgba(2,6,23,0.5)]"
            >
              <WeeklyStockTable
                products={category.products}
                categoryName={category.category_name}
              />
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
