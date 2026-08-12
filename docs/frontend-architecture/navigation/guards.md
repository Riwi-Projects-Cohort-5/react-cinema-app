# Guardas de rutas

## Descripción

Las guardas son rutas layout sin path que envuelven grupos de rutas y controlan el acceso según el estado de autenticación del usuario. Viven en `src/routes/guards/` y renderizan sus hijos con `<Outlet />`.

## Guardas disponibles

| Guarda            | Comportamiento                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| `ProtectedRoute`  | Requiere sesión activa; si no la hay, redirige a `/auth/login`.                                    |
| `PublicOnlyRoute` | Requiere **no** estar autenticado; si el usuario ya tiene sesión, redirige a `/`.                  |

## ProtectedRoute

Protege rutas privadas (perfil, historial de compras, checkout, admin).

- Si no hay `accessToken` en `useSessionStore` (`@services/session`), redirige a `/auth/login` con `replace` y guarda `state.from` — la ruta a la que se dirigía — para poder regresar tras autenticarse.
- Si hay sesión, renderiza el `<Outlet />` con sus hijos.

> El `accessToken` vive solo en memoria, según el contrato de API ([convenciones de autenticación](../../api/00-conventions.md#3-autenticación)); la sesión se crea al completar `POST /auth/login` ([contrato](../../api/endpoints/05-auth/20-POST-auth-login.md)) y se mantiene con `POST /auth/refresh` ([contrato](../../api/endpoints/05-auth/21-POST-auth-refresh.md)).

## PublicOnlyRoute

Protege rutas que no deben mostrarse a usuarios autenticados (login, register).

- Si el usuario ya está autenticado, redirige a `/`.
- Si no, renderiza el `<Outlet />` con sus hijos.

## Acceso por rol

El acceso por rol (Administrator/Employee/Customer) llegará con la feature de autorización; por ahora el grupo admin usa `ProtectedRoute`.

## Pruebas

Los tests de ambas guardas se colocalizan junto a su código (`*.test.tsx`); la cobertura y la infraestructura se documentan en [Testing](../tooling/testing.md).

## Documentos relacionados

- [Routing](./routing.md) — grupos de rutas que protegen.
- [Gestión del estado](../patterns/state-management.md) — sesión (`useSessionStore`).
- [Cliente HTTP](../data-layer/http-client.md) — ciclo de vida de la sesión.
- [Contrato de API](../../api/README.md) — módulo de autenticación (`05-auth/`) y convenciones de sesión.
