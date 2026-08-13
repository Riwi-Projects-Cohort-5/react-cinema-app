# POST /api/v1/cart

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-011** — Carrito de compras.

## Propósito
Crea el carrito de compras a partir de la retención (hold) de sillas activa, convirtiendo las sillas retenidas en líneas de boletos. Se invoca desde la pantalla de selección de sillas («Continuar»). Hay **un solo carrito activo por usuario**; al crear el carrito, la retención de sillas se mantiene vigente hasta que el propio carrito expira (10 minutos desde la retención).

## Método HTTP
POST

## URL
`/api/v1/cart` (URL completa: `https://api.multicine.com/api/v1/cart`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `X-Idempotency-Key` | Sí | UUID por clic en «Continuar»; se reutiliza al reintentar el mismo clic, nunca en un clic nuevo (convenciones §9) |
| `Accept-Language` | Opcional | `es` — los mensajes de error los localiza el backend |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "holdId": "ab1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `holdId` | string (UUID v4) | Sí | La retención activa a convertir, proveniente de `POST /functions/{functionId}/seat-holds` |

## Respuestas de éxito

**201 Created** — carrito creado a partir de la retención.

```json
{
  "cart": {
    "id": "ca1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
    "status": "OPEN",
    "expiresAt": "2026-08-10T20:41:00Z",
    "expiresInSeconds": 600,
    "lines": {
      "tickets": [
        {
          "lineId": "99999999-9999-4999-8999-999999999901",
          "function": {
            "movie": { "id": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f", "title": "El Último Horizonte" },
            "startAt": "2026-08-10T20:30:00Z",
            "format": "2D"
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
      "taxes": { "amount": 0, "currency": "COP" },
      "total": { "amount": 33000, "currency": "COP" }
    },
    "applied": { "membership": false, "giftcard": null }
  }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `cart.id` | UUID | Usado por `GET /cart`, `PUT /cart`, `DELETE /cart` |
| `cart.status` | enum | `OPEN` al crearse (`PAID`, `EXPIRED` después) |
| `cart.expiresInSeconds` | integer | Cuenta regresiva del carrito (10 min desde la retención) |
| `lines.tickets[].seats` | string[] | Etiquetas de sillas vinculadas a la línea de boletos |
| `breakdown` | object | `subtotal`/`savings`/`taxes`/`total`, entero COP (convenciones §6) |
| `applied` | object | Indicadores de beneficios `membership`/`giftcard`, activados por los endpoints de aplicación |

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` etc. | Problemas de sesión — interceptor (convenciones §3) | Refresco silencioso / redirección al inicio de sesión |
| 404 | `HOLD_NOT_FOUND` | Retención desconocida / ya consumida | Volver a seleccionar sillas |
| 409 | `HOLD_EXPIRED` | El tiempo de la retención se agotó antes de «Continuar» | Mostrar mensaje + redirigir a re-seleccionar sillas |
| 409 | `CART_ALREADY_EXISTS` | Ya existe un carrito | **En su lugar, hacer seguimiento con `GET /cart`** |
| 422 | `VALIDATION_ERROR` | `holdId` inválido o faltante | Error en el campo bajo el CTA |
| 429 | `RATE_LIMITED` | Demasiadas peticiones | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Fallo inesperado | Error reintentable (convenciones §13) |

Ejemplo completo — la retención expiró mientras el usuario decidía (`409`):

```json
{
  "error": {
    "code": "HOLD_EXPIRED",
    "message": "El tiempo para reservar tus sillas se agotó. Debes seleccionarlas de nuevo.",
    "requestId": "req_01HZ4QWX..."
  }
}
```

## Consideraciones de frontend
- Se dispara con **«Continuar»** en la pantalla de selección de sillas.
- **Evitar el doble envío**: deshabilitar el botón mientras la petición esté en curso; reutilizar la misma `X-Idempotency-Key` si la petición se reintenta — nunca generar una clave nueva para el mismo clic (convenciones §9).
- `HOLD_EXPIRED` → toast/modal «Tu reserva expiró» y navegar de vuelta al mapa de sillas para re-seleccionar.
- `CART_ALREADY_EXISTS` → **no** mostrar error; consultar `GET /cart` e ir a la pantalla del carrito.
- En caso de éxito: `queryClient.setQueryData(["cart"], data)` (o invalidar `["cart"]`) y navegar a la página del carrito.
- Además, invalidar `["reservations", "summary"]` (la retención se convirtió en un carrito).

## Reglas de validación
- `holdId` presente y un UUID válido.
- Deshabilitar el botón mientras la petición esté pendiente; tratar los clics repetidos como la misma intención (misma clave).

## Reglas de negocio
- Convertir la retención en un carrito mantiene las sillas subyacentes bloqueadas; el **carrito expira 10 minutos después de la retención**.
- La cantidad de boletos está fijada al número de sillas retenidas — `PUT /cart` no puede cambiar las cantidades de boletos.
- Los ahorros de Cine Flash se reflejan en `breakdown.savings` cuando corresponda (solo boletos).

## Notas de seguridad
- El `holdId` debe pertenecer al usuario autenticado (la propiedad se valida en el servidor).
- La clave de idempotencia garantiza que el carrito se cree **una sola vez** incluso si la respuesta se pierde y el cliente reintenta (convenciones §9).

## Flujo de ejemplo
1. El usuario tiene una retención activa F12/F13 y hace clic en «Continuar».
2. `POST /api/v1/cart` con `X-Idempotency-Key` + `holdId`.
3. `201` → carrito creado; navegar a `/cart`.
4. La pantalla del carrito consulta `GET /cart` (clave `["cart"]`) e inicia la cuenta regresiva.
