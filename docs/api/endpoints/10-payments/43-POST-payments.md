# POST /api/v1/payments

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-013** — Proceso de pago seguro. Crea la intención de pago sobre la que pivota todo el flujo de compra segura (retención de sillas → carrito → pago → orden).

## Propósito
Crea una intención de pago para el carrito actual y devuelve el flujo del gateway que el frontend debe ejecutar: una **URL de redirección** (PSE/NEQUI/DAVIPLATA) o un **payload de widget embebido** (TARJETA). El servidor no cobra nada en este punto; la captura real ocurre en el gateway, y la orden solo se confirma después mediante `POST /orders` una vez que el pago esté `APPROVED`.

## Método HTTP
POST

## URL
`/api/v1/payments` (URL completa: `https://api.multicine.com/api/v1/payments`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). El carrito pertenece al usuario autenticado.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; los mensajes de error los localiza el backend) |
| `X-Idempotency-Key` | **Sí** | UUID generado por el cliente por clic en «Pagar» (convenciones §9). **Crítico aquí**: un reintento del mismo clic nunca debe crear un segundo cargo — el servidor devuelve la intención original. Reutilizar esta misma clave en `POST /orders`. |
| `X-Request-Id` | Opcional | UUID generado por el cliente, reflejado por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "cartId": "4f3e2d1c-0b9a-4c8d-7e6f-5a4b3c2d1e0f",
  "paymentMethod": "CARD",
  "redirectUrl": "https://multicine.com/payment/return",
  "cardToken": "tok_01HZ3KQ8VX2ZP9aBcDeF"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `cartId` | UUID v4 | Sí | El carrito actual a pagar (convenciones §8). Debe ser el carrito del usuario autenticado. |
| `paymentMethod` | enum | Sí | `CARD` (crédito/débito) \| `PSE` \| `NEQUI` \| `DAVIPLATA`. (Apple/Google Pay planeados — se agregarán como literales nuevos.) |
| `redirectUrl` | string | Sí | URL de retorno para los métodos por redirección. El gateway devuelve aquí al usuario; luego el frontend consulta `GET /payments/{paymentId}`. |
| `cardToken` | string | Condicional | **Solo requerido para `CARD`.** Token de un solo uso producido por el **widget seguro** del proveedor de pagos — el frontend NUNCA envía números de tarjeta en crudo (ver Notas de seguridad). |

## Respuestas de éxito

**201 Created** — intención de pago creada; el cliente debe ejecutar el flujo del gateway devuelto.

