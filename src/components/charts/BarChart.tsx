"use client";

import React from "react";

interface BarChartItem {
  producto_id: number;
  producto_nombre: string;
  sku?: string;
  stock_calculado?: number;
  total_ingresos?: number;
  total_egresos?: number;
  total_egresos_periodo?: number;
  avg_weekly?: number;
  umbral_critico?: number;
  umbral_bajo?: number;
  umbral_normal?: number;
}

interface BarChartProps {
  labels: string[];
  values: number[];
  items: BarChartItem[];
  type: "stock" | "demand";
}

export function BarChart({ labels, values, items, type }: BarChartProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No hay datos disponibles
      </div>
    );
  }

  // Encontrar el valor máximo para calcular porcentajes
  const maxValue = Math.max(...values.map((v) => Math.abs(v)), 1);

  const getBarColor = (
    value: number,
    type: string,
    umbralCritico: number = 5,
    umbralBajo: number = 10
  ) => {
    if (type === "stock") {
      // Colores basados en los umbrales
      if (value < 0) return "bg-red-700";
      if (value <= umbralCritico) return "bg-red-500";
      if (value <= umbralBajo) return "bg-yellow-500";
      return "bg-green-500";
    }
    // Para demanda: azul
    return "bg-blue-500";
  };

  const getStockStatus = (
    stock: number,
    umbralCritico: number = 5,
    umbralBajo: number = 10,
    umbralNormal: number = 15
  ) => {
    if (stock < 0)
      return { icon: "⚠️", text: "Negativo", color: "text-red-700" };
    if (stock <= umbralCritico)
      return {
        icon: "🔴",
        text: `Crítico (≤${umbralCritico})`,
        color: "text-red-500",
      };
    if (stock <= umbralBajo)
      return {
        icon: "🟡",
        text: `Bajo (≤${umbralBajo})`,
        color: "text-yellow-600",
      };
    if (stock <= umbralNormal)
      return {
        icon: "🟢",
        text: `Normal (≤${umbralNormal})`,
        color: "text-green-600",
      };
    return {
      icon: "✅",
      text: `Óptimo (>${umbralNormal})`,
      color: "text-green-700",
    };
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const value = values[index] ?? 0;
        const label = labels[index] ?? "Sin nombre";
        const widthPercent =
          maxValue > 0 ? (Math.abs(value) / maxValue) * 100 : 0;

        const umbralCritico = item.umbral_critico ?? 5;
        const umbralBajo = item.umbral_bajo ?? 10;
        const umbralNormal = item.umbral_normal ?? 15;

        const status =
          type === "stock"
            ? getStockStatus(value, umbralCritico, umbralBajo, umbralNormal)
            : null;

        return (
          <div key={item.producto_id} className="space-y-2">
            {/* Header del producto */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-card-foreground truncate">
                    {label}
                  </span>
                  {item.sku && (
                    <span className="text-xs text-muted-foreground">
                      ({item.sku})
                    </span>
                  )}
                </div>
                {type === "stock" && status && (
                  <div
                    className={`text-xs ${status.color} flex items-center gap-1 mt-1`}
                  >
                    <span>{status.icon}</span>
                    <span>{status.text}</span>
                  </div>
                )}
              </div>
              <span
                className={`text-sm font-bold shrink-0 ${
                  type === "stock" && value <= umbralCritico
                    ? "text-red-500"
                    : "text-card-foreground"
                }`}
              >
                {value.toFixed(2)}
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="relative h-10 bg-muted/50 rounded-lg overflow-hidden border border-border">
              <div
                className={`h-full ${getBarColor(
                  value,
                  type,
                  umbralCritico,
                  umbralBajo
                )} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                style={{
                  width: `${Math.max(widthPercent, 2)}%`,
                  minWidth: widthPercent > 0 ? "2%" : "0%",
                }}
              >
                {widthPercent > 15 && (
                  <span className="text-xs font-semibold text-white">
                    {value.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Info adicional */}
            <div className="text-xs text-muted-foreground pl-1">
              {type === "stock" ? (
                <>
                  <span className="font-medium">Stock actual:</span>{" "}
                  {value.toFixed(2)}
                  {item.total_ingresos !== undefined &&
                    item.total_ingresos > 0 && (
                      <>
                        {" | "}
                        <span className="text-green-600">
                          ↑ Ingresos: {item.total_ingresos.toFixed(2)}
                        </span>
                      </>
                    )}
                  {item.total_egresos !== undefined &&
                    item.total_egresos > 0 && (
                      <>
                        {" | "}
                        <span className="text-red-600">
                          ↓ Egresos: {item.total_egresos.toFixed(2)}
                        </span>
                      </>
                    )}
                </>
              ) : (
                <>
                  <span className="font-medium">Total consumido:</span>{" "}
                  {item.total_egresos_periodo?.toFixed(2) ?? "0"}
                  {" | "}
                  <span className="font-medium">Promedio semanal:</span>{" "}
                  {item.avg_weekly?.toFixed(2) ?? "0"}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
