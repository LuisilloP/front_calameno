"use client";

import React from "react";
import Link from "next/link";
import { Calendar, TrendingUp } from "lucide-react";

export default function VistasPage() {
  return (
    <main className="flex min-h-screen flex-col gap-8 text-slate-100">
      <header className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/80 via-slate-950/70 to-slate-900/40 p-6 shadow-[0_20px_45px_rgba(2,6,23,0.45)] ring-1 ring-white/5 lg:p-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Reportes
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Vistas y tableros de control
          </h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Accede a vistas enfocadas para analizar el inventario semanal, detectar
            tendencias y preparar decisiones operativas.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/vistas/weekly-stock"
          className="group relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.45)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-sky-500/50 hover:shadow-[0_25px_60px_rgba(14,165,233,0.25)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          <div className="relative flex items-center gap-4">
            <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3 text-sky-200 shadow-lg shadow-sky-900/40">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Vista operativa
              </p>
              <h2 className="text-xl font-semibold text-white">
                Stock semanal
              </h2>
            </div>
          </div>
          <p className="relative mt-4 text-sm leading-relaxed text-slate-400">
            Visualiza los movimientos diarios, la disponibilidad y el stock final por
            categoria en intervalos semanales.
          </p>
          <div className="relative mt-6 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-sky-300">
            <span>Ver detalle</span>
            <span className="text-[10px] text-slate-500">Ctrl + 1</span>
          </div>
        </Link>

        <div className="rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/20 p-6 text-slate-500">
          <div className="flex items-center gap-4 opacity-70">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-600">
                En desarrollo
              </p>
              <h2 className="text-xl font-semibold text-white">
                Tendencias
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Proximamente habilitaremos analisis predictivos y reportes avanzados.
          </p>
        </div>
      </section>
    </main>
  );
}
