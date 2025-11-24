"use client";

import React from "react";
import { WeeklyProduct } from "../types";
import {
  WEEK_DAYS,
  getDayLabel,
  formatMovement,
  getStockColor,
} from "../utils";

interface WeeklyStockTableProps {
  products: WeeklyProduct[];
  isLoading?: boolean;
}

export const WeeklyStockTable: React.FC<WeeklyStockTableProps> = ({
  products,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-6 py-8 text-center text-[hsl(var(--muted))]">
        Cargando datos...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-6 py-8 text-center text-[hsl(var(--muted))]">
        No hay productos en esta categoria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
        <table className="min-w-full divide-y divide-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))]">
          <thead className="bg-[hsl(var(--surface-strong))] text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--muted))]">
            <tr>
              <th className="sticky left-0 z-10 bg-[hsl(var(--surface-strong))] px-4 py-3 text-left">
                Producto
              </th>
              <th className="px-4 py-3 text-left">Marca</th>
              <th className="px-4 py-3 text-left">Proveedor</th>
              <th className="px-4 py-3 text-center">Stock inicial</th>
              {WEEK_DAYS.map((day) => (
                <th key={day} className="px-4 py-3 text-center">
                  {getDayLabel(day)}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-[hsl(var(--muted-strong))]">
                Stock final
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            {products.map((product) => (
              <tr
                key={product.id}
                className="text-sm text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--surface-strong))]"
              >
                <td className="sticky left-0 z-10 bg-[hsl(var(--surface-strong))] px-4 py-3 font-semibold text-[hsl(var(--foreground))] backdrop-blur">
                  {product.name}
                </td>
                <td className="px-4 py-3 text-[hsl(var(--muted))]">
                  {product.brand || "-"}
                </td>
                <td className="px-4 py-3 text-[hsl(var(--muted))]">
                  {product.supplier || "-"}
                </td>
                <td className="px-4 py-3 text-center text-[hsl(var(--foreground))]">
                  {product.initial_stock.toFixed(2)}
                </td>
                {WEEK_DAYS.map((day) => {
                  const value = product.daily_movements[day];
                  return (
                    <td key={day} className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          value === null
                            ? "border-[hsl(var(--border))] text-[hsl(var(--muted))]"
                            : value > 0
                              ? "border-[hsla(var(--success)/0.6)] text-[hsl(var(--success))]"
                              : value < 0
                                ? "border-[hsla(var(--danger)/0.6)] text-[hsl(var(--danger))]"
                                : "border-[hsl(var(--border))] text-[hsl(var(--muted))]"
                        }`}
                      >
                        {formatMovement(value)}
                      </span>
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${getStockColor(
                      product.final_stock_realtime,
                    )}`}
                  >
                    {product.final_stock_realtime.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
