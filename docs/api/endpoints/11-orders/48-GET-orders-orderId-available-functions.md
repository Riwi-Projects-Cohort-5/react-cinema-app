# GET /api/v1/orders/{orderId}/available-functions

## Historia de usuario relacionada
- **HU-FE-016** — Cambio de función. Alias del backlog: `GET /reservations/{id}/available-functions` (rediseñado — las reservas se convirtieron en órdenes).

## Propósito
Devuelve las funciones alternativas a las que el usuario puede cambiar esta orden, con una comparación de precios en vivo. Solo es accesible mientras la ventana de cambio está abierta; el frontend renderiza el paso "elegir nueva función" del flujo de cambio a partir de ella, reutilizando los mismos componentes de mapa de sillas de la compra normal.

## Método HTTP
GET

## URL
`/api/v1/orders/{orderId}/available-functions` (URL completa: `https://api.multicine.com/api/v1/orders/{orderId}/available-functions`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Solo propietario.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendado | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; los mensajes de error los localiza el backend) |

## Parámetros de ruta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `orderId` | string (UUID v4) | Sí | Id de la orden (convenciones §8) |

## Parámetros de consulta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `cityId` | string (UUID v4) | No | Restringir a una ciudad (por defecto, la ciudad de la orden) |
| `page` | integer | No | Basado en 1 (por defecto `1`, §5) |
| `pageSize` | integer | No | Máx. 100 (por defecto `20`, §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Envelope paginado según las convenciones §5, con un `priceComparison` de nivel superior.

```json
{
  "data": [
    {
      "functionId": "8d7c6b5a-4e3f-4d2c-8b1a-0f9e8d7c6b5a",
      "movie": { "id": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f", "title": "El Último Horizonte", "posterUrl": "https://cdn.multicine.com/posters/el-ultimo-horizonte.jpg" },
      "cinema": { "id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", "name": "Multicine Santa Fe" },
      "room": { "id": "4c5d6e7f-8a9b-4c0d-9e1f-2a3b4c5d6e7f", "name": "Sala 7" },
      "startAt": "2026-08-15T19:30:00Z",
      "format": "2D",
      "price": { "amount": 16500, "currency": "COP" },
      "seatsAvailable": 42,
      "isCineFlash": false
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 3, "totalPages": 1 },
  "priceComparison": {
    "originalPaid": { "amount": 48200, "currency": "COP" },
    "newPrice": { "amount": 33000, "currency": "COP" },
    "difference": { "amount": -15200, "currency": "COP" }
  }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `price` | object | Precio por ticket de esa función (COP entero, §6) |
| `seatsAvailable` | integer | Conteo de disponibilidad en vivo para insinuar opciones agotadas |
| `isCineFlash` | boolean | Insignias de Cine Flash (20% de descuento, reglas solo de tickets) |
| `priceComparison.difference` | object | COP entero; **negativo → reembolso pendiente**, positivo → se requiere un pago adicional |

## Respuestas de error
Todos los errores usan el envelope de las convenciones §4. Códigos relevantes:

| HTTP | Code | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No propietario o no elegible → "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | Orden desconocida |
| 409 | `NOT_ELIGIBLE` | Ventana de cambio cerrada (después de `changeWindow.until`, o la función actual ya empezó) |
| 500 | `SERVER_ERROR` | Error reintentable (§13) |

Ejemplo completo — ventana cerrada (`409`):

```json
{
  "error": {
    "code": "NOT_ELIGIBLE",
    "message": "El tiempo para cambiar tu función ya expiró.",
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- **Solo se muestra cuando `order.canChangeFunction`** en el detalle de la orden; oculta el CTA en caso contrario.
- Al seleccionar una nueva función → **reutiliza `GET /functions/{id}/seats`** para el mapa de sillas y **`POST /functions/{functionId}/seat-holds`** para bloquear las nuevas sillas (los mismos componentes de la compra normal, HU-FE-010).
- **Muestra la diferencia de precio con claridad** junto a cada función: "Pagarás $15.200 adicionales" vs "Recibirás reembolso de $15.200".
- Modal de confirmación antes de ejecutar el cambio: advierte que **los QRs anteriores quedarán invalidados**.
- Clave de TanStack Query `["orders", orderId, "availableFunctions", { cityId, page }]`; `keepPreviousData` para la paginación.

## Reglas de validación
- `orderId` y `cityId` deben ser UUID válidos.
- Solo las funciones futuras son elegibles — nunca ofrezcas/uses un `functionId` que ya empezó.

## Reglas de negocio
- Solo se devuelven funciones **futuras**; las funciones **ya iniciadas o canceladas** se excluyen.
- El cambio solo se permite dentro de la ventana: normalmente **hasta 2 horas antes de `startAt`** (configurable en el servidor; `changeWindow.until`).
- `priceComparison` se calcula por sillas seleccionadas/cantidad de tickets del lado del servidor; el frontend lo usa para el banner de diferencia, pero el cargo/reembolso definitivo proviene de `POST /orders/{orderId}/change-function`.
- Las funciones Cine Flash conservan sus reglas (máx. 3 tickets, solo tickets, no acumulables).

## Notas de seguridad
- Lectura con alcance por propietario; la respuesta no revela datos personales más allá del contexto de la propia orden.
- La retención de sillas + la ejecución del cambio son los pasos autoritativos — la disponibilidad mostrada aquí es orientativa.

## Flujo de ejemplo
```
El detalle de la orden muestra canChangeFunction → el usuario toca "Cambiar función"
↓
GET /orders/{orderId}/available-functions?cityId=...
↓
Tarjetas de funciones con banners de diferencia de precio
↓
El usuario elige una → GET /functions/{id}/seats → mapa de sillas
↓
POST /functions/{functionId}/seat-holds (bloquear nuevas sillas)
↓
Modal de confirmación → POST /orders/{orderId}/change-function
```
