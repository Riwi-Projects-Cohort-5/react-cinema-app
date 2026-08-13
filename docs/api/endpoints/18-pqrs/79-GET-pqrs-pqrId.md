# GET /api/v1/pqrs/{pqrId}

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-028** — PQRS. Vista de detalle de una sola solicitud PQRS con su línea de tiempo completa de actividad y sus adjuntos.

## Propósito
Devuelve el detalle completo de una solicitud PQRS: campos de cabecera, el número de radicado oficial, los adjuntos y la **línea de tiempo** completa (creación, cambios de estado, comentarios de personal/usuarios, resolución). Alimenta la pantalla de detalle donde el usuario hace seguimiento a la solicitud y publica comentarios de seguimiento mientras sigue abierta.

## Método HTTP
GET

## URL
`/api/v1/pqrs/{pqrId}` (URL completa: `https://api.multicine.com/api/v1/pqrs/{pqrId}`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). **Propietario o personal** — el backend hace cumplir la propiedad; el personal (rol de soporte) puede leer cualquier solicitud.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` — localiza los tipos de entrada de la línea de tiempo |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `pqrId` | string (UUID v4) | Sí | Id de la solicitud PQRS (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — detalle completo incluida la línea de tiempo.

```json
{
  "pqrsId": "8a7b6c5d-4e3f-4a2b-8c1d-0e9f8a7b6c5d",
  "radicadoNumber": "PQRS-2026-004521",
  "category": "RECLAMO",
  "subject": "Reembolso función cancelada",
  "description": "Compré 3 boletas para la función del 9 de agosto que fue cancelada y no he recibido el reembolso.",
  "status": "IN_PROGRESS",
  "createdAt": "2026-08-10T22:41:00Z",
  "estimatedResponseAt": "2026-08-20T22:41:00Z",
  "attachments": [
    {
      "id": "5f4e3d2c-1b2a-4c3d-8e9f-0a1b2c3d4e5f",
      "name": "tiquetes-20260809.jpg",
      "url": "https://cdn.multicine.com/pqrs/8a7b6c5d/5f4e3d2c.jpg?ts=1754270000"
    }
  ],
  "timeline": [
    {
      "id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
      "at": "2026-08-10T22:41:00Z",
      "type": "CREATED",
      "message": "Solicitud creada",
      "attachments": []
    },
    {
      "id": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
      "at": "2026-08-11T09:00:00Z",
      "type": "STATUS_CHANGE",
      "message": "En proceso de revisión",
      "attachments": []
    },
    {
      "id": "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f",
      "at": "2026-08-12T14:05:00Z",
      "type": "COMMENT",
      "message": "Adjuntamos el comprobante de la cancelación de la función.",
      "attachments": [
        {
          "id": "5f4e3d2c-1b2a-4c3d-8e9f-0a1b2c3d4e5f",
          "name": "tiquetes-20260809.jpg",
          "url": "https://cdn.multicine.com/pqrs/8a7b6c5d/5f4e3d2c.jpg?ts=1754270000"
        }
      ]
    }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `status` | enum | `RECEIVED` \| `IN_PROGRESS` \| `RESOLVED` \| `REJECTED` |
| `attachments[]` | array | Archivos adjuntos a la solicitud; `url` es una URL CDN firmada/privada |
| `timeline[].type` | enum | `CREATED` \| `STATUS_CHANGE` \| `COMMENT` \| `RESOLUTION` |
| `timeline[].at` | string | ISO 8601 UTC (convenciones §7) |

## Respuestas de error
Todos los errores usan el envoltorio compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No es el propietario y no es personal → estado "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | La solicitud no existe → redirigir a la lista |
| 500 | `SERVER_ERROR` | Fallo inesperado → error recuperable con reintento (§13) |

Ejemplo completo — no es propietario (`403`):

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para ver esta solicitud",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Vista de línea de tiempo**: lista vertical renderizada en orden `at` con iconos por `type`; `RESOLUTION` recibe una tarjeta destacada.
- **Caja de comentarios** habilitada solo mientras `status` es `RECEIVED`/`IN_PROGRESS`; deshabilitada con una pista ("Esta solicitud está cerrada") cuando es `RESOLVED`/`REJECTED` (ver `POST /pqrs/{pqrId}/comments`).
- **Cuenta regresiva del SLA**: calcular desde `estimatedResponseAt` contra `Date.now()` (convenciones §7); oculta cuando la solicitud está cerrada.
- **Descargas de adjuntos**: renderizar `attachments[].name` como enlaces a `url` (nueva pestaña / descarga); las URLs firmadas no deben persistirse más allá de la consulta.
- Clave de TanStack Query `["pqrs", pqrId]`; `staleTime` ~30s (el personal puede llegar con actualizaciones); `refetchInterval` ~60s mientras está `IN_PROGRESS` para que la línea de tiempo se mantenga fresca. Después de publicar un comentario, `invalidateQueries(["pqrs", pqrId])` para que se anexe del lado del servidor.
- Carga → esqueleto del encabezado + línea de tiempo; error → reintento; 404 → redirigir a la lista; 403 → estado de permiso (§13).

## Reglas de validación
- `pqrId` debe ser un UUID v4 válido antes de la petición.

## Reglas de negocio
- La línea de tiempo es de solo añadido; `CREATED` es siempre la primera entrada, `RESOLUTION` (o el cambio de estado `REJECTED`) la última para las solicitudes cerradas.
- Los adjuntos pertenecen a la solicitud o a una entrada específica de la línea de tiempo; los adjuntos a nivel de entrada solo se renderizan con su entrada.
- Mientras está `RESOLVED`/`REJECTED`, el backend rechaza nuevos comentarios (409) — la UI debe deshabilitar la caja de comentarios antes de ese punto.

## Notas de seguridad
- Propietario-o-personal aplicado del lado del servidor; el frontend nunca renderiza `url` ante un 403.
- Las URLs de los adjuntos están firmadas/privadas — no almacenarlas en caché en localStorage ni compartirlas.

## Flujo de ejemplo
1. El usuario toca una fila en "Mis solicitudes" → `GET /pqrs/{pqrId}`.
2. El encabezado se renderiza (radicado, categoría, insignia de estado, cuenta regresiva del SLA) + línea de tiempo de entradas.
3. El estado es `IN_PROGRESS` → la caja de comentarios está habilitada.
4. El usuario descarga un adjunto de una entrada `COMMENT`.
5. La solicitud llega a `RESOLVED` → cuenta regresiva oculta, caja de comentarios deshabilitada con una pista de "cerrada".
