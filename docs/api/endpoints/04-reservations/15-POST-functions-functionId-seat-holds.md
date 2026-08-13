# POST /api/v1/functions/{functionId}/seat-holds

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-010** — Selección interactiva de sillas. Alias del backlog: `POST /reservations/lock-seats` (rediseñado por consistencia REST).

## Propósito
Bloquea (hold) un conjunto de sillas de una función durante 10 minutos para que el usuario pueda completar la compra. Un usuario tiene como máximo un hold activo: crear un nuevo hold libera automáticamente el anterior. Devuelve el hold con su expiración para que el frontend pueda ejecutar la cuenta regresiva.

## Método HTTP
POST

## URL
`/api/v1/functions/{functionId}/seat-holds` (URL completa: `https://api.multicine.com/api/v1/functions/{functionId}/seat-holds`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `X-Idempotency-Key` | Sí | UUID por intención del usuario; se reutiliza en el reintento de la misma acción de "hold", nunca en un nuevo clic (convenciones §9) |
| `Accept-Language` | Opcional | `es` — mensajes de error localizados por el backend |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `functionId` | string (UUID v4) | Sí | Función a la que pertenecen las sillas (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "seatIds": [
    "11111111-1111-4111-8111-111111111112",
    "11111111-1111-4111-8111-111111111113"
  ]
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `seatIds` | string[] (UUID v4) | Sí | 1..N sillas a bloquear. Máximo por hold: 10 (estándar) o 3 (Cine Flash, ver Reglas de negocio). Los duplicados se rechazan con 422. |

## Respuestas de éxito

**201 Created** — sillas bloqueadas por 10 minutos.

```json
{
  "holdId": "ab1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e",
  "expiresAt": "2026-08-10T20:40:00Z",
  "expiresInSeconds": 600,
  "functionId": "9a8b7c6d-5e4f-4a3b-8c9d-1e2f3a4b5c6d",
  "seats": [
    {
      "seatId": "11111111-1111-4111-8111-111111111112",
      "seatLabel": "F12",
      "seatType": "STANDARD",
      "price": { "amount": 16500, "currency": "COP" }
    },
    {
      "seatId": "11111111-1111-4111-8111-111111111113",
      "seatLabel": "F13",
      "seatType": "STANDARD",
      "price": { "amount": 16500, "currency": "COP" }
    }
  ],
  "subtotal": { "amount": 33000, "currency": "COP" }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `holdId` | UUID | Id usado por `DELETE /functions/{functionId}/seat-holds/{holdId}` y `POST /cart` |
| `expiresAt` | ISO 8601 UTC | Fecha límite del hold (convenciones §7) |
| `expiresInSeconds` | integer | 600 (10 min) — maneja la cuenta regresiva desde esto, no desde matemáticas del reloj del cliente |
| `seats[].seatLabel` | string | Fila+número legible para humanos, p. ej. `F12` |
| `seats[].seatType` | enum | `STANDARD` \| `PREFERENTIAL` \| `VIP` |
| `seats[].price` | object | Precio unitario, COP entero (convenciones §6) |
| `subtotal` | object | Suma de las sillas en hold (antes de descuentos/impuestos) |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` etc. | Problemas de sesión — interceptor (§3) | Refresco silencioso / redirigir al login |
| 403 | `FORBIDDEN` | Token válido pero se violan las reglas de propiedad del hold | Estado "No tienes permiso" |
| 404 | `FUNCTION_NOT_FOUND` / `SEAT_NOT_FOUND` | La función o la silla no existe / no está publicada | Error recuperable, recargar la cartelera |
| 409 | `SEATS_UNAVAILABLE` | Algunas sillas fueron tomadas mientras tanto | Deseleccionar esas sillas; `details` lista cada una (ejemplo completo abajo) |
| 422 | `VALIDATION_ERROR` | Sin sillas, duplicados, o por encima del máximo de boletas por función | Mensaje a nivel de campo bajo el mapa de sillas |
| 429 | `RATE_LIMITED` | Demasiadas peticiones | Respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Falla inesperada | Error genérico reintentable (§13) |

Ejemplo completo — se perdió una silla durante la selección (`409`):

```json
{
  "error": {
    "code": "SEATS_UNAVAILABLE",
    "message": "Algunas sillas ya no están disponibles",
    "details": [
      { "field": "seatIds", "message": "Silla F12 ya no está disponible" },
      { "field": "seatIds", "message": "Silla F14 ya no está disponible" }
    ],
    "requestId": "req_01HZ7KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- Iniciar una **cuenta regresiva de 10:00** desde `expiresInSeconds` (calcula contra el delta del servidor, nunca `Date.now()` menos un momento fijado por el cliente — convenciones §7).
- Cuando la cuenta regresiva llega a 0: **auto-liberar** (disparar `DELETE .../seat-holds/{holdId}`), deshabilitar el botón "Continuar" y mostrar un estado de expiración.
- Antes de abandonar el mapa de sillas (botón atrás / navegación), mostrar un **modal de confirmación** ("¿Abandonar la selección? Las sillas se liberarán").
- **Re-bloquear** = un nuevo POST con una **nueva clave de idempotencia** (una clave por intención del usuario, §9).
- Sondear `GET /functions/{functionId}/seats` (clave `["functions", functionId, "seats"]`) cada ~20 s para detectar sillas perdidas frente a otros; quitar de la selección las sillas recién tomadas.
- Deshabilitar las sillas agotadas de la respuesta del mapa de sillas.
- Ante `SEATS_UNAVAILABLE`, quitar de la selección cada silla en `details` y re-renderizar (no enviar una liberación — nunca estuvieron en hold).

## Reglas de validación
- `seatIds` no vacío; sin duplicados; cada uno es un UUID.
- Máximo de sillas por hold: **3 en funciones Cine Flash** (flag de `GET /functions/{id}`), 10 en los demás casos.
- Deshabilitar el envío mientras una petición de hold esté en vuelo (protección contra doble envío).

## Reglas de negocio
- El hold dura **10 minutos** y también expira automáticamente en el servidor (el temporizador del cliente es solo UX; el servidor es autoritativo).
- **Un hold activo por usuario.** Un nuevo POST libera automáticamente el hold anterior (misma u otra función).
- Funciones Cine Flash: **máximo 3 boletas**, **20% de descuento solo en boletas**, **no acumulable** con membresías/otras promos (HU-FE-019).
- Tras la expiración las sillas en hold vuelven al pool; el frontend debe re-bloquear antes de continuar.

## Notas de seguridad
- El hold pertenece al usuario autenticado; la propiedad se hace cumplir en el servidor (403 para otros).
- Liberar o convertir un hold requiere propiedad (`holdId` debe pertenecer al llamador).
- Los ids son UUIDs (§8); no viajan datos personales en la petición.

## Flujo de ejemplo
1. El usuario selecciona las sillas F12, F13 en el mapa de sillas.
2. `POST /api/v1/functions/{functionId}/seat-holds` con `X-Idempotency-Key` + `seatIds`.
3. `201` → hold guardado; la cuenta regresiva de 10:00 inicia desde `expiresInSeconds`.
4. El mapa de sillas sondea `GET /functions/{id}/seats`; un vecino toma F14 (no está en nuestra selección) — sin impacto.
5. El usuario hace clic en "Continuar" → `POST /api/v1/cart` con `holdId`.
