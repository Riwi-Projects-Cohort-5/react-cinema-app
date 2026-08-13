# POST /api/v1/cart/apply-giftcard

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-011** — Carrito de compras. **HU-FE-018** — Bonos de regalo digitales (flujo de canje).

## Propósito
Aplica un código de tarjeta de regalo (bonos) como línea de pago/descuento en el carrito activo. El saldo de la tarjeta se canjea contra el total del carrito; el carrito completo se devuelve con `applied.giftcard` y el desglose actualizado. Una tarjeta de regalo se puede combinar con un descuento de membresía, pero nunca baja el total por debajo de 0 COP.

## Método HTTP
POST

## URL
`/api/v1/cart/apply-giftcard` (URL completa: `https://api.multicine.com/api/v1/cart/apply-giftcard`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `X-Idempotency-Key` | Sí | UUID por intención de aplicar; se reutiliza al reintentar (convenciones §9) |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "code": "MC-GIFT-2026-8F3K"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `code` | string | Sí | Código alfanumérico legible (convenciones §8); no distingue mayúsculas y minúsculas |

## Respuestas de éxito

**200 OK** — tarjeta de regalo aplicada al carrito.

```json
{
  "cart": {
    "id": "ca1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
    "status": "OPEN",
    "expiresAt": "2026-08-10T20:41:00Z",
    "expiresInSeconds": 210,
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
      "snacks": []
    },
    "breakdown": {
      "subtotal": { "amount": 33000, "currency": "COP" },
      "savings": { "amount": 0, "currency": "COP" },
      "giftcard": { "amount": 33000, "currency": "COP" },
      "membership": { "amount": 0, "currency": "COP" },
      "taxes": { "amount": 0, "currency": "COP" },
      "total": { "amount": 0, "currency": "COP" }
    },
    "applied": {
      "membership": false,
      "giftcard": { "code": "MC-GIFT-2026-8F3K", "amount": { "amount": 33000, "currency": "COP" } }
    }
  }
}
```

`applied.giftcard.amount` es el monto aplicado a *este* carrito (≤ total del carrito). Aquí cubre los 33000 completos; cualquier saldo restante queda en la tarjeta para un carrito futuro.

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` etc. | Problemas de sesión — interceptor (convenciones §3) | Refresco silencioso / redirección al inicio de sesión |
| 404 | `GIFT_CARD_NOT_FOUND` | El código no existe | Error en línea bajo el campo de entrada |
| 404 | `CART_NOT_FOUND` | No hay carrito activo | Redirigir a la selección de sillas |
| 409 | `GIFT_CARD_REDEEMED` | El código ya fue usado | Error en línea: «Este bono ya fue usado» |
| 409 | `GIFT_CARD_EXPIRED` | El código pasó su vigencia | Error en línea: «Este bono está vencido» |
| 409 | `INSUFFICIENT_BALANCE` | Saldo de la tarjeta < total del carrito (cuando se requiere cobertura total) | Mostrar el monto parcial aplicado + el saldo pendiente |
| 422 | `VALIDATION_ERROR` | Código mal formado | Mensaje de formato en línea |
| 500 | `SERVER_ERROR` | Fallo inesperado | Error recuperable (convenciones §13) |

Ejemplo completo — ya canjeado (`409`):

```json
{
  "error": {
    "code": "GIFT_CARD_REDEEMED",
    "message": "Este bono de regalo ya fue utilizado",
    "requestId": "req_01HZ6PLQ9WX4..."
  }
}
```

## Consideraciones de frontend
- **Campo de código en línea** en la pantalla de carrito/pago con un botón pequeño «Aplicar».
- Pre-verificación opcional mediante `GET /giftcards/{code}` (público, HU-FE-018) para validar antes de aplicar — tratarla como una verificación suave; la llamada de aplicar es la autoritativa.
- En caso de éxito mostrar el monto aplicado (`applied.giftcard.amount`) y una opción para quitarlo.
- Los errores se renderizan **en línea bajo el campo de entrada**, mapeados desde la tabla de códigos de error.
- Invalidar `["cart"]`; mantener la línea de desglose `giftcard` sincronizada.

## Reglas de validación
- Recortar (trim) el código; validar el formato (p. ej. `MC-XXXX-XXXX-XXXX`) antes de enviar.
- No vacío; deshabilitar «Aplicar» mientras la petición esté en curso.

## Reglas de negocio
- La tarjeta de regalo actúa como una **línea de descuento** (`breakdown.giftcard`); el saldo restante de la tarjeta es usable en un carrito futuro.
- Se puede combinar con un descuento de membresía, pero el total nunca baja de 0 COP.
- Aplicarla no extiende el plazo del carrito.

## Notas de seguridad
- Autenticado; el código se aplica al propio carrito del llamante.
- Los códigos se validan en el servidor; nunca registrar códigos completos más allá de la transacción.
- La idempotencia evita que el mismo código se canjee dos veces al reintentar (convenciones §9).

## Flujo de ejemplo
1. El usuario escribe `MC-GIFT-2026-8F3K` en la pantalla de pago.
2. `POST /api/v1/cart/apply-giftcard` → `200`; se muestra el monto aplicado.
3. El desglose se actualiza; el total baja a $0; el usuario procede a confirmar la orden.
