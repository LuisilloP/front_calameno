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
      </div>
    </main>
  );
}
