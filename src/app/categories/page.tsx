"use client";

import React, { useEffect, useState } from "react";
import { Input } from "../../components/form";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  CategoriesService,
  Categoria,
  CreateCategoriaPayload,
} from "./categories.service";

export default function CategoriesPage() {
  const [formNombre, setFormNombre] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CategoriesService.getAll();
      setCategorias(data);
    } catch (e: any) {
      setError(e.message || "Error cargando categorías");
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
      const payload: CreateCategoriaPayload = { nombre: formNombre.trim() };
      await CategoriesService.create(payload);
      alert("Categoría creada");
      setFormNombre("");
      await load();
    } catch (e: any) {
      alert("Error: " + (e.message || "No fue posible crear"));
    }
  };

  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Agregar categoría
      </h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre de la categoría"
              value={formNombre}
              onChange={setFormNombre}
              required
            />
            <div className="text-right">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded hover:bg-primary/90 transition-colors"
              >
                Guardar categoría
              </button>
            </div>
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Categorías
          </h2>
          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando...</div>
          ) : error ? (
            <div className="text-sm text-red-500">Error: {error}</div>
          ) : categorias.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No hay categorías
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
                  {categorias.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-card-foreground">
                        {c.nombre}
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
        title="Confirmar categoría"
        message={<p>Nombre: {formNombre}</p>}
        confirmLabel="Confirmar"
        cancelLabel="Editar"
        onConfirm={confirmSubmit}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </main>
  );
}
