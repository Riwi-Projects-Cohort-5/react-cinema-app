# GET /api/v1/pqrs

## Historia de usuario relacionada
- **HU-FE-028** — PQRS. Lista las solicitudes PQRS propias del usuario con filtros, insignias de estado y la cuenta regresiva del SLA por fila.

## Propósito
Devuelve las solicitudes PQRS del usuario autenticado como una lista paginada y filtrable. Cada fila lleva el número de radicado, la categoría, el estado, las fechas y la fecha límite del SLA para que la lista pueda renderizar insignias de estado y una cuenta regresiva por fila. Solo se devuelven las solicitudes propias del llamante.

## Método HTTP
GET

## URL
`/api/v1/pqrs` (URL completa: `https://api.multicine.com/api/v1/pqrs`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` — localiza las etiquetas de categoría/estado |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `status` | enum | No | `RECEIVED` \| `IN_PROGRESS` \| `RESOLVED` \| `REJECTED` |
| `category` | enum | No | `PETICION` \| `QUEJA` \| `RECLAMO` \| `SUGERENCIA` \| `FELICITACION` |
| `sortBy` | enum | No | `createdAt` (por defecto) |
| `sortOrder` | enum | No | `asc` \| `desc` (por defecto `desc`, convenciones §5) |
| `page` | integer | No | Página basada en 1 (por defecto `1`, §5) |
| `pageSize` | integer | No | Máximo 100 (por defecto `20`, §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — lista paginada (envoltorio según convenciones §5).

```json
{
  "data": [
    {
      "pqrsId": "8a7b6c5d-4e3f-4a2b-8c1d-0e9f8a7b6c5d",
      "radicadoNumber": "PQRS-2026-004521",
      "category": "RECLAMO",
      "subject": "Reembolso función cancelada",
      "status": "IN_PROGRESS",
      "createdAt": "2026-08-10T22:41:00Z",
      "estimatedResponseAt": "2026-08-20T22:41:00Z",
      "lastUpdate": "2026-08-12T14:05:00Z"
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 5, "totalPages": 1 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `data[].pqrsId` | UUID | Convenciones §8; enlaza a `GET /pqrs/{pqrId}` |
| `data[].radicadoNumber` | string | Referencia oficial (`PQRS-YYYY-NNNNNN`) |
| `data[].category` | enum | Una de las cinco categorías PQRS |
| `data[].status` | enum | `RECEIVED` \| `IN_PROGRESS` \| `RESOLVED` \| `REJECTED` |
| `data[].createdAt` / `lastUpdate` | string | ISO 8601 UTC (convenciones §7) |
| `data[].estimatedResponseAt` | string | Fecha límite del SLA; null cuando ya está resuelta/rechazada |

## Respuestas de error
Todos los errores usan el envoltorio compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 500 | `SERVER_ERROR` | Fallo inesperado → error recuperable con reintento (§13) |

Ejemplo completo — fallo genérico (`500`):

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Ocurrió un error inesperado. Intenta de nuevo.",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Filtros** (estado, categoría) viven en la URL (parámetros de búsqueda de React Router) para que recargas y compartidos los conserven; cambio de filtro = `setSearchParams` + refetch (§12).
- **Insignias de estado** con los cuatro estados; mapeo de colores (p. ej. `RECEIVED` gris, `IN_PROGRESS` azul, `RESOLVED` verde, `REJECTED` rojo) en un componente compartido.
- **Cuenta regresiva del SLA por fila**: calcular contra `estimatedResponseAt` y `Date.now()` (convenciones §7); estilo rojo cuando está vencida.
- Tocar la fila → detalle de `GET /pqrs/{pqrId}` (línea de tiempo).
- Clave de TanStack Query `["pqrs", { status, category, page, pageSize }]`; `staleTime` ~30s (el estado cambia en el servidor); `keepPreviousData` para una paginación fluida (§5, §12). Invalidar `["pqrs"]` después de crear una PQRS o publicar un comentario.
- Carga → esqueletos de fila; vacío → "Aún no has radicado solicitudes" + CTA "Radicar una solicitud"; error → reintento (§13).

## Reglas de validación
- Validar `status`/`category` contra los literales documentados antes de enviar.
- `page` ≥ 1; ajustar `pageSize` a 1–100 (§5).

## Reglas de negocio
- Solo se devuelven las PQRS propias del llamante (limitado al propietario).
- `estimatedResponseAt` es null una vez que la solicitud está `RESOLVED`/`REJECTED` — la cuenta regresiva desaparece para las solicitudes cerradas.
- La ordenación es del lado del servidor solo sobre `createdAt`.

## Notas de seguridad
- Solo autenticado y limitado al propietario — nunca exponer las solicitudes de otro usuario; la distinción 403/lista vacía está reforzada en el backend.

## Flujo de ejemplo
1. El usuario abre "Mis solicitudes" → `GET /pqrs?page=1` → esqueletos → filas con insignias y cuentas regresivas.
2. El usuario selecciona el filtro "RECLAMO" → `setSearchParams({ status: 'RECLAMO' })` → refetch.
3. Una fila muestra `IN_PROGRESS` con una cuenta regresiva de SLA de 8 días.
4. El usuario toca la fila → línea de tiempo de `GET /pqrs/{pqrId}`.
5. Después de publicar un comentario, la lista se vuelve a consultar (invalidate `["pqrs"]`) para actualizar `lastUpdate`.
