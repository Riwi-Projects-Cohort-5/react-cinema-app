# GET /api/v1/orders

## Historia de usuario relacionada
- **HU-FE-016** — Cambio de función. **HU-FE-014** — Entradas digitales y factura. El historial de compras del usuario ("Mis compras"); también el punto de entrada para encontrar órdenes elegibles para un cambio de función.

## Propósito
Devuelve las órdenes del usuario autenticado, las más recientes primero, con filtros y paginación. Cada fila lleva la información de resumen que necesita la pantalla de historial (película, hora de la función, cine, totales) además de las banderas de elegibilidad (`canChangeFunction`, `canViewTickets`) para que la UI pueda mostrar/ocultar acciones sin abrir cada orden.

## Método HTTP
GET

## URL
`/api/v1/orders` (URL completa: `https://api.multicine.com/api/v1/orders`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Siempre con alcance al usuario autenticado.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendado | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; los mensajes de error los localiza el backend) |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `status` | enum | No | `CONFIRMED` \| `CHANGED` \| `CANCELLED` \| `REFUNDED` |
| `dateFrom` | string `YYYY-MM-DD` | No | Cota inferior inclusiva sobre `createdAt` (convenciones §7) |
| `dateTo` | string `YYYY-MM-DD` | No | Cota superior inclusiva sobre `createdAt` |
| `sortBy` | enum | No | `createdAt` (por defecto) |
| `sortOrder` | enum | No | `asc` \| `desc` (por defecto `desc`, §5) |
| `page` | integer | No | Basado en 1 (por defecto `1`, §5) |
| `pageSize` | integer | No | Máx. 100 (por defecto `20`, §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Envelope paginado según las convenciones §5.

```json
{
  "data": [
    {
      "orderId": "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
      "orderNumber": "ORD-2026-000123",
      "createdAt": "2026-08-10T18:07:42Z",
      "status": "CONFIRMED",
      "total": { "amount": 48200, "currency": "COP" },
      "items": {
        "ticketCount": 2,
        "movieTitle": "El Último Horizonte",
        "functionAt": "2026-08-14T21:10:00Z",
        "cinemaName": "Multicine El Tesoro"
      },
      "canChangeFunction": true,
      "canViewTickets": true,
      "invoiceId": "c1b2a3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 31, "totalPages": 2 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `orderNumber` | string | Legible para humanos, se muestra en la fila (convenciones §8) |
| `status` | enum | `CONFIRMED` \| `CHANGED` \| `CANCELLED` \| `REFUNDED` — controla la insignia de la fila |
| `total` | object | COP entero (convenciones §6) |
| `items.functionAt` | string | ISO 8601 UTC (convenciones §7); mostrar en `America/Bogota` |
| `canChangeFunction` | boolean | Puerta para la acción de fila "Cambiar función" (ver `GET /orders/{orderId}/available-functions`) |
| `canViewTickets` | boolean | False cuando todos los tickets están `EXPIRED`/`INVALIDATED` → deshabilitar el CTA de tickets |
| `invoiceId` | UUID \| null | Presente cuando existe una factura → enlace "Descargar factura" |

## Respuestas de error
Todos los errores usan el envelope de las convenciones §4. Códigos relevantes:

| HTTP | Code | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 500 | `SERVER_ERROR` | Error recuperable con reintento (§13) |

Ejemplo completo — fallo del servidor (`500`):

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
- Lista de "Mis compras" con pestañas de filtro (status) y un selector de rango de fechas; filtros en la URL (search params de React Router) para que las recargas los conserven.
- Clave de TanStack Query `["orders", { status, dateFrom, dateTo, page, pageSize, sort }]`; `keepPreviousData` para una paginación fluida (§5, §12).
- Carga → skeletons de fila; nunca en blanco (§13).
- **Estado vacío** → "Aún no tienes compras" + un CTA "Ver cartelera".
- Fila → detalle `GET /orders/{orderId}`; acciones inline: "Entradas", "Cambiar función" (solo cuando `canChangeFunction`), "Descargar factura" (enlaza a `GET /orders/{orderId}/invoice`, descarga como blob).
- Después de un cambio de función o una cancelación, invalida `["orders"]` para que las banderas se actualicen (consulta esos documentos).

## Reglas de validación
- Valida `status` contra `CONFIRMED|CHANGED|CANCELLED|REFUNDED` antes de enviar.
- Valida `dateFrom`/`dateTo` como `YYYY-MM-DD`; `dateTo >= dateFrom`.
- Limita `pageSize ≤ 100` (§5).

## Reglas de negocio
- Solo se devuelven las órdenes del propio usuario autenticado — sin fugas de admin u otros usuarios.
- `canChangeFunction` refleja la ventana de cambio actual del lado del servidor (ver `GET /orders/{orderId}/available-functions`); la bandera de la fila puede quedar desactualizada, así que la llamada de disponibilidad es la autoridad.
- Las órdenes `CANCELLED`/`REFUNDED` nunca ofrecen acción de cambio.

## Notas de seguridad
- Lista con alcance por propietario; sin datos personales más allá del historial del propio usuario autenticado.
- `orderNumber` se muestra pero no es un UUID (convenciones §8); no es una credencial de acceso — los detalles siguen verificándose por propietario.

## Flujo de ejemplo
```
El usuario abre "Mis compras"
↓
GET /orders (por defecto: desc, página 1)
↓
Skeletons → filas (orderNumber, película, fecha, total, insignia de status)
↓
El usuario filtra por status=CHANGED → refetch con keepPreviousData
↓
Acción de fila "Cambiar función" → GET /orders/{orderId}/available-functions
```
