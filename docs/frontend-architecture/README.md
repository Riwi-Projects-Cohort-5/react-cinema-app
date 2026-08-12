# Frontend Architecture

## Descripción

Esta documentación define la arquitectura, organización, convenciones y flujo de desarrollo del frontend del proyecto **React Cinema App**.

Su objetivo es establecer un estándar que permita al equipo desarrollar funcionalidades de forma consistente, mantenible y escalable, siguiendo las decisiones de arquitectura definidas para el proyecto.

## Objetivos

- Definir la arquitectura del frontend.
- Documentar la organización por funcionalidades.
- Establecer el flujo de la lógica de negocio.
- Unificar las convenciones de desarrollo.
- Definir el flujo de trabajo del equipo.
- Facilitar la incorporación de nuevos integrantes.

## Contenido

### [Arquitectura](./architecture/)
Estructura y principios de la arquitectura del frontend.

| Documento | Descripción |
| --------- | ----------- |
| [Visión general](./architecture/overview.md) | Arquitectura feature-based y sus principios. |
| [Estructura del proyecto](./architecture/project-structure.md) | Árbol de `src/` y de `features/`. |
| [Organización por features](./architecture/features.md) | Qué es una feature, responsabilidades e independencia. |

### [Patrones](./patterns/)
Cómo se implementa cada funcionalidad.

| Documento | Descripción |
| --------- | ----------- |
| [Lógica de negocio](./patterns/business-logic.md) | Flujo y separación de responsabilidades. |
| [Gestión del estado](./patterns/state-management.md) | Estado local vs. compartido y stores. |

### [Navegación](./navigation/)
Enrutamiento y protección de rutas.

| Documento | Descripción |
| --------- | ----------- |
| [Routing](./navigation/routing.md) | Tipos de rutas y organización del router. |
| [Guardas](./navigation/guards.md) | `ProtectedRoute` y `PublicOnlyRoute`. |

### [Capa de datos](./data-layer/)
Comunicación centralizada con el backend.

| Documento | Descripción |
| --------- | ----------- |
| [Cliente HTTP](./data-layer/http-client.md) | Instancia, interceptores, sesión y query client. |
| [Modelo de error `ApiError`](./data-layer/api-error.md) | Error normalizado de la API. |

### [UI](./ui/)
Estructuras y páginas de nivel de aplicación.

| Documento | Descripción |
| --------- | ----------- |
| [Layouts](./ui/layouts.md) | App-shells: público, autenticado y admin. |
| [Páginas de aplicación](./ui/app-pages.md) | Página 404 y de error general. |

### [Tooling](./tooling/)
Configuración de entorno, errores, calidad de código, despliegue y pruebas.

| Documento | Descripción |
| --------- | ----------- |
| [Variables de entorno](./tooling/environment.md) | Variables y validación en runtime. |
| [Manejo global de errores](./tooling/error-handling.md) | Listeners globales y `ErrorBoundary`. |
| [Notificaciones visuales](./tooling/notifications.md) | Capa de toasts sobre sonner. |
| [Calidad de código](./tooling/code-quality.md) | ESLint y Prettier. |
| [Despliegue](./tooling/deployment.md) | Docker y nginx. |
| [Testing](./tooling/testing.md) | Vitest + React Testing Library. |

### [Desarrollo](./development/)
Guías del día a día del equipo.

| Documento | Descripción |
| --------- | ----------- |
| [Flujo de trabajo](./development/workflow.md) | De la Historia de Usuario al Merge. |
| [Convenciones de código](./development/coding-conventions.md) | Nomenclatura, imports y exportaciones. |
| [Buenas prácticas](./development/best-practices.md) | Prácticas de código limpio y escalable. |
| [Path aliases](./development/path-aliases.md) | Aliases de importación. |

## Documentación complementaria del proyecto

Esta guía se apoya en la documentación del repositorio que define los contratos y herramientas con los que trabaja el frontend:

| Guía | Descripción | Relación |
| ---- | ----------- | -------- |
| [Contrato de API](../api/README.md) | Catálogo de endpoints y mapa *Historia de usuario → Endpoints*. | Los servicios de cada feature consumen estos contratos; [00-conventions.md](../api/00-conventions.md) define el envelope de error, paginación y autenticación que implementan `http-client`, `api-error` y las guardas. |
| [Guía de tipado](../type-guides/typing-guide.md) | Estándares TypeScript: `type` vs `interface`, ubicación de tipos, checklist de PR. | Aplica a `shared/interfaces`, `features/*/interfaces` y al tipado de servicios. |
| [Generador de features](../scripts/info.md) | Script `npm run feature <nombre>` y el scaffold que genera. | Crea la estructura de `features/<feature>/` documentada en [Estructura del proyecto](./architecture/project-structure.md). |

## Alcance

Esta documentación está dirigida exclusivamente al equipo de **Frontend** y complementa la documentación existente del proyecto. Su contenido deberá mantenerse actualizado conforme evolucione la arquitectura y las decisiones técnicas del equipo.
