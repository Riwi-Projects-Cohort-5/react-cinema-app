# Cliente HTTP

## Responsabilidad

Centralizar toda la comunicación con la API en una única capa (`src/services/`). Ningún componente ni feature debe llamar a `axios`/`fetch` directamente: todos los servicios de feature pasan por `httpClient`.

## Estructura

```text
src/services/
├── api-error.ts        # Modelo ApiError (ver api-error.md)
├── httpClient.ts       # Instancia de axios + interceptores
├── queryClient.ts      # Cliente de TanStack Query
├── session.ts          # Sesión transversal (accessToken, refreshAccessToken, clearSession)
├── notify.ts           # Capa de notificaciones (ver tooling/notifications.md)
└── index.ts            # Barrel de exportaciones
```

## Configuración de la instancia

`httpClient` se crea con `axios.create()`:

| Configuración     | Valor                                             | Origen                                   |
| ----------------- | ------------------------------------------------- | ---------------------------------------- |
| `baseURL`         | `VITE_API_BASE_URL` o `/api/v1` por defecto       | `@config/env`                            |
| `timeout`         | `VITE_API_TIMEOUT_MS` o `15000` ms por defecto    | `@config/env`                            |
| `Accept`          | `application/json`                                | —                                        |
| `Accept-Language` | `es`                                              | Los mensajes de error los localiza el backend |

La URL base se configura en un único lugar (`.env.example`) y nunca se hardcodea en componentes (ver [coding-conventions.md](../development/coding-conventions.md)).

## Interceptores

### Request

- **`X-Request-Id`**: UUID generado por cliente para trazabilidad.
- **`Authorization: Bearer <token>`**: se adjunta cuando existe un `accessToken` en la sesión (`@services/session`).

### Response

1. **Dedupe de GETs en vuelo**: peticiones GET idénticas (mismo método, URL y params) que coinciden mientras hay una en curso comparten la misma promesa, evitando duplicados hacia el backend.
2. **Refresco único en `401/ACCESS_TOKEN_EXPIRED`**: implementa el [flujo de renovación de token del contrato (§3)](../../api/00-conventions.md#3-autenticación) — un solo `refreshAccessToken()`, peticiones concurrentes en cola, un único reintento (`_retried`) y, si el refresco falla o el `401` trae otro código, cierre de sesión (`clearSession`) + redirect a `/auth/login` recordando la ruta de origen.
3. **Normalización de errores**: toda respuesta no-2xx se convierte en `ApiError` (ver [api-error.md](./api-error.md)).

## Sesión (`session.ts`)

`src/services/session.ts` expone la capa de sesión transversal usada por el cliente HTTP y las guardas de rutas:

- `useSessionStore` — store Zustand con el `accessToken` en memoria (nunca en `localStorage`).
- `getAccessToken()` — lectura para el interceptor de request.
- `setAccessToken()` — actualización tras un refresh exitoso.
- `clearSession()` — cierre de sesión.
- `refreshAccessToken()` — stub pendiente de la feature de autenticación.

## Query Client

`queryClient` (TanStack Query) se provee en `App.tsx` y define los defaults globales:

- `retry: 3`
- `refetchOnReconnect: true`

Los valores específicos de una query (por ejemplo `staleTime` o reintentos de la sonda de health) se configuran en el hook de cada feature.

## Uso desde una feature

```ts
import { httpClient } from "@services/httpClient";

export async function getHealth(signal?: AbortSignal) {
  const { data } = await httpClient.get<HealthResponse>("/health", { signal });
  return data;
}
```

## Convenciones de API relacionadas

La configuración e interceptores del cliente HTTP implementan las secciones del contrato de API:

| Sección de `00-conventions.md`                                  | Implementación en `httpClient`                |
| --------------------------------------------------------------- | --------------------------------------------- |
| [§1 URL base y versionado](../../api/00-conventions.md#1-url-base-y-versionado) | `baseURL` desde `VITE_API_BASE_URL`, configurado en un único lugar. |
| [§2 Cabeceras comunes](../../api/00-conventions.md#2-cabeceras-comunes) | `Accept`, `Accept-Language`, `X-Request-Id`, `Authorization`. |
| [§3 Autenticación](../../api/00-conventions.md#3-autenticación) | Refresco único en `401/ACCESS_TOKEN_EXPIRED`, cola de reintentos, cierre de sesión. |
| [§12 Capa de datos](../../api/00-conventions.md#12-capa-de-datos-en-frontend-axios--tanstack-query) | Cliente centralizado, dedupe de GETs en vuelo, `AbortController`. |

## Documentos relacionados

- [Modelo de error `ApiError`](./api-error.md)
- [Variables de entorno](../tooling/environment.md)
- [Manejo global de errores](../tooling/error-handling.md)
- [Lógica de negocio](../patterns/business-logic.md)
- [Convenciones de capa de datos](../../api/00-conventions.md#12-capa-de-datos-en-frontend-axios--tanstack-query)
