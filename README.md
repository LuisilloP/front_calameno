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
