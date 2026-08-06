# HTTP Client

## Responsabilidad

Centralizar toda la comunicación con la API en una única capa (`src/services/`). Ningún componente ni feature debe llamar a `axios`/`fetch` directamente: todos los servicios de feature pasan por `httpClient`.

## Estructura

```text
src/services/
├── api-error.ts        # Modelo ApiError y envelope de error estándar
├── httpClient.ts       # Instancia de axios + interceptores
├── queryClient.ts      # Cliente de TanStack Query
├── session.ts          # Sesión transversal (accessToken, refreshAccessToken, clearSession)
└── index.ts            # Barrel de exportaciones
```

## Configuración de la instancia

`httpClient` se crea con `axios.create()`:

| Configuración    | Valor                                             | Origen                                        |
| ---------------- | ------------------------------------------------- | --------------------------------------------- |
| `baseURL`        | `VITE_API_BASE_URL` o `/api/v1` por defecto       | `@config/env`                                 |
| `timeout`        | `VITE_API_TIMEOUT_MS` o `15000` ms por defecto    | `@config/env`                                 |
| `Accept`         | `application/json`                                | —                                             |
| `Accept-Language`| `es`                                              | Los mensajes de error los localiza el backend |

La URL base se configura en un único lugar (`.env.example`) y nunca se hardcodea en componentes (convenciones §1).

## Interceptores

### Request

- **`X-Request-Id`**: UUID generado por cliente para trazabilidad (convenciones §2).
- **`Authorization: Bearer <token>`**: se adjunta cuando existe un `accessToken` en la sesión (`@services/session`).

### Response

1. **Dedupe de GETs en vuelo**: peticiones GET idénticas (mismo método, URL y params) que coinciden mientras hay una en curso comparten la misma promesa, evitando duplicados hacia el backend.
2. **Refresco único en `401/ACCESS_TOKEN_EXPIRED`**:
   - Se llama a `refreshAccessToken()` **una sola vez**.
   - Las peticiones concurrentes que fallan `401` durante el refresco se **ponen en cola** y se reintentan cuando este resuelve.
   - Si el refresco es exitoso, la petición original se reintenta **exactamente una vez** (`_retried`).
   - Si falla el refresco, o el `401` trae otro código, se **cierra la sesión** (`clearSession`) y se redirige a `/auth/login` (recordando la ruta de origen).
3. **Normalización de errores**: toda respuesta no-2xx se convierte en `ApiError` (envelope §4).

## Sesión (session.ts)

`src/services/session.ts` expone la capa de sesión transversal usada por el cliente HTTP y las guardas de rutas:

- `useSessionStore` — store Zustand con el `accessToken` en memoria (nunca en `localStorage`).
- `getAccessToken()` — lectura para el interceptor de request.
- `setAccessToken()` — actualización tras un refresh exitoso.
- `clearSession()` — cierre de sesión.
- `refreshAccessToken()` — stub pendiente de la feature de autenticación (HU-FE-007).

## Modelo de error (ApiError)

`ApiError` es el error normalizado que los servicios y hooks reciben. Expone:

- `message` — mensaje legible.
- `status` — código HTTP (`undefined` en fallos de red/cancelación).
- `code` — código de negocio del envelope (`VALIDATION_ERROR`, `SERVICE_UNAVAILABLE`, ...).
- `details` — errores por campo (422/409).
- `requestId` — id de trazabilidad del servidor.
- `retryAfterSeconds` — para 429/bloqueos.
- `isCanceled` — petición cancelada por `AbortController`.
- `isNetwork` — fallo de conectividad sin respuesta.

## Query Client

`queryClient` (TanStack Query) se provee en `App.tsx` y define los defaults globales:

- `retry: 3`
- `refetchOnReconnect: true`

Los valores específicos de una query (por ejemplo `staleTime` o reintentos de la sonda de health) se configuran en el hook de cada feature.

## Variables de entorno

| Variable                 | Ejemplo                                    | Descripción                          |
| ------------------------ | ------------------------------------------ | ------------------------------------ |
| `VITE_API_BASE_URL`      | `https://api.multicine.com/api/v1`         | URL base versionada de la API.       |
| `VITE_API_TIMEOUT_MS`    | `15000`                                    | Timeout por petición en ms.          |

Copiar `.env.example` a `.env.local` para desarrollo.

## Uso desde una feature

```ts
import { httpClient } from "@services/httpClient";

export async function getHealth(signal?: AbortSignal) {
  const { data } = await httpClient.get<HealthResponse>("/health", { signal });
  return data;
}
```
