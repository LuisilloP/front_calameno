import { BASE_URL } from '@/api/config';

export interface Producto {
  id: number;
  nombre: string;
  sku: string | null;
  activo: boolean;
  marca_id: number | null;
  categoria_id: number | null;
  uom_id: number;
}

export interface ProductoCreate {
  nombre: string;
  sku?: string | null;
  activo?: boolean;
  marca_id?: number | null;
  categoria_id?: number | null;
  uom_id: number;
}

export interface ProductoUpdate {
  nombre?: string;
  sku?: string | null;
  activo?: boolean;
  marca_id?: number | null;
  categoria_id?: number | null;
  uom_id?: number;
}

export const productosApi = {
  getAll: async (): Promise<Producto[]> => {
    const response = await fetch(`${BASE_URL}/productos/?limit=500`);
    if (!response.ok) {
      throw new Error('Error al cargar productos');
    }
    return response.json();
  },

  getById: async (id: number): Promise<Producto> => {
    const response = await fetch(`${BASE_URL}/productos/${id}`);
    if (!response.ok) {
      throw new Error('Producto no encontrado');
    }
    return response.json();
  },

  create: async (data: ProductoCreate): Promise<Producto> => {
    const response = await fetch(`${BASE_URL}/productos/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'Error al crear producto');
    }
    return response.json();
  },

  update: async (id: number, data: ProductoUpdate): Promise<Producto> => {
    const response = await fetch(`${BASE_URL}/productos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.message || 'Error al actualizar producto');
    }
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/productos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar producto');
    }
  },
};
