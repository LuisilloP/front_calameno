# Calameno Inventario – Frontend

Frontend en Next.js para operar el inventario de Calameno: panel de métricas, registro de movimientos y CRUD administrativos conectados a la API (`/api/v1`) de Laravel/FastAPI.

## Funcionalidad clave
- **Panel principal** (`/`): KPIs de la última semana, feed paginado/filtrable de movimientos, stock por locación y monitores de ajustes. Usa `NEXT_PUBLIC_API_TOKEN` si el backend exige Bearer y permite fijar zona horaria con `NEXT_PUBLIC_TIMEZONE_UI`.
- **Registro de movimientos** (`/acciones/movimientos`): un solo formulario para ingresos, usos, traspasos y ajustes. Valida cantidades, bloqueo de campos según tipo, confirma UOM, cachea catálogos durante la sesión y muestra toasts/resumen del movimiento creado.
- **Administración** (`/admin/*`): CRUD de productos, locaciones, categorías, marcas, proveedores y personas con React Query (cache + refetch), formularios validados, confirmaciones para acciones destructivas, paginación `skip/limit` y mensajes específicos ante duplicados o 404.
- **Inventario semanal y vistas** (`/vistas/weekly-stock` y `(dashboard)/inventory-weekly`): selector de semana y categorías, grilla con estados de stock, exportación a CSV y fallback a seeds en memoria cuando la API no responde o `INVENTORY_WEEKLY_FORCE_MOCK=true`.
- **Experiencia de uso**: layout con sidebar fijo, tema claro/oscuro, tipografías Geist, toasts globales, loaders/skeletons coherentes y componentes reutilizables en `src/components` y `src/modules`.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript.
- Tailwind CSS 4 para estilos utilitarios.
- TanStack React Query 5 para cache y sincronización de datos.
- Chart.js + react-chartjs-2 para visualizaciones.
- Vitest para pruebas unitarias.

## Requisitos previos
- Node.js 18.18+ y npm 10+.
- API de backend accesible en la URL configurada (`/api/v1`).

## Puesta en marcha local
1) Duplica `.env` y ajusta valores mínimos:
```dotenv
NEXT_PUBLIC_BASE_URL=http://127.0.0.1:8000/api/v1
# Opcional: bearer para el dashboard
NEXT_PUBLIC_API_TOKEN=token-backend
```
2) Instala dependencias y arranca el servidor de desarrollo:
```bash
npm install
npm run dev
```
3) Abre `http://localhost:3000`.

## Scripts disponibles
- `npm run dev`: servidor Next en modo desarrollo.
- `npm run build`: build de producción.
- `npm start`: sirve la build generada.
- `npm run lint`: ESLint.
- `npm test`: Vitest (include tests de API y seeds in-memory).

## Variables de entorno relevantes
Obligatorias/clave:
- `NEXT_PUBLIC_BASE_URL`: base de la API (sin slash final). Alias aceptado: `VITE_API_URL`.

Opcionales según módulo:
- `NEXT_PUBLIC_API_TOKEN`: token Bearer para endpoints del dashboard.
- `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_TEST_TOKEN`: base y token para los gráficos en `src/components/graphics`.
- `NEXT_PUBLIC_TIMEZONE_UI` (`NEXT_PUBLIC_TIMEZONE` como respaldo): zona horaria para formatear fechas en el dashboard.
- `NEXT_PUBLIC_CENTRAL_LOCATION_ID` y `NEXT_PUBLIC_CENTRAL_LOCATION_NAME` (fallbacks a `1` y "Bodega Calameno").
- `INVENTORY_WEEKLY_FORCE_MOCK`: `true` fuerza uso de seeds en memoria.
- `INVENTORY_WEEKLY_CATEGORIES_PATH` y `INVENTORY_WEEKLY_STOCK_PATH`: permiten personalizar los paths cuando se proxea al backend.

## Estructura rápida
- `src/app`: rutas del App Router. Incluye handlers API (`src/app/api/**`) que proxéan al backend o a mocks.
- `src/modules`: módulos feature-driven (admin, inventory-weekly, productos, etc.) con API, hooks y componentes cohesivos.
- `src/services`: clientes HTTP y normalizadores (`dashboardApi`, `movementsApi`, `inventoryWeeklyApi`).
- `src/lib`: helpers compartidos (validaciones de movimientos, seeds de inventario semanal, utilidades HTTP/auth).
- `src/components`: UI reutilizable (layout, sidebar, formularios, toasts, confirm dialogs, gráficos).
- `src/config`: configuración de bodega (`warehouse.ts`).

## Integraciones y datos mock
- Las rutas internas `/api/categories` y `/api/stock/weekly` actúan como proxy hacia la API real; si falla o falta, responden con los seeds de `src/lib/db/inventory-weekly.ts` e indican la fuente en la cabecera `x-inventory-source`.
- `movementsApi` consume `/productos`, `/locaciones`, `/personas`, `/proveedores`, `/uoms` y publica en `/movimientos`; propaga `error_detail` del backend al UI.
- El dashboard normaliza respuestas tolerantes a campos faltantes y reintenta automáticamente errores 5xx/timeout.

## Pruebas
- Ejecuta `npm test` para validar seeds (`inventoryWeeklyDb`) y la construcción de payloads/errores en `movementsApi`.
- Vitest usa el alias `@` → `src`, definido en `vitest.config.ts`.

## Notas de desarrollo
- El layout global está en `src/components/LayoutContent.tsx`; las páginas se montan dentro de ese contenedor.
- Path alias `@` apunta a `src/`. Usa imports absolutos para mantener consistencia.
- El tema (claro/oscuro) se controla con `ThemeProvider` (`next-themes`) y se expone en la barra lateral.

Mantén este README actualizado a medida que evolucionen las vistas o endpoints.
