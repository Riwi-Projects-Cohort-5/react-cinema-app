# POST /api/v1/promotions

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-026** — Administración de promociones y cupones. Crea una promoción en el panel de administración. Las promociones comienzan **inactivas** (`isActive: false`) y se activan más adelante desde el endpoint de edición (HU-FE-026).

## Propósito
Crea una nueva promoción (regla de descuento) de uno de los ocho tipos, con su alcance, ventana de validez y condiciones. Una promoción se crea **inactiva** para que pueda revisarse antes de salir en vivo; la activación ocurre vía `PUT /promotions/{promotionId}`. Requiere una clave de idempotencia porque es una mutación que afecta dinero.

## Método HTTP
POST

## URL
`/api/v1/promotions` (URL completa: `https://api.multicine.com/api/v1/promotions`)

## Autenticación
- Rol requerido: **ADMIN** (Bearer JWT, convenciones §3). El panel de administración oculta esta acción para roles no privilegiados, pero el backend siempre la aplica (403 FORBIDDEN).

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
  "name": "Dos por uno martes",
  "description": "Compra dos boletas y paga una en todas las funciones 2D de los martes.",
  "type": "TWO_FOR_ONE",
  "discountValue": 100,
  "scope": {
    "all": false,
    "movies": [],
    "cinemas": ["1c2b3a4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d"],
    "cities": []
  },
  "validity": {
    "startAt": "2026-08-01T00:00:00Z",
    "endAt": "2026-08-31T23:59:59Z"
  },
  "accumulable": false,
  "quantityLimit": 4,
  "maxRedemptions": 1000
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `name` | string | Sí | 3–120 caracteres |
| `description` | string | Sí | 10–500 caracteres |
| `type` | enum | Sí | `TWO_FOR_ONE` \| `PERCENTAGE` \| `COMBO` \| `BIRTHDAY` \| `MEMBERSHIP` \| `SEASONAL` \| `BLACK_FRIDAY` \| `CINE_FLASH` |
| `discountValue` | number | Sí | Porcentaje (1–100) para `PERCENTAGE`; o un monto fijo en COP para los demás (COP entero, convenciones §6) |
| `scope.all` | boolean | Sí | `true` → aplica en todas partes |
| `scope.movies` / `scope.cinemas` / `scope.cities` | string[] (UUID) | No | Ids objetivo cuando `all` es false; se requiere al menos una fuente de alcance |
| `validity.startAt` / `endAt` | string | Sí | ISO 8601 UTC; `endAt` debe ser posterior a `startAt` (convenciones §7) |
| `accumulable` | boolean | No | Si puede acumularse con otras promociones |
| `quantityLimit` | integer | No | Máximo de ítems (p. ej. boletas) a los que aplica la promoción por transacción |
| `maxRedemptions` | integer | No | Tope global de redenciones; null = ilimitado |

## Respuestas de éxito

**201 Created** — promoción almacenada; comienza **inactiva**.

```json
{
  "promotionId": "6e5f4a3b-2c1d-4e5f-8a9b-0c1d2e3f4a5b",
  "isActive": false
}
```

## Respuestas de error
Todos los errores usan el envelope compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento del frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No es ADMIN → estado "No tienes permiso" (§13) |
| 422 | `VALIDATION_ERROR` | `endAt` antes de `startAt`, descuento fuera del rango permitido, alcance faltante → mapea `details` a los campos del formulario |
| 429 | `RATE_LIMITED` | Respeta `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Fallo inesperado → error reintentable (§13) |

Ejemplo completo — validación (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revisa los campos de la promoción",
    "details": [
      { "field": "validity.endAt", "message": "La fecha de fin debe ser posterior a la de inicio" },
      { "field": "discountValue", "message": "Para PERCENTAGE el valor debe estar entre 1 y 100" },
      { "field": "scope", "message": "Define un alcance (all o al menos un ámbito) para la promoción" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Formulario de administración** con: nombre/descripción, selector de tipo, campo de descuento (alterna entre porcentaje 1–100 y monto COP entero según `type`), selector de alcance (all / movies / cinemas / cities), selectores de fecha y toggles (`accumulable`).
- Tarjeta de **vista previa en vivo** junto al formulario que re-renderiza nombre, insignia (tipo), descuento y validez a medida que cambian los campos.
- **Selectores de fecha** con validación: `endAt > startAt` aplicada en el cliente antes de enviar; renderiza ambos en `America/Bogota` y serializa ISO 8601 UTC (convenciones §7).
- **Validación del rango de descuento** en el cliente: porcentaje 1–100 para `PERCENTAGE`; COP entero positivo en los demás casos.
- En éxito: `queryClient.invalidateQueries({ queryKey: ["promotions"] })` para que la lista y la visualización pública se actualicen; toast "Promoción creada (inactiva)".
- Una `X-Idempotency-Key` por intención de creación, reutilizada en reintentos (§9) — evita promociones duplicadas en una red inestable.
- 403 → oculta el formulario y muestra el estado de permisos.

## Reglas de validación
Valida ANTES de enviar:
- `name` 3–120 caracteres; `description` 10–500 caracteres.
- `type` de los ocho literales documentados; `discountValue` 1–100 cuando `type === "PERCENTAGE"`, COP entero positivo en los demás casos.
- `endAt` estrictamente posterior a `startAt`.
- `scope`: `all: true` **o** al menos un arreglo de ids no vacío.
- `maxRedemptions`/`quantityLimit` positivos cuando estén presentes.

## Reglas de negocio
- Las promociones nuevas siempre se crean **inactivas** — solo llegan a los clientes después de que un administrador las activa vía `PUT /promotions/{promotionId}`.
- `PERCENTAGE` usa porcentaje; los demás tipos expresan `discountValue` como COP entero fijo (convenciones §6).
- Las promociones afectan dinero → se requiere `X-Idempotency-Key` (§9).

## Notas de seguridad
- Solo ADMIN, aplicado por el backend (403 FORBIDDEN); el panel solo oculta la acción para otros roles.
- `discountValue`/`maxRedemptions` son datos internos de negocio — nunca expuestos por el `GET /promotions` público.

## Flujo de ejemplo
1. El administrador abre Promociones → "Crear promoción".
2. Llena el formulario → la vista previa en vivo se actualiza → pasa la validación del cliente (`endAt` posterior a `startAt`, descuento 1–100).
3. El administrador envía → `X-Idempotency-Key` → `POST /promotions`.
4. 201 → `{ promotionId, isActive: false }` → toast "Promoción creada (inactiva)" → invalida `["promotions"]`.
5. El administrador abre la nueva promoción en la pantalla de edición y la activa (`PUT`).
6. El `GET /promotions` público ahora la devuelve dentro de su ventana de validez.
