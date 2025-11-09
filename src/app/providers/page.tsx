"use client";

import React, { useEffect, useState } from "react";
import { Input } from "../../components/form";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  ProvidersService,
  Proveedor,
  CreateProveedorPayload,
} from "./providers.service";

export default function ProvidersPage() {
  const [formNombre, setFormNombre] = useState("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProvidersService.getAll();
      setProveedores(data);
    } catch (e: any) {
      setError(e.message || "Error cargando proveedores");
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
      const payload: CreateProveedorPayload = { nombre: formNombre.trim() };
      await ProvidersService.create(payload);
      alert("Proveedor creado");
      setFormNombre("");
      await load();
    } catch (e: any) {
      alert("Error: " + (e.message || "No fue posible crear"));
    }
  };

  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Agregar proveedor
      </h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre del proveedor"
              value={formNombre}
              onChange={setFormNombre}
              required
            />
            <div className="text-right">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded hover:bg-primary/90 transition-colors"
              >
                Guardar proveedor
              </button>
            </div>
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Proveedores
          </h2>
          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando...</div>
          ) : error ? (
            <div className="text-sm text-red-500">Error: {error}</div>
          ) : proveedores.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No hay proveedores
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
                  {proveedores.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-card-foreground">
                        {p.nombre}
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
        title="Confirmar proveedor"
        message={<p>Nombre: {formNombre}</p>}
        confirmLabel="Confirmar"
        cancelLabel="Editar"
        onConfirm={confirmSubmit}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </main>
  );
}
