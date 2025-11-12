"use client";

import React from "react";
import Link from "next/link";
import { Calendar, TrendingUp } from "lucide-react";

export default function VistasPage() {
  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Vistas y Reportes
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Vista Semanal */}
        <Link
          href="/vistas/weekly-stock"
          className="block p-6 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Stock Semanal
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Visualiza movimientos diarios y disponibilidad de stock organizado por semana y categoría.
          </p>
        </Link>

        {/* Placeholder para futuras vistas */}
        <div className="p-6 bg-card border border-border rounded-lg opacity-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-muted">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Tendencias
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Próximamente: Análisis de tendencias y proyecciones.
          </p>
        </div>
      </div>
    </main>
  );
}
