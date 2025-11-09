export interface Categoria {
  id: number;
  nombre: string;
}

export interface CreateCategoriaPayload {
  nombre: string;
}

const API_URL = "http://localhost:8000/api/v1/categorias/";

export const CategoriesService = {
  getAll: async (): Promise<Categoria[]> => {
    const res = await fetch(API_URL, { method: "GET" });
    if (!res.ok) throw new Error("Error obteniendo categorías");
    return res.json();
  },
  create: async (cat: CreateCategoriaPayload): Promise<Categoria> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cat),
    });
    if (!res.ok) throw new Error("Error creando categoría");
    return res.json();
  },
};
