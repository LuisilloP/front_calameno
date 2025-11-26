'use client';

import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { CENTRAL_LOCATION_NAME } from '@/config/warehouse';

type KpiCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  emphasis?: 'normal' | 'alert';
  children?: React.ReactNode;
};

const integerFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const quantityFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const percentageFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
const lastUpdatedFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const movementBadgeStyles: Record<string, string> = {
  ingreso: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  uso: 'bg-sky-500/10 text-sky-300 border border-sky-500/30',
  traspaso: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30',
  ajuste: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
  default:
    'bg-[hsla(var(--border)/0.2)] text-[hsl(var(--muted-strong))] border border-[hsl(var(--border))]',
};

const movementTypes = [
  { label: 'Todos', value: '' },
  { label: 'Ingresos', value: 'ingreso' },
  { label: 'Usos', value: 'uso' },
];

const limitOptions = [25, 50, 100, 200];

const UsageDonut: React.FC<{ usoPercent: number; ingresoPercent: number }> = ({
  usoPercent,
  ingresoPercent,
}) => {
  const uso = Math.min(Math.max(usoPercent, 0), 100);
  const background = `conic-gradient(#0ea5e9 0 ${uso}%, #34d399 ${uso}% 100%)`;

  return (
    <div className="mt-2 flex items-center gap-3 text-[10px] text-[hsl(var(--muted))]">
      <div
        className="relative h-12 w-12 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))]"
        style={{ background }}
      >
        <div className="absolute inset-1 flex items-center justify-center rounded-full bg-[hsl(var(--surface))] text-[9px] text-[hsl(var(--muted))]">
          {percentageFormatter.format(uso)}%
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-sky-300">
          {percentageFormatter.format(usoPercent)} uso
        </span>
        <span className="font-semibold text-emerald-300">
          {percentageFormatter.format(ingresoPercent)} ingreso
        </span>
        <span className="text-[9px] text-slate-500">Ultimos 7 dias</span>
      </div>
    </div>
  );
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, helper, emphasis, children }) => {
  const emphasisClasses =
    emphasis === 'alert'
      ? 'border-red-500/60 bg-red-500/5'
      : 'border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))]';

  return (
    <div className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 ${emphasisClasses}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted))]">
        {label}
      </span>
      <span className="text-2xl font-semibold leading-tight text-[hsl(var(--foreground))]">
        {value}
      </span>
      {helper && <span className="text-[10px] text-[hsl(var(--muted))]">{helper}</span>}
      {children}
    </div>
  );
};

