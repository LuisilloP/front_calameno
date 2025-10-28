# Frontend Inventario Calameno

Frontend profesional en Next.js 14 para administrar unidades de medida y productos consumiendo una API Laravel protegida con Sanctum. Incluye arquitectura limpia, estado global con Zustand, formularios con React Hook Form + Zod, tablas con TanStack Table y UI basada en shadcn/ui.

## Stack principal

- Next.js 16 (App Router) + TypeScript estricto
- UI: shadcn/ui, Radix UI, Tailwind CSS, sonner
- Estado: Zustand con persistencia y middlewares
- HTTP: Axios con interceptores, axios-retry y normalizacion de errores
- Formularios: React Hook Form + Zod
- Tablas: @tanstack/react-table

## Puesta en marcha

```bash
# instalar dependencias
pnpm install

# levantar en modo desarrollo
pnpm dev

# ejecutar pruebas unitarias
pnpm test
```

### Dependencias shadcn

```bash
pnpm dlx shadcn@latest init
pnpm add axios zod react-hook-form zustand @tanstack/react-table sonner
```

## Variables de entorno (`.env.local`)

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.tu-dominio.com
# direct | bff (por defecto: direct)
AUTH_MODE=direct
```

## Modos de autenticacion

| Modo   | Descripcion | Token en cliente | Uso recomendado |
|--------|-------------|------------------|-----------------|
| `direct` | El frontend recibe el `plainTextToken` y lo persiste en localStorage. | Si (persistente) | Desarrollo / ambientes cerrados |
| `bff` | Next.js actua como BFF: `/api/auth/login` guarda el token en cookie httpOnly y se proxyea todo por `/api/proxy/*`. | No (httpOnly) | Produccion |

> El middleware solo fuerza autenticacion en modo `bff`, redirigiendo a `/login` cuando falta la cookie httpOnly.

## Arquitectura destacada

- `src/lib`: axios, manejo de errores, paginacion, formularios y utilidades varias.
- `src/services`: base service tipado + servicios de auth, UoM y productos.
- `src/store`: stores Zustand con TTL, invalidaciones y actualizaciones optimistas.
- `src/components`: UI reutilizable (DataTable, dialogos, formularios) + vistas especificas de recursos.
- `src/app/api`: handlers BFF (login/logout) y proxy `/api/proxy` hacia Laravel en modo seguro.
- `docs/USAGE.md`: guia extendida con patrones, snippets y cURL.

## Comandos utiles

| Comando | Accion |
|---------|--------|
| `pnpm dev` | Levanta el entorno local |
| `pnpm build` | Compila la aplicacion |
| `pnpm start` | Sirve la build |
| `pnpm lint` | Ejecuta ESLint |
| `pnpm test` | Ejecuta Vitest en modo CI |

## Consideraciones de seguridad

- Prefiere el modo **BFF** en produccion: el token nunca sale del backend y viaja en cookie httpOnly `Secure`.
- El interceptor 401 fuerza `logout` y redirige a `/login`.
- Las peticiones se enriquecen con `X-Request-Id` (UUID) para correlacion de logs.
- Evita exponer tokens en logs o en el DOM; en modo directo se persisten solo para la demo.

## Pruebas

- `src/__tests__/auth.store.test.ts`: flujo de login/logout en el store global.
- `src/__tests__/uom.service.test.ts`: construccion de query strings en `uomService.list`.

Ejecuta `pnpm test` para validarlas (Vitest con coverage V8).

## Documentacion adicional

Consulta `docs/USAGE.md` para ejemplos de uso (cURL, stores, servicios), convenciones y snippets practicos.
