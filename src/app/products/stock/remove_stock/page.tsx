"use client";

import React, { useState } from "react";
import { Input, Select } from "../../../../components/form";
export default function RemoveStock() {
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    location: "",
    receiver: "",
    qty: "",
    obs: "",
  });
  const update = (field: string, value: string) =>
    setForm((s) => ({ ...s, [field]: value }));
  const providers = [
    { value: "prov1", label: "Proveedor A" },
    { value: "prov2", label: "Proveedor B" },
    { value: "prov3", label: "Proveedor C" },
  ];
  const names = [
    { value: "prov1", label: "Pedro A" },
    { value: "prov2", label: "Raul B" },
    { value: "prov3", label: "Maria C" },
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
    <main className="min-h-screen bg-[hsl(var(--surface))] p-6 text-[hsl(var(--foreground))]">
      <h1 className="mb-4 text-2xl font-semibold">Egreso de producto</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] p-4 shadow-sm md:grid-cols-2"
      >
        <div className="mb-2 md:col-span-2">
          <Input
            label="Buscar producto"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Escriba el nombre del producto a modificar"
          />
        </div>
        <div>
          <Select
            label="Area de destino de producto: EJ Cocina, Bar, Salon"
            value={form.location}
            options={providers}
            onChange={(v) => update("location", v)}
          />
        </div>
        <div>
          <Select
            label="Recibido por"
            value={form.receiver}
            options={names}
            onChange={(v) => update("receiver", v)}
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
          <Input
            label="Observaciones"
            type="text"
            value={form.obs}
            onChange={(v) => update("obs", v)}
            placeholder="No aplica"
          />
        </div>

        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            className="inline-flex items-center rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition hover:bg-[hsla(var(--accent)/0.9)]"
          >
            Egresar Stock
          </button>
        </div>
      </form>
    </main>
  );
}
