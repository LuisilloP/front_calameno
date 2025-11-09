export interface Locacion {
  id: number;
  nombre: string;
  activa: boolean;
}

export interface CreateLocacionPayload {
  nombre: string;
  activa?: boolean; // por si luego se agrega toggle, default true
}

const API_URL = "http://localhost:8000/api/v1/locaciones/"; // terminar en /

export const LocationsService = {
  getAll: async (): Promise<Locacion[]> => {
    const res = await fetch(API_URL, { method: "GET" });
    if (!res.ok) throw new Error("Error obteniendo locaciones");
    return res.json();
  },
  create: async (loc: CreateLocacionPayload): Promise<Locacion> => {
    const body = { activa: true, ...loc };
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Error creando locación");
    return res.json();
  },
};
