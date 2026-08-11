# UI / Base Structure and Layouts

## Alcance

Documenta el subtask **MULT-30** (HU-FE-001 / MULT-29): construcción de la estructura base del
proyecto y los layouts de la aplicación.

Checklist del ticket:

- Estructura modular de carpetas (`api`, `components`, `features`, `hooks`, `layouts`, `pages`,
  `routes`, `services`, `store`, etc.)
- Layouts: público, autenticado y admin
- Página 404
- Página de error general

---

## 1. Estructura modular de carpetas

El proyecto organiza el código en dos capas (ver [`architecture.md`](./architecture.md) y
[`feature-organization.md`](./feature-organization.md)):

### App-shell global (`src/`)

Recursos de aplicación que envuelven rutas y no pertenecen a una feature específica:

```text
src/
├── assets/      # Recursos estáticos (imágenes, estilos)
├── config/      # Variables de entorno y configuración
├── layouts/     # App-shells globales: PublicLayout, AuthenticatedLayout, AdminLayout
├── pages/       # Páginas de aplicación: NotFoundPage (404), GeneralErrorPage
├── routes/      # PATHS, appRouter y guardas
├── services/    # Cliente HTTP, errores, sesión, notificaciones, query client
├── shared/      # Componentes e interfaces reutilizables
└── test/        # Infraestructura de testing
```

### Features (`src/features/`)

Cada funcionalidad agrupa sus propios recursos (`components`, `interfaces`, `layouts`, `pages`,
`services`, `store`, `hooks`). El scaffold se genera con `npm run feature <nombre>`.

> La checklist menciona `api`, `hooks` y `store` como carpetas top-level; en esta arquitectura esos
> recursos viven dentro de cada feature (`features/<feature>/hooks`, `features/<feature>/store`) o en
> `services/` para lo transversal, manteniendo la cohesión por funcionalidad.

---

## 2. Layouts

Los app-shells viven en `src/layouts/` y se re-exportan desde `src/layouts/index.ts`. Todos son rutas
layout sin path que renderizan sus hijos con `<Outlet />`.

| Layout                 | Archivo                          | Nav                                        | Rutas que envuelve                          |
| ---------------------- | -------------------------------- | ------------------------------------------ | ------------------------------------------- |
| **Público**            | `src/layouts/PublicLayout.tsx`   | Inicio, Iniciar sesión, Registrarse        | `/` (Home)                                  |
| **Autenticado**        | `src/layouts/AuthenticatedLayout.tsx` | Perfil, Historial de compras, Checkout | `/profile`, `/purchase-history`, `/checkout` |
| **Admin**              | `src/layouts/AdminLayout.tsx`    | Sidebar: Dashboard                         | `/admin/dashboard`                          |

Los layouts se asignan en `src/routes/appRouter.tsx`:

```tsx
{
  element: <PublicLayout />,
  children: [{ path: PATHS.home, element: <PlaceholderPage title="Home" /> }],
},
```

La navegación usa `<Link>` de React Router con `PATHS`; las rutas privadas se protegen con
`ProtectedRoute` (ver [`routing.md`](./routing.md)). El acceso admin usa `ProtectedRoute` por ahora;
la guarda por rol (Administrator/Employee/Customer) llegará con la feature de autorización.

---

## 3. Página 404

`src/pages/NotFoundPage.tsx` — renderiza un encabezado `404`, un mensaje descriptivo y un enlace
"Volver al inicio". Se registra en la ruta catch-all del router:

```tsx
{
  path: "*",
  element: <NotFoundPage />,
},
```

---

## 4. Página de error general

`src/pages/GeneralErrorPage.tsx` — renderiza el mensaje de error (opcional), un botón "Recargar" y un
enlace "Volver al inicio". Acepta `message` vía props.

Se usa en dos lugares:

1. **Ruta `/error`** en `src/routes/appRouter.tsx` (`PATHS.error`).
2. **Fallback por defecto de `ErrorBoundary`** (`src/shared/components/ErrorBoundary.tsx`) — cuando un
   error es capturado, renderiza `<GeneralErrorPage message={...} />`. Permite override con la prop
   `fallback` si un punto específico necesita un comportamiento distinto.

```tsx
render() {
  if (!this.state.error) return this.props.children;
  if (this.props.fallback) return this.props.fallback;
  return <GeneralErrorPage message={this.state.error.message} />;
}
```

---

## 5. Integración con rutas y aliases

- Los paths se centralizan en `src/routes/paths.ts` (`PATHS`), incluyendo `PATHS.admin.dashboard` y
  `PATHS.error`.
- Aliases nuevos: `@layouts` → `src/layouts` y `@pages` → `src/pages`, definidos en `vite.config.ts` y
  `tsconfig.app.json` (incluyen mapeo exacto del barril y mapeo wildcard). Ver
  [`path-aliases.md`](./path-aliases.md).

---

## 6. Verificación

```bash
npm run build         # tsc -b + vite build (type-check + bundle)
npm run lint          # eslint
npm run test          # vitest run
npm run format:check  # prettier --check
```

Cobertura de tests: `src/routes/appRouter.test.tsx` (integración: layouts, admin, 404, error) y
`src/layouts/layouts.test.tsx` (nav + outlet de cada layout). Ver [`testing.md`](./testing.md).
