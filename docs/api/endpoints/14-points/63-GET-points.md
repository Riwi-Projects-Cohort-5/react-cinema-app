# GET /api/v1/points

## Historia de usuario relacionada
- **HU-FE-023** — Programa de fidelización y puntos. Lado de lectura del programa de fidelización; la acción de canje es `POST /points/redeem`. Las definiciones de nivel las sirve `GET /membership/levels`.

## Propósito
Devuelve el resumen de puntos de fidelización del usuario autenticado: saldo actual, nivel de membresía y progreso hacia el siguiente nivel, puntos que vencen pronto y un historial de movimientos paginado. Alimenta el tablero de fidelización (tarjeta de saldo, barra de progreso, sección "por vencer", lista de historial).

## Método HTTP
GET

## URL
`/api/v1/points` (URL completa: `https://api.multicine.com/api/v1/points`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Los puntos son por usuario.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; `description` lo localiza el backend) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, devuelto por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `page` | integer | No | Número de página basado en 1 para el historial (por defecto `1`, convenciones §5) |
| `pageSize` | integer | No | Elementos de historial por página, máximo 100 (por defecto `20`, convenciones §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — resumen de saldo más historial paginado.

```json
{
  "balance": 2450,
  "level": { "id": "b8c9d0e1-2f3a-4b5c-6d7e-8f9a0b1c2d3e", "name": "PLATA" },
  "pointsToNextLevel": 550,
  "nextLevel": { "id": "c9d0e1f2-3a4b-5c6d-7e8f-9a0b1c2d3e4f", "name": "ORO" },
  "expiringSoon": [
    { "amount": 800, "expiresAt": "2026-09-30" },
    { "amount": 250, "expiresAt": "2026-10-15" }
  ],
  "history": {
    "data": [
      {
        "id": "4d4f8a2b-3c1e-4d5f-8a9b-0c1d2e3f4a5b",
        "amount": 350,
        "type": "EARNED",
        "description": "Compra de entradas — orden #0001234",
        "occurredAt": "2026-08-10T19:02:00Z",
        "expiresAt": "2027-02-10"
      },
      {
        "id": "5e5a9b3c-4d2f-4e6a-9b0c-1d2e3f4a5b6c",
        "amount": -2000,
        "type": "REDEEMED",
        "description": "Canje por bono de regalo $20.000",
        "occurredAt": "2026-08-01T12:30:00Z",
        "expiresAt": null
      }
    ],
    "pagination": { "page": 1, "pageSize": 20, "totalItems": 12, "totalPages": 1 }
  }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `balance` | integer | Puntos canjeables actuales (positivo). Autoritativo del servidor. |
| `level` / `nextLevel` | object \| null | `{ id, name }`; `nextLevel` es `null` en el nivel máximo |
| `pointsToNextLevel` | integer \| null | Puntos necesarios para alcanzar `nextLevel`; `null` en el nivel máximo |
| `expiringSoon[]` | array | Puntos que vencen en los próximos ~90 días: `{ amount, expiresAt (YYYY-MM-DD) }` |
| `history.data[].amount` | integer | Positivo = ganados, negativo = usados/perdidos (§6: solo enteros) |
| `history.data[].type` | enum | `EARNED` \| `REDEEMED` \| `EXPIRED` \| `BONUS` |
| `history.data[].occurredAt` | string ISO-8601 UTC | Convenciones §7 |
| `history.data[].expiresAt` | string `YYYY-MM-DD` \| null | Cuándo vencen los puntos del movimiento; `null` para canjes |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — fallo inesperado (`500`):

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Ocurrió un error inesperado. Intenta de nuevo.",
    "requestId": "req_01HZB..."
  }
}
```

## Consideraciones de frontend
- **Tarjeta de saldo**: entero grande; formatear con `Intl.NumberFormat("es-CO")` — sin decimales (§6).
- **Barra de progreso de nivel**: etiqueta "Faltan X puntos para Nivel Y" usando `pointsToNextLevel` + `nextLevel.name`; ocultar en el nivel máximo.
- **Sección "Por vencer"**: listar `expiringSoon` con la fecha `expiresAt` y el monto; advertir sobre el vencimiento más cercano.
- **Lista de historial**: renderizar `amount` con prefijo `+`/`−` y color (verde ganados, rojo canjeados/vencidos); mapear `type` a una etiqueta; agrupar por fecha.
- TanStack Query clave `["points", { page, pageSize }]`; `keepPreviousData` para una paginación fluida (§5). También refrescar `["membership"]` donde se muestra el progreso de nivel.
- Esqueleto mientras carga; historial vacío → "Aún no has ganado puntos"; error recuperable → mensaje + reintento; sin conexión → banner + reintento (§13).
- Tras un canje, invalidar `["points"]` (ver `POST /points/redeem`).

## Reglas de validación
- `page ≥ 1`, `pageSize` limitado a `[1, 100]` (convenciones §5).
- Nunca sumar `expiringSoon` del lado del cliente al `balance` — `balance` es autoritativo del servidor.

## Reglas de negocio
- **Los puntos vencen**: los canjes son primero en entrar/primero en salir contra los puntos que vencen primero (el backend maneja FIFO; la UI solo muestra `expiringSoon` como advertencia).
- El nivel/progreso lo deriva el servidor y puede cambiar a medida que se ganan o vencen puntos.
- El historial de canjes registra movimientos `REDEEMED` con `amount` negativo.

## Notas de seguridad
- El endpoint devuelve solo los puntos del usuario autenticado; sin datos entre cuentas.
- El saldo y los vencimientos son autoritativos del servidor — el cliente nunca adivina ni cachea a largo plazo (re-obtener al enfocar).

## Flujo de ejemplo
1. La pantalla de fidelización se monta → `GET /api/v1/points?page=1` → esqueleto → tarjeta de saldo + barra de nivel.
2. "Faltan 550 puntos para Nivel ORO" se renderiza desde `pointsToNextLevel`.
3. "Por vencer" muestra 800 puntos que vencen el 2026-09-30.
4. El historial pagina con `keepPreviousData`.
5. El usuario canjea → `POST /points/redeem` → `["points"]` invalidada → saldo/progreso actualizados.
