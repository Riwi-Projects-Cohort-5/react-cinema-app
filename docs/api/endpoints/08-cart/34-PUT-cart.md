# PUT /api/v1/cart

## Historia de usuario relacionada
- **HU-FE-011** — Carrito de compras.

## Propósito
Actualiza las cantidades de las líneas de snacks del carrito activo (la única parte editable del carrito — las cantidades de boletos están fijadas a las sillas retenidas). Una sola petición actualiza varias líneas a la vez; las cantidades deben ser ≥ 1. Devuelve el carrito completo actualizado para que los totales se refresquen en una sola respuesta.

## Método HTTP
PUT

## URL
`/api/v1/cart` (URL completa: `https://api.multicine.com/api/v1/cart`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `X-Idempotency-Key` | Sí | UUID por intención de cambio de cantidad; se reutiliza al reintentar (convenciones §9) |
| `Accept-Language` | Opcional | `es` — los mensajes de error los localiza el backend |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "snacks": [
    { "lineId": "99999999-9999-4999-8999-999999999902", "quantity": 3 },
    { "lineId": "99999999-9999-4999-8999-999999999903", "quantity": 1 }
  ]
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `snacks` | array | Sí | Líneas a actualizar; se permite un array vacío (no-op) |
| `snacks[].lineId` | string (UUID v4) | Sí | Id de una línea de snacks existente de `GET /cart` |
| `snacks[].quantity` | integer | Sí | ≥ 1; 0/negativos se rechazan (422) |

## Respuestas de éxito

**200 OK** — carrito actualizado (misma forma que `GET /cart`).

```json
{
  "cart": {
    "id": "ca1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
    "status": "OPEN",
    "expiresAt": "2026-08-10T20:41:00Z",
    "expiresInSeconds": 298,
    "lines": {
      "tickets": [
        {
          "lineId": "99999999-9999-4999-8999-999999999901",
          "function": {
            "id": "9a8b7c6d-5e4f-4a3b-8c9d-1e2f3a4b5c6d",
            "movie": { "id": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f", "title": "El Último Horizonte" },
            "startAt": "2026-08-10T20:30:00Z",
            "format": "2D",
            "cinema": { "id": "c1a2b3c4-5d6e-7f80-9a1b-2c3d4e5f6a7b", "name": "Cine Colombia Santafé" }
          },
          "seats": ["F12", "F13"],
          "quantity": 2,
          "unitPrice": { "amount": 16500, "currency": "COP" }
        }
      ],
      "snacks": [
        {
          "lineId": "99999999-9999-4999-8999-999999999902",
          "snackId": "77777777-7777-4777-8777-777777777701",
          "name": "Combo Familiar",
          "imageUrl": "https://cdn.multicine.com/snacks/combo-familiar.jpg",
          "unitPrice": { "amount": 38500, "currency": "COP" },
          "quantity": 3,
          "lineTotal": { "amount": 115500, "currency": "COP" }
        }
      ]
    },
    "breakdown": {
      "subtotal": { "amount": 148500, "currency": "COP" },
      "savings": { "amount": 0, "currency": "COP" },
      "giftcard": { "amount": 0, "currency": "COP" },
      "membership": { "amount": 0, "currency": "COP" },
      "taxes": { "amount": 21945, "currency": "COP" },
      "total": { "amount": 170445, "currency": "COP" }
    },
    "applied": { "membership": false, "giftcard": null }
  }
}
```

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` etc. | Problemas de sesión — interceptor (convenciones §3) | Refresco silencioso / redirección al inicio de sesión |
| 404 | `LINE_NOT_FOUND` | La línea de snacks no existe / fue eliminada | Ignorar esa línea, reconsultar `["cart"]` |
| 409 | `CART_EXPIRED` | Se agotó la ventana de tiempo del carrito | Notificación + invalidar; el carrito pasa a `null` |
| 422 | `VALIDATION_ERROR` | `quantity` < 1, no entero, lineId desconocido | Mensaje en el campo bajo el stepper |
| 500 | `SERVER_ERROR` | Fallo inesperado | Error recuperable (convenciones §13) |

Ejemplo completo — el carrito expiró mientras se editaba (`409`):

```json
{
  "error": {
    "code": "CART_EXPIRED",
    "message": "El tiempo del carrito se agotó. Las sillas fueron liberadas.",
    "requestId": "req_01HZ2PLQ9WX4..."
  }
}
```

## Consideraciones de frontend
- **Actualización optimista** de la cantidad de snacks en la UI con **rollback** ante error; `queryClient.setQueryData(["cart"], ...)` y luego reconciliar con la respuesta del servidor.
- **Debounce** de clics rápidos en `+`/`-` (~400 ms) para que una sola petición refleje la cantidad final.
- Ante `CART_EXPIRED`: toast «Tu carrito expiró» e invalidar `["cart"]` → la pantalla muestra el estado vacío.
- Recalcular el total mostrado a partir del `breakdown` devuelto, no con cálculos del cliente (convenciones §6).
- Las líneas de boletos nunca son editables desde aquí — ocultar los steppers en las filas de boletos.

## Reglas de validación
- `quantity` ≥ 1 (ni cero, ni negativos) antes de enviar.
- Nunca incluir `lineId`s de boletos en `snacks` — son propiedad del servidor.

## Reglas de negocio
- Las cantidades no pueden ser negativas; una línea de snacks solo se puede eliminar mediante `DELETE /cart/snacks/{lineId}`.
- Las cantidades de boletos están fijadas a las sillas retenidas y **no** son editables a través de este endpoint.
- Actualizar cantidades no extiende el plazo del carrito.

## Notas de seguridad
- Autenticado; el carrito pertenece al llamante.
- La idempotencia evita la doble aplicación de la cantidad al reintentar (convenciones §9).

## Flujo de ejemplo
1. Pantalla del carrito: el usuario toca `+` dos veces en Combo Familiar.
2. Se dispara el debounce → `PUT /api/v1/cart` con `{ snacks: [{ lineId, quantity: 3 }] }` (UI optimista en 3).
3. `200` → el carrito se reemplaza; el total del desglose se actualiza.
4. Si llega un `409 CART_EXPIRED` → rollback, toast, estado vacío.
