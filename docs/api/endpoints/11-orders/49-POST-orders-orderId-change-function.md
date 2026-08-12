# POST /api/v1/orders/{orderId}/change-function

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-016** — Cambio de función. Alias del backlog: `PUT /reservations/change` (rediseñado — la operación es una transición de estado sobre el recurso de la orden, no un PUT genérico).

## Propósito
Ejecuta el cambio de función: invalida los códigos QR de los tickets anteriores, genera nuevos tickets para la nueva función/sillas y cobra o reembolsa la diferencia de precio. La orden **conserva su `orderNumber`**; solo cambian su estado y sus tickets. Este endpoint es idempotente mediante `X-Idempotency-Key`.

## Método HTTP
POST

## URL
`/api/v1/orders/{orderId}/change-function` (URL completa: `https://api.multicine.com/api/v1/orders/{orderId}/change-function`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Solo propietario.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendado | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; los mensajes de error los localiza el backend) |
| `X-Idempotency-Key` | **Sí** | UUID generado por el cliente para este intent de cambio (convenciones §9). Un reintento devuelve el resultado original — sin doble cargo/reembolso. |
| `X-Request-Id` | Opcional | UUID generado por el cliente, replicado por el servidor para trazabilidad |

## Parámetros de ruta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `orderId` | string (UUID v4) | Sí | Id de la orden (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "newFunctionId": "8d7c6b5a-4e3f-4d2c-8b1a-0f9e8d7c6b5a",
  "newSeatIds": [
    "5e7a4f1b-0203",
    "5e7a4f1b-0204"
  ]
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `newFunctionId` | UUID v4 | Sí | Elegido de `GET /orders/{orderId}/available-functions` (convenciones §8) |
| `newSeatIds` | string[] | Sí | Ids de sillas con alcance por función (los mismos ids de `GET /functions/{id}/seats`), bloqueadas mediante seat-holds antes de esta llamada |

## Respuestas de éxito

**200 OK** — cambio ejecutado.

```json
{
  "status": "CHANGED",
  "priceDifference": { "amount": -15200, "currency": "COP" },
  "additionalPaymentRequired": false,
  "paymentId": null,
  "newTickets": [
    {
      "id": "6e5f4a3b-2c1d-4e0f-9a8b-7c6d5e4f3a2b",
      "code": "MC-9E7B3C4D",
      "qrDataUrl": "data:image/png;base64,iVBORw0KGgo..."
    }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `status` | enum | `CHANGED`; el estado de la orden se actualiza (orderNumber sin cambios) |
| `priceDifference` | object | COP entero (convenciones §6); negativo → reembolso, positivo → pago adicional |
| `additionalPaymentRequired` | boolean | `true` → se necesita un nuevo `POST /payments` por `priceDifference` antes de que los tickets sean utilizables |
| `paymentId` | UUID \| null | Se establece cuando esta llamada creó un intent de pago adicional |
| `newTickets[].qrDataUrl` | string | URI `data:` para renderizar los nuevos QRs de inmediato |

## Respuestas de error
Todos los errores usan el envelope de las convenciones §4. Códigos relevantes:

| HTTP | Code | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No propietario → "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | Orden desconocida |
| 409 | `NOT_ELIGIBLE` | Ventana cerrada / la función actual ya empezó → ocultar el flujo |
| 409 | `SEATS_UNAVAILABLE` | Sillas elegidas tomadas desde la retención → volver a seleccionar (details lista los ids de sillas) |
| 422 | `VALIDATION_ERROR` | `newFunctionId`/`newSeatIds` inválidos; `details` mapea a los campos (§4) |
| 429 | `RATE_LIMITED` | Respeta `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Error reintentable (§13) |

Ejemplo completo — sillas tomadas (`409`):

```json
{
  "error": {
    "code": "SEATS_UNAVAILABLE",
    "message": "Algunas sillas ya no están disponibles. Por favor elige otras.",
    "details": [
      { "field": "newSeatIds", "message": "Las sillas F-7 y F-8 ya fueron tomadas" }
    ],
    "requestId": "req_01HZ9..."
  }
}
```

## Consideraciones de frontend
- Si `additionalPaymentRequired` → ejecuta **`POST /payments`** por el `priceDifference` primero (mismo flujo CARD/PSE/NEQUI/DAVIPLATA), espera `APPROVED` y luego vuelve a llamar **este mismo flujo de change-function** con la misma clave de idempotencia.
- En caso de éxito: muestra los nuevos QRs + la confirmación; **invalida `["orders", orderId]` y `["tickets"]`** (los tickets anteriores están `INVALIDATED`, los nuevos `ACTIVE`).
- El **número de orden se conserva** — el encabezado de confirmación no debe cambiarlo.
- Si `priceDifference` es negativo (reembolso): el servidor reembolsa al método de pago original; muestra "Te reembolsaremos $X" — los reembolsos se liquidan en 1–3 días hábiles.
- `409 SEATS_UNAVAILABLE` → volver al mapa de sillas (identifica las sillas tomadas desde `details`); `409 NOT_ELIGIBLE` → volver al detalle de la orden con un aviso.
- Protección contra doble envío en el botón de confirmar (§9 idempotencia + botón deshabilitado).

## Reglas de validación
- `newFunctionId` y cada `newSeatId` deben ser UUID válidos; `newSeatIds` no vacío.
- `newFunctionId` debe provenir de `available-functions` (nunca de una función iniciada/cancelada).
- Las nuevas sillas deben estar bloqueadas (retenidas) por el usuario antes de esta llamada — vuelve a verificarlo contra el mapa de sillas más reciente.

## Reglas de negocio
- **Los códigos QR de los tickets anteriores se invalidan de inmediato** (estado `INVALIDATED`); los nuevos tickets llegan en `ACTIVE`.
- La orden **conserva su `orderNumber`**; `status` pasa a `CHANGED`.
- Si el precio nuevo < pagado → la diferencia se **reembolsa** (estado `REFUNDED` en el registro del reembolso); si el precio nuevo > pagado → se requiere un intent de pago adicional (`additionalPaymentRequired: true`).
- El cambio solo se permite dentro de la ventana (p. ej. hasta 2h antes de `startAt`, configurable) — se aplica del lado del servidor sin importar la bandera de la UI.

## Notas de seguridad
- Alcance por propietario (403 en caso contrario) — solo el comprador cambia su propia orden.
- La clave de idempotencia + el botón deshabilitado evitan cargos/reembolsos duplicados al reintentar (§9).
- El frontend nunca hace matemáticas de dinero para el cargo: `priceDifference`/`additionalPaymentRequired` son autoritativos desde el servidor (convenciones §6 — solo COP entero).

## Flujo de ejemplo
```
Retención de sillas bloqueada para la nueva función
↓
Modal de confirmación ("El QR anterior dejará de funcionar")
↓
POST /orders/{orderId}/change-function { newFunctionId, newSeatIds }  (clave k-c1)
↓
200 → se muestran los nuevos QRs, invalidar ["orders", orderId] + ["tickets"]
↓
(si additionalPaymentRequired → POST /payments por la diferencia → consultar → volver a ejecutar el cambio)
```
