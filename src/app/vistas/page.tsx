"use client";

import React from "react";
import Link from "next/link";
import { Calendar, TrendingUp } from "lucide-react";

export default function VistasPage() {
  return (
    <main className="flex min-h-screen flex-col gap-8 text-[hsl(var(--foreground))]">
      <header className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.12)] lg:p-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-[hsl(var(--muted))]">
            Reportes
          </p>
          <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
            Vistas y tableros de control
          </h1>
          <p className="max-w-3xl text-sm text-[hsl(var(--muted))]">
            Accede a vistas enfocadas para analizar el inventario semanal, detectar
            tendencias y preparar decisiones operativas.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/vistas/weekly-stock"
          className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:shadow-[0_25px_60px_rgba(0,0,0,0.18)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsla(var(--accent)/0.12)] via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          <div className="relative flex items-center gap-4">
            <div className="rounded-2xl border border-[hsl(var(--accent))] bg-[hsla(var(--accent)/0.15)] p-3 text-[hsl(var(--accent))] shadow-lg shadow-black/10">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[hsl(var(--muted))]">
                Vista operativa
              </p>
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                Stock semanal
              </h2>
            </div>
          </div>
          <p className="relative mt-4 text-sm leading-relaxed text-[hsl(var(--muted))]">
            Visualiza los movimientos diarios, la disponibilidad y el stock final por
            categoria en intervalos semanales.
          </p>
          <div className="relative mt-6 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent))]">
            <span>Ver detalle</span>
            <span className="text-[10px] text-[hsl(var(--muted))]">Ctrl + 1</span>
          </div>
        </Link>

        <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 text-[hsl(var(--muted))]">
          <div className="flex items-center gap-4 opacity-70">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] p-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[hsl(var(--muted))]">
                En desarrollo
              </p>
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                Tendencias
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-[hsl(var(--muted))]">
            Proximamente habilitaremos analisis predictivos y reportes avanzados.
          </p>
        </div>
      </section>
    </main>
  );
}
