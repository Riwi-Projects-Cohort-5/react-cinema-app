# Notificaciones visuales

## Descripción

Capa de toasts construida sobre **sonner** (`src/services/notify.ts`), expuesta por `@services`. Centraliza la presentación de mensajes al usuario para que los componentes no manejen toasts directamente.

## Funciones

| Función         | Uso                                                        |
| --------------- | ---------------------------------------------------------- |
| `notifyError`   | Error tipado (`ApiError`, `Error`) o desconocido.          |
| `notifySuccess` | Confirmación de una operación exitosa.                     |
| `notifyInfo`    | Información general.                                       |
| `notifyWarning` | Advertencia.                                               |

## Mapeo de `ApiError`

`notifyError` mapea los campos de `ApiError` (ver [data-layer/api-error.md](../data-layer/api-error.md)):

- `message` → descripción legible.
- `retryAfterSeconds` → "Reintenta en X s" (429, bloqueo de cuenta).
- `requestId` → id de trazabilidad del servidor.
- `onRetry` (opcional) → botón **Reintentar** que re-dispara la acción.

> Los mensajes mostrados se alinean con el comportamiento que define el contrato de API: respetar `retryAfterSeconds` en 429/rate limiting ([§10](../../api/00-conventions.md#10-rate-limiting-429)) y mostrar el `message` localizado del envelope de error ([§4](../../api/00-conventions.md#4-envelope-de-error-estándar)).

## Configuración

El `<Toaster/>` (sonner) se monta en `src/App.tsx` con `richColors` y posición `top-right`, dentro del `QueryClientProvider`.

## Uso

```ts
import { notifyError } from "@services/notify";
import { ApiError } from "@services/api-error";

try {
  // ...
} catch (error) {
  notifyError(error, { onRetry: refetch });
}
```

## Documentos relacionados

- [Manejo global de errores](./error-handling.md)
- [Modelo de error `ApiError`](../data-layer/api-error.md)
- [Convenciones de API](../../api/00-conventions.md) — §4 (envelope de error) y §10 (rate limiting).
