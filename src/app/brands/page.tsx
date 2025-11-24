"use client";

import React, { useEffect, useState } from "react";
import { Input } from "../../components/form";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  BrandsService,
  Marca,
  CreateMarcaPayload,
} from "./brands.service";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Error inesperado";

export default function BrandsPage() {
  const [formNombre, setFormNombre] = useState("");
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BrandsService.getAll();
      setMarcas(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error) || "Error cargando marcas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) {
      alert("Ingresa un nombre");
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    setIsConfirmOpen(false);
    try {
      const payload: CreateMarcaPayload = { nombre: formNombre.trim() };
      await BrandsService.create(payload);
      alert("Marca creada");
      setFormNombre("");
      await load();
    } catch (error: unknown) {
      alert("Error: " + (getErrorMessage(error) || "No fue posible crear"));
    }
  };

  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Agregar marca
      </h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre de la marca"
              value={formNombre}
              onChange={setFormNombre}
              required
            />
            <div className="text-right">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded hover:bg-primary/90 transition-colors"
              >
                Guardar marca
              </button>
            </div>
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Marcas
          </h2>
          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando...</div>
          ) : error ? (
            <div className="text-sm text-red-500">Error: {error}</div>
          ) : marcas.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No hay marcas
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Nombre
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {marcas.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-card-foreground">
                        {m.nombre}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Confirmar marca"
        message={<p>Nombre: {formNombre}</p>}
        confirmLabel="Confirmar"
        cancelLabel="Editar"
        onConfirm={confirmSubmit}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </main>
  );
}
