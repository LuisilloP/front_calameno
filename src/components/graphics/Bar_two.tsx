"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArcElement,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  Tooltip,
} from "chart.js";
import { useTheme } from "next-themes";
import { Doughnut } from "react-chartjs-2";
import { apiConnector, Product } from "./api-connector";

ChartJS.register(ArcElement, Tooltip, Legend);

type Palette = {
  foreground: string;
  muted: string;
  surface: string;
  border: string;
  accent: string;
  accentSoft: string;
  info: string;
  success: string;
  danger: string;
};

const fallbackPalette: Palette = {
  foreground: "hsl(222 32% 14%)",
  muted: "hsl(222 12% 45%)",
  surface: "hsl(0 0% 100%)",
  border: "hsl(220 16% 86%)",
  accent: "hsl(21 92% 46%)",
  accentSoft: "hsla(21, 92%, 46%, 0.3)",
  info: "hsl(201 97% 48%)",
  success: "hsl(154 64% 42%)",
  danger: "hsl(0 72% 52%)",
};

const readVar = (token: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return value ? `hsl(${value})` : fallback;
};

const readVarAlpha = (token: string, alpha: number, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return value ? `hsla(${value} / ${alpha})` : fallback;
};

interface DoughnutChartProps {
  title?: string;
  dataField: keyof Product;
  sortDirection?: "asc" | "desc";
  limit?: number;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export const DoughnutChart: React.FC<DoughnutChartProps> = ({
  title = "",
  dataField,
  sortDirection = "desc",
  limit = 10,
  height = 300,
  showLegend = true,
  className = "",
}) => {
  const { resolvedTheme, theme } = useTheme();

  const palette = useMemo<Palette>(() => {
    const themeKey = resolvedTheme ?? theme;
    void themeKey; // recalcula al cambiar el tema
    return {
      foreground: readVar("--foreground", fallbackPalette.foreground),
      muted: readVar("--muted", fallbackPalette.muted),
      surface: readVar("--surface", fallbackPalette.surface),
      border: readVar("--border", fallbackPalette.border),
      accent: readVar("--accent", fallbackPalette.accent),
      accentSoft: readVarAlpha("--accent", 0.35, fallbackPalette.accentSoft),
      info: readVar("--info", fallbackPalette.info),
      success: readVar("--success", fallbackPalette.success),
      danger: readVar("--danger", fallbackPalette.danger),
    };
  }, [resolvedTheme, theme]);

  const [series, setSeries] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiConnector.getProducts();

        const sortedProducts = [...response.data].sort((a, b) => {
          const aValue = parseFloat(String(a[dataField]));
          const bValue = parseFloat(String(b[dataField]));
          return sortDirection === "desc" ? bValue - aValue : aValue - bValue;
        });

        const limitedProducts = sortedProducts.slice(0, limit);

        setSeries({
          labels: limitedProducts.map((p) => p.name),
          values: limitedProducts.map((p) => parseFloat(String(p[dataField]))),
        });
        setError("");
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message?: string }).message)
            : "Error al cargar los datos";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataField, limit, sortDirection]);

  const paletteCycle = useMemo(
    () => [
      palette.accent,
      palette.info,
      palette.success,
      palette.danger,
      palette.accentSoft,
      readVarAlpha("--info", 0.65, "hsla(201, 97%, 48%, 0.45)"),
      readVarAlpha("--success", 0.6, "hsla(154, 64%, 42%, 0.45)"),
    ],
    [palette.accent, palette.accentSoft, palette.danger, palette.info, palette.success]
  );

  const chartData = useMemo<ChartData<"doughnut">>(
    () => ({
      labels: series.labels,
      datasets: [
        {
          label: title || String(dataField),
          data: series.values,
          backgroundColor: series.values.map(
            (_, index) => paletteCycle[index % paletteCycle.length]
          ),
          borderColor: palette.surface,
          borderWidth: 2,
        },
      ],
    }),
    [dataField, palette.surface, paletteCycle, series.labels, series.values, title]
  );

  const options: ChartOptions<"doughnut"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: "right",
          labels: {
            color: palette.foreground,
          },
        },
        title: {
          display: !!title,
          text: title,
          font: { size: 16 },
          color: palette.foreground,
        },
      },
    }),
    [palette.foreground, showLegend, title]
  );

  if (loading) {
    return (
      <div
        className={`surface-card rounded-2xl border border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--muted))] ${className}`}
        style={{ height }}
      >
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-2xl border border-[hsl(var(--danger))] bg-[hsla(var(--danger)/0.08)] p-4 text-sm text-[hsl(var(--danger))] ${className}`}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className={`surface-card rounded-2xl border border-[hsl(var(--border))] p-4 shadow-sm ${className}`}
    >
      <div style={{ height }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};
