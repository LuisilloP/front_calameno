"use client";

import React, { useEffect, useState } from "react";
import { Category, WeeklyStockResponse } from "./types";
import { WeeklyStockService } from "./service";
import { getMonday, formatDate, formatWeekRange } from "./utils";
import { CategorySelector } from "./components/CategorySelector";
import { WeekPicker } from "./components/WeekPicker";
import { WeeklyStockTable } from "./components/WeeklyStockTable";
import { WeeklyStockExporter } from "./components/WeeklyStockExporter";

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

  const formattedWeekLabel = weekStart
    ? weekLabelFormatter.format(new Date(`${weekStart}T00:00:00`))
    : "Semana sin seleccionar";
  const formattedWeekRange = weekStart ? formatWeekRange(weekStart) : "";

  const selectedCategoriesCount = selectedCategoryIds.length;
  const totalProducts =
    data?.categories.reduce(
      (sum, category) => sum + category.products.length,
      0,
    ) ?? 0;

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center text-[hsl(var(--foreground))]">
        <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-6 py-4 shadow-lg shadow-black/20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
          <span className="text-sm tracking-wide text-slate-400">
            Preparando vista...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col gap-8 text-[hsl(var(--foreground))]">
      <header className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.12)] lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-[hsl(var(--muted))]">
              Vista semanal
            </p>
            <div>
              <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
                Stock semanal
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-[hsl(var(--muted))]">
                Explora la rotacion diaria y la disponibilidad consolidada por
                categoria para entender el pulso de la semana.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-[hsl(var(--muted))]">
              <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-3 py-1">
                Semana base:{" "}
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {formattedWeekLabel}
                </span>
              </span>
              <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-3 py-1">
                Categorias activas:{" "}
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {selectedCategoriesCount || "-"}
                </span>
              </span>
              {data && (
                <span className="rounded-full border border-[hsla(var(--success)/0.6)] bg-[hsla(var(--success)/0.12)] px-3 py-1 text-[hsl(var(--success))]">
                  Productos listados:{" "}
                  <span className="font-semibold text-[hsl(var(--foreground))]">
                    {totalProducts}
                  </span>
                </span>
              )}
            </div>
          </div>
          <WeeklyStockExporter data={data} weekStart={weekStart} disabled={loading} />
        </div>
      </header>

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-8 lg:flex-col">
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[hsl(var(--muted))]">
                  Semana seleccionada
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--muted))]">
                  Cambia de semana para ver la evolucion diaria.
                </p>
              </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3">
              <WeekPicker selectedWeek={weekStart} onChange={setWeekStart} />
            </div>
          </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[hsl(var(--muted))]">
                    Categorias
                  </p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted))]">
                    Elige una o mas categorias para comparar.
                  </p>
                </div>
                <button
                onClick={() =>
                  setSelectorMode(
                    selectorMode === "tabs" ? "multi" : "tabs",
                  )
                }
                className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted))] transition hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
              >
                {selectorMode === "tabs" ? "Multi select" : "Tabs"}
              </button>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-4">
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
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-6 py-12 text-center shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Cargando datos...</p>
        </div>
      )}

      {!loading && data && data.categories.length === 0 && (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-6 py-12 text-center text-[hsl(var(--muted))] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          No hay datos para las categorias seleccionadas.
        </div>
      )}

      {!loading && data && data.categories.length > 0 && (
        <div className="space-y-8">
          {data.categories.map((category) => (
            <section
              key={category.category_id}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] p-4 shadow-[0_18px_35px_rgba(0,0,0,0.22)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted))]">
                    Inventario de
                  </p>
                  <h3 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                    {category.category_name}
                  </h3>
                  {formattedWeekRange && (
                    <p className="text-sm text-[hsl(var(--muted))]">
                      Semana {formattedWeekRange}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1 text-[hsl(var(--muted))]">
                    Productos:{" "}
                    <span className="font-semibold text-[hsl(var(--foreground))]">
                      {category.products.length}
                    </span>
                  </span>
                  <span className="rounded-full border border-[hsla(var(--success)/0.6)] bg-[hsla(var(--success)/0.12)] px-3 py-1 text-[hsl(var(--success))]">
                    Stock total:{" "}
                    <span className="font-semibold text-[hsl(var(--foreground))]">
                      {category.products
                        .reduce(
                          (sum, product) => sum + product.final_stock_realtime,
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>
              <WeeklyStockTable
                products={category.products}
              />
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
