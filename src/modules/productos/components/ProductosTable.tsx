"use client";

import React from 'react';
import { Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Producto } from '../types';

interface ProductosTableProps {
  productos: Producto[];
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
  categorias: Array<{ id: number; nombre: string }>;
  marcas: Array<{ id: number; nombre: string }>;
  uoms: Array<{ id: number; nombre: string; simbolo: string }>;
}

export function ProductosTable({
  productos,
  onEdit,
  onDelete,
  categorias,
  marcas,
  uoms,
}: ProductosTableProps) {
  const getCategoriaName = (id?: number | null) => {
    if (!id) return '-';
    return categorias.find((c) => c.id === id)?.nombre || '-';
  };

  const getMarcaName = (id?: number | null) => {
    if (!id) return '-';
    return marcas.find((m) => m.id === id)?.nombre || '-';
  };

  const getUomName = (id: number) => {
    const uom = uoms.find((u) => u.id === id);
    return uom ? `${uom.nombre} (${uom.simbolo})` : '-';
  };

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Producto
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              SKU
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Marca
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Unidad
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {productos.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No hay productos registrados
              </td>
            </tr>
          ) : (
            productos.map((producto) => (
              <tr key={producto.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-card-foreground">
                  {producto.nombre}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                  {producto.sku || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-card-foreground">
                  {getCategoriaName(producto.categoria_id)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-card-foreground">
                  {getMarcaName(producto.marca_id)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-card-foreground">
                  {getUomName(producto.uom_id)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {producto.activo ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-200">
                      <XCircle className="w-3 h-3" />
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(producto)}
                      className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el producto "${producto.nombre}"?`)) {
                          onDelete(producto.id);
                        }
                      }}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
