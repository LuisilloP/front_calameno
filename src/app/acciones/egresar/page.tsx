"use client";

import React from "react";
import { useState } from "react";
import { PopupAlert, MovementAlertData } from "@/components/ui/PopupAlert";

export default function EgresarProductosPage() {
  const [alert, setAlert] = useState<MovementAlertData | null>(null);
  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Egresar Productos
      </h1>
      <div className="text-muted-foreground">
        <p>
          Formulario para registrar usos: descuentan stock de la bodega central
          y opcionalmente etiquetan dónde se consumió el producto.
        </p>
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={() =>
            setAlert({
              tipo: "uso",
              producto: "Producto demo",
              cantidad: 3.5,
              unidad: "kg",
              locacionDestino: "Cocina Fria",
              fechaIso: new Date().toISOString(),
              nota: "Uso para preparación de menú",
            })
          }
          className="rounded-xl border border-sky-500/50 bg-sky-500/10 px-3 py-2 text-sm text-sky-100 hover:border-sky-400"
        >
          Probar alerta de egreso
        </button>
      </div>
      {alert && (
        <PopupAlert data={alert} onClose={() => setAlert(null)} />
      )}
    </main>
  );
}