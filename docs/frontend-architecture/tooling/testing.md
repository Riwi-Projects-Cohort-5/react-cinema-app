# Testing

## Descripción

El proyecto usa **Vitest + React Testing Library** para las pruebas unitarias y de integración. La elección responde a que Vitest integra sin fricción con Vite (mismos aliases, TS y plugins) y es el estándar del ecosistema React/Vite.

## Stack

| Herramienta                    | Rol                                             |
| ------------------------------ | ----------------------------------------------- |
| **Vitest**                     | Test runner (proyecto Vite; reutiliza la config) |
| **React Testing Library (RTL)**| Renderizado y consultas centradas en el usuario |
| `@testing-library/jest-dom`    | Matchers de aserción (`toBeInTheDocument`, …)   |
| `jsdom`                        | Entorno DOM para los tests de componentes       |

## Configuración

Definida en `vite.config.ts` (bloque `test`, vía `defineConfig` de `vitest/config`):

```ts
test: {
  environment: "jsdom",
  setupFiles: ["./src/test/setup.ts"],
  include: ["src/**/*.{test,spec}.{ts,tsx}"],
},
```

Scripts (`package.json`):

| Script       | Comando      | Uso                        |
| ------------ | ------------ | -------------------------- |
| `test`       | `vitest run` | Ejecuta los tests una vez. |
| `test:watch` | `vitest`     | Ejecuta en modo watch.     |

Los aliases de Vite (`@routes`, `@services`, `@features`, …) se resuelven igual que en la app; los tests importan con los mismos alias que el código de producción.

## Infraestructura de test (`src/test/`)

| Archivo                          | Rol                                                               |
| -------------------------------- | ----------------------------------------------------------------- |
| `src/test/setup.ts`              | Matchers de jest-dom, `cleanup()` automático y reset del session store entre tests. |
| `src/test/helpers/renderRouter.tsx` | `renderRouter(initialPath)` — crea un `createMemoryRouter` con las rutas reales (`appRoutes`), lo renderiza y devuelve el router para asertar redirecciones. |
| `src/test/smoke.test.tsx`        | Smoke del base platform: env, `PATHS`, session store y render de un componente compartido. |

## Organización (convención)

- Los tests se **colocalizan** junto al módulo que prueban (`*.test.tsx`), siguiendo la convención de React Testing Library y la cohesión por feature del repo.
- `src/test/` se reserva **solo para infraestructura y smoke**, no para tests de módulos.

```text
src/routes/
├── appRouter.tsx
├── appRouter.test.tsx            # integración del router
└── guards/
    ├── ProtectedRoute.tsx
    ├── ProtectedRoute.test.tsx   # colocalizado
    ├── PublicOnlyRoute.tsx
    └── PublicOnlyRoute.test.tsx
```

- Los tests usan consultas accesibles de RTL (`getByRole`, `getByText`) y aserciones de jest-dom.
- El estado de `useSessionStore` se resetea en cada test vía `setup.ts` para garantizar aislamiento.

## Cobertura actual

| Área                  | Archivo                          | Qué valida                                                        |
| --------------------- | -------------------------------- | ----------------------------------------------------------------- |
| Guard `ProtectedRoute`| `src/routes/guards/ProtectedRoute.test.tsx` | Renderiza el `Outlet` autenticado; redirige a `/auth/login` sin sesión; conserva `state.from`. |
| Guard `PublicOnlyRoute` | `src/routes/guards/PublicOnlyRoute.test.tsx` | Renderiza el `Outlet` sin sesión; redirige a `/` autenticado.     |
| Router (integración)  | `src/routes/appRouter.test.tsx`  | Home (con `MainLayout`), login, redirección de rutas privadas, acceso autenticado (con `AuthenticatedLayout`), dashboard admin, salida de rutas public-only, página 404 y página de error general. |
| Layouts               | `src/layouts/layouts.test.tsx`   | `MainLayout`, `AuthenticatedLayout` y `AdminLayout` renderizan su nav/sidebar y el `Outlet`. |
| Base platform (smoke) | `src/test/smoke.test.tsx`        | Config de entorno, `PATHS`, session store y render de un componente compartido. |

## Documentos relacionados

- [Guardas](../navigation/guards.md) — pruebas de protección de rutas.
- [Layouts](../ui/layouts.md) — pruebas de los app-shells.
- [Convenciones de autenticación](../../api/00-conventions.md#3-autenticación) — el reset de `useSessionStore` entre tests reproduce el flujo de sesión en memoria del contrato.
