# POST /api/v1/cart/snacks

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-012** — Compra de productos de confitería.

## Propósito
Agrega un producto de confitería al carrito activo, creando una línea de snacks. Requiere un carrito existente (la retención de sillas ya debe haberse convertido). Devuelve la nueva línea más el carrito completo actualizado para que el frontend pueda refrescar los totales y la insignia del carrito de una sola vez.

## Método HTTP
POST

## URL
`/api/v1/cart/snacks` (URL completa: `https://api.multicine.com/api/v1/cart/snacks`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `X-Idempotency-Key` | Sí | UUID por clic en «agregar»; se reutiliza al reintentar (convenciones §9) |
| `Accept-Language` | Opcional | `es` — los nombres de los productos los localiza el backend |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "snackId": "77777777-7777-4777-8777-777777777701",
  "quantity": 2
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `snackId` | string (UUID v4) | Sí | Producto de `GET /snacks` |
| `quantity` | integer | Sí | 1–10 por petición de agregar |

## Respuestas de éxito

**201 Created** — snack agregado; también se devuelve el carrito completo.

```json
{
  "line": {
    "lineId": "99999999-9999-4999-8999-999999999902",
    "snackId": "77777777-7777-4777-8777-777777777701",
    "name": "Combo Familiar",
    "imageUrl": "https://cdn.multicine.com/snacks/combo-familiar.jpg",
    "unitPrice": { "amount": 38500, "currency": "COP" },
    "quantity": 2,
    "lineTotal": { "amount": 77000, "currency": "COP" }
  },
  "cart": { "id": "ca1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d", "status": "OPEN", "expiresInSeconds": 420, "lines": {}, "breakdown": {}, "applied": {} }
}
```

El campo `cart` tiene la misma forma que `GET /cart` (abreviado arriba). Leer siempre los totales de él en lugar de sumar las líneas localmente.

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` etc. | Problemas de sesión — interceptor (convenciones §3) | Refresco silencioso / redirección al inicio de sesión |
| 404 | `SNACK_NOT_FOUND` | Producto desconocido / no disponible en este cine | Deshabilitar la tarjeta; reconsultar el catálogo |
| 409 | `SOLD_OUT` | Producto agotado | Deshabilitar la tarjeta + insignia «Agotado» |
| 409 | `INVENTORY_LIMIT` | La cantidad supera el stock restante | `details` incluye la cantidad disponible; limitar el stepper |
| 409 | `CART_EXPIRED` | No hay carrito activo (expirado/vaciado) | Toast + redirección a la selección de sillas |
| 422 | `VALIDATION_ERROR` | `quantity` fuera de 1–10 | Límite del stepper + mensaje |
| 500 | `SERVER_ERROR` | Fallo inesperado | Error recuperable (convenciones §13) |

Ejemplo completo — stock agotado (`409`):

```json
{
  "error": {
    "code": "INVENTORY_LIMIT",
    "message": "No hay suficiente inventario",
    "details": [
      { "field": "quantity", "message": "Solo quedan 1 unidades disponibles" }
    ],
    "requestId": "req_01HZ0JKQ8VX2Z"
  }
}
```

## Consideraciones de frontend
- **Stepper** de cantidad (1–10); deshabilitar el botón de agregar en los límites.
- Las **tarjetas agotadas** están deshabilitadas y muestran una insignia «Agotado» (de `GET /snacks`).
- En caso de éxito: toast «Agregado al carrito»; actualizar la insignia del carrito a partir del carrito devuelto e invalidar `["cart"]` (y `["snacks", ...]` si expone stock).
- `INVENTORY_LIMIT` → limitar el stepper a la cantidad disponible en `details` y mostrar el mensaje.
- `CART_EXPIRED` → la página de snacks debe pedirle al usuario volver atrás y re-bloquear sillas (el carrito ya no existe).

## Reglas de validación
- `quantity` limitada a 1–10 antes de enviar.
- Solo permitir agregar cuando el producto tenga `isAvailable` y no esté `isSoldOut`.

## Reglas de negocio
- Los productos agotados no se pueden agregar; el stock es por cine (inventario).
- Agregar snacks requiere un carrito activo — sin carrito → `409 CART_EXPIRED`.
- El IVA (19%) aplica a las líneas de snacks y aparece en `breakdown.taxes` (los boletos están exentos).
- Los descuentos de Cine Flash nunca aplican a los snacks.

## Notas de seguridad
- Autenticado; el carrito pertenece al llamante.
- La idempotencia evita líneas de snacks duplicadas cuando un reintento llega a ejecutarse (convenciones §9).

## Flujo de ejemplo
1. El usuario en la pestaña de confitería toca `+` en Combo Familiar (cant. 2).
2. `POST /api/v1/cart/snacks` con `X-Idempotency-Key`.
3. `201` → línea + carrito actualizado; toast; el contador de la insignia aumenta.
4. El stepper continúa en `2`; el usuario puede subirlo mediante `PUT /cart/snacks/{lineId}`.
