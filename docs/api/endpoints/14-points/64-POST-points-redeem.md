# POST /api/v1/points/redeem

## Historia de usuario relacionada
- **HU-FE-023** — Programa de fidelización y puntos. Lado de escritura del programa de fidelización; el estado de saldo/nivel viene de `GET /points`.

## Propósito
Canjea puntos de fidelización por una recompensa del catálogo de canjes (descuento, entrada, snack, tarjeta de regalo). El canje se cobra de inmediato contra el saldo del usuario, por lo que una clave de idempotencia es obligatoria para garantizar un solo cobro por intención del usuario (convenciones §9).

## Método HTTP
POST

## URL
`/api/v1/points/redeem` (URL completa: `https://api.multicine.com/api/v1/points/redeem`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Los puntos son por usuario.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `X-Idempotency-Key` | **Sí** | UUID generado por el cliente por cada intención de canje (convenciones §9). Una clave por clic en "Canjear", reutilizada textualmente en el reintento — nunca en un clic nuevo. |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; los mensajes de error los localiza el backend) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, devuelto por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "points": 2000,
  "rewardId": "c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e6f"
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `points` | integer | Sí | Puntos a gastar; debe coincidir con el costo de la recompensa (validado por el servidor, §9) |
| `rewardId` | UUID v4 | Sí | Recompensa del catálogo de canjes (convenciones §8). El catálogo se sirve con la pantalla de recompensas. |

## Respuestas de éxito

**201 Created** — puntos debitados y recompensa emitida.

```json
{
  "redemptionId": "9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d",
  "pointsDebited": 2000,
  "reward": {
    "id": "c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e6f",
    "type": "GIFTCARD",
    "value": { "amount": 20000, "currency": "COP" },
    "code": "MC-7F3K-9QX2",
    "expiresAt": "2026-11-01"
  },
  "remainingBalance": 450
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `redemptionId` | UUID | Id del registro de canje (convenciones §8) |
| `pointsDebited` | integer | Puntos cobrados; igual a `request.points` |
| `reward.type` | enum | `DISCOUNT` \| `TICKET` \| `SNACK` \| `GIFTCARD` |
| `reward.value` | object | COP entero (convenciones §6): monto de descuento, valor de entrada/snack o monto de tarjeta de regalo |
| `reward.code` | string \| null | Presente para códigos que el usuario debe usar (tarjeta de regalo / algunos descuentos); **sensible** — mostrar en un control de revelar/copiar, nunca registrar |
| `reward.expiresAt` | string `YYYY-MM-DD` \| null | Fecha límite de validez de la recompensa |
| `remainingBalance` | integer | Nuevo saldo de puntos tras el débito — usarlo para refrescar la UI |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 404 | `NOT_FOUND` | `rewardId` no existe en el catálogo |
| 409 | `INSUFFICIENT_POINTS` | Saldo < puntos solicitados → "No tienes suficientes puntos" con un enlace para ganar más |
| 409 | `REWARD_UNAVAILABLE` | Recompensa agotada o fuera de su ventana de canje → deshabilitar esa tarjeta de recompensa |
| 422 | `VALIDATION_ERROR` | Puntos por debajo del mínimo de la recompensa, puntos que no coinciden con el costo de la recompensa, o UUID inválido (`details` por campo, §4) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — puntos insuficientes (`409`):

```json
{
  "error": {
    "code": "INSUFFICIENT_POINTS",
    "message": "No tienes suficientes puntos para canjear esta recompensa.",
    "details": [
      { "field": "points", "message": "Tu saldo actual es de 450 puntos y esta recompensa cuesta 2.000" }
    ],
    "requestId": "req_01HZC..."
  }
}
```

Ejemplo completo — recompensa ya no disponible (`409`):

```json
{
  "error": {
    "code": "REWARD_UNAVAILABLE",
    "message": "Esta recompensa ya no está disponible. Prueba con otra.",
    "requestId": "req_01HZD..."
  }
}
```

## Consideraciones de frontend
- **Modal de confirmación** antes de canjear: mostrar los puntos a gastar, la recompensa y su valor — el usuario confirma y luego la petición se dispara.
- Deshabilitar el botón de confirmar mientras está en vuelo (sin doble canje; clave de idempotencia por intención, §9).
- **En éxito**: revelar la recompensa — para códigos mostrar una acción "Copiar código" con una revelación breve (nunca pre-imprimir a largo plazo), mostrar el `remainingBalance` actualizado e invalidar `["points"]` y `["membership"]` para que el saldo/progreso de nivel se actualicen.
- **Lista de recompensas**: deshabilitar el botón de canjear para recompensas vencidas y marcar las no disponibles (según los metadatos del catálogo) para que los usuarios no lleguen al modal por ellas.
- TanStack Query: `useMutation` con clave `["points", "redeem"]`; en éxito `invalidateQueries(["points"])` e `invalidateQueries(["membership"])`.
- Ante `429` → cuenta regresiva según §10; ante `404`/`REWARD_UNAVAILABLE` → refrescar el catálogo y deshabilitar la tarjeta.
- Reintento idempotente: si un reintento devuelve el `201` **original**, tratarlo como éxito (no doble toast ni doble revelación).

## Reglas de validación
Validar ANTES de enviar:
- `points` es un entero positivo y **al menos el mínimo de la recompensa** (mostrar el mínimo en la tarjeta).
- `rewardId` es un UUID v4 válido.
- El modal de confirmación debe volver a leer el costo/disponibilidad actual de la recompensa antes de habilitar "Canjear".
- Generar `X-Idempotency-Key` exactamente una vez por intención de canje; reutilizarla textualmente en el reintento de ese mismo clic (§9).

## Reglas de negocio
- El costo de la recompensa es autoritativo del lado del servidor; un `points` no coincidente se rechaza con `422`.
- Los canjes se cobran de inmediato (FIFO contra los puntos que vencen primero, ver `GET /points`).
- `REWARD_UNAVAILABLE` cubre agotamiento y ventana de canje vencida; el estado del catálogo que muestra el cliente es provisional.
- Las recompensas de tarjeta de regalo/descuento llevan un `code` con un `expiresAt` — el usuario debe usarlo antes de esa fecha.

## Notas de seguridad
- Propiedad: solo se puede debitar el saldo del usuario autenticado.
- La `X-Idempotency-Key` evita el doble canje en reintentos (§9) — nunca reutilizarla para una recompensa *diferente*.
- El `code` de la recompensa es sensible: revelar bajo demanda, solo copiar al portapapeles, nunca registrar ni persistir en analítica.

## Flujo de ejemplo
1. El usuario abre una tarjeta de recompensa → "Canjear".
2. Modal de confirmación: "Canjearás 2.000 puntos por un bono de regalo de $20.000".
3. Generar clave de idempotencia `k-1` → `POST /api/v1/points/redeem { points: 2000, rewardId }`.
4. `201` → recompensa revelada con código `MC-7F3K-9QX2` + "Copiar código"; `remainingBalance: 450`.
5. `["points"]` y `["membership"]` invalidadas → la tarjeta de saldo y la barra de nivel se actualizan.
6. Reintento por fallo de red reutiliza `k-1` → el servidor devuelve el `201` original → sin doble débito.
