export interface Proveedor {
  id: number;
  nombre: string;
}

export interface CreateProveedorPayload {
  nombre: string;
}

const API_URL = "http://localhost:8000/api/v1/proveedores/";

export const ProvidersService = {
  getAll: async (): Promise<Proveedor[]> => {
    const res = await fetch(API_URL, { method: "GET" });
    if (!res.ok) throw new Error("Error obteniendo proveedores");
    return res.json();
  },
  create: async (prov: CreateProveedorPayload): Promise<Proveedor> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prov),
    });
    if (!res.ok) throw new Error("Error creando proveedor");
    return res.json();
  },
};
