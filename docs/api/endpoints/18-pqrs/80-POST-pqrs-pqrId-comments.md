# POST /api/v1/pqrs/{pqrId}/comments

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-028** — PQRS. Agrega un comentario de seguimiento (y adjuntos opcionales) a una solicitud PQRS abierta. Alias del backlog: `PUT /pqrs` (comentar es una anexión, por eso un POST a un sub-recurso).

## Propósito
Anexa un comentario a una solicitud PQRS abierta. El propietario puede comentar mientras la solicitud esté abierta; el personal puede comentar en cualquier momento. Los adjuntos opcionales viajan junto (variante multipart). Una vez que una solicitud está `RESOLVED` o `REJECTED`, los comentarios se deshabilitan (`409 CLOSED`).

## Método HTTP
POST

## URL
`/api/v1/pqrs/{pqrId}/comments` (URL completa: `https://api.multicine.com/api/v1/pqrs/{pqrId}/comments`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). **Propietario** (mientras la solicitud esté abierta) o **personal** (siempre).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Condicional | `application/json` para un comentario solo de texto, o `multipart/form-data` cuando se adjuntan `files[]` (no configurarla manualmente para FormData — §11) |
| `Accept` | Recomendada | `application/json` |
| `X-Idempotency-Key` | Recomendada | UUID generado por el cliente por intención de comentario; reutilizar al reintentar el mismo clic para que un comentario nunca se duplique (§9) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `pqrId` | string (UUID v4) | Sí | Id de la solicitud PQRS (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Variante JSON (solo texto):

```json
{
  "message": "Adjunto el comprobante de pago de la función cancelada."
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `message` | string | Sí | Texto del comentario, de 1 a 2000 caracteres |

Variante multipart — el mismo campo `message` más:

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `files[]` | archivo(s) | No | ≤ **3 archivos**, cada uno `pdf`/`jpg`/`png`, ≤ **5 MB** cada uno (§11) |

## Respuestas de éxito

**201 Created** — comentario anexado; se convierte en la última entrada de la línea de tiempo.

```json
{
  "commentId": "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f",
  "at": "2026-08-12T14:05:00Z",
  "type": "COMMENT",
  "message": "Adjunto el comprobante de pago de la función cancelada.",
  "attachments": []
}
```

## Respuestas de error
Todos los errores usan el envoltorio compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No es el propietario ni personal, o propietario en una acción solo para personal |
| 404 | `NOT_FOUND` | La solicitud no existe → redirigir a la lista |
| 409 | `CLOSED` | La solicitud ya está `RESOLVED`/`REJECTED` → comentarios deshabilitados; mostrar "Esta solicitud está cerrada" |
| 422 | `VALIDATION_ERROR` | `message` vacío o UUID incorrecto → mapear `details` a la caja |
| 413 | `TOO_LARGE` | Un archivo supera los 5 MB → prevalidar y permitir reintentar (§11) |
| 500 | `SERVER_ERROR` | Fallo inesperado → error reintentable (§13) |

Ejemplo completo — solicitud cerrada (`409`):

```json
{
  "error": {
    "code": "CLOSED",
    "message": "La solicitud está cerrada y ya no admite comentarios",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- Caja de comentarios al final de la línea de tiempo del detalle de la PQRS, con selector de adjuntos opcional (el mismo patrón de validación/progreso por archivo que `POST /pqrs`).
- **Deshabilitar la caja** cuando `status` es `RESOLVED`/`REJECTED` (desde `GET /pqrs/{pqrId}`) — el `409 CLOSED` es un respaldo del lado del servidor, no la UX principal.
- Al tener éxito: **anexar la entrada devuelta a la línea de tiempo local** (optimista) y `invalidateQueries(["pqrs", pqrId])` para que la línea de tiempo del servidor sea la autoridad; también actualizar `lastUpdate` en la lista `["pqrs"]`.
- Contador de caracteres en `message` (máx. 2000); envío deshabilitado mientras está en vuelo o cuando está vacío después de recortar.
- Una `X-Idempotency-Key` por intención de comentario, reutilizada al reintentar — garantiza que el comentario nunca se envíe dos veces (§9).
- Ante `409 CLOSED` (p. ej. la solicitud se cerró entre la consulta y el envío) mostrar el mensaje, deshabilitar la caja y volver a consultar el detalle.

## Reglas de validación
Validar ANTES de enviar:
- `message` recortado, no vacío, ≤ 2000 caracteres.
- Archivos: ≤ 3, MIME ∈ { `application/pdf`, `image/jpeg`, `image/png` }, cada uno ≤ 5 MB.
- Habilitar la caja solo cuando la solicitud esté abierta (`RECEIVED`/`IN_PROGRESS`).

## Reglas de negocio
- Los comentarios solo se permiten mientras la solicitud esté abierta; `RESOLVED`/`REJECTED` la cierra permanentemente (409).
- El personal puede comentar en cualquier solicitud sin importar el estado (las notas internas de resolución quedan fuera del alcance del contrato con el cliente).
- Los adjuntos pasan a formar parte de la entrada de la línea de tiempo y son legibles por propietario/personal.

## Notas de seguridad
- Propietario-o-personal aplicado del lado del servidor; el 403 no debe filtrar si la solicitud existe.
- Los archivos pueden contener datos sensibles — solo URLs firmadas, nunca almacenarlos en caché públicamente.
- Con límite de tasa (§10) para prevenir inundación de comentarios.

## Flujo de ejemplo
1. El detalle muestra `IN_PROGRESS` → caja de comentarios habilitada.
2. El usuario escribe un comentario + adjunta 1 imagen → el cliente valida → `POST /pqrs/{pqrId}/comments` (multipart, `X-Idempotency-Key`).
3. 201 → entrada anexada a la línea de tiempo local + `invalidateQueries(["pqrs", pqrId])`.
4. La solicitud se resuelve del lado del servidor → el refetch muestra `RESOLVED` → la caja se deshabilita con "Esta solicitud está cerrada".
5. Un intento de envío obsoleto después del cierre → `409 CLOSED` → se muestra el mensaje, la caja permanece deshabilitada.
