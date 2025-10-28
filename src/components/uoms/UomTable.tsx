"use client";

import * as React from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { buildCacheKey, type QueryOptions } from "@/lib/pagination";
import { useUomStore, selectUomList } from "@/store/uom.store";
import type { Uom } from "@/types/uom";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DataTable } from "../ui/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const categoryLabels: Record<string, string> = {
  weight: "Peso",
  volume: "Volumen",
  unit: "Unidad",
};

interface UomTableProps {
  onCreate: () => void;
  onEdit: (uom: Uom) => void;
  onDelete: (uom: Uom) => void;
}

interface FiltersState {
  name: string;
  category: string;
}

const columns = (onEdit: (uom: Uom) => void, onDelete: (uom: Uom) => void): ColumnDef<Uom>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => {
      const category = row.original.category;
      return <Badge variant="secondary">{categoryLabels[category] ?? category}</Badge>;
    },
  },
  {
    accessorKey: "ratioToBase",
    header: "Factor base",
    cell: ({ row }) => <span>{row.original.ratioToBase}</span>,
  },
  {
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => {
      const uom = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Acciones">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(uom)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(uom)}>
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UomTable({ onCreate, onEdit, onDelete }: UomTableProps) {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<FiltersState>({ name: "", category: "all" });

  const queryOptions = React.useMemo<QueryOptions>(() => {
    const sort = sorting[0]
      ? {
          field: sorting[0].id ?? "name",
          order: sorting[0].desc ? "desc" : "asc",
        }
      : undefined;

    const filterParams: QueryOptions["filters"] = {
      "filter[name]": filters.name ? filters.name : undefined,
      "filter[category]": filters.category !== "all" ? filters.category : undefined,
    };

    return {
      page,
      perPage,
      sort,
      filters: filterParams,
    };
  }, [filters.category, filters.name, page, perPage, sorting]);

  const key = buildCacheKey("uoms", queryOptions);

  const data = useUomStore((state) => selectUomList(queryOptions)(state));
  const isLoading = useUomStore((state) => state.loadingKeys.has(key));
  const error = useUomStore((state) => state.errorByKey[key] ?? null);
  const list = useUomStore((state) => state.list);

  React.useEffect(() => {
    void list(queryOptions).catch(() => undefined);
  }, [list, queryOptions]);

  const toolbar = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-64">
          <Input
            value={filters.name}
            onChange={(event) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, name: event.target.value }));
            }}
            placeholder="Buscar por nombre..."
            aria-label="Filtrar por nombre"
          />
        </div>
        <Select
          value={filters.category}
          onValueChange={(value) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, category: value }));
          }}
        >
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="weight">Peso</SelectItem>
            <SelectItem value="volume">Volumen</SelectItem>
            <SelectItem value="unit">Unidad</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onCreate} className="sm:w-auto">
        Nueva unidad
      </Button>
    </div>
  );

  return (
    <DataTable
      columns={columns(onEdit, onDelete)}
      data={data?.items ?? []}
      total={data?.total ?? 0}
      page={page}
      perPage={perPage}
      sorting={sorting}
      onSortChange={setSorting}
      onPageChange={setPage}
      onPerPageChange={(value) => {
        setPerPage(value);
        setPage(1);
      }}
      toolbar={toolbar}
      isLoading={isLoading}
      error={error}
      emptyMessage="No se encontraron unidades de medida."
    />
  );
}
