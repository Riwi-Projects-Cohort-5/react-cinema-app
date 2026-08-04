# GET /api/v1/notifications

## Historia de usuario relacionada
- **HU-FE-015** — Notificaciones por correo. Alias de backlog: `GET /notifications/history` → este endpoint (el historial de notificaciones ES la colección de notificaciones; no hay ruta separada de "historial").

## Propósito
Devuelve el historial de notificaciones del usuario autenticado, filtrable por canal (`type`) y estado de entrega (`status`). Alimenta el centro "Mis notificaciones": pestañas de filtro, indicadores de leído/no leído y entradas `FAILED` reenviables.

## Método HTTP
GET

## URL
`/api/v1/notifications` (URL completa: `https://api.multicine.com/api/v1/notifications`)

Sub-ruta estática — nunca colisiona con `/notifications/{notificationId}` porque los ids son UUID (convenciones §8).

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Devuelve solo las notificaciones del usuario autenticado.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; `subject`/`bodyPreview` los localiza el backend) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, devuelto por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `type` | enum | No | Filtrar por canal: `EMAIL` \| `PUSH` \| `SMS`. Ausente → todos los canales. |
| `status` | enum | No | Filtrar por estado de entrega: `SENT` \| `PENDING` \| `FAILED`. Ausente → todos los estados. |
| `sortBy` | enum | No | Campo de ordenamiento (por defecto `sentAt`, el único valor soportado). |
| `sortOrder` | enum | No | `asc` \| `desc` (por defecto `desc` — más recientes primero; convenciones §5) |
| `page` | integer | No | Número de página basado en 1 (por defecto `1`, convenciones §5) |
| `pageSize` | integer | No | Elementos por página, máximo 100 (por defecto `20`, convenciones §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — lista paginada (envoltorio según convenciones §5).

```json
{
  "data": [
    {
      "id": "9f8e7d6c-5b4a-4c3d-2e1f-0a9b8c7d6e5f",
      "type": "EMAIL",
      "subject": "Tus entradas para 'El Último Horizonte'",
      "bodyPreview": "Hola Valentina, aquí están tus 2 entradas para el viernes 21:10...",
      "status": "SENT",
      "sentAt": "2026-08-10T19:02:00Z",
      "readAt": "2026-08-10T19:10:00Z",
      "relatedEntity": { "type": "ORDER", "id": "5a4b3c2d-1e2f-3a4b-5c6d-7e8f9a0b1c2d" }
    },
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "type": "EMAIL",
      "subject": "Tu factura de la orden #0001234",
      "bodyPreview": "Adjuntamos la factura electrónica de tu compra...",
      "status": "FAILED",
      "sentAt": "2026-08-09T21:40:00Z",
      "readAt": null,
      "relatedEntity": { "type": "ORDER", "id": "5a4b3c2d-1e2f-3a4b-5c6d-7e8f9a0b1c2d" }
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 8, "totalPages": 1 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Convenciones §8; abre `GET /notifications/{notificationId}` |
| `type` | enum | `EMAIL` \| `PUSH` \| `SMS` |
| `subject` | string | Asunto/titular corto |
| `bodyPreview` | string | Cuerpo truncado (del lado del servidor, ~160 caracteres) para la fila de la lista |
| `status` | enum | `SENT` \| `PENDING` \| `FAILED` |
| `sentAt` | string ISO-8601 UTC | Convenciones §7 |
| `readAt` | string ISO-8601 UTC \| null | `null` → no leído (negrita + punto) |
| `relatedEntity` | object | Origen de la notificación (`type`: `ORDER` \| `TICKET` \| `MOVIE` \| `ACCOUNT` \| `PROMOTION`; `id`). Se usa para el enlace profundo. `null` cuando no está relacionada. |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — fallo inesperado (`500`):

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Ocurrió un error inesperado. Intenta de nuevo.",
    "requestId": "req_01HZ6..."
  }
}
```

## Consideraciones de frontend
- **Pestañas de filtro** por canal (`Todos` / `EMAIL` / `PUSH` / `SMS`) mapeadas al parámetro de consulta `type`; un control secundario para `status` donde la UI lo necesite (p. ej. "Fallidas").
- **Indicador de no leído/leído**: `readAt === null` → no leído (punto + asunto en negrita); abrir el detalle (`GET /notifications/{notificationId}`) lo marca como leído del lado del servidor — al volver, invalidar la lista.
- **Insignia `FAILED`** (roja) con acción de reenvío → `POST /notifications/{notificationId}/resend` (ver ese documento; respetar el enfriamiento de 60 s).
- TanStack Query clave `["notifications", { type, status, sortBy, sortOrder, page, pageSize }]`; `keepPreviousData` para una paginación fluida (§5).
- Filas esqueleto mientras carga; estado vacío → "No tienes notificaciones"; error recuperable → mensaje + reintento; sin conexión → banner + reintento (§13).
- Paginación: usar los totales de `pagination` para el paginador; nunca adivinar el total de páginas.

## Reglas de validación
- `page ≥ 1`, `pageSize` limitado a `[1, 100]` (convenciones §5).
- `type`/`status`/`sortBy`/`sortOrder` solo se envían con valores de enum válidos; descartar filtros inválidos en lugar de enviarlos.

## Reglas de negocio
- El orden por defecto es `sentAt desc` — no re-ordenar del lado del cliente (convenciones §5).
- Un reenvío crea un **nuevo** registro de notificación (nuevo elemento `PENDING`), por lo que la lista puede mostrar duplicados de un asunto — lo que importa es la insignia/el emisor del nuevo.
- Los elementos `PENDING` pueden transicionar a `SENT`/`FAILED` más tarde; la lista es una instantánea al momento de la obtención.

## Notas de seguridad
- Propiedad: el endpoint solo devuelve las notificaciones del usuario autenticado (`403`/`404` aplican en los endpoints de elemento).
- Sin contenido sensible más allá del texto de la notificación; los enlaces de factura/adjuntos están firmados y con tiempo limitado.

## Flujo de ejemplo
1. "Mis notificaciones" se monta → `GET /api/v1/notifications?sortOrder=desc&page=1` → esqueleto → filas.
2. El usuario toca la pestaña `EMAIL` → re-obtención con `type=EMAIL`.
3. Una fila `FAILED` muestra una insignia roja + "Reenviar" → `POST /notifications/{id}/resend` → toast + invalidar `["notifications"]`.
4. El usuario abre una fila → `GET /notifications/{notificationId}` (la marca como leída) → invalidar la lista.
5. Filtro vacío → "No tienes notificaciones".
