"use client";

import { Download } from "lucide-react";
import ExcelJS from "exceljs";
import { WeeklyStockResponse } from "../types";

type WeeklyStockExporterProps = {
  data: WeeklyStockResponse | null;
  weekStart: string; // <-- VIENE DEL FRONT COMO "2025-11-10" (ISO)
  disabled?: boolean;
};

const dayOrder = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const dayLabels = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
} as const;

/* -----------------------------------------------
   🟦 CORRECCIÓN: Manejo de fechas sin UTC
-------------------------------------------------*/

// Crear fecha local correcta (evita desfase por timezone)
const parseLocalDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Calcular fecha fin de semana (lunes → domingo)
const getEndOfWeek = (iso: string) => {
  const start = parseLocalDate(iso);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(end.getDate()).padStart(2, "0")}`;
};

// Formatear igual que en la UI (10 nov)
const formatDisplay = (iso: string) => {
  const date = parseLocalDate(iso);
  return date
    .toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    })
    .replace(".", "");
};

/* ----------------------------------------------------- */

export const WeeklyStockExporter = ({
  data,
  weekStart,
  disabled,
}: WeeklyStockExporterProps) => {
  const handleExport = async () => {
    if (!data || !data.categories.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock semanal");

    // Obtener fecha final real
    const weekEnd = getEndOfWeek(weekStart);

    // Mostrar formato UI
    const displayStart = formatDisplay(weekStart);
    const displayEnd = formatDisplay(weekEnd);

    // Columnas sin headers automáticos
    worksheet.columns = [
      { key: "producto" },
      { key: "marca" },
      { key: "proveedor" },
      { key: "stock_inicial" },
      ...dayOrder.map((d) => ({ key: d })),
      { key: "stock_final" },
    ];

    data.categories.forEach((category) => {
      worksheet.addRow([]);

      // Fila de categoría + fechas
      const titleRow = worksheet.addRow([]);

      titleRow.getCell(1).value = category.category_name.toUpperCase();
      titleRow.getCell(2).value = "FECHA";
      titleRow.getCell(3).value = displayStart; // EJ: "10 nov"
      titleRow.getCell(4).value = "A";
      titleRow.getCell(5).value = displayEnd; // EJ: "16 nov"

      titleRow.getCell(1).font = { bold: true, size: 20 };
      titleRow.getCell(2).font = { bold: true };
      titleRow.eachCell((cell, col) => {
        cell.alignment = { horizontal: col === 1 ? "left" : "center" };
      });

      worksheet.addRow([]);

      // Cabecera azul real
      const headerRow = worksheet.addRow([
        "Producto",
        "Marca",
        "Proveedor",
        "Stock inicial",
        ...dayOrder.map((d) => dayLabels[d]),
        "Stock final",
      ]);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0EA5E9" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          bottom: { style: "thin", color: { argb: "FF1F2937" } },
        };
      });

      // Filas de productos
      category.products.forEach((product) => {
        const row: Record<string, string | number | null> = {
          producto: product.name,
          marca: product.brand ?? "-",
          proveedor: product.supplier ?? "-",
          stock_inicial: product.initial_stock ?? 0,
        };

        dayOrder.forEach((d) => {
          row[d] = product.daily_movements[d] ?? 0;
        });

        row.stock_final = product.final_stock_realtime ?? 0;

        worksheet.addRow(row);
      });

      worksheet.addRow([]);
    });

    // Ajuste compacto de columnas
    const columns = worksheet.columns ?? [];
    columns.forEach((col) => {
      if (!col || typeof col.eachCell !== "function") return;
      let max = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const text = cell.value ? String(cell.value) : "";
        max = Math.max(max, text.length);
      });
      col.width = max + 1;
    });

    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-semanal-${weekStart}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || !data || !data.categories.length}
      className="group inline-flex items-center gap-2 rounded-2xl border border-[hsl(var(--accent))] bg-[hsla(var(--accent)/0.12)] px-5 py-3 text-sm font-semibold text-[hsl(var(--foreground))] shadow-[0_15px_35px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:bg-[hsla(var(--accent)/0.2)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4 transition group-hover:scale-105" />
      Exportar Excel
    </button>
  );
};
