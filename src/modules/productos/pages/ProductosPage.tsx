"use client";

import React, { useState } from 'react';
import { PackagePlus, PackageX } from 'lucide-react';
import { ProductoForm } from '../components/ProductoForm';
import { ProductosTable } from '../components/ProductosTable';
import { useProductos, useCreateProducto, useUpdateProducto, useDeleteProducto } from '../hooks';
import { Producto, ProductoCreate } from '../api';
import { useCatalogResource } from '@/hooks/useCatalogResource';
import { BASE_URL } from '@/api/config';

export function ProductosPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  // Datos
  const { data: productos, isLoading, error } = useProductos();
  const { data: uomsRaw = [] } = useCatalogResource('uoms');
  
  // Fetch categorias y marcas directamente
  const [categorias, setCategorias] = React.useState<Array<{ id: number; nombre: string }>>([]);
  const [marcas, setMarcas] = React.useState<Array<{ id: number; nombre: string }>>([]);
  
  React.useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [catResponse, marcasResponse] = await Promise.all([
          fetch(`${BASE_URL}/categorias/?limit=500`),
          fetch(`${BASE_URL}/marcas/?limit=500`),
        ]);
        
        if (catResponse.ok) {
          setCategorias(await catResponse.json());
        }
        if (marcasResponse.ok) {
          setMarcas(await marcasResponse.json());
        }
      } catch (error) {
        console.error('Error loading catalogs:', error);
      }
    };
    loadCatalogs();
  }, []);
  
  // Mapear UOMs para incluir simbolo (usando abreviatura)
  const uoms = uomsRaw.map(uom => ({
    id: uom.id,
    nombre: uom.nombre,
    simbolo: uom.abreviatura || uom.nombre,
  }));

  // Mutations
  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const deleteMutation = useDeleteProducto();

  const handleCreate = async (data: ProductoCreate) => {
    try {
      await createMutation.mutateAsync(data);
      setShowForm(false);
      alert('Producto creado exitosamente');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al crear producto');
    }
  };

  const handleUpdate = async (data: ProductoCreate) => {
    if (!editingProducto) return;

    try {
      await updateMutation.mutateAsync({
        id: editingProducto.id,
        data,
      });
      setEditingProducto(null);
      setShowForm(false);
      alert('Producto actualizado exitosamente');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar producto');
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      alert('Producto eliminado exitosamente');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar producto');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProducto(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Cargando productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Productos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona el catálogo de productos del inventario
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProducto(null);
              setShowForm(!showForm);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
          >
            {showForm ? (
              <>
                <PackageX className="w-4 h-4" />
                Cancelar
              </>
            ) : (
              <>
                <PackagePlus className="w-4 h-4" />
                Nuevo Producto
              </>
            )}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-6 bg-card border border-border rounded-lg">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <ProductoForm
              onSubmit={editingProducto ? handleUpdate : handleCreate}
              initialData={editingProducto}
              onCancel={handleCancel}
              categorias={categorias}
              marcas={marcas}
              uoms={uoms}
            />
          </div>
        )}

        <ProductosTable
          productos={productos || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          categorias={categorias}
          marcas={marcas}
          uoms={uoms}
        />
      </div>
    </div>
  );
}
