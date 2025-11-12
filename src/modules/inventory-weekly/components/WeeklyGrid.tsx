import { WeeklyStockProduct } from "../types";

const statusClasses: Record<string, string> = {
  alto: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  bajo: "border-amber-400/40 bg-amber-400/10 text-amber-100",
  critico: "border-rose-500/50 bg-rose-500/10 text-rose-100",
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
  <tr key={`skeleton-${index}`} className="border-b border-slate-900/40">
    <td className="sticky left-0 z-10 bg-slate-950/40 p-4 backdrop-blur">
      <div className="h-4 w-48 animate-pulse rounded-full bg-slate-800/60" />
    </td>
    {Array.from({ length: 7 }).map((__, dayIndex) => (
      <td key={`cell-${dayIndex}`} className="p-3">
        <div className="h-10 animate-pulse rounded-2xl border border-slate-900/70 bg-slate-900/30" />
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
    <div className="rounded-3xl border border-slate-800/70 bg-slate-950/40 shadow-xl shadow-slate-900/40">
      {isError && (
        <div className="flex flex-col gap-3 border-b border-rose-500/40 bg-rose-500/5 px-6 py-4 text-sm text-rose-100 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">No pudimos cargar el stock.</p>
            <p className="text-xs text-rose-200/80">
              Revisa tu conexion e intenta nuevamente.
            </p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full border border-rose-400/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-100 transition hover:border-rose-300"
          >
            Reintentar
          </button>
        </div>
      )}
      <div className="relative max-h-[620px] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur">
            <tr>
              <th className="sticky left-0 z-30 border-b border-slate-900/60 bg-slate-950/95 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Producto
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.iso}
                  className="border-b border-slate-900/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
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
                  className="p-6 text-center text-sm text-slate-400"
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
                  className="border-b border-slate-900/40 last:border-b-0"
                >
                  <td className="sticky left-0 z-10 bg-slate-950/60 px-4 py-4 text-sm font-semibold text-slate-100 backdrop-blur">
                    <div>{row.productoNombre}</div>
                    <div className="text-xs text-slate-500">
                      ID #{row.productoId}
                    </div>
                  </td>
                  {row.dias.map((day) => {
                    const tone =
                      statusClasses[day.estado] ??
                      "border-slate-800/80 bg-slate-900/40 text-slate-100";
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
