"use client";

import { Plus } from "lucide-react";
import {
  AdminTable,
  AdminTableColumn,
} from "@/modules/admin/components/AdminTable";
import { Locacion } from "../hooks";

const actionButtonClass =
  "rounded-full border border-slate-700/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 hover:border-slate-500";

type LocacionesTableProps = {
  data: Locacion[];
  total: number;
  pageIndex: number;
  pageSize: number;
  searchValue: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (size: number) => void;
  onCreateClick: () => void;
  onEdit: (locacion: Locacion) => void;
  onToggleActive: (locacion: Locacion) => void;
};

const columns: AdminTableColumn<Locacion>[] = [
  {
    key: "nombre",
    label: "Nombre",
    render: (item) => (
      <div>
        <p className="text-base font-medium text-white">
          {item.nombre}
        </p>
        <p className="text-xs text-slate-500">
          ID #{item.id.toString().padStart(4, "0")}
        </p>
      </div>
    ),
  },
  {
    key: "estado",
    label: "Estado",
    className: "w-32",
    render: (item) => (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          item.activa
            ? "border border-emerald-500/60 text-emerald-200"
            : "border border-slate-700 text-slate-400"
        }`}
      >
        {item.activa ? "Activa" : "Inactiva"}
      </span>
    ),
  },
  {
    key: "acciones",
    label: "Acciones",
    className: "w-64 text-right",
    render: () => null,
  },
];

export const LocacionesTable = ({
  data,
  total,
  pageIndex,
  pageSize,
  searchValue,
  isLoading,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onCreateClick,
  onEdit,
  onToggleActive,
}: LocacionesTableProps) => {
  const resolvedColumns: AdminTableColumn<Locacion>[] = columns.map(
    (column) =>
      column.key === "acciones"
        ? {
            ...column,
            render: (item) => (
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  className={actionButtonClass}
                  onClick={() => onEdit(item)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className={`${actionButtonClass} ${
                    item.activa
                      ? "border-rose-500/70 text-rose-200 hover:border-rose-400"
                      : "border-emerald-500/70 text-emerald-200 hover:border-emerald-400"
                  }`}
                  onClick={() => onToggleActive(item)}
                >
                  {item.activa ? "Desactivar" : "Activar"}
                </button>
              </div>
            ),
          }
        : column
  );

  return (
    <AdminTable
      title="Locaciones"
      description="Administra bodegas y areas disponibles para movimientos."
      data={data}
      columns={resolvedColumns}
      isLoading={isLoading}
      total={total}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      primaryAction={{
        label: "Nueva locacion",
        onClick: onCreateClick,
        icon: <Plus className="h-4 w-4" />,
      }}
      emptyState={{
        title: "Aun no registras locaciones",
        description:
          "Crea la primera locacion para empezar a asociar movimientos.",
      }}
      accent="emerald"
    />
  );
};
