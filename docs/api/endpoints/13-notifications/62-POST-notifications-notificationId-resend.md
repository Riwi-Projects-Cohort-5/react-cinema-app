# POST /api/v1/notifications/{notificationId}/resend

## Historia de usuario relacionada
- **HU-FE-015** — Notificaciones por correo. Alias de backlog: `POST /notifications/resend` y `POST /notifications/email` → `POST /notifications/{notificationId}/resend` por elemento (consistencia REST, ver conciliación en el README).

## Propósito
Solicita el reenvío de una notificación fallida — o que de otro modo se pueda reenviar — (p. ej. un correo de entrada o factura que rebotó). El reenvío se encola como un **nuevo** registro de notificación `PENDING` en lugar de mutar el original.

## Método HTTP
POST

## URL
`/api/v1/notifications/{notificationId}/resend` (URL completa: `https://api.multicine.com/api/v1/notifications/{notificationId}/resend`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). La notificación debe pertenecer al usuario autenticado.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; los mensajes de error los localiza el backend) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, devuelto por el servidor para trazabilidad |

## Parámetros de ruta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `notificationId` | UUID v4 | Sí | Id de la notificación a reenviar (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{}
```

Un objeto JSON vacío. No se requieren campos — el reenvío reutiliza el contenido y el destino originales.

## Respuestas de éxito

**200 OK** — reenvío aceptado y encolado.

```json
{
  "id": "b3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e",
  "status": "PENDING",
  "message": "Notificación reenviada"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | **Id del nuevo registro de notificación** (no el `notificationId` original); aparecerá en el historial como elemento `PENDING` |
| `status` | enum | Siempre `PENDING` inmediatamente después de la petición |
| `message` | string | Se muestra textualmente como toast de éxito |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | Autenticado pero no es el propietario → "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | La notificación no existe |
| 409 | `NOT_ALLOWED` | No reenviable (ya `SENT` y no es de tipo reenviable, o `PENDING` ya encolado) → ocultar/deshabilitar el botón de reenvío |
| 429 | `RATE_LIMITED` | Enfriamiento entre reenvíos; respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — no reenviable (`409`):

```json
{
  "error": {
    "code": "NOT_ALLOWED",
    "message": "Esta notificación no puede reenviarse.",
    "requestId": "req_01HZ9..."
  }
}
```

Ejemplo completo — límite de tasa (`429`):

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Demasiadas solicitudes. Intenta de nuevo en X segundos.",
    "requestId": "req_01HZA...",
    "retryAfterSeconds": 60
  }
}
```

## Consideraciones de frontend
- Mostrar la **acción de reenvío** en elementos `FAILED` y en tipos transaccionales reenviables (entradas, facturas, confirmaciones de pedido) — p. ej. un botón de ícono junto a la fila.
- **Enfriamiento**: tras un reenvío exitoso, deshabilitar el botón y contar **60 s** (por defecto; usar el `retryAfterSeconds` del servidor de un `429` si se devuelve). Nunca reintentar automáticamente (§10).
- Toast de éxito con el `message` devuelto ("Notificación reenviada").
- Invalidar `["notifications"]` (y `["notifications", notificationId]`) para que la nueva fila `PENDING` y el estado de la insignia de la lista se actualicen.
- Ante `409 NOT_ALLOWED` → ocultar/deshabilitar la acción de reenvío para ese elemento (no mostrar un diálogo de error).
- TanStack Query: `useMutation`; deshabilitar mientras está en vuelo (sin doble reenvío).

## Reglas de validación
- `notificationId` debe ser un UUID v4 válido.
- Solo ofrecer reenvío para notificaciones `FAILED` o tipos transaccionales reenviables — nunca para elementos de marketing genéricos `SENT`.

## Reglas de negocio
- **Solo las notificaciones fallidas o explícitamente reenviables se pueden reenviar.** Enviar un reenvío crea un **nuevo registro `PENDING`**; el original permanece intacto.
- Un reenvío puede fallar más tarde — el nuevo registro se convierte entonces en `FAILED` y se puede reenviar de nuevo.
- El enfriamiento aplica por notificación (y globalmente por ráfaga); el servidor devuelve `429` con `retryAfterSeconds` (§10).

## Notas de seguridad
- Propiedad exigida — un usuario solo puede reenviar sus propias notificaciones (`403`/`404` en caso contrario).
- El reenvío reutiliza el destinatario/contenido originales; no se requiere ni devuelve ningún dato personal nuevo.

## Flujo de ejemplo
1. El usuario ve una fila `FAILED` (insignia roja) en `GET /notifications`.
2. Toca "Reenviar" → `POST /api/v1/notifications/{id}/resend {}`.
3. `200` → toast "Notificación reenviada"; el botón entra en un enfriamiento de 60 s.
4. `["notifications"]` invalidada → una nueva fila `PENDING` aparece al inicio.
5. La nueva fila luego se convierte en `SENT` (o `FAILED` de nuevo → reenviable).
