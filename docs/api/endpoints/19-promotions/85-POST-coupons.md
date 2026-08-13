# POST /api/v1/coupons

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-026** — Administración de promociones y cupones. Crea un código de cupón en el panel de administración.

## Propósito
Crea un código de cupón con su descuento, validez y límites de uso. Los cupones pueden referenciar opcionalmente una promoción. El código es único en toda la plataforma — un código duplicado devuelve `409 CODE_ALREADY_EXISTS`. Como los cupones afectan dinero, la creación requiere una clave de idempotencia para que un envío reintentado nunca genere dos códigos idénticos.

## Método HTTP
POST

## URL
`/api/v1/coupons` (URL completa: `https://api.multicine.com/api/v1/coupons`)

## Autenticación
- Rol requerido: **ADMIN** (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` |
| `Accept` | Recomendada | `application/json` |
| `X-Idempotency-Key` | **Sí** | UUID generado por el cliente por clic en "Crear", reutilizado en reintentos (convenciones §9) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, devuelto por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "code": "CINE10",
  "promotionId": "6e5f4a3b-2c1d-4e5f-8a9b-0c1d2e3f4a5b",
  "discountValue": 10,
  "type": "PERCENTAGE",
  "validity": {
    "from": "2026-08-01T00:00:00Z",
    "to": "2026-08-31T23:59:59Z"
  },
  "maxUses": 500,
  "maxUsesPerUser": 1,
  "scope": {
    "all": true,
    "movies": [],
    "cinemas": [],
    "cities": []
  }
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `code` | string | Sí | 3–20 caracteres, `A-Z0-9` y `-`/`_`; único en toda la plataforma |
| `promotionId` | string (UUID v4) | No | Promoción padre opcional (el cupón hereda las condiciones) |
| `discountValue` | number | Sí | Porcentaje (1–100) para `PERCENTAGE` o monto COP entero para `AMOUNT` (convenciones §6) |
| `type` | enum | Sí | `PERCENTAGE` \| `AMOUNT` |
| `validity.from` / `to` | string | Sí | ISO 8601 UTC; `to` posterior a `from` (convenciones §7) |
| `maxUses` | integer | Sí | Positivo; tope total de redenciones |
| `maxUsesPerUser` | integer | Sí | Positivo; tope por usuario (1 = un solo uso por cuenta) |
| `scope` | object | No | Misma forma que las promociones (`all` o arreglos de ids) |

## Respuestas de éxito

**201 Created** — cupón generado.

```json
{
  "couponId": "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
  "code": "CINE10"
}
```

## Respuestas de error
Todos los errores usan el envelope compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento del frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No es ADMIN → estado "No tienes permiso" (§13) |
| 409 | `CODE_ALREADY_EXISTS` | El código ya está en uso → error en línea en el campo del código |
| 422 | `VALIDATION_ERROR` | Formato de código inválido, `maxUses` no positivo, fechas invertidas → mapea `details` a los campos |
| 429 | `RATE_LIMITED` | Respeta `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Fallo inesperado → error reintentable (§13) |

Ejemplo completo — código duplicado (`409`):

```json
{
  "error": {
    "code": "CODE_ALREADY_EXISTS",
    "message": "Ese código ya existe",
    "details": [
      { "field": "code", "message": "Prueba con otro código o genera uno automático" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

Ejemplo completo — validación (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revisa los campos del cupón",
    "details": [
      { "field": "maxUses", "message": "El máximo de usos debe ser un número positivo" },
      { "field": "validity.to", "message": "La fecha de fin debe ser posterior a la de inicio" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Formulario de cupón** con: campo de código + **botón de autogeneración** (`A-Z0-9` aleatorio en el cliente dentro del charset documentado, p. ej. prefijo `MUL` + 5 caracteres), toggle de tipo de descuento (`PERCENTAGE`/`AMOUNT` con el rango correspondiente), selectores de fecha, inputs numéricos de `maxUses`/`maxUsesPerUser`, selector de alcance y select de promoción opcional.
- Validación en el cliente: código requerido + formato, `maxUses`/`maxUsesPerUser` positivos, `to > from`.
- **Ante `409 CODE_ALREADY_EXISTS`**: muestra "ese código ya existe" **en línea sobre el campo del código** y ofrece un reemplazo de un toque "generar código"; nunca limpies el resto del formulario.
- Una `X-Idempotency-Key` por intención de creación, reutilizada en reintentos (§9) — un reintento en red inestable no debe generar dos códigos.
- En éxito: toast "Cupón CINE10 creado" y `queryClient.invalidateQueries({ queryKey: ["promotions"] })` (los cupones y las promociones comparten la superficie de lista/caché del módulo de administración).
- Cargando → spinner en el botón; 403 → estado de permisos (§13).

## Reglas de validación
Valida ANTES de enviar:
- `code` coincide con `^[A-Z0-9_-]{3,20}$` (mayúsculas normalizadas en el cliente).
- `discountValue` 1–100 para `PERCENTAGE`, COP entero positivo para `AMOUNT`.
- `maxUses` y `maxUsesPerUser` son enteros positivos.
- `validity.to` estrictamente posterior a `validity.from`.

## Reglas de negocio
- Los códigos son únicos e inmutables una vez generados; un duplicado devuelve `409 CODE_ALREADY_EXISTS`.
- `maxUsesPerUser` aplica el tope por cuenta (p. ej. 1 = un uso por usuario).
- Los cupones afectan dinero → se requiere `X-Idempotency-Key` (§9).

## Notas de seguridad
- Solo ADMIN, aplicado por el backend (403 FORBIDDEN).
- Los códigos son instrumentos de descuento sensibles: nunca los registres en texto plano más allá de la auditoría de acciones del administrador, y la pantalla de administración puede mostrarlos con revelado al hacer clic.

## Flujo de ejemplo
1. El administrador abre Cupones → "Crear cupón".
2. El administrador hace clic en "Generar código" → el cliente llena `MUL8K2X`; valida maxUses y las fechas.
3. El administrador envía → `X-Idempotency-Key` → `POST /coupons`.
4. 201 → `{ couponId, code: "MUL8K2X" }` → toast + invalida `["promotions"]`.
5. Otro administrador intenta el mismo código → `409 CODE_ALREADY_EXISTS` → "ese código ya existe" en línea + regeneración de un toque.
6. Un reintento de red reutiliza la misma `X-Idempotency-Key` → el cupón original, no un duplicado.
