# GET /api/v1/cart

## Historia de usuario relacionada
- **HU-FE-011** — Carrito de compras.

## Propósito
Devuelve el carrito activo del usuario (líneas de boletos + líneas de snacks, desglose y beneficios aplicados) o `null` cuando no hay un carrito activo. Es la única fuente de verdad para la pantalla del carrito — todos los totales y contadores se recalculan a partir de esta respuesta, nunca se calculan en los componentes.

## Método HTTP
GET

## URL
`/api/v1/cart` (URL completa: `https://api.multicine.com/api/v1/cart`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `Accept-Language` | Opcional | `es` — localiza los nombres de los productos |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — carrito activo (o `cart: null`).

```json
{
  "cart": {
    "id": "ca1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
    "status": "OPEN",
    "expiresAt": "2026-08-10T20:41:00Z",
    "expiresInSeconds": 432,
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
      "membership": { "amount": 0, "currency": "COP" },
      "taxes": { "amount": 7315, "currency": "COP" },
      "total": { "amount": 78815, "currency": "COP" }
    },
    "applied": { "membership": false, "giftcard": null }
  }
}
```

Variante vacía:

```json
{
  "cart": null
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `cart` | object \| null | `null` → no hay carrito activo (expirado, vaciado o nunca creado) |
| `lines.tickets[].function` | object | Usado por «editar sillas» para navegar de vuelta al mapa de sillas (`function.id`) |
| `lines.snacks[].lineTotal` | object | `unitPrice × quantity`, entero COP (convenciones §6) |
| `breakdown.taxes` | object | IVA (19%) sobre las líneas de snacks; los boletos están exentos |
| `breakdown.total` | object | `subtotal − savings − giftcard − membership + taxes` |

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4. Códigos relevantes: `401`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` etc. | Problemas de sesión — interceptor (convenciones §3) | Refresco silencioso / redirección al inicio de sesión |
| 500 | `SERVER_ERROR` | Fallo inesperado | Error recuperable con reintento (convenciones §13) |

Ejemplo completo:

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Ocurrió un error inesperado. Intenta de nuevo.",
    "requestId": "req_01HZ3JKQ8VX2Z"
  }
}
```

## Consideraciones de frontend
- Clave de TanStack Query `["cart"]`; `refetchInterval` de ~**30 s** para que la insignia de cuenta regresiva y los precios se mantengan actualizados.
- **Skeleton** mientras se carga (convenciones §13) — nunca una pantalla en blanco.
- **Estado vacío** (`cart: null`) → «Tu carrito está vacío» + CTA a la cartelera (`GET /movies`).
- **Insignia de cuenta regresiva** a partir de `expiresInSeconds`; cuando llega a 0, mostrar un overlay de expiración e invalidar — la siguiente consulta devuelve `cart: null`.
- «Editar sillas» navega de vuelta al mapa de sillas usando `lines.tickets[0].function.id` (hay como máximo una línea de boletos por función).
- **Recalcular los totales a partir de la respuesta** — no sumar líneas en los componentes (evitar desviaciones de flotantes/redondeo, convenciones §6).
- El contador de la insignia del carrito = cantidad de boletos + suma de cantidades de snacks de `lines`.

## Reglas de validación
- Ninguna — solo lectura.

## Reglas de negocio
- El carrito **expira 10 minutos después de la retención**; tras la expiración el servidor libera las sillas y el carrito deja de estar activo (`cart: null`).
- Las cantidades de boletos están ligadas a las sillas retenidas; las cantidades de snacks son editables mediante `PUT /cart` / `PUT /cart/snacks/{lineId}`.
- Cine Flash (solo boletos, 20%, máx. 3) se refleja en `breakdown.savings`.

## Notas de seguridad
- Autenticado y limitado al llamante — nunca muestra el carrito de otro usuario.
- Los precios provienen del servidor; el frontend no debe recalcularlos.

## Flujo de ejemplo
1. El usuario llega a `/cart`.
2. `GET /api/v1/cart` → skeleton → carrito con boletos + 1 snack.
3. La insignia de cuenta regresiva muestra 07:12; el `refetchInterval` la mantiene actualizada.
4. El usuario toca «Editar sillas» → `GET /functions/{function.id}/seats`.
