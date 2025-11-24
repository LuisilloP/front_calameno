"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useTheme } from "next-themes";
import { Bar } from "react-chartjs-2";
import { apiConnector, Product } from "./api-connector";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Palette = {
  foreground: string;
  muted: string;
  surface: string;
  border: string;
  grid: string;
  accent: string;
  accentSoft: string;
  danger: string;
};

const fallbackPalette: Palette = {
  foreground: "hsl(222 32% 14%)",
  muted: "hsl(222 12% 45%)",
  surface: "hsl(0 0% 100%)",
  border: "hsl(220 16% 86%)",
  grid: "hsla(220, 16%, 86%, 0.45)",
  accent: "hsl(21 92% 46%)",
  accentSoft: "hsla(21, 92%, 46%, 0.18)",
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

interface BarChartProps {
  title?: string;
  dataField: keyof Product;
  sortDirection?: "asc" | "desc";
  limit?: number;
  height?: number;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  title = "",
  dataField,
  sortDirection = "desc",
  limit = 10,
  height = 300,
  showLegend = true,
  xAxisLabel = "Productos",
  yAxisLabel = "",
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
      grid: readVarAlpha("--border", 0.55, fallbackPalette.grid),
      accent: readVar("--accent", fallbackPalette.accent),
      accentSoft: readVarAlpha("--accent", 0.18, fallbackPalette.accentSoft),
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
          labels: limitedProducts.map((product) => product.name),
          values: limitedProducts.map((product) =>
            parseFloat(String(product[dataField]))
          ),
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

  const chartData = useMemo<ChartData<"bar">>(
    () => ({
      labels: series.labels,
      datasets: [
        {
          label: title || String(dataField),
          data: series.values,
          backgroundColor: palette.accentSoft,
          borderColor: palette.accent,
          borderWidth: 1,
          hoverBackgroundColor: palette.accent,
          hoverBorderColor: palette.border,
        },
      ],
    }),
    [dataField, palette.accent, palette.accentSoft, palette.border, series.labels, series.values, title]
  );

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: "top",
          labels: {
            color: palette.foreground,
          },
        },
        title: {
          display: !!title,
          text: title,
          color: palette.foreground,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: !!yAxisLabel,
            text: yAxisLabel,
            color: palette.muted,
          },
          ticks: {
            color: palette.foreground,
          },
          grid: {
            color: palette.grid,
          },
        },
        x: {
          title: {
            display: !!xAxisLabel,
            text: xAxisLabel,
            color: palette.muted,
          },
          ticks: {
            color: palette.foreground,
          },
          grid: {
            color: palette.grid,
          },
        },
      },
    }),
    [palette.foreground, palette.grid, palette.muted, showLegend, title, xAxisLabel, yAxisLabel]
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
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