```json
{
  "paymentId": "7c5d3e2f-9b8a-4c1d-8e2f-6a5b4c3d2e1f",
  "status": "PENDING",
  "amount": { "amount": 48200, "currency": "COP" },
  "method": "CARD",
  "provider": {
    "name": "PAYU",
    "type": "WIDGET",
    "redirectUrl": null,
    "clientSecret": "cs_live_a1b2c3...",
    "gatewayReference": "PAY-2026-0008819"
  },
  "createdAt": "2026-08-10T18:02:15Z"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `paymentId` | UUID | Id para consultar con `GET /payments/{paymentId}` y para enviar a `POST /orders` (convenciones §8) |
| `status` | enum | `PENDING` \| `APPROVED` \| `DECLINED` (siempre `PENDING` justo después de la creación) |
| `amount` | object | Entero COP (convenciones §6); equivale al total del carrito |
| `provider.type` | enum | `REDIRECT` → navegar a `redirectUrl`; `WIDGET` → abrir el widget seguro embebido con `clientSecret` |
| `provider.clientSecret` | string \| null | Presente para `WIDGET` (TARJETA); el widget se renderiza dentro de la app. Nunca mostrarlo. |
| `provider.gatewayReference` | string | Referencia del lado del proveedor para soporte/trazabilidad |

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (convenciones §3) |
| 409 | `CART_EXPIRED` | Se agotó la ventana de tiempo del carrito → re-crear el carrito (re-tener sillas) y luego reintentar. Ver convenciones §4. |
| 409 | `CART_EMPTY` | El carrito no tiene ítems → volver a la selección de sillas/snacks |
| 422 | `VALIDATION_ERROR` | `paymentMethod` inválido o `cardToken` faltante para `CARD`; `details` mapea a los campos (convenciones §4) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error reintentable (convenciones §13) |

Ejemplo completo — carrito expirado (`409`):

```json
{
  "error": {
    "code": "CART_EXPIRED",
    "message": "Tu carrito expiró. Por favor selecciona de nuevo tus sillas.",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Deshabilitar el botón de pagar tras el primer clic** — sin doble envío (convenciones §9). Mostrar un estado «Procesando» con el spinner del método seleccionado mientras se espera el `201`.
- Mantener la `X-Idempotency-Key` en memoria durante **toda la sesión de compra**: enviar la misma clave a `POST /orders` después del `APPROVED`. Esto es lo que garantiza «la compra no se envía dos veces».
- **TARJETA** → cerrar cualquier ruta de envío por botón y abrir el **widget seguro embebido** del proveedor (`provider.type === "WIDGET"`, usando `clientSecret`). No renderizar campos de tarjeta propios.
- **PSE / NEQUI / DAVIPLATA** → navegar (`window.location` o una redirección controlada) a `provider.redirectUrl`, pasando la `redirectUrl` para que el gateway regrese a la app.
- Al regresar del gateway → **consultar `GET /payments/{paymentId}`** (ver ese documento). Para `WIDGET`, suscribirse al evento de éxito del widget y también consultar — la consulta es la autoritativa.
- **Nunca almacenar datos de tarjeta**, `cardToken` ni `clientSecret` en ningún almacenamiento del cliente (Notas de seguridad).
- TanStack Query: usar un `useMutation` de un solo disparo para la intención (sin caché que invalidar aún); consultar mediante la clave GET de pagos.
- Ante `409 CART_EXPIRED` → redirigir a la re-selección de sillas con un toast; ante `429` → cuenta regresiva según convenciones §10.

## Reglas de validación
Validar ANTES de enviar:
- `cartId` es un UUID v4 válido; `paymentMethod` es uno de `CARD|PSE|NEQUI|DAVIPLATA`.
- `redirectUrl` es una URL `https://` bajo el dominio propio de la app (`multicine.com`), para el retorno del gateway.
- Para `CARD`: el widget seguro produjo un `cardToken` no vacío. Si el widget falló/el token está vacío, NO enviar — mostrar el error del widget.
- Generar `X-Idempotency-Key` como UUID exactamente una vez por intención de pago; reutilizarla textualmente en cada reintento de ese mismo clic.

## Reglas de negocio
- El total del carrito queda congelado en la intención (`amount`); ediciones posteriores del carrito no lo cambian.
- Las intenciones `PENDING` se pueden consultar; el servidor transiciona a `APPROVED`/`DECLINED` conforme reporta el gateway.
- Un pago `APPROVED` sin un `POST /orders` posterior se reconcilia **asincrónicamente mediante webhook** (ver documento de órdenes) — el frontend no debe asumir que la orden existe solo porque el pago está aprobado.
- Las reglas de Cine Flash aplican al momento de la compra (solo boletos, sin snacks) — aplicadas en el servidor sobre el carrito.

## Notas de seguridad
- **PCI**: el frontend NUNCA toca, almacena o registra números de tarjeta. Todo el ingreso de tarjeta ocurre dentro del widget seguro del proveedor; el cliente solo maneja `cardToken`. No almacenar `cardToken` ni `clientSecret` más allá del alcance de la llamada en memoria.
- Nunca registrar payloads de pago ni la clave de idempotencia.
- Propiedad: la intención está vinculada al usuario autenticado; `GET /payments/{paymentId}` aplica el mismo propietario (403 para otros).
- La `X-Idempotency-Key` previene el doble cobro — el servidor reproduce el resultado original al reintentar (convenciones §9).

## Flujo de ejemplo
```
El usuario toca «Pagar» → botón deshabilitado, spinner «Procesando»
↓
POST /payments { cartId, paymentMethod, redirectUrl, cardToken? }  (X-Idempotency-Key: k-1)
↓
201 → provider.type === "WIDGET"
↓
Abrir el widget seguro embebido (clientSecret) → el usuario completa el ingreso de la tarjeta
↓
El gateway confirma → consultar GET /payments/{paymentId} (3 s)
↓
status APPROVED → POST /orders { paymentId } con la misma clave k-1
(métodos por redirección: navegar a provider.redirectUrl → retorno vía redirectUrl → consultar)
```

## Conciliación con el backlog
Este endpoint reemplaza el `POST /payments/initiate` del backlog (sin ruta separada — la intención ES la creación del pago; no existe la división «crear y luego iniciar»).
