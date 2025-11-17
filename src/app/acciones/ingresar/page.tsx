"use client";

import React from "react";
import { useState } from "react";
import { PopupAlert, MovementAlertData } from "@/components/ui/PopupAlert";

export default function IngresarProductosPage() {
  const [alert, setAlert] = useState<MovementAlertData | null>(null);
  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Ingresar Productos
      </h1>
      <div className="text-muted-foreground">
        <p>Formulario para registrar ingreso de productos al inventario.</p>
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={() =>
            setAlert({
              tipo: "ingreso",
              producto: "Producto demo",
              cantidad: 10,
              unidad: "un",
              locacionDestino: "Depósito Central",
              fechaIso: new Date().toISOString(),
            })
          }
          className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100 hover:border-emerald-400"
        >
          Probar alerta de ingreso
        </button>
      </div>
      {alert && (
        <PopupAlert data={alert} onClose={() => setAlert(null)} />
      )}
    </main>
  );
}
