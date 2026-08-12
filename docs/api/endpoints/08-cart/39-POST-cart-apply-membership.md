# POST /api/v1/cart/apply-membership

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-011** — Carrito de compras.

## Propósito
Aplica el beneficio de membresía del usuario (descuento) al carrito activo. Devuelve el carrito completo con `applied.membership: true` y el desglose actualizado para que el frontend pueda mostrar el nuevo total y los ahorros.

## Método HTTP
POST

## URL
`/api/v1/cart/apply-membership` (URL completa: `https://api.multicine.com/api/v1/cart/apply-membership`)

## Autenticación
- Autenticado + **miembro** (Bearer JWT, convenciones §3).

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
{}
```

Sin campos en el cuerpo — el beneficio proviene de la membresía autenticada.

## Respuestas de éxito

**200 OK** — membresía aplicada al carrito.

```json
{
  "cart": {
    "id": "ca1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
    "status": "OPEN",
    "expiresAt": "2026-08-10T20:41:00Z",
    "expiresInSeconds": 315,
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
          "quantity": 1,
          "lineTotal": { "amount": 38500, "currency": "COP" }
        }
      ]
    },
    "breakdown": {
      "subtotal": { "amount": 71500, "currency": "COP" },
      "savings": { "amount": 0, "currency": "COP" },
      "giftcard": { "amount": 0, "currency": "COP" },
      "membership": { "amount": 4950, "currency": "COP" },
      "taxes": { "amount": 7315, "currency": "COP" },
      "total": { "amount": 73865, "currency": "COP" }
    },
    "applied": { "membership": true, "giftcard": null }
  }
}
```

El descuento de membresía (15% de los boletos = 4950) se muestra como una línea dedicada `breakdown.membership`. Los snacks conservan su IVA.

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` etc. | Problemas de sesión — interceptor (convenciones §3) | Refresco silencioso / redirección al inicio de sesión |
| 403 | `NOT_A_MEMBER` | Sin membresía / beneficio no elegible | Ocultar/deshabilitar el toggle con un CTA «hazte miembro» |
| 404 | `CART_NOT_FOUND` | No hay carrito activo | Redirigir a la selección de sillas |
| 409 | `PROMOTION_CONFLICT` | La membresía no es acumulable con una promo activa (p. ej. Cine Flash) | Mensaje en el cuerpo; mantener el toggle apagado |
| 409 | `CART_EXPIRED` | Se agotó la ventana de tiempo del carrito | Toast + invalidar → estado vacío |
| 500 | `SERVER_ERROR` | Fallo inesperado | Error recuperable (convenciones §13) |

Ejemplo completo — conflicto con Cine Flash (`409`):

```json
{
  "error": {
    "code": "PROMOTION_CONFLICT",
    "message": "El descuento de membresía no es acumulable con Cine Flash",
    "requestId": "req_01HZ7QWX..."
  }
}
```

## Consideraciones de frontend
- **Toggle «Aplicar membresía»** en la pantalla de carrito/pago; mostrar la etiqueta del beneficio del miembro desde `GET /membership/benefits`.
- **Toggle optimista con rollback** ante error.
- **Deshabilitar el toggle mientras esté activa una promo de Cine Flash** (`promotionApplied.type === "CINEFLASH"` en el resumen de reserva / banderas del carrito) — no acumulable.
- En caso de éxito: toast con el monto ahorrado («¡Ahorraste $4.950 con tu membresía!»).
- Invalidar `["cart"]`; mantener `applied.membership` sincronizado.

## Reglas de validación
- Mostrar el toggle solo cuando el usuario tenga una membresía elegible (de `GET /membership`).
- Deshabilitarlo cuando `promotionApplied` indique Cine Flash.

## Reglas de negocio
- El descuento de membresía aplica a los **boletos** (y, según las reglas de la promo, opcionalmente a los snacks); aparece en `breakdown.membership`.
- **No acumulable con Cine Flash** — un conflicto devuelve `409 PROMOTION_CONFLICT`.
- Aplicarla no extiende el plazo del carrito.

## Notas de seguridad
- Solo autenticado + miembro (`403 NOT_A_MEMBER` de lo contrario).
- El beneficio se deriva en el servidor de la membresía; nunca confiar en un descuento calculado por el cliente.

## Flujo de ejemplo
1. Pantalla del carrito: el usuario activa el toggle «Aplicar membresía».
2. `POST /api/v1/cart/apply-membership` → `200` con `applied.membership: true`.
3. El desglose muestra `membership: 4950`; el total baja; el toast confirma los ahorros.
