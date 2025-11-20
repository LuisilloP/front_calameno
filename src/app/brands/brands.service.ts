export interface Marca {
  id: number;
  nombre: string;
}

export interface CreateMarcaPayload {
  nombre: string;
}

const API_URL = "http://localhost:8000/api/v1/marcas/";

export const BrandsService = {
  getAll: async (): Promise<Marca[]> => {
    const res = await fetch(API_URL, { method: "GET" });
    if (!res.ok) throw new Error("Error obteniendo marcas");
    return res.json();
  },
  create: async (marca: CreateMarcaPayload): Promise<Marca> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(marca),
    });
    if (!res.ok) throw new Error("Error creando marca");
    return res.json();
  },
};
