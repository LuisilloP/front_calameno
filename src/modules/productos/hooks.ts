import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productosApi, type Producto, type ProductoCreate, type ProductoUpdate } from './api';

export function useProductos() {
  return useQuery({
    queryKey: ['productos'],
    queryFn: productosApi.getAll,
  });
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: ['productos', id],
    queryFn: () => productosApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProducto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProductoCreate) => productosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      productosApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos', variables.id] });
    },
  });
}

export function useDeleteProducto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => productosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}
