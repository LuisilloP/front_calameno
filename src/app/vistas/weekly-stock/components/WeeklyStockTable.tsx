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
      <div className="rounded-2xl border border-slate-800/50 bg-slate-950/30 px-6 py-8 text-center text-slate-400">
        Cargando datos...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/50 bg-slate-950/30 px-6 py-8 text-center text-slate-400">
        No hay productos en esta categoria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-800/60 bg-slate-950/30">
        <table className="min-w-full divide-y divide-slate-800/60 text-sm text-slate-200">
          <thead className="bg-slate-900/70 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-900/80 px-4 py-3 text-left">
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
              <th className="px-4 py-3 text-center text-sky-300">Stock final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
            {products.map((product) => (
              <tr
                key={product.id}
                className="text-sm text-slate-300 transition hover:bg-slate-900/40"
              >
                <td className="sticky left-0 z-10 bg-slate-950/60 px-4 py-3 font-semibold text-white backdrop-blur">
                  {product.name}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {product.brand || "-"}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {product.supplier || "-"}
                </td>
                <td className="px-4 py-3 text-center text-white">
                  {product.initial_stock.toFixed(2)}
                </td>
                {WEEK_DAYS.map((day) => {
                  const value = product.daily_movements[day];
                  return (
                    <td key={day} className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          value === null
                            ? "border-slate-700/70 text-slate-500"
                            : value > 0
                              ? "border-emerald-500/50 text-emerald-300"
                              : value < 0
                                ? "border-rose-500/50 text-rose-300"
                                : "border-slate-700/70 text-slate-400"
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
