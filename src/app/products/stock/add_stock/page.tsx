"use client";

import React, { useState } from "react";
import { Input, Select } from "../../../../components/form";
export default function AddStock() {
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    price: "",
    qty: "",
    provider: "",
    obs: "",
  });
  const update = (field: string, value: string) =>
    setForm((s) => ({ ...s, [field]: value }));
  const providers = [
    { value: "prov1", label: "Proveedor A" },
    { value: "prov2", label: "Proveedor B" },
    { value: "prov3", label: "Proveedor C" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now just log the values. In real app send to API.
    console.log("Producto a crear:", form);
    alert("Datos enviados (ver consola)");
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implementar búsqueda de productos
    console.log("Buscando producto:", value);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ingreso de producto</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="mb-6">
          <Input
            label="Buscar producto"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Escriba el nombre del producto a modificar"
          />
        </div>
        <div>
          <Input
            label="Precio"
            type="number"
            value={form.price}
            onChange={(v) => update("price", v)}
            placeholder="0.00"
          />
        </div>

        <div>
          <Input
            label="Cantidad"
            type="number"
            value={form.qty}
            onChange={(v) => update("qty", v)}
            placeholder="0"
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
            label="observaciones"
            type="text"
            value={form.obs}
            onChange={(v) => update("obs", v)}
            placeholder="No aplica"
          />
        </div>

        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-stone-700"
          >
            Ingresar Producto
          </button>
        </div>
      </form>
    </main>
  );
}
