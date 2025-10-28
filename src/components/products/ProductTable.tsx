"use client";

import * as React from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { buildCacheKey, type QueryOptions } from "@/lib/pagination";
import { selectProductList, useProductStore } from "@/store/product.store";
import type { Product } from "@/types/product";
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

interface ProductTableProps {
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

interface FiltersState {
  name: string;
  category: string;
}

const columns = (
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
  uomIndex: Record<number, Uom>,
): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) =>
      row.original.category ? <Badge variant="secondary">{row.original.category}</Badge> : <span className="text-muted-foreground">-</span>,
  },
  {
    accessorKey: "baseUomId",
    header: "UoM base",
    cell: ({ row }) => uomIndex[row.original.baseUomId]?.name ?? row.original.baseUomId,
  },
  {
    accessorKey: "purchaseUomId",
    header: "UoM compra",
    cell: ({ row }) => {
      const id = row.original.purchaseUomId;
      if (!id) return <span className="text-muted-foreground">-</span>;
      return uomIndex[id]?.name ?? id;
    },
  },
  {
    accessorKey: "shelfLifeDays",
    header: "Duracion (dias)",
    cell: ({ row }) => row.original.shelfLifeDays ?? <span className="text-muted-foreground">-</span>,
  },
  {
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Acciones">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(product)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(product)}>
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ProductTable({ onCreate, onEdit, onDelete }: ProductTableProps) {
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
      "filter[name]": filters.name || undefined,
      "filter[category]": filters.category !== "all" ? filters.category : undefined,
    };

    return {
      page,
      perPage,
      sort,
      filters: filterParams,
    };
  }, [filters.category, filters.name, page, perPage, sorting]);

  const key = buildCacheKey("products", queryOptions);

  const data = useProductStore((state) => selectProductList(queryOptions)(state));
  const isLoading = useProductStore((state) => state.loadingKeys.has(key));
  const error = useProductStore((state) => state.errorByKey[key] ?? null);
  const list = useProductStore((state) => state.list);
  const fetchUomsForSelect = useProductStore((state) => state.fetchUomsForSelect);
  const uomCache = useProductStore((state) => state.uomsForSelect);

  React.useEffect(() => {
    void list(queryOptions).catch(() => undefined);
  }, [list, queryOptions]);

  React.useEffect(() => {
    void fetchUomsForSelect().catch(() => undefined);
  }, [fetchUomsForSelect]);

  const uomIndex = React.useMemo(() => {
    const record: Record<number, Uom> = {};
    if (uomCache?.data) {
      for (const uom of uomCache.data) {
        record[uom.id] = uom;
      }
    }
    return record;
  }, [uomCache]);

  const toolbar = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={filters.name}
          onChange={(event) => {
            setPage(1);
            setFilters((prev) => ({ ...prev, name: event.target.value }));
          }}
          placeholder="Buscar por nombre..."
          aria-label="Filtrar por nombre"
          className="sm:w-64"
        />
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
            <SelectItem value="fresh">Frescos</SelectItem>
            <SelectItem value="dry">Secos</SelectItem>
            <SelectItem value="beverage">Bebidas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onCreate} className="sm:w-auto">
        Nuevo producto
      </Button>
    </div>
  );

  return (
    <DataTable
      columns={columns(onEdit, onDelete, uomIndex)}
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
      emptyMessage="No se encontraron productos."
    />
  );
}
