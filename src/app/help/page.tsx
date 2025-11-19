"use client";

import React from "react";

export default function HelpPage() {
  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Ayuda</h1>
      <div className="space-y-4 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Guía de uso del sistema
          </h2>
          <p>
            Aquí encontrarás documentación y ayuda sobre cómo usar el sistema.
          </p>
        </section>
        <section className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4 text-sm text-slate-200">
          <h3 className="mb-2 text-base font-semibold text-foreground">
            Bodega central y destinos de uso
          </h3>
          <p>
            Los usos registran dónde se gastó el producto sin afectar stock en esa locación; el stock
            siempre vive en la bodega central. Cada movimiento de ingreso suma unidades en la{" "}
            <strong>Bodega Calameno</strong> y los usos sólo etiquetan el punto de consumo (por
            ejemplo cocina o barra) para generar contexto operativo.
          </p>
        </section>
      </div>
    </main>
  );
}
