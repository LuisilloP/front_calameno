"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { apiConnector, Product } from "./api-connector";

// Registrar los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

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
  const [chartData, setChartData] = useState<ChartData<"doughnut">>({
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

        // Tomar los primeros N productos
        const limitedProducts = sortedProducts.slice(0, limit);

        // Colores automáticos
        const backgroundColors = limitedProducts.map(
          (_, i) => `hsl(${(i * 360) / limitedProducts.length}, 70%, 60%)`
        );

        setChartData({
          labels: limitedProducts.map((p) => p.name),
          datasets: [
            {
              label: title || String(dataField),
              data: limitedProducts.map((p) =>
                parseFloat(String(p[dataField]))
              ),
              backgroundColor: backgroundColors,
              borderColor: "#fff",
              borderWidth: 2,
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

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: "right",
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 16 },
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
    return <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>;
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <div style={{ height }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};
