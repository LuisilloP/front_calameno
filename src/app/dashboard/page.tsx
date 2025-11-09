"use client";

import React, { useState, useEffect } from "react";
import {
  DashboardService,
  type DashboardResponse,
} from "@/services/dashboard.service";
import { BarChart } from "@/components/charts/BarChart";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, [weekOffset]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardData = await DashboardService.getDashboardData(weekOffset);
      setData(dashboardData);
    } catch (err: any) {
      setError(err.message || "Error al cargar el dashboard");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatWeekRange = () => {
    if (!data) return "";
    const start = new Date(data.meta.week_start);
    const end = new Date(data.meta.week_end);

    const formatDate = (date: Date) => {
      const day = date.getDate();
      const month = date.toLocaleDateString("es-ES", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month}`;
    };

    return `Semana ${formatDate(start)} a ${formatDate(
      end
    )} ${end.getFullYear()}`;
  };

  const exportCSV = () => {
    if (!data) return;

    const headers = [
      "Fecha",
      "Producto",
      "Tipo",
      "Cantidad",
      "Ubicación",
      "Responsable",
      "Observación",
    ];
    const rows = data.items.map((item) => [
      item.fecha_local,
      item.producto_nombre,
      item.tipo,
      item.cantidad.toString(),
      item.to_locacion_nombre || item.from_locacion_nombre || "-",
      item.persona_nombre || "-",
      item.nota || "-",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-${data.meta.week_start}.csv`;
    a.click();
  };

  const getTipoLabel = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    switch (tipoLower) {
      case "ingreso":
        return "Ingreso";
      case "uso":
      case "egreso":
        return "Uso";
      case "movimiento":
        return "Movimiento";
      default:
        return tipo;
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    switch (tipoLower) {
      case "ingreso":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "uso":
      case "egreso":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "movimiento":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">
            Cargando dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
          <button
            onClick={loadDashboard}
            className="ml-4 underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 min-h-screen">
        <div className="text-muted-foreground">No hay datos disponibles</div>
      </div>
    );
  }

  return (
    <main className="p-6 min-h-screen">
      {/* Header con navegación de semana */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Semana anterior"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h1 className="text-2xl font-bold text-foreground">
            {formatWeekRange()}
          </h1>

          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Semana siguiente"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="ml-4 text-sm text-primary hover:underline"
            >
              Ir a semana actual
            </button>
          )}
        </div>

        <button
          onClick={exportCSV}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Exportar CSV
        </button>
      </div>

      {/* Gráficos laterales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Productos con Bajo Stock
          </h2>
          <BarChart
            labels={data.charts.bar_one.labels}
            values={data.charts.bar_one.values}
            items={data.charts.bar_one.items}
            type="stock"
          />
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Productos Más Demandados
          </h2>
          <BarChart
            labels={data.charts.bar_two.labels}
            values={data.charts.bar_two.values}
            items={data.charts.bar_two.items}
            type="demand"
          />
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            Últimos Movimientos ({data.items.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Observación
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {data.items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                    {item.fecha_local}
                  </td>
                  <td className="px-6 py-4 text-sm text-card-foreground">
                    <div className="font-medium">{item.producto_nombre}</div>
                    {item.sku && (
                      <div className="text-xs text-muted-foreground">
                        {item.sku}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoBadgeColor(
                        item.tipo
                      )}`}
                    >
                      {getTipoLabel(item.tipo)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                    {item.cantidad.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-card-foreground">
                    {item.to_locacion_nombre || item.from_locacion_nombre || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-card-foreground">
                    {item.persona_nombre || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-card-foreground">
                    {item.nota || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}

              {data.items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-sm text-muted-foreground"
                  >
                    No hay movimientos registrados en esta semana
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-6 bg-muted p-4 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Debug Info
          </summary>
          <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
            {JSON.stringify(data.meta, null, 2)}
          </pre>
          <div className="mt-2 text-xs text-muted-foreground">
            <strong>Endpoints llamados:</strong>
            <ul className="list-disc list-inside mt-1">
              {data.endpoints_called.map((endpoint, i) => (
                <li key={i}>{endpoint}</li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </main>
  );
}
