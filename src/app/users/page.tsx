"use client";

import React, { useState, useEffect } from "react";
import { Input } from "../../components/form";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { UsersService, Persona, CreatePersonaPayload } from "./users.service";

export default function UsersPage() {
  // Formulario de creación (nombre, activa)
  const [form, setForm] = useState<{
    nombre: string;
    apellido: string;
    area: string;
    activa: boolean;
  }>({
    nombre: "",
    apellido: "",
    area: "",
    activa: true,
  });

  // Lista de personas existentes
  const [usersList, setUsersList] = useState<Persona[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Cargar lista de personas al montar
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const data = await UsersService.getAll();
      setUsersList(data);
    } catch (error: any) {
      setUsersError(error.message || "Error al cargar personas");
    } finally {
      setLoadingUsers(false);
    }
  };

  const update = (field: keyof typeof form, value: string | boolean) => {
    setForm((s) => ({ ...s, [field]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Abrir modal de confirmación antes de enviar
    setIsConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    setIsConfirmOpen(false);
    try {
      const personaData: CreatePersonaPayload = {
        nombre: form.nombre.trim(),
        activa: true,
        apellidos: form.apellido.trim(),
        area: form.area.trim(),
      };
      await UsersService.create(personaData);
      alert("Persona creada correctamente");
      await loadUsers();
      setForm({ nombre: "", apellido: "", area: "", activa: true });
    } catch (error: any) {
      alert("Error: " + (error.message || "No fue posible guardar"));
    }
  };

  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Agregar persona
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre"
              value={form.nombre}
              onChange={(v) => update("nombre", v)}
              required
            />
            <Input
              label="Apellido"
              value={form.apellido}
              onChange={(v) => update("apellido", v)}
            />
            <Input
              label="Área"
              value={form.area}
              onChange={(v) => update("area", v)}
            />

            <div className="text-right">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded hover:bg-primary/90 transition-colors"
              >
                Guardar persona
              </button>
            </div>
          </form>
        </div>

        {/* Tabla */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Personas existentes
          </h2>

          {loadingUsers ? (
            <div className="text-sm text-muted-foreground">
              Cargando personas...
            </div>
          ) : usersError ? (
            <div className="text-sm text-red-500">Error: {usersError}</div>
          ) : usersList.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No hay usuarios registrados
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Activa
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-card-foreground">
                        {user.nombre}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-card-foreground">
                        {user.activa ? "Sí" : "No"}
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
        title="Confirmar datos"
        message={
          <>
            <p>Confirma que los datos ingresados son correctos:</p>
            <p>Nombre: {form.nombre}</p>
            <p>Apellidos: {form.apellido || "(sin apellidos)"}</p>
            <p>Área: {form.area || "(sin área)"}</p>
          </>
        }
        confirmLabel="Confirmar"
        cancelLabel="Editar"
        onConfirm={confirmSubmit}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </main>
  );
}
