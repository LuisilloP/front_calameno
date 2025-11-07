"use client";

import React, { useState } from "react";
import { Input, Select } from "../../components/form";

export default function ProductsPage() {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    provider: "",
    unitPrice: "",
    initialQty: "",
    minStock: "",
    unit: "",
    category: "",
  });

  const providers = [
    { value: "prov1", label: "Proveedor A" },
    { value: "prov2", label: "Proveedor B" },
    { value: "prov3", label: "Proveedor C" },
  ];

  const units = [
    { value: "unit", label: "Unidad" },
    { value: "kg", label: "Kilogramo" },
    { value: "g", label: "Gramo" },
    { value: "ml", label: "Mililitro" },
    { value: "l", label: "Litro" },
  ];

  const categories = [
    { value: "insumos", label: "Insumos" },
    { value: "verduras", label: "Verduras" },
    { value: "carnes", label: "Carnes" },
    { value: "lacteos", label: "Lácteos" },
  ];

  const update = (field: string, value: string) =>
    setForm((s) => ({ ...s, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now just log the values. In real app send to API.
    console.log("Producto a crear:", form);
    alert("Datos enviados (ver consola)");
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ingreso de producto</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <Input
            label="Nombre del producto"
            value={form.name}
            onChange={(v) => update("name", v)}
            required
          />
        </div>

        <div>
          <Input
            label="Marca"
            value={form.brand}
            onChange={(v) => update("brand", v)}
          />
        </div>

        <div>
          <Select
            label="Proveedor"
            value={form.provider}
            options={providers}
            onChange={(v) => update("provider", v)}
          />
        </div>

        <div>
          <Input
            label="Precio unitario"
            type="number"
            value={form.unitPrice}
            onChange={(v) => update("unitPrice", v)}
            placeholder="0.00"
          />
        </div>

        <div>
          <Input
            label="Cantidad inicial"
            type="number"
            value={form.initialQty}
            onChange={(v) => update("initialQty", v)}
            placeholder="0"
          />
        </div>

        <div>
          <Input
            label="Stock mínimo"
            type="number"
            value={form.minStock}
            onChange={(v) => update("minStock", v)}
            placeholder="0"
          />
        </div>

        <div>
          <Select
            label="Unidad de medida"
            value={form.unit}
            options={units}
            onChange={(v) => update("unit", v)}
          />
        </div>

        <div>
          <Select
            label="Categoría"
            value={form.category}
            options={categories}
            onChange={(v) => update("category", v)}
          />
        </div>

        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-stone-700"
          >
            Guardar producto
          </button>
        </div>
      </form>
    </main>
  );
}
