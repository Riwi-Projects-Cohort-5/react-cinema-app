# POST /api/v1/giftcards/redeem

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-018** — Bonos de regalo digitales. Agrega un bono de regalo recibido al saldo del usuario (o lo aplica al carrito actual). La consulta es `GET /giftcards/{code}`, aplicar en el carrito es `POST /cart/apply-giftcard`.

## Propósito
Canjea un código de bono de regalo recibido por el usuario, agregando su saldo al saldo de bonos de regalo del usuario (utilizable en compras futuras). Un código solo puede canjearse una vez, por lo que la clave de idempotencia es obligatoria (convenciones §9).

## Método HTTP
POST

## URL
`/api/v1/giftcards/redeem` (URL completa: `https://api.multicine.com/api/v1/giftcards/redeem`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). El saldo canjeado pertenece al usuario autenticado.

## Cabeceras
| Cabecera | ¿Requerida? | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `X-Idempotency-Key` | **Sí** | UUID generado por el cliente por cada intención de canje (convenciones §9). Una clave por cada clic en "Canjear", reutilizada tal cual en el reintento — nunca en un clic nuevo. |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; los mensajes de error son localizados por el backend) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "code": "MC-7F3K-9QX2"
}
```

| Campo | Tipo | ¿Requerido? | Notas |
|---|---|---|---|
| `code` | string | Sí | El código del bono de regalo a canjear (alfanumérico, normalizado en mayúsculas) |

## Respuestas de éxito

**200 OK** — código canjeado y saldo agregado.

```json
{
  "giftcardId": "8c7b6a59-4d3e-4f2a-8b1c-9d0e1f2a3b4c",
  "balanceAdded": { "amount": 80000, "currency": "COP" },
  "newBalance": { "amount": 125000, "currency": "COP" }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `giftcardId` | UUID | Id del bono de regalo canjeado (convenciones §8) |
| `balanceAdded` | object | El valor del bono agregado (COP entero, §6) |
| `newBalance` | object | El **saldo de bonos de regalo** del usuario después de agregar (no el saldo restante del bono) |

## Respuestas de error
Todos los errores usan el sobre de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 404 | `GIFT_CARD_NOT_FOUND` | El código no existe → "Este código no es válido" |
| 409 | `REDEEMED` | El código ya fue canjeado (por este o cualquier usuario) → "Este bono ya fue canjeado" |
| 409 | `EXPIRED` | El bono superó su período de validez → "Este bono expiró" |
| 422 | `VALIDATION_ERROR` | Formato de código inválido (`details` por campo, §4) |
| 429 | `RATE_LIMITED` | Respeta `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — ya canjeado (`409`):

```json
{
  "error": {
    "code": "REDEEMED",
    "message": "Este bono de regalo ya fue canjeado.",
    "requestId": "req_01HZI..."
  }
}
```

## Consideraciones de frontend
- **Flujo de "Canjear"**: un campo para el código, o un enlace profundo del correo recibido que lo pre-llena. Pre-verificación opcional mediante `GET /giftcards/{code}` (solo pista).
- Deshabilitar el botón mientras la petición esté en curso; mantener la `X-Idempotency-Key` por clic (§9) — un reintento devuelve el `200` original sin doble adición.
- En éxito: toast "Bono canjeado: $80.000 agregados a tu saldo" e invalidar `["giftcards"]` (el bono canjeado ahora aparece como `REDEEMED`, aplica `newBalance`) y `["points"]` (el canje puede afectar el resumen de fidelidad).
- **Deshabilitar códigos ya canjeados**: después de una respuesta `409 REDEEMED` (o una pre-verificación), persistir ese estado en la interfaz para que el código no pueda reenviarse; ofrecer contactar a soporte si el bono fue recibido de alguien.
- TanStack Query: `useMutation` con clave `["giftcards", "redeem"]`; en éxito `invalidateQueries(["giftcards"])` + `invalidateQueries(["points"])`.
- En `429` → cuenta regresiva según §10.

## Reglas de validación
Valida ANTES de enviar:
- `code` recortado y en mayúsculas, alfanumérico, longitud esperada ~12.
- Una clave de idempotencia por intención de canje — nunca reutilizar una clave de otro bono.
- Opcionalmente ejecutar la pre-verificación `GET /giftcards/{code}` y bloquear códigos conocidos como inválidos.

## Reglas de negocio
- Un bono de regalo solo puede **canjearse una vez**; los códigos `REDEEMED`/`EXPIRED` se rechazan con sus `409` específicos.
- `balanceAdded` equivale al valor restante completo del bono al momento del canje; `newBalance` es el saldo de bonos de regalo acumulado del usuario (puede gastarse mediante `POST /cart/apply-giftcard`).
- El canje es por usuario y no transferible una vez aplicado — después del canje el saldo pertenece a esta cuenta.

## Notas de seguridad
- La clave de idempotencia evita una doble adición en los reintentos (§9) — nunca reutilizarla para un código diferente.
- Los códigos de bono de regalo son sensibles: sanear/normalizar antes de registrar, nunca registrar códigos completos (truncar).
- Propiedad: solo se acredita el saldo del usuario autenticado; el código en sí no lleva información del propietario (privacidad según `GET /giftcards/{code}`).

## Flujo de ejemplo
1. El usuario abre "Canjear bono" → escribe `MC-7F3K-9QX2` (o llega desde el enlace profundo del correo).
2. Pre-verificación opcional `GET /api/v1/giftcards/MC-7F3K-9QX2` → válido, muestra el saldo.
3. "Canjear" → `POST /api/v1/giftcards/redeem { code }` con `X-Idempotency-Key: k-1`.
4. `200` → toast; `["giftcards"]` y `["points"]` invalidados → saldo actualizado.
5. El usuario intenta el mismo código de nuevo → `409 REDEEMED` → estado deshabilitado, sin doble abono.