const DashboardInventarioMVP: React.FC = () => {
  const { dashboardState, reload } = useDashboardData();
  const { kpis, movements, topUsedProducts, topCategories, error, lastUpdated } = dashboardState;

  const limit = movements.filters.limit ?? 25;
  const offset = movements.filters.offset ?? 0;

  const [pendingProducto, setPendingProducto] = React.useState('');
  const [dateRange, setDateRange] = React.useState({ from: '', to: '' });

  React.useEffect(() => {
    if (movements.filters.producto_id !== undefined && movements.filters.producto_id !== null) {
      setPendingProducto(String(movements.filters.producto_id));
    } else {
      setPendingProducto('');
    }
  }, [movements.filters.producto_id]);

  const parseNullableNumber = (value: string) => {
    if (value.trim().length === 0) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const applyProductoFilter = () => {
    reload({
      movements: {
        producto_id: parseNullableNumber(pendingProducto),
        offset: 0,
      },
    });
  };

  const resetFilters = () => {
    setPendingProducto('');
    reload({
      movements: {
        tipo: undefined,
        producto_id: undefined,
        offset: 0,
      },
    });
  };

  const updateLimit = (nextLimit: number) => {
    if (Number.isNaN(nextLimit)) {
      return;
    }
    reload({
      movements: {
        limit: nextLimit,
        offset: 0,
      },
    });
  };

  const canGoPrev = offset > 0;
  const canGoNext = offset + limit < movements.total;
  const totalPages = Math.max(1, Math.ceil(Math.max(movements.total, 1) / limit));
  const currentPage = Math.min(totalPages, Math.floor(offset / limit) + 1);

  const changePage = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && !canGoPrev) {
      return;
    }
    if (direction === 'next' && !canGoNext) {
      return;
    }
    const delta = direction === 'next' ? limit : -limit;
    const nextOffset = Math.max(0, offset + delta);
    reload({ movements: { offset: nextOffset } });
  };

  const handleDateChange = (key: 'from' | 'to', value: string) => {
    setDateRange((prev) => ({ ...prev, [key]: value }));
  };

  const clearDateRange = () => setDateRange({ from: '', to: '' });

  const filteredMovements = React.useMemo(() => {
    if (!dateRange.from && !dateRange.to) {
      return movements.items;
    }

    const fromDate = dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : null;
    const toDate = dateRange.to ? new Date(`${dateRange.to}T23:59:59`) : null;

    return movements.items.filter((movement) => {
      if (!fromDate && !toDate) {
        return true;
      }
      const movementDate = new Date(movement.dateUtc);
      if (Number.isNaN(movementDate.getTime())) {
        return true;
      }
      if (fromDate && movementDate < fromDate) {
        return false;
      }
      if (toDate && movementDate > toDate) {
        return false;
      }
      return true;
    });
  }, [dateRange.from, dateRange.to, movements.items]);

  const usageHelper = `${integerFormatter.format(kpis.usageVsIngress.uso.count)} usos vs ${integerFormatter.format(
    kpis.usageVsIngress.ingreso.count
  )} ingresos`;

  const lastUpdatedLabel = lastUpdated
    ? `Actualizado: ${lastUpdatedFormatter.format(new Date(lastUpdated))}`
    : 'Actualizando...';

  const topUsedMax = Math.max(
    ...topUsedProducts.items.map((item) => item.totalUsado),
    1
  );
  const topCategoryMax = Math.max(
    ...topCategories.items.map((item) => item.totalMovimiento),
    1
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--surface))] px-6 py-5 text-[hsl(var(--foreground))]">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Inventario Operativo</h1>
          <p className="text-xs text-[hsl(var(--muted))]">
            Foto rapida de salud operativa: actividad, stock, consumos y calidad de datos.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-[10px] text-[hsl(var(--muted))]">
          <span>{lastUpdatedLabel}</span>
          <button
            type="button"
            className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-[10px] uppercase tracking-wide text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--accent))]"
            onClick={() => reload()}
            disabled={movements.isLoading || topUsedProducts.isLoading || topCategories.isLoading}
          >
            Refrescar
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-amber-400/50 bg-amber-500/10 px-4 py-2 text-[11px] text-amber-200">
          <span>{error}</span>
          <button
            type="button"
            className="rounded-full border border-amber-300/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
            onClick={() => reload()}
          >
            Reintentar
          </button>
        </div>
      )}

      <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
        <KpiCard
          label="Movimientos ultimos 7 dias"
          value={integerFormatter.format(kpis.totalMovementsLast7d)}
          helper="Incluye ingresos y usos."
        />
        <KpiCard label="% uso vs ingreso (7 dias)" value="Balance operativo" helper={usageHelper}>
          <UsageDonut
            usoPercent={kpis.usageVsIngress.uso.percentage}
            ingresoPercent={kpis.usageVsIngress.ingreso.percentage}
          />
        </KpiCard>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 lg:col-span-2">
          <div className="flex flex-col gap-2 text-[10px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="uppercase tracking-wide text-slate-400">
                Movimientos recientes · {filteredMovements.length} visibles / {movements.total}
              </span>
              {movements.isLoading && (
                <span className="rounded-full border border-slate-700/70 px-2 py-[2px] text-slate-400">
                  Cargando...
                </span>
              )}
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <select
                  className="rounded-xl border border-slate-700/70 bg-slate-900/80 px-2 py-1"
                  value={movements.filters.tipo ?? ''}
                  onChange={(event) =>
                    reload({ movements: { tipo: event.target.value || undefined, offset: 0 } })
                  }
                >
                  {movementTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      Tipo: {option.label.toLowerCase()}
                    </option>
                  ))}
                </select>
                {/* <input
                  type="number"
                  className="w-28 rounded-xl border border-slate-700/70 bg-slate-900/80 px-2 py-1"
                  placeholder="Producto ID"
                  value={pendingProducto}
                  onChange={(event) => setPendingProducto(event.target.value)}
                  onBlur={applyProductoFilter}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      applyProductoFilter();
                    }
                  }}
                /> */}
                <select
                  className="rounded-xl border border-slate-700/70 bg-slate-900/80 px-2 py-1"
                  value={limit}
                  onChange={(event) => updateLimit(Number(event.target.value))}
                >
                  {limitOptions.map((option) => (
                    <option key={option} value={option}>
                      Limite: {option}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-xl border border-slate-700/70 px-2 py-1 text-[9px] uppercase tracking-wide text-slate-300"
                  onClick={resetFilters}
                >
                  Limpiar filtros API
                </button>
              </div>
              </div>
            <p className="text-[9px] text-slate-500">
              Solo la bodega central refleja existencias; los destinos de uso son contextuales.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-slate-400">
              <span className="text-[9px] uppercase tracking-wide">Rango de fechas (frontend)</span>
              <label className="text-[9px] text-slate-500" htmlFor="date-from">
                Desde
              </label>
              <input
                id="date-from"
                type="date"
                className="rounded-xl border border-slate-700/70 bg-slate-900/80 px-2 py-1 text-slate-200"
                value={dateRange.from}
                onChange={(event) => handleDateChange('from', event.target.value)}
              />
              <label className="text-[9px] text-slate-500" htmlFor="date-to">
                Hasta
              </label>
              <input
                id="date-to"
                type="date"
                className="rounded-xl border border-slate-700/70 bg-slate-900/80 px-2 py-1 text-slate-200"
                value={dateRange.to}
                onChange={(event) => handleDateChange('to', event.target.value)}
              />
              <button
                type="button"
                className="rounded-xl border border-slate-700/70 px-2 py-1 text-[9px] uppercase tracking-wide text-slate-300"
                onClick={clearDateRange}
              >
                Limpiar fechas
              </button>
              <div className="ml-auto flex items-center gap-1 text-[9px] text-slate-400">
                <button
                  type="button"
                  className="rounded-full border border-slate-700/70 px-2 py-1 text-slate-300 disabled:opacity-40"
                  onClick={() => changePage('prev')}
                  disabled={!canGoPrev}
                >
                  ← Anterior
                </button>
                <span>
                  Pag {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-slate-700/70 px-2 py-1 text-slate-300 disabled:opacity-40"
                  onClick={() => changePage('next')}
                  disabled={!canGoNext}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-auto rounded-xl border border-[hsl(var(--border))]">
            <table className="min-w-full text-[10px]">
              <thead className="bg-slate-900/90 text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Fecha / Hora</th>
                  <th className="px-3 py-2 text-left font-medium">Tipo</th>
                  <th className="px-3 py-2 text-left font-medium">Producto</th>
                  <th className="px-3 py-2 text-left font-medium">
                    From {'->'} To
                  </th>
                  <th className="px-3 py-2 text-right font-medium">Cantidad</th>
                  <th className="px-3 py-2 text-left font-medium">Persona</th>
                  <th className="px-3 py-2 text-left font-medium">Proveedor</th>
                  <th className="px-3 py-2 text-left font-medium">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {movements.isLoading && movements.items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                      Cargando movimientos...
                    </td>
                  </tr>
                )}

                {!movements.isLoading && filteredMovements.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                      No hay movimientos para los filtros seleccionados
                    </td>
                  </tr>
                )}

              {filteredMovements.map((mov) => {
                const hasFrom = mov.fromLocation && mov.fromLocation !== '-';
                const hasTo = mov.toLocation && mov.toLocation !== '-';
                const locationLabel =
                  mov.type === 'uso'
                    ? hasTo
                      ? `Consumido en ${mov.toLocation}`
                      : 'Uso sin destino etiquetado'
                    : mov.type === 'ingreso'
                      ? `Ingreso en ${CENTRAL_LOCATION_NAME}`
                      : `${hasFrom ? mov.fromLocation : '-'} -> ${hasTo ? mov.toLocation : '-'}`;

                return (
                  <tr key={mov.id} className="hover:bg-[hsl(var(--surface-strong))]">
                    <td className="whitespace-nowrap px-3 py-2 text-[hsl(var(--muted))]">{mov.dateLabel}</td>
                    <td className="px-3 py-2 capitalize">
                      <span
                        className={`inline-flex rounded-full border px-2 py-[2px] text-[9px] font-semibold ${
                          movementBadgeStyles[mov.type] ?? movementBadgeStyles.default
                        }`}
                      >
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[hsl(var(--foreground))]">{mov.productName}</td>
                    <td className="px-3 py-2 text-[hsl(var(--muted))]">{locationLabel}</td>
                    <td className="px-3 py-2 text-right text-[hsl(var(--foreground))]">
                      {quantityFormatter.format(mov.quantity)}
                    </td>
                    <td className="px-3 py-2 text-[hsl(var(--muted))]">{mov.person || 'Sin dato'}</td>
                    <td className="px-3 py-2 text-[hsl(var(--muted))]">{mov.supplier || '-'}</td>
                    <td className="px-3 py-2 text-[hsl(var(--muted))]" title={mov.note}>
                      {mov.note || 'Sin nota'}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Top categorias con mas movimiento ({topCategories.params.days ?? 0} dias)
              </span>
              <div className="flex items-center gap-1 text-[9px] text-slate-500">
                <select
                  className="rounded border border-slate-700/70 bg-slate-900/80 px-1 py-[2px]"
                  value={topCategories.params.days ?? 30}
                  onChange={(event) =>
                    reload({ topCategories: { days: Number(event.target.value) } })
                  }
                >
                  {[7, 14, 30, 60, 90].map((option) => (
                    <option key={option} value={option}>
                      {option} d
                    </option>
                  ))}
                </select>
                <select
                  className="rounded border border-slate-700/70 bg-slate-900/80 px-1 py-[2px]"
                  value={topCategories.params.limit ?? 10}
                  onChange={(event) =>
                    reload({ topCategories: { limit: Number(event.target.value) } })
                  }
                >
                  {[5, 8, 10, 15].map((option) => (
                    <option key={option} value={option}>
                      Top {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {!topCategories.items.length && (
                <span className="text-[10px] text-slate-500">Sin movimientos en este rango.</span>
              )}
              {topCategories.items.map((item, index) => (
                <div key={`${item.categoriaId}-${index}`} className="flex items-center gap-2">
                  <span className="w-4 text-[9px] text-slate-500">#{index + 1}</span>
                  <span className="flex-1 truncate text-[9px] text-slate-300">{item.nombre}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-900/80">
                    <div
                      className="h-1.5 rounded-full bg-sky-500/80"
                      style={{ width: `${(item.totalMovimiento / topCategoryMax) * 100}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-[9px] text-slate-400">
                    <div>{quantityFormatter.format(item.totalMovimiento)}</div>
                    <div className="text-[8px] text-slate-500">
                      {integerFormatter.format(item.movimientosCount)} movs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Top productos mas usados ({topUsedProducts.params.days ?? 0} dias)
              </span>
              <div className="flex items-center gap-1 text-[9px] text-slate-500">
                <select
                  className="rounded border border-slate-700/70 bg-slate-900/80 px-1 py-[2px]"
                  value={topUsedProducts.params.days ?? 30}
                  onChange={(event) =>
                    reload({ topUsed: { days: Number(event.target.value) } })
                  }
                >
                  {[7, 14, 30, 60, 90].map((option) => (
                    <option key={option} value={option}>
                      {option} d
                    </option>
                  ))}
                </select>
                <select
                  className="rounded border border-slate-700/70 bg-slate-900/80 px-1 py-[2px]"
                  value={topUsedProducts.params.limit ?? 10}
                  onChange={(event) =>
                    reload({ topUsed: { limit: Number(event.target.value) } })
                  }
                >
                  {[5, 10, 15].map((option) => (
                    <option key={option} value={option}>
                      Top {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {!topUsedProducts.items.length && (
                <span className="text-[10px] text-slate-500">Sin consumos en el rango.</span>
              )}
              {topUsedProducts.items.map((item, index) => (
                <div key={item.productoId} className="flex items-center gap-2">
                  <span className="w-4 text-[9px] text-slate-500">#{index + 1}</span>
                  <span className="flex-1 truncate text-[9px] text-slate-300">{item.nombre}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-900/80">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500/80"
                      style={{ width: `${(item.totalUsado / topUsedMax) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[9px] text-slate-400">
                    {integerFormatter.format(item.totalUsado)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardInventarioMVP;
