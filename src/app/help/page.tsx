"use client";

import React from "react";

const Card = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))]/80 p-4 shadow-sm ${className}`}
  >
    <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h2>
    <div className="mt-3 space-y-2 text-sm text-[hsl(var(--muted-strong))]">{children}</div>
  </section>
);

export default function HelpPage() {
  return (
    <main className="min-h-screen p-6">
      <header className="mb-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-[hsl(var(--muted))]">Centro de ayuda</p>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Guia rapida</h1>
        <p className="text-[hsl(var(--muted))]">
          Pasos sencillos para moverte, cargar datos, registrar movimientos y leer los reportes.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Antes de empezar">
          <ul className="list-disc space-y-1 pl-4">
            <li>
              Crea o revisa <strong>categorias</strong> y <strong>marcas</strong>.
            </li>
            <li>
              Agrega <strong>proveedores</strong> y <strong>personas</strong> (quien consume).
            </li>
            <li>
              Define <strong>sectores</strong> (Bodega Calameno, Barra, Cocina, Camara fria, etc.).
            </li>
            <li>
              Da de alta los <strong>productos</strong> con SKU, unidad, categoria, marca y proveedor.
            </li>
            <li>
              Luego registra <strong>ingresos</strong> y <strong>usos</strong> en Registro de movimientos.
            </li>
          </ul>
        </Card>

        <Card title="Como navegar">
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong>Barra lateral:</strong> accesos a Panel principal, Vistas y reportes, Registro de movimientos y
              Administracion (productos, sectores, categorias, marcas, proveedores, personas).
            </li>
            <li>
              <strong>Tema claro/oscuro:</strong> boton sol/luna en el header del menu lateral.
            </li>
            <li>
              <strong>Toasts:</strong> confirmaciones y errores aparecen arriba a la derecha.
            </li>
            <li>
              <strong>Perfil:</strong> el avatar en el pie del menu es solo informativo.
            </li>
          </ul>
        </Card>

        <Card title="Registrar movimientos">
          <p>Menu: Registro de movimientos. Todo descuenta o suma en la Bodega Calameno.</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong>Ingreso:</strong> producto, cantidad, proveedor y nota (opcional). Suma stock en Bodega Calameno.
            </li>
            <li>
              <strong>Uso:</strong> producto, cantidad y sector donde se consume (Barra, Cocina, etc.). Descuenta del stock
              central; el sector es solo referencia.
            </li>
            
          </ul>
        </Card>

        <Card title="Panel principal (dashboard)">
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong>Graficos:</strong> movimientos totales, productos distintos y relacion uso/ingreso.
            </li>
            <li>
              <strong>Top categorias y productos usados:</strong> cambia dias y top con los selects.
            </li>
            <li>
              <strong>Movimientos recientes:</strong> filtra por tipo, producto y fecha; pagina y cambia el limite.
            </li>
            <li>
              <strong>Acceso rapido al stock semanal:</strong> en Vistas y reportes.
            </li>
          </ul>
        </Card>

        <Card title="Vistas y reportes">
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong>Stock semanal:</strong> elige semana y filtra por categoria. Muestra stock por sector y producto.
            </li>
            <li>
              <strong>Exportar Excel:</strong> el boton Exportar genera XLSX segun los filtros aplicados.
            </li>
            <li>
              <strong>Fuente de datos:</strong> el banner indica si la info viene del backend o de datos de prueba.
            </li>
          </ul>
        </Card>

        <Card title="Catalogos (Administracion)">
          <p>Son necesarios antes de registrar movimientos. Menu: Administracion.</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong>Productos:</strong> nombre, SKU, unidad, categoria, marca, proveedor.
            </li>
            <li>
              <strong>Sectores:</strong> bodegas y puntos de consumo.
            </li>
            <li>
              <strong>Categorias y Marcas:</strong> para agrupar y reportar.
            </li>
            <li>
              <strong>Proveedores y Personas:</strong> para ingresos y usos.
            </li>
          </ul>
        </Card>

       
      </div>
    </main>
  );
}
