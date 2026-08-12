# GET /api/v1/giftcards/{code}

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-018** — Bonos de regalo digitales. Consulta pública de saldo usada antes de aplicar un bono en el carrito (con `POST /cart/apply-giftcard`). El canje es `POST /giftcards/redeem`.

## Propósito
Comprueba la validez, el estado y el saldo actual de un código de bono de regalo (p. ej. antes de aplicarlo en el carrito). Público por diseño para que un destinatario pueda verificar un bono recibido sin cuenta — la respuesta contiene intencionalmente **ninguna información del propietario**.

## Método HTTP
GET

## URL
`/api/v1/giftcards/{code}` (URL completa: `https://api.multicine.com/api/v1/giftcards/{code}`)

## Autenticación
- Público. No se requiere cabecera `Authorization`.

## Cabeceras
| Cabecera | ¿Requerida? | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; los mensajes de error son localizados por el backend) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
| Nombre | Tipo | ¿Requerido? | Descripción |
|---|---|---|---|
| `code` | string (alfanumérico) | Sí | El código del bono de regalo, p. ej. `MC-7F3K-9QX2` |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — código válido y utilizable.

```json
{
  "code": "MC-7F3K-9QX2",
  "status": "ACTIVE",
  "balance": { "amount": 80000, "currency": "COP" },
  "expiresAt": "2026-12-31"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `code` | string | Refleja el parámetro de ruta (normalizado en mayúsculas) |
| `status` | enum | Siempre `ACTIVE` en una consulta exitosa |
| `balance` | object | Saldo restante actual en COP entero (convenciones §6) |
| `expiresAt` | string `YYYY-MM-DD` | Fin del período de validez del bono |

## Respuestas de error
Todos los errores usan el sobre de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 404 | `GIFT_CARD_NOT_FOUND` | El código no existe → "Este código no es válido" |
| 409 | `REDEEMED` | El bono ya fue canjeado por completo (sin saldo) → "Este bono ya fue usado" |
| 410 | `EXPIRED` | El bono superó su período de validez → "Este bono expiró" |
| 422 | `VALIDATION_ERROR` | Formato de código inválido (longitud/juego de caracteres incorrecto) |
| 429 | `RATE_LIMITED` | Respeta `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — canjeado (`409`):

```json
{
  "error": {
    "code": "REDEEMED",
    "message": "Este bono de regalo ya fue usado en su totalidad.",
    "requestId": "req_01HZG..."
  }
}
```

Ejemplo completo — expirado (`410`):

```json
{
  "error": {
    "code": "EXPIRED",
    "message": "Este bono de regalo expiró y ya no puede usarse.",
    "requestId": "req_01HZH..."
  }
}
```

## Consideraciones de frontend
- Se usa en el **campo de aplicar bono de regalo** del carrito como una pre-verificación opcional antes de `POST /cart/apply-giftcard` (debounce ~500 ms; el endpoint del carrito sigue siendo la autoridad).
- Con un código válido, mostrar **saldo + vencimiento** antes de que el usuario confirme aplicarlo.
- Mapear cada código a un mensaje en línea específico: no encontrado / usado / expirado (códigos §4 de arriba).
- Tratar la consulta solo como una pista — confiar siempre en el resultado propio de `POST /cart/apply-giftcard` antes de aplicar.
- Clave de TanStack Query `["giftcards", "lookup", code]`; `staleTime` ~30 s (el saldo puede cambiar).
- Nunca mostrar la identidad del destinatario/propietario en ninguna interfaz construida sobre este endpoint — la API nunca la devuelve.

## Reglas de validación
- Normalizar la entrada (recortar, mayúsculas) antes de enviar.
- Validar el formato en el cliente (alfanumérico, longitud esperada ~12) para evitar idas y vueltas `422` innecesarias.
- No pre-verificar en cada tecla — usar debounce o disparar al salir del campo/al aplicar.

## Reglas de negocio
- Un bono solo puede usarse mientras esté `ACTIVE`; los bonos `REDEEMED` y `EXPIRED` devuelven sus errores específicos.
- La consulta refleja el saldo al momento de la petición; puede diferir para cuando se confirme el carrito.

## Notas de seguridad
- **La respuesta no contiene datos del propietario** — sin nombre, correo ni información de compra. No mostrar nada más allá de código/saldo/vencimiento.
- Los códigos de bono de regalo son de **alta entropía** y solo adivinables dentro de los límites de límite de peticiones (el endpoint tiene límite de peticiones; respetar el `429`).
- No registrar códigos completos en analíticas; truncar (`MC-*****QX2`) si se necesita para soporte.

## Flujo de ejemplo
1. El usuario escribe `MC-7F3K-9QX2` en el campo de aplicar bono de regalo del carrito.
2. `GET /api/v1/giftcards/MC-7F3K-9QX2` con debounce → `200` → "Saldo disponible: $80.000, vence 31/12/2026".
3. El usuario confirma → `POST /cart/apply-giftcard`.
4. Códigos inválidos/expirados/usados → mensaje en línea desde el código de error correspondiente.
