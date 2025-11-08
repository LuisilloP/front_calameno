// Tipos ajustados a la API real de personas
export interface Persona {
  id: number;
  nombre: string;
  activa: boolean;
}

// Payload permitido al crear (el backend puede ignorar campos extra si no existen)
export interface CreatePersonaPayload {
  nombre: string;
  activa: boolean;
  apellidos?: string;
  area?: string;
}

const API_URL = "http://localhost:8000/api/v1/personas/"; // terminar en /

export const UsersService = {
  // Obtener todas las personas
  getAll: async (): Promise<Persona[]> => {
    try {
      const response = await fetch(API_URL, { method: "GET" });

      if (!response.ok) {
        throw new Error("Error obteniendo personas");
      }

      return response.json();
    } catch (error) {
      console.error("Error en getAll:", error);
      throw error;
    }
  },

  // Obtener persona por ID
  getById: async (id: number): Promise<Persona> => {
    try {
      const response = await fetch(`${API_URL}${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error obteniendo persona");
      }

      return response.json();
    } catch (error) {
      console.error("Error en getById:", error);
      throw error;
    }
  },

  // Crear persona (permite campos adicionales en la creación)
  create: async (persona: CreatePersonaPayload): Promise<Persona> => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(persona),
      });

      if (!response.ok) {
        throw new Error("Error creando persona");
      }

      return response.json();
    } catch (error) {
      console.error("Error en create:", error);
      throw error;
    }
  },

  // Actualizar persona (no usado en esta página, pero disponible)
  update: async (id: number, persona: Partial<Persona>): Promise<Persona> => {
    try {
      const response = await fetch(`${API_URL}${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(persona),
      });

      if (!response.ok) {
        throw new Error("Error actualizando persona");
      }

      return response.json();
    } catch (error) {
      console.error("Error en update:", error);
      throw error;
    }
  },

  // Eliminar persona (no usado en esta página)
  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error eliminando persona");
      }
    } catch (error) {
      console.error("Error en delete:", error);
      throw error;
    }
  },
};
