# POST /api/v1/orders

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-013** — Proceso de pago seguro. **HU-FE-029** — Consumo de API pública. Confirma la orden una vez que el pago está `APPROVED`; es el paso final que genera los tickets + la factura y cierra el carrito.

## Propósito
Confirma la orden de un pago aprobado: genera los tickets digitales (con códigos QR) y la factura, cierra el carrito y devuelve todo lo que necesita la pantalla de confirmación. Es **idempotente** — un reintento con la misma clave devuelve la orden original, nunca un duplicado.

## Método HTTP
POST

## URL
`/api/v1/orders` (URL completa: `https://api.multicine.com/api/v1/orders`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). El pago debe pertenecer al usuario autenticado.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendado | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; los mensajes de error los localiza el backend) |
| `X-Idempotency-Key` | **Sí** | **Reutiliza exactamente la misma clave enviada con `POST /payments`** (convenciones §9). Un reintento después de un timeout o un error de red devuelve la orden original en lugar de crear una segunda. |
| `X-Request-Id` | Opcional | UUID generado por el cliente, replicado por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "paymentId": "7c5d3e2f-9b8a-4c1d-8e2f-6a5b4c3d2e1f"
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `paymentId` | UUID v4 | Sí | El id del intent de `POST /payments`, ahora `APPROVED` (convenciones §8) |

## Respuestas de éxito

**201 Created** — orden confirmada, tickets y factura generados.

```json
{
  "orderId": "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
  "orderNumber": "ORD-2026-000123",
  "status": "CONFIRMED",
  "tickets": [
    {
      "id": "3f2e1d0c-9b8a-4f6e-8d5c-4b3a2f1e0d9c",
      "code": "MC-8D4FA2B1",
      "qrDataUrl": "data:image/png;base64,iVBORw0KGgo..."
    }
  ],
  "invoiceId": "c1b2a3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "summary": {
    "total": { "amount": 48200, "currency": "COP" },
    "items": {
      "tickets": 2,
      "snacks": 1
    }
  }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `orderId` | UUID | Para `GET /orders/{orderId}` (convenciones §8) |
| `orderNumber` | string | Legible para humanos, p. ej. `ORD-2026-000123` — muéstralo de forma **destacada** en la confirmación; se usa en soporte |
| `status` | enum | `CONFIRMED` inicialmente (después `CHANGED`/`CANCELLED`/`REFUNDED` mediante los flujos de cambio/cancelación) |
| `tickets[].code` | string | Código QR legible para humanos/alfanumérico (convenciones §8; no es un UUID) |
| `tickets[].qrDataUrl` | string | URI `data:` para renderizar el QR de inmediato |
| `summary.total` | object | COP entero (convenciones §6) |

## Respuestas de error
Todos los errores usan el envelope de las convenciones §4. Códigos relevantes:

| HTTP | Code | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | El pago/orden pertenece a otro usuario |
| 404 | `NOT_FOUND` | `paymentId` desconocido → reiniciar el checkout |
| 409 | `PAYMENT_NOT_APPROVED` | El pago aún no está `APPROVED` → consultar `GET /payments/{paymentId}` o reintentar más tarde |
| 409 | `ORDER_ALREADY_EXISTS` | Replay idempotente → devolver la orden existente (tratar como éxito) |
| 409 | `CART_EXPIRED` | La ventana del carrito cerró → volver a reservar sillas y pagar de nuevo |
| 422 | `VALIDATION_ERROR` | `paymentId` inválido; `details` mapea a los campos (§4) |
| 500 | `SERVER_ERROR` | Error reintentable (§13) |

Ejemplo completo — pago no aprobado (`409`):

```json
{
  "error": {
    "code": "PAYMENT_NOT_APPROVED",
    "message": "El pago aún no ha sido aprobado. Intenta nuevamente en unos segundos.",
    "requestId": "req_01HZ5..."
  }
}
```

## Consideraciones de frontend
- Llama **solo una vez por pago aprobado**; confía en la clave de idempotencia para cualquier reintento automático después de un timeout — NO abras una segunda ruta de llamada.
- En `201`: navega a la pantalla de confirmación con los tickets devueltos; renderiza cada `qrDataUrl` de inmediato.
- **Invalida las cachés**: `["orders"]`, `["tickets"]`, `["cart"]` (el carrito ya está cerrado y también debe limpiarse localmente) — convenciones §12.
- Muestra `orderNumber` de forma destacada y copiable (soporte lo necesita).
- `409 ORDER_ALREADY_EXISTS` → trátalo como **éxito**: vuelve a consultar la orden (`GET /orders/{orderId}` desde `details`) y continúa a la confirmación, sin mostrar error.
- `409 PAYMENT_NOT_APPROVED` → reanuda la consulta del pago; no lo presentes como un error grave.
- Carga: spinner a pantalla completa en la transición a la confirmación; el botón que dispara esto debe permanecer deshabilitado.

## Reglas de validación
- `paymentId` debe ser un UUID v4 válido.
- El cliente solo debe enviar esta petición cuando el último estado de pago conocido es `APPROVED` (de la consulta); de lo contrario, continúa consultando.

## Reglas de negocio
- La orden se crea exactamente una vez por pago; la clave de idempotencia + el vínculo con el pago lo garantizan (§9).
- Los tickets se generan en estado `ACTIVE` con códigos QR nuevos; la factura se genera junto con la orden (`invoiceId` para `GET /orders/{orderId}/invoice`).
- Si la orden ya existe (`ORDER_ALREADY_EXISTS`), el servidor devuelve el cuerpo de la orden **original** — nunca una segunda orden.
- `orderNumber` se conserva durante toda la vida de la orden (también después de cambios de función — consulta ese documento).

## Notas de seguridad
- Alcance por propietario: confirma órdenes solo para el pago aprobado del propio usuario autenticado.
- La clave de idempotencia + el vínculo con el pago aprobado es lo que evita el doble cobro ("la compra no se envía dos veces") — reutiliza la misma clave del intent, nunca generes una nueva para la misma compra.
- En este paso no intervienen datos de tarjeta (ya los maneja el widget seguro en `POST /payments`).
- Nunca registres `tickets[].code` (otorga acceso) — mantén los payloads de QR fuera de las analíticas.

## Flujo de ejemplo
```
La consulta del pago devuelve APPROVED (GET /payments/{paymentId})
↓
POST /orders { paymentId }  (misma X-Idempotency-Key k-1)
↓
201 → navegar a la pantalla de confirmación
↓
Renderizar tickets (qrDataUrl) + mostrar orderNumber
↓
Invalidar ["orders"], ["tickets"], ["cart"]
```

## Reconciliación con el backlog
Enumerado en el conjunto de consumo público de HU-FE-029; endpoint único de colección (`POST /orders`) — sin alias separado de "confirm".
