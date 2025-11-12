"use client";

import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Category, WeeklyStockResponse } from './types';
import { WeeklyStockService } from './service';
import { getMonday, formatDate } from './utils';
import { CategorySelector } from './components/CategorySelector';
import { WeekPicker } from './components/WeekPicker';
import { WeeklyStockTable } from './components/WeeklyStockTable';

export default function WeeklyStockPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [weekStart, setWeekStart] = useState<string>('');
  const [data, setData] = useState<WeeklyStockResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectorMode, setSelectorMode] = useState<'tabs' | 'multi'>('tabs');
  const [mounted, setMounted] = useState(false);

  // Inicializar en cliente
  useEffect(() => {
    setWeekStart(formatDate(getMonday(new Date())));
    setMounted(true);
  }, []);

  // Cargar categorías al montar
  useEffect(() => {
    if (mounted) {
      loadCategories();
    }
  }, [mounted]);

  const loadCategories = async () => {
    try {
      const cats = await WeeklyStockService.getCategories();
      setCategories(cats);
      
      // Seleccionar primera categoría por defecto
      if (cats.length > 0) {
        setSelectedCategoryIds([cats[0].id]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error cargando categorías';
      setError(message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await WeeklyStockService.getWeeklyStock(
        weekStart,
        selectedCategoryIds
      );
      setData(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error cargando datos';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando cambian filtros
  useEffect(() => {
    if (mounted && selectedCategoryIds.length > 0 && weekStart) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, selectedCategoryIds, mounted]);

  const handleExportCSV = () => {
    WeeklyStockService.downloadCSV(weekStart, selectedCategoryIds);
  };

  // No renderizar hasta que esté montado (evita hydration mismatch)
  if (!mounted) {
    return (
      <main className="p-6 min-h-screen">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Stock Semanal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualiza movimientos y disponibilidad por semana
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={!data || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Controles */}
      <div className="space-y-4 bg-card border border-border rounded-lg p-6">
        {/* Selector de semana */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Selecciona semana:
          </label>
          <WeekPicker selectedWeek={weekStart} onChange={setWeekStart} />
        </div>

        {/* Selector de categorías */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">
              Categorías:
            </label>
            <button
              onClick={() =>
                setSelectorMode(selectorMode === 'tabs' ? 'multi' : 'tabs')
              }
              className="text-xs text-primary hover:underline"
            >
              {selectorMode === 'tabs'
                ? 'Cambiar a multi-selección'
                : 'Cambiar a tabs'}
            </button>
          </div>
          <CategorySelector
            categories={categories}
            selectedIds={selectedCategoryIds}
            onSelectionChange={setSelectedCategoryIds}
            mode={selectorMode}
          />
        </div>
      </div>

      {/* Errores */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/40 rounded-lg p-4 text-rose-200">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Contenido */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-sm text-muted-foreground mt-4">Cargando datos...</p>
        </div>
      )}

      {!loading && data && data.categories.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground">
            No hay datos para las categorías seleccionadas
          </p>
        </div>
      )}

      {!loading && data && data.categories.length > 0 && (
        <div className="space-y-8">
          {data.categories.map((category) => (
            <WeeklyStockTable
              key={category.category_id}
              products={category.products}
              categoryName={category.category_name}
            />
          ))}
        </div>
      )}
    </main>
  );
}
