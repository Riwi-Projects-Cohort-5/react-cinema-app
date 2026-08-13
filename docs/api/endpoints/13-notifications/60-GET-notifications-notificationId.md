# GET /api/v1/notifications/{notificationId}

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-015** — Notificaciones por correo. Vista de detalle del centro de notificaciones; lista la misma colección que `GET /notifications`.

## Propósito
Devuelve el contenido completo de una sola notificación: cuerpo completo, adjuntos (p. ej. PDF de entradas o facturas) y, cuando la entrega falló, el motivo del fallo. Abrir este detalle marca implícitamente la notificación como leída (`readAt` se fija del lado del servidor).

## Método HTTP
GET

## URL
`/api/v1/notifications/{notificationId}` (URL completa: `https://api.multicine.com/api/v1/notifications/{notificationId}`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). La notificación debe pertenecer al usuario autenticado.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; `subject`/`body` los localiza el backend) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, devuelto por el servidor para trazabilidad |

## Parámetros de ruta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `notificationId` | UUID v4 | Sí | Id de la notificación (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — detalle completo de la notificación. La notificación se marca como leída del lado del servidor al tener éxito.

```json
{
  "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "type": "EMAIL",
  "subject": "Tu factura de la orden #0001234",
  "body": "Hola Valentina,\n\nGracias por tu compra. Adjuntamos la factura electrónica de la orden #0001234.\n\nMulticine",
  "status": "FAILED",
  "sentAt": "2026-08-09T21:40:00Z",
  "readAt": "2026-08-11T14:05:00Z",
  "failureReason": "Buzón del destinatario lleno (rebote 5.2.2)",
  "attachments": [
    {
      "id": "f1e2d3c4-b5a6-4c3d-2e1f-0a9b8c7d6e5f",
      "name": "factura-0001234.pdf",
      "url": "https://cdn.multicine.com/notifications/att/f1e2d3c4-b5a6-4c3d-2e1f-0a9b8c7d6e5f.pdf?exp=..."
    }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Convenciones §8 |
| `type` | enum | `EMAIL` \| `PUSH` \| `SMS` |
| `subject` / `body` | string | Contenido completo (a diferencia del `bodyPreview` de la lista) |
| `status` | enum | `SENT` \| `PENDING` \| `FAILED` |
| `sentAt` | string ISO-8601 UTC | Convenciones §7 |
| `readAt` | string ISO-8601 UTC \| null | Lo fija este GET la primera vez que se abre; `null` en caso contrario |
| `failureReason` | string \| null | Presente solo cuando `status === "FAILED"`; legible para la UI |
| `attachments[]` | array | `id`, `name`, `url` firmada (con tiempo limitado). Vacío para `PUSH`/`SMS`. |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | Autenticado pero no es el propietario → estado "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | La notificación no existe (o pertenece a otro usuario — nunca se filtra) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — no es el propietario (`403`):

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para ver esta notificación.",
    "requestId": "req_01HZ7..."
  }
}
```

## Consideraciones de frontend
- **Vista de detalle**: renderizar `body` (conservar saltos de línea), listar `attachments` como enlaces clicables (abrir en una pestaña nueva — son URLs firmadas, con tiempo limitado).
- **Marcar como leída**: este GET fija `readAt` del lado del servidor. Fijar `readAt` localmente de forma optimista al abrir; luego, con la respuesta, invalidar `["notifications"]` para que los indicadores de no leído de la lista se actualicen (y reemplazar cualquier valor local con el del servidor).
- **`FAILED`** → mostrar el `failureReason` y un botón "Reenviar" → `POST /notifications/{notificationId}/resend` (ver ese documento; respetar el enfriamiento de 60 s).
- TanStack Query clave `["notifications", notificationId]`; `staleTime` corto (~30 s) para que las reaperturas vuelvan a verificar `readAt`.
- Carga: cuerpo esqueleto; error: mensaje + reintento (§13).
- Si la notificación ya está leída, obtenerla de todos modos — el contenido puede releerse desde la caché sin re-obtener si está fresco.

## Reglas de validación
- `notificationId` debe ser un UUID v4 válido antes de enviar.

## Reglas de negocio
- Abrir una notificación la marca como leída **solo en la primera apertura**; las aperturas repetidas conservan el `readAt` original.
- Los elementos `PENDING`/`FAILED` también son legibles (el motivo del fallo solo se completa en `FAILED`).
- Las URLs de adjuntos caducan — nunca cachearlas para uso offline posterior; volver a obtener la notificación si un enlace está muerto.

## Notas de seguridad
- Propiedad exigida: solo se resuelven las notificaciones del propietario; otros ids devuelven `404` (nunca revelar la existencia) o `403` según la política del backend — tratar ambos como "no se puede ver".
- Las URLs de adjuntos están firmadas y con tiempo limitado; no registrarlas ni persistirlas.
- Sin PII más allá del contenido propio de la notificación.

## Flujo de ejemplo
1. El usuario toca una fila en `GET /notifications`.
2. `GET /api/v1/notifications/{id}` → detalle con cuerpo + adjuntos; `readAt` fijado.
3. Lista local actualizada + `["notifications"]` invalidada → punto de no leído eliminado.
4. `status === "FAILED"` → "Reenviar" → `POST /notifications/{id}/resend` → toast + enfriamiento.
