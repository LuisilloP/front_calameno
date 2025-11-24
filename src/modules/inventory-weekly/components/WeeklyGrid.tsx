import { WeeklyStockProduct } from "../types";

const statusClasses: Record<string, string> = {
  alto: "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-50",
  bajo: "border-amber-400/50 bg-amber-400/10 text-amber-900 dark:text-amber-50",
  critico: "border-rose-500/60 bg-rose-500/10 text-rose-900 dark:text-rose-50",
};

type WeekDay = {
  iso: string;
  label: string;
  weekday: string;
};

type WeeklyGridProps = {
  data: WeeklyStockProduct[];
  weekDays: WeekDay[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

const skeletonRows = Array.from({ length: 5 }).map((_, index) => (
  <tr key={`skeleton-${index}`} className="border-b border-[hsl(var(--border))]">
    <td className="sticky left-0 z-10 bg-[hsl(var(--surface))] p-4 backdrop-blur">
      <div className="h-4 w-48 animate-pulse rounded-full bg-[hsl(var(--surface-strong))]" />
    </td>
    {Array.from({ length: 7 }).map((__, dayIndex) => (
      <td key={`cell-${dayIndex}`} className="p-3">
        <div className="h-10 animate-pulse rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))]" />
      </td>
    ))}
  </tr>
));

export const WeeklyGrid = ({
  data,
  weekDays,
  isLoading,
  isError,
  onRetry,
}: WeeklyGridProps) => {
  return (
    <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xl shadow-black/10">
      {isError && (
        <div className="flex flex-col gap-3 border-b border-[hsl(var(--danger))] bg-[hsla(var(--danger)/0.08)] px-6 py-4 text-sm text-[hsl(var(--danger))] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">No pudimos cargar el stock.</p>
            <p className="text-xs text-[hsl(var(--muted))]">
              Revisa tu conexion e intenta nuevamente.
            </p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full border border-[hsl(var(--danger))] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--danger))] transition hover:bg-[hsla(var(--danger)/0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--danger))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
          >
            Reintentar
          </button>
        </div>
      )}
      <div className="relative max-h-[620px] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-20 bg-[hsl(var(--surface))] backdrop-blur">
            <tr>
              <th className="sticky left-0 z-30 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted))]">
                Producto
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.iso}
                  className="border-b border-[hsl(var(--border))] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted))]"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && skeletonRows}
            {!isLoading && data.length === 0 && (
              <tr>
                <td
                  className="p-6 text-center text-sm text-[hsl(var(--muted))]"
                  colSpan={weekDays.length + 1}
                >
                  No hay datos para la combinacion seleccionada.
                </td>
              </tr>
            )}
            {!isLoading &&
              data.map((row) => (
                <tr
                  key={row.productoId}
                  className="border-b border-[hsl(var(--border))] last:border-b-0"
                >
                  <td className="sticky left-0 z-10 bg-[hsl(var(--surface))] px-4 py-4 text-sm font-semibold text-[hsl(var(--foreground))] backdrop-blur">
                    <div>{row.productoNombre}</div>
                    <div className="text-xs text-[hsl(var(--muted))]">
                      ID #{row.productoId}
                    </div>
                  </td>
                  {row.dias.map((day) => {
                    const tone =
                      statusClasses[day.estado] ??
                      "border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] text-[hsl(var(--foreground))]";
                    return (
                      <td key={`${row.productoId}-${day.fecha}`} className="px-3 py-2">
                        <div
                          className={`rounded-2xl border px-3 py-3 text-center transition ${tone}`}
                        >
                          <div className="text-base font-semibold">
                            {day.stock}
                          </div>
                          <div className="text-[11px] uppercase tracking-wide">
                            {day.estado}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
