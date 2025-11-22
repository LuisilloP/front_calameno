# Calameno Inventario — Frontend

Frontend en Next.js 16/React 19 + TypeScript para operar el inventario: panel semanal, registro de movimientos y CRUD administrativos. Usa App Router con proveedores globales (tema, React Query y toasts).

## Rutas y modulos
- `/` panel principal (KPIs semanales, feed de movimientos, stock por locacion).
- `/vistas/weekly-stock` y `/(dashboard)/inventory-weekly` muestran el inventario semanal con selector de semana/categorias y export a Excel.
- `/acciones/movimientos` para ingresos/usos/traspasos/ajustes; cachea catalogos y muestra toasts/resumen.
- `/admin/{productos,locaciones,categorias,marcas,proveedores,personas}` CRUD con confirmaciones.
- `/api/categories` y `/api/stock/weekly` proxian al backend o seeds en memoria y devuelven `x-inventory-source` indicando `backend`, `mock` o `mock-fallback`.

La arquitectura esta orientada a features en `src/modules/*` (inventory-weekly, admin, ui, etc.). El layout global vive en `src/components/LayoutContent.tsx` y la barra lateral en `src/components/product_bar.tsx`.

## Configuracion y variables de entorno
- `NEXT_PUBLIC_BASE_URL` (alias `VITE_API_URL`): base URL de la API, normalizada con fallback en `src/config/env.ts`.
- `NEXT_PUBLIC_API_TOKEN`: bearer opcional para el dashboard.
- `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_TEST_TOKEN`: API y token para graficos.
- `NEXT_PUBLIC_TIMEZONE_UI`/`NEXT_PUBLIC_TIMEZONE`: zona horaria para formateo del dashboard.
- `NEXT_PUBLIC_CENTRAL_LOCATION_ID|NAME`: bodega central (fallback 1 y "Bodega Calameno"), parseados en `src/config/warehouse.ts`.
- `INVENTORY_WEEKLY_FORCE_MOCK`, `INVENTORY_WEEKLY_CATEGORIES_PATH`, `INVENTORY_WEEKLY_STOCK_PATH`: controlan la fuente de datos del inventario semanal.

## UX/UI y tema
- Tema claro/oscuro con `next-themes`; tokens HSL definidos en `src/app/globals.css` (background, surface, border, accent) y aplicados en el layout, sidebar y vistas semanales.
- Evita colores hardcodeados: usa clases con `hsl(var(--token))` o los helpers utilitarios (`surface-card`, `text-muted-foreground`, etc.).
- Estados de carga y error visibles en inventario semanal; botones y selects se deshabilitan mientras se procesan peticiones.

## Datos y React Query
- `QueryProvider` (retry=1, staleTime=30s, sin refetch on focus).
- Inventario semanal: claves consistentes en `src/modules/inventory-weekly/query-keys.ts`, normalizacion de categorias/fechas y retry deshabilitado para evitar loops en errores.
- Cliente `src/services/inventoryWeeklyApi.ts` normaliza payloads y evita llamadas sin categorias validas. Seeds en `src/lib/db/inventory-weekly.ts` y helpers de parseo en `src/modules/inventory-weekly/server/params.ts`.

## Scripts
- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de produccion.
- `npm start`: sirve la build.
- `npm run lint`: ESLint.
- `npm test`: Vitest.

## Pruebas
- Ejecuta `npm test` para validar normalizacion de inventario semanal (payloads, query keys, helpers) y flujos de movimientos existentes.
- Ejecuta `npm run lint` para mantener el estilo.

## Contribuir
- Usa imports absolutos con el alias `@` -> `src`.
- Mantener los modulos por feature (separando hooks/services de UI) y los colores a traves de variables de tema.
- Al modificar APIs internas, conservar el header `x-inventory-source` y los mensajes de error claros.
- Documenta cambios relevantes en este README.
