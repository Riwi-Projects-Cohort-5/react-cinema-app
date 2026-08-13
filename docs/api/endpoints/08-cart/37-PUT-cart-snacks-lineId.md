# PUT /api/v1/cart/snacks/{lineId}

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-012** — Compra de productos de confitería. Alias de backlog: `PUT /cart/snacks` (rediseñado para consistencia REST — con alcance por ítem).

## Propósito
Actualiza la cantidad de una sola línea de snacks existente en el carrito activo. Devuelve el carrito completo actualizado para que los totales se refresquen en una sola respuesta.

## Método HTTP
PUT

## URL
`/api/v1/cart/snacks/{lineId}` (URL completa: `https://api.multicine.com/api/v1/cart/snacks/{lineId}`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `X-Idempotency-Key` | Sí | UUID por intención de cambio de cantidad; se reutiliza al reintentar (convenciones §9) |
| `Accept-Language` | Opcional | `es` — los nombres de los productos los localiza el backend |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `lineId` | string (UUID v4) | Sí | Id de la línea de snacks de `GET /cart` |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "quantity": 3
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `quantity` | integer | Sí | ≥ 1; máx. 10 por línea |

## Respuestas de éxito

**200 OK** — carrito actualizado (misma forma que `GET /cart`).

```json
{
  "cart": {
    "id": "ca1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
    "status": "OPEN",
    "expiresAt": "2026-08-10T20:41:00Z",
    "expiresInSeconds": 240,
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
| 404 | `LINE_NOT_FOUND` | Falta la línea de snacks | Reconsultar `["cart"]`; ignorar la línea obsoleta |
| 409 | `CART_EXPIRED` | Se agotó la ventana de tiempo del carrito | Toast + invalidar → estado vacío |
| 409 | `INVENTORY_LIMIT` | La cantidad supera el stock | Limitar a lo disponible en `details` |
| 422 | `VALIDATION_ERROR` | `quantity` < 1 o > 10 | Limitar el stepper; mensaje en línea |
| 500 | `SERVER_ERROR` | Fallo inesperado | Error recuperable (convenciones §13) |

Ejemplo completo — se alcanzó el límite de inventario (`409`):

```json
{
  "error": {
    "code": "INVENTORY_LIMIT",
    "message": "No hay suficiente inventario",
    "details": [
      { "field": "quantity", "message": "Solo quedan 2 unidades disponibles" }
    ],
    "requestId": "req_01HZ9QWX..."
  }
}
```

## Consideraciones de frontend
- **Actualización optimista** de la cantidad con **rollback** ante error; debounce de clics rápidos en `+`/`-` (~400 ms).
- El total se actualiza en tiempo real a partir del `breakdown` devuelto (recalcular desde el servidor, convenciones §6).
- Ante `CART_EXPIRED` hacer rollback y mostrar el estado de expiración.
- Invalidar `["cart"]` en caso de éxito para mantener la insignia consistente.

## Reglas de validación
- `quantity` ≥ 1 y ≤ 10 antes de enviar.

## Reglas de negocio
- Los cambios de cantidad no extienden el plazo del carrito.
- Eliminar una línea por completo se hace mediante `DELETE /cart/snacks/{lineId}`, no asignando `quantity: 0` (se rechaza con 422).

## Notas de seguridad
- Autenticado; `lineId` debe pertenecer al carrito del llamante (propiedad validada).
- La idempotencia evita la doble aplicación al reintentar (convenciones §9).

## Flujo de ejemplo
1. Pantalla del carrito: el usuario toca `+` en Combo Familiar (2 → 3).
2. `PUT /api/v1/cart/snacks/{lineId}` con `{ quantity: 3 }` (UI optimista).
3. `200` → los totales se refrescan; el stepper lee `3`.
