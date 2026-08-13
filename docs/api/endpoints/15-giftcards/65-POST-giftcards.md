# POST /api/v1/giftcards

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-018** — Bonos de regalo digitales. Creación/compra de un bono de regalo digital; la consulta es `GET /giftcards`, el canje es `POST /giftcards/redeem`, y `POST /cart/apply-giftcard` aplica uno en el carrito.

## Propósito
Crea la compra de un bono de regalo digital (monto preestablecido o personalizado, diseño, destinatario, envío programado opcional). El bono se crea en estado `PENDING_PAYMENT` y solo pasa a `ACTIVE` una vez que su pago es aprobado — el código y el QR se revelan solo después de la compra. La clave de idempotencia es obligatoria para evitar compras duplicadas (convenciones §9).

## Método HTTP
POST

## URL
`/api/v1/giftcards` (URL completa: `https://api.multicine.com/api/v1/giftcards`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). El comprador es el usuario autenticado.

## Cabeceras
| Cabecera | ¿Requerida? | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `X-Idempotency-Key` | **Sí** | UUID generado por el cliente por cada intención de compra (convenciones §9). Una clave por cada clic en "Comprar", reutilizada tal cual en el reintento — nunca en un clic nuevo. |
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
  "amount": null,
  "customAmount": 80000,
  "designId": "d1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f5a",
  "recipient": {
    "name": "Camila Gómez",
    "email": "camila.gomez@example.com"
  },
  "message": "¡Feliz cumpleaños, Camila! Te invito al cine.",
  "sendAt": "2026-08-25"
}
```

| Campo | Tipo | ¿Requerido? | Notas |
|---|---|---|---|
| `amount` | integer | Condicional | Monto preestablecido en COP; debe estar presente **exactamente uno** de `amount`/`customAmount` |
| `customAmount` | integer | Condicional | Monto personalizado en COP; debe estar dentro de `[20000, 500000]` |
| `designId` | UUID v4 | Sí | Diseño del bono elegido del catálogo de bonos de regalo (convenciones §8) |
| `recipient.name` | string | Sí | Nombre visible del destinatario |
| `recipient.email` | string | Sí | Correo del destinatario (formato válido) — destino de la entrega cuando se envía ahora o en `sendAt` |
| `message` | string | No | Mensaje personal opcional (≤ 500 caracteres) |
| `sendAt` | string `YYYY-MM-DD` | No | Fecha de envío programado **futura** opcional (convenciones §7). Si está ausente → se envía inmediatamente después del pago. |

## Respuestas de éxito

**201 Created** — bono de regalo registrado, a la espera del pago. El código y el QR son `null` hasta que el pago sea aprobado.

```json
{
  "giftcardId": "7f6e5d4c-3b2a-4c1d-8e0f-1a2b3c4d5e6f",
  "code": null,
  "qrDataUrl": null,
  "amount": { "amount": 80000, "currency": "COP" },
  "status": "PENDING_PAYMENT",
  "paymentId": "3a2b1c0d-9e8f-4a7b-6c5d-4e3f2a1b0c9d",
  "sendAt": "2026-08-25"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `giftcardId` | UUID | Id usado para hacer seguimiento del bono y su pago (convenciones §8) |
| `code` | string \| null | Código del bono; **`null` hasta la aprobación del pago** — nunca renderizar antes de la compra |
| `qrDataUrl` | string \| null | URL de la imagen QR del bono; `null` hasta la aprobación del pago |
| `amount` | object | Entero COP (convenciones §6) |
| `status` | enum | Siempre `PENDING_PAYMENT` en la creación |
| `paymentId` | UUID | La intención de pago a cobrar — envíala con tu `paymentMethod` elegido a `POST /payments`, luego haz polling a `GET /payments/{paymentId}` |
| `sendAt` | string `YYYY-MM-DD` \| null | Fecha de envío programado (refleja la petición) |

## Respuestas de error
Todos los errores usan el sobre de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 422 | `VALIDATION_ERROR` | `customAmount` fuera de `[20000, 500000]`, correo del destinatario inválido, `sendAt` en el pasado, o se enviaron `amount` y `customAmount` a la vez (`details` por campo, §4) |
| 409 | `CONFLICT` | Misma `X-Idempotency-Key` reutilizada con un payload diferente (idempotencia, §9) |
| 429 | `RATE_LIMITED` | Respeta `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — monto inválido (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El valor del bono no es válido.",
    "details": [
      { "field": "customAmount", "message": "El valor debe estar entre $20.000 y $500.000 COP" }
    ],
    "requestId": "req_01HZE..."
  }
}
```

## Consideraciones de frontend
- **Montos preestablecidos** (p. ej. $20.000 / $50.000 / $100.000 / $200.000) más un **campo de monto personalizado** validado contra `[20000, 500000]` COP; se selecciona exactamente uno.
- **Selector de diseño** con vista previa en vivo del diseño elegido superpuesta con el monto y el nombre del destinatario.
- **Formulario del destinatario** (nombre, correo), mensaje opcional, selector de fecha de **envío programado** opcional (debe ser futura).
- **"Pagar"**: deshabilitar al hacer clic (sin doble envío), luego
  1. `POST /api/v1/giftcards` con `X-Idempotency-Key` → `201` → `paymentId`.
  2. `POST /payments` con ese `paymentId` + el `paymentMethod` elegido (según `POST /payments`).
  3. Hacer polling a `GET /payments/{paymentId}` (3 s) hasta `APPROVED`/`DECLINED`.
  4. En `APPROVED` el bono pasa a `ACTIVE` — invalidar `["giftcards"]` y volver a consultar para obtener y mostrar `code` + `qrDataUrl` (revelación "ver código/QR").
- Conserva la misma `X-Idempotency-Key` para toda la intención de compra; un reintento debe devolver el `201` original (§9).
- En `DECLINED` → permitir reintentar con una intención nueva; en `422` → mapear `details` a los campos del formulario.
- TanStack Query: `useMutation` para la creación; el refresco posterior al pago usa `["giftcards"]`.

## Reglas de validación
Valida ANTES de enviar:
- Exactamente uno de `amount`/`customAmount`; `customAmount` entero dentro de `[20000, 500000]` COP (§6).
- `recipient.email` cumple un formato de correo válido; `recipient.name` no vacío.
- `sendAt` tiene formato `YYYY-MM-DD` y está estrictamente en el futuro (convenciones §7).
- `message` ≤ 500 caracteres; `designId` es un UUID válido.
- Genera `X-Idempotency-Key` exactamente una vez por intención de compra; reutilízala tal cual en el reintento (§9).

## Reglas de negocio
- El bono se crea en **`PENDING_PAYMENT`** y pasa a **`ACTIVE` solo después de que su pago sea aprobado** (webhook/polling).
- El **código y el QR aparecen solo después de la compra** — son `null` en el `201` y en el listado hasta que esté `ACTIVE`.
- Con `sendAt`, el bono se entrega al correo del destinatario en esa fecha; de lo contrario, se envía justo después de la aprobación del pago.
- Un pago `DECLINED` deja el bono en `PENDING_PAYMENT`; un bono abandonado puede reanudarse o descartarse.

## Notas de seguridad
- La `X-Idempotency-Key` evita compras/cargos duplicados (§9); nunca reutilices una clave para un monto/destinatario diferente.
- `code` y `qrDataUrl` son sensibles — revelarlos solo después de la compra, en un modal, y nunca registrarlos ni persistirlos en el cliente más allá de la sesión.
- Propiedad: solo el comprador ve sus bonos comprados en `GET /giftcards`; el destinatario recibe la entrega pero no acceso a la cuenta del comprador.

## Flujo de ejemplo
1. El usuario elige un monto preestablecido ($80.000), un diseño, el destinatario "Camila Gómez", un mensaje de cumpleaños y `sendAt`.
2. "Pagar" → `POST /api/v1/giftcards` (`X-Idempotency-Key: k-1`) → `201 PENDING_PAYMENT` + `paymentId`.
3. `POST /payments { paymentMethod, paymentId }` → flujo de la pasarela → polling a `GET /payments/{paymentId}`.
4. `APPROVED` → bono `ACTIVE` → invalidar `["giftcards"]` → código + QR revelados en un modal "ver código".
5. El bono se entrega al destinatario en `sendAt`.
