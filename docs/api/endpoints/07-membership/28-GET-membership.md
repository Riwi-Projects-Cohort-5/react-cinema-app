# GET /api/v1/membership

## Historia de usuario relacionada
- **HU-FE-008** — Perfil y beneficios de membresía. También la consume HU-FE-029 (consumo de API pública). Renderiza la tarjeta digital de membresía (nivel, puntos, QR).

## Propósito
Devuelve los datos de la tarjeta de membresía del usuario autenticado: nivel actual, puntos acumulados, progreso hacia el siguiente nivel y el código QR escaneado en el cine. Es la data detrás de la tarjeta "Mi membresía".

## Método HTTP
GET

## URL
`/api/v1/membership` (URL completa: `https://api.multicine.com/api/v1/membership`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; el backend localiza los mensajes de error) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, replicado por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno.

## Respuestas de éxito

**200 OK** — datos de la tarjeta de membresía.

```json
{
  "level": { "id": "lv_basic", "name": "BASIC", "color": "#64748B" },
  "points": 320,
  "pointsToNextLevel": 680,
  "nextLevel": { "name": "PLUS" },
  "qrCodeUrl": "https://cdn.multicine.com/memberships/7f1a2b3c/qr.png",
  "memberNumber": "MC-2026-0001234",
  "validSince": "2026-05-14T10:00:00Z",
  "validUntil": null,
  "benefitsAvailableCount": 3
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `level.id` / `level.name` | string | Clave/nombre del nivel actual (p. ej. `BASIC`); `name` se mapea a la etiqueta de la insignia |
| `level.color` | string | Color de acento de la insignia (hex) — solo visual, nunca ingresado por el usuario |
| `points` | integer | Puntos acumulados actuales |
| `pointsToNextLevel` | integer | Puntos que faltan para alcanzar `nextLevel`; `0` cuando ya se está en el nivel superior |
| `nextLevel` | object \| null | `{ name }` del siguiente nivel; `null` en el nivel más alto |
| `qrCodeUrl` | string | QR de la tarjeta digital — se escanea en la taquilla del cine |
| `memberNumber` | string | Número de membresía legible (según convenciones §8, no es un UUID) |
| `validSince` | string | Fecha de activación ISO 8601 UTC (convenciones §7) |
| `validUntil` | string \| null | Expiración, `null` para membresías de por vida |
| `benefitsAvailableCount` | integer | Cantidad de beneficios actualmente disponibles (ver `GET /membership/benefits`) |

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | Sin permiso → estado "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | No hay membresía para este usuario → estado vacío "Activa tu membresía" (ver `POST /memberships`) |
| 500 | `SERVER_ERROR` | Error reintentable (§13) |

Ejemplo completo — sin membresía (`404`):

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Aún no tienes una membresía activa",
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- Clave de TanStack Query: `["membership"]`; queda obsoleta tras cambios de puntos/nivel (invalidarla después del checkout y del canje de puntos).
- QR renderizado como imagen (`qrCodeUrl`); mostrar un affordance "recargar QR" si falla la carga.
- Insignia de nivel estilizada con `level.color`; barra de progreso calculada desde `points` / `pointsToNextLevel` (ver `GET /membership/levels` para los datos de los niveles).
- Skeleton mientras carga (nunca en blanco, §13); estado de error con reintento.
- `404` → estado vacío "Activa tu membresía" con CTA a `POST /memberships`.
- `validUntil` (cuando esté presente) → mostrar un aviso de expiración (calculado contra UTC, convenciones §7).
- Banner de sin conexión / conexión perdida con reintento según §13.

## Reglas de validación
- Ninguna (llamada de solo lectura).

## Reglas de negocio
- El nivel de membresía depende de los puntos acumulados (umbrales de niveles en `GET /membership/levels`).
- El QR es la tarjeta digital de membresía — regenerarlo/refrescarlo puede requerir una recarga manual de `qrCodeUrl`.
- Un usuario sin membresía recibe `404` (tratarlo como estado vacío, no como error).
- `points` se acumula de compras/canjes; el frontend nunca calcula el nivel localmente (autoridad del servidor).

## Notas de seguridad
- El QR codifica una capacidad de membresía (usada para canjes/beneficios) — tratar `qrCodeUrl` como sensible; evitar cachearla agresivamente.
- Alcance del propietario (§3): solo el miembro autenticado ve su tarjeta.
- Nunca registrar `memberNumber` ni el contenido del QR.

## Flujo de ejemplo
```
User opens "Mi membresía"
↓
GET /membership (key ["membership"])
↓
Skeleton loading state
↓
200 → render level badge, points, progress bar + QR image
(404 → "Activa tu membresía" empty state with CTA)
```
