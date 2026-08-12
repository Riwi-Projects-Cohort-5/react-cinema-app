# Estructura del proyecto

## Descripción

El código se organiza en dos capas: un **app-shell global** bajo `src/` (recursos que envuelven rutas y no pertenecen a una feature) y los **módulos funcionales** bajo `src/features/`.

## App-shell global

```text
src/
├── assets/      # Recursos estáticos (imágenes, estilos)
├── config/      # Variables de entorno y configuración validada
├── layouts/     # App-shells globales: PublicLayout, AuthenticatedLayout, AdminLayout
├── pages/       # Páginas de aplicación: NotFoundPage (404), GeneralErrorPage
├── routes/      # PATHS, appRouter y guardas
├── services/    # Cliente HTTP, errores, sesión, notificaciones, query client
├── shared/      # Componentes e interfaces reutilizables
└── test/        # Infraestructura de testing
```

### Contenido por carpeta

| Carpeta     | Contenido                                                                 |
| ----------- | ------------------------------------------------------------------------- |
| `assets/`   | Recursos estáticos compartidos por toda la aplicación.                    |
| `config/`   | Variables de entorno (`env.ts`) y configuración validada en runtime.      |
| `layouts/`  | Layouts globales (`PublicLayout`, `AuthenticatedLayout`, `AdminLayout`).  |
| `pages/`    | Páginas de nivel de aplicación (`NotFoundPage` 404, `GeneralErrorPage`).  |
| `routes/`   | Constantes de paths (`PATHS`), configuración del router y guardas.        |
| `services/` | Capa transversal de datos y errores: cliente HTTP, `ApiError`, sesión, notificaciones, query client. Implementa las [convenciones de capa de datos](../../api/00-conventions.md#12-capa-de-datos-en-frontend-axios--tanstack-query) del contrato de API. |
| `shared/`   | Componentes, interfaces y utilidades reutilizables por más de una feature. Ver la [guía de tipado](../../type-guides/typing-guide.md#5-organización-de-carpetas-adaptada-a-la-arquitectura-real-feature-based) para las reglas de `shared/interfaces`. |
| `test/`     | Setup y helpers de testing (no tests de módulos).                         |

## Features (`src/features/`)

Cada funcionalidad agrupa sus propios recursos (`components/`, `interfaces/`, `layouts/`, `pages/`, `services/`, `store/`). La estructura se genera con `npm run feature <nombre>`; ver el [generador de features](../../scripts/info.md) para el árbol completo que crea.

> Una feature puede incorporar únicamente los recursos que necesite para su implementación y añadir carpetas si las necesita. Las capas transversales (`api`, `hooks`, `store` top-level) no existen en la raíz: esos recursos viven dentro de cada feature o en `services/` para lo transversal, manteniendo la cohesión por funcionalidad.
>
> Cada feature mapea los módulos del contrato de API (por ejemplo `05-auth/` → `features/auth/`, `02-movies/` → `features/movies/`) según el [catálogo de endpoints](../../api/README.md). Sus `services/` consumen `httpClient` y sus `interfaces/` siguen la [guía de tipado](../../type-guides/typing-guide.md).

## Organización actual de rutas

Los grupos de rutas actuales y su asignación a layouts y guardas se documentan en [Routing](../navigation/routing.md).

## Documentos relacionados

- [Visión general de la arquitectura](./overview.md)
- [Organización por features](./features.md)
- [Layouts](../ui/layouts.md)
- [Routing](../navigation/routing.md)
- [Path aliases](../development/path-aliases.md)
- [Contrato de API](../../api/README.md) y [convenciones compartidas](../../api/00-conventions.md)
- [Guía de tipado (TypeScript)](../../type-guides/typing-guide.md)
- [Generador de features](../../scripts/info.md)
