"use client";

import React from 'react';
import { WeeklyProduct } from '../types';
import { WEEK_DAYS, getDayLabel, formatMovement, getStockColor } from '../utils';

interface WeeklyStockTableProps {
  products: WeeklyProduct[];
  categoryName: string;
  isLoading?: boolean;
}

export const WeeklyStockTable: React.FC<WeeklyStockTableProps> = ({
  products,
  categoryName,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando datos...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay productos en esta categoría
      </div>
    );
  }

  const totalStock = products.reduce(
    (sum, p) => sum + p.final_stock_realtime,
    0
  );

  return (
    <div className="space-y-4">
      {/* Header con totales */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {categoryName}
        </h3>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{products.length}</span> productos |{' '}
          <span className="font-medium">Stock total: {totalStock.toFixed(2)}</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="sticky left-0 z-10 bg-muted px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Marca
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Stock Inicial
              </th>
              {WEEK_DAYS.map((day) => (
                <th
                  key={day}
                  className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {getDayLabel(day)}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider bg-primary/10">
                Stock Final
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-muted/50">
                <td className="sticky left-0 z-10 bg-card px-4 py-3 whitespace-nowrap text-sm font-medium text-card-foreground">
                  {product.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                  {product.brand || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                  {product.supplier || '-'}
                </td>
                <td className="px-4 py-3 text-center text-sm text-card-foreground">
                  {product.initial_stock.toFixed(2)}
                </td>
                {WEEK_DAYS.map((day) => {
                  const value = product.daily_movements[day];
                  return (
                    <td
                      key={day}
                      className="px-4 py-3 text-center text-sm font-mono"
                    >
                      <span
                        className={`inline-block px-2 py-1 rounded ${
                          value === null
                            ? 'text-muted-foreground'
                            : value > 0
                            ? 'text-emerald-400'
                            : value < 0
                            ? 'text-rose-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatMovement(value)}
                      </span>
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center text-sm font-semibold bg-primary/5">
                  <span
                    className={`inline-block px-3 py-1 rounded-full ${getStockColor(
                      product.final_stock_realtime
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
