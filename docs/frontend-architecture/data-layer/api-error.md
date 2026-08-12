# Modelo de error (`ApiError`)

## Descripción

`ApiError` es el error normalizado que reciben los servicios y hooks cuando una petición HTTP falla. Es el resultado de la normalización de errores de los interceptores del [cliente HTTP](./http-client.md): toda respuesta no-2xx se convierte en este modelo.

Se define en `src/services/api-error.ts` y es la traducción del **envelope de error estándar** del contrato de API ([convenciones §4](../../api/00-conventions.md#4-envelope-de-error-estándar)): `code`/`message`/`details`/`requestId`/`retryAfterSeconds` coinciden con el cuerpo de error del backend.

## Propiedades

Los campos `code`, `message`, `details`, `requestId` y `retryAfterSeconds` mapean 1:1 el [envelope de error del contrato (§4)](../../api/00-conventions.md#4-envelope-de-error-estándar). `ApiError` agrega campos frontend-only:

| Propiedad    | Tipo      | Descripción                                                      |
| ------------ | --------- | ---------------------------------------------------------------- |
| `status`     | `number?` | Código HTTP (`undefined` en fallos de red/cancelación).          |
| `isCanceled` | `boolean` | Petición cancelada por `AbortController`.                        |
| `isNetwork`  | `boolean` | Fallo de conectividad sin respuesta.                             |

## Origen

- **Interceptores del cliente HTTP**: convierten toda respuesta no-2xx en `ApiError` ([http-client.md](./http-client.md)).
- **Fallos de red / cancelaciones**: `status` queda `undefined` y se distinguen con `isNetwork` / `isCanceled`.

## Consumo

Los hooks y componentes reciben `ApiError` y deben tratar su mensaje y campos estructurados en lugar de errores planos:

```ts
import { notifyError } from "@services/notify";
import { ApiError } from "@services/api-error";

try {
  // ...
} catch (error) {
  notifyError(error, { onRetry: refetch });
}
```

La capa de notificaciones (`notifyError`) ya mapea los campos de `ApiError` a mensajes legibles (ver [tooling/notifications.md](../tooling/notifications.md)).

## Documentos relacionados

- [Cliente HTTP](./http-client.md)
- [Manejo global de errores](../tooling/error-handling.md)
- [Notificaciones visuales](../tooling/notifications.md)
- [Convenciones de API](../../api/00-conventions.md) — §4 (envelope de error), §10 (rate limiting), §13 (estados de pantalla obligatorios).
