"use client";

import * as React from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./button";
import { Input } from "./input";
import { Skeleton } from "./skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  total: number;
  page: number;
  perPage: number;
  sorting?: SortingState;
  defaultColumnVisibility?: Record<string, boolean>;
  onSortChange?: (sorting: SortingState) => void;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  toolbar?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

export function DataTable<TData>({
  columns,
  data,
  total,
  page,
  perPage,
  sorting,
  defaultColumnVisibility,
  onSortChange,
  onPageChange,
  onPerPageChange,
  toolbar,
  isLoading,
  error,
  emptyMessage = "No hay registros para mostrar",
}: DataTableProps<TData>) {
  const [sortingState, setSortingState] = React.useState<SortingState>(sorting ?? []);

  React.useEffect(() => {
    if (sorting) {
      setSortingState(sorting);
    }
  }, [sorting]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sortingState,
    },
    onSortingChange: (updater) => {
      const nextSorting = typeof updater === "function" ? updater(sortingState) : updater;
      setSortingState(nextSorting);
      onSortChange?.(nextSorting);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    initialState: {
      columnVisibility: defaultColumnVisibility,
    },
  });

  const totalPages = Math.max(Math.ceil(total / Math.max(perPage, 1)), 1);
  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  const handlePerPageChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 1) return;
    const clamped = Math.min(Math.max(parsed, 5), 100);
    onPerPageChange?.(clamped);
  };

  const sortIndicator: Record<string, string> = {
    asc: "ASC",
    desc: "DESC",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">{toolbar}</div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.getCanSort() ? "cursor-pointer select-none" : undefined}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortIndicator[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {table.getAllLeafColumns().map((column) => (
                      <TableCell key={column.id}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : error
                ? (
                    <TableRow>
                      <TableCell colSpan={columns.length || 1} className="h-24 text-center text-sm text-destructive">
                        {error}
                      </TableCell>
                    </TableRow>
                  )
                : table.getRowModel().rows?.length
                  ? table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  : (
                      <TableRow>
                        <TableCell colSpan={columns.length || 1} className="h-24 text-center text-sm text-muted-foreground">
                          {emptyMessage}
                        </TableCell>
                      </TableRow>
                    )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Pagina {page} de {totalPages} | {total} registros
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filas por pagina</span>
            <Input
              type="number"
              value={perPage}
              min={5}
              max={100}
              className="w-20"
              onChange={(event) => handlePerPageChange(event.target.value)}
              aria-label="Cambiar filas por pagina"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => onPageChange?.(1)} disabled={!canPreviousPage} aria-label="Primera pagina">
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onPageChange?.(page - 1)} disabled={!canPreviousPage} aria-label="Pagina anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onPageChange?.(page + 1)} disabled={!canNextPage} aria-label="Pagina siguiente">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onPageChange?.(totalPages)} disabled={!canNextPage} aria-label="Ultima pagina">
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

