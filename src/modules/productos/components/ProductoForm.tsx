"use client";

import React, { useState, FormEvent } from 'react';
import { Producto, ProductoCreate } from '../api';

interface ProductoFormProps {
  onSubmit: (data: ProductoCreate) => void;
  initialData?: Producto | null;
  onCancel?: () => void;
  categorias: Array<{ id: number; nombre: string }>;
  marcas: Array<{ id: number; nombre: string }>;
  uoms: Array<{ id: number; nombre: string; simbolo: string }>;
}

export function ProductoForm({
  onSubmit,
  initialData,
  onCancel,
  categorias,
  marcas,
  uoms,
}: ProductoFormProps) {
  const [formData, setFormData] = useState<ProductoCreate>({
    nombre: initialData?.nombre || '',
    sku: initialData?.sku || null,
    activo: initialData?.activo ?? true,
    marca_id: initialData?.marca_id || null,
    categoria_id: initialData?.categoria_id || null,
    uom_id: initialData?.uom_id || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre || formData.nombre.trim().length === 0) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.uom_id || formData.uom_id <= 0) {
      newErrors.uom_id = 'La unidad de medida es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Limpiar datos
    const cleanData: ProductoCreate = {
      ...formData,
      sku: formData.sku?.trim() || null,
      marca_id: formData.marca_id || null,
      categoria_id: formData.categoria_id || null,
    };
    
    onSubmit(cleanData);
    
    if (!initialData) {
      // Reset form
      setFormData({
        nombre: '',
        sku: null,
        activo: true,
        marca_id: null,
        categoria_id: null,
        uom_id: 0,
      });
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-foreground">
          Nombre del Producto <span className="text-red-500">*</span>
        </label>
        <input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Ej: Arroz Granel 25kg"
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
        )}
      </div>

      <div>
        <label htmlFor="sku" className="block text-sm font-medium text-foreground">
          SKU (Código)
        </label>
        <input
          id="sku"
          value={formData.sku || ''}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value || null })}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Ej: ARR-25KG-001"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="categoria_id" className="block text-sm font-medium text-foreground">
            Categoría
          </label>
          <select
            id="categoria_id"
            value={formData.categoria_id || ''}
            onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value ? Number(e.target.value) : null })}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sin categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="marca_id" className="block text-sm font-medium text-foreground">
            Marca
          </label>
          <select
            id="marca_id"
            value={formData.marca_id || ''}
            onChange={(e) => setFormData({ ...formData, marca_id: e.target.value ? Number(e.target.value) : null })}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sin marca</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="uom_id" className="block text-sm font-medium text-foreground">
          Unidad de Medida <span className="text-red-500">*</span>
        </label>
        <select
          id="uom_id"
          value={formData.uom_id || ''}
          onChange={(e) => setFormData({ ...formData, uom_id: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Seleccione una unidad</option>
          {uoms.map((uom) => (
            <option key={uom.id} value={uom.id}>
              {uom.nombre} ({uom.simbolo})
            </option>
          ))}
        </select>
        {errors.uom_id && (
          <p className="mt-1 text-sm text-red-500">{errors.uom_id}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="activo"
          type="checkbox"
          checked={formData.activo}
          onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
          className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
        />
        <label htmlFor="activo" className="ml-2 block text-sm text-foreground">
          Producto activo
        </label>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
        >
          {initialData ? 'Actualizar' : 'Crear'} Producto
        </button>
      </div>
    </form>
  );
}
