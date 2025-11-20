"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import {
  AdminTable,
  AdminTableColumn,
} from "@/modules/admin/components/AdminTable";
import { Producto, ProductoCatalogs } from "../types";

type ProductoTableProps = {
  data: Producto[];
  total: number;
  pageIndex: number;
  pageSize: number;
  searchValue: string;
  isLoading: boolean;
  catalogs: ProductoCatalogs;
  onSearchChange: (value: string) => void;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (size: number) => void;
  onCreate: () => void;
  onEdit: (producto: Producto) => void;
  onToggleActive: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
};

const actionButton =
  "rounded-full border border-slate-700/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 hover:border-slate-500";

export const ProductoTable = ({
  data,
  total,
  pageIndex,
  pageSize,
  searchValue,
  isLoading,
  catalogs,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onCreate,
  onEdit,
  onToggleActive,
  onDelete,
}: ProductoTableProps) => {
  const lookup = useMemo(() => {
    const toMap = (items: { id: number; nombre: string }[]) =>
      new Map(items.map((item) => [item.id, item.nombre]));
    return {
      uoms: toMap(catalogs.uoms),
      marcas: toMap(catalogs.marcas),
      categorias: toMap(catalogs.categorias),
    };
  }, [catalogs]);

  const columns: AdminTableColumn<Producto>[] = [
    {
      key: "nombre",
      label: "Producto",
      render: (item) => (
        <div>
          <p className="text-base font-semibold text-white">{item.nombre}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            SKU {item.sku || "N/A"}
          </p>
        </div>
      ),
    },
    {
      key: "uom",
      label: "Unidad",
      className: "w-40",
      render: (item) => (
        <span className="text-sm text-slate-200">
          {lookup.uoms.get(item.uom_id) ?? `ID ${item.uom_id}`}
        </span>
      ),
    },
    {
      key: "marca",
      label: "Marca",
      className: "w-40",
      render: (item) => (
        <span className="text-sm text-slate-300">
          {item.marca_id
            ? lookup.marcas.get(item.marca_id) ?? `ID ${item.marca_id}`
            : "Sin marca"}
        </span>
      ),
    },
    {
      key: "categoria",
      label: "Categoria",
      className: "w-44",
      render: (item) => (
        <span className="text-sm text-slate-300">
          {item.categoria_id
            ? lookup.categorias.get(item.categoria_id) ??
              `ID ${item.categoria_id}`
            : "Sin categoria"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      className: "w-32",
      render: (item) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            item.activo
              ? "border border-emerald-500/60 text-emerald-200"
              : "border border-slate-600 text-slate-400"
          }`}
        >
          {item.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      className: "w-72 text-right",
      render: () => null,
    },
  ];

  const tableColumns = columns.map((column) =>
    column.key === "actions"
      ? {
          ...column,
          render: (item: Producto) => (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className={actionButton}
                onClick={() => onEdit(item)}
                aria-label={`Editar ${item.nombre}`}
              >
                Editar
              </button>
              <button
                type="button"
                className={`${actionButton} ${
                  item.activo
                    ? "border-rose-500/70 text-rose-200 hover:border-rose-400"
                    : "border-emerald-500/70 text-emerald-200 hover:border-emerald-400"
                }`}
                onClick={() => onToggleActive(item)}
                aria-label={`${
                  item.activo ? "Desactivar" : "Activar"
                } ${item.nombre}`}
              >
                {item.activo ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                className={`${actionButton} border-slate-600 text-slate-200`}
                onClick={() => onDelete(item)}
                aria-label={`Eliminar ${item.nombre}`}
              >
                Eliminar
              </button>
            </div>
          ),
        }
      : column
  );

  return (
    <AdminTable
      title="Productos"
      description="Controla el catálogo y sus vínculos con catálogos relacionados."
      data={data}
      columns={tableColumns}
      isLoading={isLoading}
      total={total}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      primaryAction={{
        label: "Nuevo producto",
        onClick: onCreate,
        icon: <Plus className="h-4 w-4" />,
      }}
      emptyState={{
        title: "Sin productos registrados",
        description:
          "Crea el primer producto para comenzar a registrar movimientos.",
      }}
      accent="sky"
    />
  );
};
