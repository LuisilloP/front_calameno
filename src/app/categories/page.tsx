"use client";

import React, { useEffect, useState } from "react";
import { Input } from "../../components/form";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
  CategoriesService,
  Categoria,
  CreateCategoriaPayload,
} from "./categories.service";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

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
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error cargando categorías"));
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
    } catch (err: unknown) {
      alert("Error: " + getErrorMessage(err, "No fue posible crear"));
    }
  };

  return (
    <main className="min-h-screen p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Agregar categoría
      </h1>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
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
                className="rounded bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Guardar categoría
              </button>
            </div>
          </form>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
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
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Nombre
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {categorias.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/50">
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-card-foreground">
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
