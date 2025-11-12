## Calameno · Frontend de inventario

Aplicación Next.js para operar inventario (dashboard y registro de movimientos) conectada al backend FastAPI/Laravel disponible en `/api/v1`.

### Entorno local

1. Copia `.env` (ya existe un ejemplo con `NEXT_PUBLIC_BASE_URL=http://127.0.0.1:8000/api/v1`).
2. Instala dependencias y levanta el servidor:

```bash
npm install
npm run dev
```

El panel vive en `http://localhost:3000`. La vista de registro de movimientos está en `/acciones/movimientos` y también aparece en el menú lateral.

### Scripts útiles

- `npm run dev` · servidor Next.
- `npm run lint` · ESLint (puede reportar pendientes en otras vistas legacy).
- `npm test` · Vitest (validaciones y consumo de API ficticio).

---

## UI Story · Registro de movimientos

### Objetivo

Registrar ingresos, usos, traspasos y ajustes desde un único formulario, con validaciones espejo del backend y feedback inmediato del resultado de la API.

### Endpoints usados

  - `GET /api/v1/productos`
  - `GET /api/v1/locaciones`
  - `GET /api/v1/personas`
  - `GET /api/v1/proveedores`
  - `GET /api/v1/uoms`
  - `POST /api/v1/movimientos`

Los catálogos se cachean en memoria durante la sesión y cada tarjeta expone estados `loading`, `empty`, `error+retry`.

### Validaciones implementadas

- `producto_id` obligatorio.
- `cantidad` numérica, > 0 y máx. 3 decimales.
- Confirmación explícita de la unidad de medida mostrada.
- Reglas por tipo:
  - **Ingreso**: solo destino, bloquea origen.
  - **Uso**: solo origen, bloquea destino.
  - **Traspaso**: exige ambas locaciones distintas.
  - **Ajuste**: requiere al menos una locación.
- Nota opcional con `trim` para evitar cadenas vacías.

### Estados de UI

- Uso extensivo de loaders y mensajes localizados en ES.
- Formulario bloqueado durante el submit con spinner en el botón.
- En éxito: reset del formulario, toast y resumen del movimiento creado (id, fecha, tipo, locaciones, cantidad).
- En error: se muestra `error_detail` y se ofrece reintentar de inmediato.

### Próximos pasos sugeridos

1. Persistir los catálogos en IndexedDB para conservarlos entre sesiones.
2. Enriquecer el resumen del último movimiento con nombres que provengan del backend (cuando se incluya en la respuesta).
3. Permitir adjuntar evidencia (foto/documento) cuando se trate de ajustes.
4. Guardar el usuario autenticado responsable del movimiento cuando el backend lo exponga.

---

Este README se centra en la funcionalidad de registro de movimientos. Ajusta el contenido según evolucione el proyecto.
## Modulo Admin

Las vistas CRUD para locaciones, categorias, proveedores y personas viven en /admin/{entidad} y comparten la estetica translucida del dashboard.

### Configuracion rapida

1. Declara la URL base que consumen los hooks en .env: VITE_API_URL=http://localhost:8000/api/v1.
2. Instala dependencias y levanta el servidor con pnpm install seguido de pnpm dev (o npm install && npm run dev).

### Pruebas manuales recomendadas

Para cada ruta (/admin/locaciones, /admin/categorias, /admin/proveedores, /admin/personas):

1. **Crear** un registro nuevo. El checkbox Activa viene marcado; al guardar aparece un toast verde y la fila se agrega a la tabla.
2. **Editar** el registro y confirma que los datos cambian tras el refetch automatico de React Query.
3. **Duplicado**: intenta crear otra fila con el mismo nombre y verifica el mensaje "Ya existe ..." en formulario y toast.
4. **Eliminar / Desactivar**:
   - Locaciones solo permiten activar o desactivar; las desactivaciones muestran un confirm dialog antes de aplicar el cambio.
   - Categorias, proveedores y personas permiten eliminar ademas de activar/desactivar; ambas acciones destructivas piden confirmacion y refrescan la tabla.
5. **Paginacion**: cambia a la pagina 2 con distintos limites (10/25/50) y revisa en la ventana de red que la peticion use skip = pageIndex * limit.

Tambien valida los estados vacios, skeleton loaders y que los codigos *_duplicate y *_not_found disparan mensajes especificos; el resto de errores activa el banner "No se pudo completar la operacion".

## Gestion de Productos

La vista administrativa de productos vive en `/admin/productos` y sigue la misma arquitectura feature-driven.

### Flujo de trabajo

1. **Tabla**: usa paginacion (`skip/limit`) y filtros locales por nombre/SKU. Las columnas muestran unidad, marca, categoria y estado.
2. **Catálogos**: los selectores del formulario se nutren de `/uoms`, `/marcas` y `/categorias`, cacheados con React Query.
3. **Formulario**: `nombre` obligatorio, `sku` opcional (se sugiere en mayusculas), `uom_id` requerido, `marca_id`/`categoria_id` opcionales y `activo` encendido por defecto.
4. **Acciones**: editar, eliminar y togglear activos se ejecutan inline con confirmaciones y toasts coherentes.
5. **Errores**: los códigos `producto_sku_duplicate`, `*_not_found` y `*_error` muestran mensajes específicos en banners/formularios con opciones para reintentar o refrescar.

### Pruebas manuales sugeridas

1. Crear un producto con SKU nuevo; confirmar que aparece en la tabla.
2. Repetir el SKU para validar el mensaje “SKU ya registrado”.
3. Editar un producto cambiando UOM/Marca/Categoría y verificar la persistencia tras el refetch.
4. Usar el toggle de estado para desactivar y volver a activar el producto.
5. Eliminar un producto y confirmar que la tabla se actualiza sin errores 404.
## Guia de layout

La aplicacion usa `src/components/LayoutContent.tsx` como cascaron global. Este componente fija la barra lateral (`src/components/product_bar.tsx`) en un <aside> pegado al tope y expone un <main> central con padding consistente. Cualquier vista en `src/app/**/page.tsx` se renderiza dentro de ese `main`, por lo que solo necesita preocuparse por su propio contenido (usa `AdminPageShell` u otro contenedor si quieres titulares/secciones).

- **Sidebar**: agrega o reordena enlaces en `product_bar.tsx`, respetando las secciones `Funciones principales`, `Operaciones` y `Administracion` para mantener coherencia.
- **Vistas**: crea componentes de pagina dentro de `src/modules/<feature>/pages` y monta la ruta en `src/app/.../page.tsx`. El contenedor global ya provee fondo, anchos maximos y tipografia.
- **Componentes reutilizables**: ubicalos en `src/modules/<feature>/components` o en `src/components/ui` si son genericos. Mantener esta arquitectura evita desalinear la barra y asegura que todas las pantallas compartan el mismo estilo del dashboard/acciones.
