# Routing

## Descripción

El sistema de enrutamiento es responsable de gestionar la navegación entre las diferentes vistas de la aplicación. Su objetivo es mantener una navegación organizada, segura y escalable, facilitando el acceso a las funcionalidades según el estado de autenticación y el rol del usuario.

## Principios

- Cada ruta debe representar una funcionalidad específica.
- Las rutas deben mantenerse organizadas por módulos.
- Las rutas protegidas deben validar la autenticación del usuario.
- El acceso a funcionalidades deberá respetar los permisos definidos por el negocio.

## Tipos de rutas

### Rutas públicas

Permiten el acceso sin necesidad de autenticación.

Ejemplos: Login, Register, Home, Movies.

### Rutas protegidas

Requieren que el usuario haya iniciado sesión.

Ejemplos: Profile, Purchase History, Checkout.

### Rutas por rol

Algunas funcionalidades podrán restringirse según el rol del usuario (Administrator, Employee, Customer).

## Organización

Las rutas se mantienen agrupadas según la funcionalidad correspondiente. La configuración del enrutamiento debe permitir un crecimiento progresivo de la aplicación sin afectar los módulos existentes.

### Constantes de rutas

Los paths se centralizan en `src/routes/paths.ts` (`PATHS`) y se referencian desde la configuración del router y las guardas — nunca se hardcodean URLs en componentes.

### Configuración del router

`src/routes/appRouter.tsx` define `createBrowserRouter` con los siguientes grupos:

| Grupo         | Rutas                                                      | Layout                | Guard             |
| ------------- | ---------------------------------------------------------- | --------------------- | ----------------- |
| Público       | `/` (Home)                                                 | `PublicLayout`        | —                 |
| Solo público  | `/auth/login`, `/auth/register`                            | —                     | `PublicOnlyRoute` |
| Autenticado   | `/profile`, `/purchase-history`, `/checkout`               | `AuthenticatedLayout` | `ProtectedRoute`  |
| Admin         | `/admin/dashboard`                                         | `AdminLayout`         | `ProtectedRoute`  |
| Error general | `/error`                                                   | —                     | —                 |
| Catch-all     | `*` (404)                                                  | —                     | —                 |

> El grupo de autenticación (`/auth/login`, `/auth/register`) corresponde a los endpoints del módulo `05-auth/` del contrato de API (login, refresh, logout, etc.), que gobiernan la sesión que validan las guardas. Ver [convenciones de autenticación](../../api/00-conventions.md#3-autenticación).

## Buenas prácticas

- Evitar rutas duplicadas.
- Utilizar nombres descriptivos.
- Centralizar la configuración de rutas.
- Mantener protegidas las rutas privadas.
- Evitar lógica de negocio dentro de la configuración del enrutamiento.

## Documentos relacionados

- [Guardas](./guards.md) — protección de rutas pública/autenticada.
- [Layouts](../ui/layouts.md) — app-shells que envuelven los grupos de rutas.
- [Páginas de aplicación](../ui/app-pages.md) — 404 y página de error general.
- [Contrato de API](../../api/README.md) — módulo de autenticación y mapa de rutas por historia de usuario.
