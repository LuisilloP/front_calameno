"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { apiConnector, Product } from "./api-connector";

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const [chartData, setChartData] = useState<ChartData<"bar">>({
    labels: [],
    datasets: [],
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiConnector.getProducts();

        // Ordenar productos por el campo especificado
        const sortedProducts = [...response.data].sort((a, b) => {
          const aValue = parseFloat(String(a[dataField]));
          const bValue = parseFloat(String(b[dataField]));
          return sortDirection === "desc" ? bValue - aValue : aValue - bValue;
        });

        // Tomar la cantidad limitada de productos
        const limitedProducts = sortedProducts.slice(0, limit);

        setChartData({
          labels: limitedProducts.map((product) => product.name),
          datasets: [
            {
              label: title || String(dataField),
              data: limitedProducts.map((product) =>
                parseFloat(String(product[dataField]))
              ),
              backgroundColor: "rgba(53, 162, 235, 0.5)",
              borderColor: "rgb(53, 162, 235)",
              borderWidth: 1,
            },
          ],
        });
      } catch (err: any) {
        setError(err.message || "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataField, limit, sortDirection, title]);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: "top" as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
        },
      },
      x: {
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ height }}>
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 text-red-700 p-3 rounded"
        style={{ height: "auto" }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <div style={{ height }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Ejemplo de uso:
// <BarChart
//   title="Top 10 Productos por Stock Mínimo"
//   dataField="minStock"
//   sortDirection="desc"
//   limit={10}
//   height={400}
//   yAxisLabel="Stock Mínimo"
//   xAxisLabel="Productos"
// />
