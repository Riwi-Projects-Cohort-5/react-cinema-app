# POST /api/v1/auth/refresh

## Historia de usuario relacionada
- **HU-FE-007** — Inicio de sesión y autenticación segura. También HU-FE-029. Rota el token de acceso de forma transparente; lo usa **solo** el interceptor centralizado del cliente HTTP (convenciones §3).

## Propósito
Intercambia la cookie `refresh_token` de larga duración por un nuevo token de acceso de corta duración sin interacción del usuario. El token de refresh se rota (se establece una nueva cookie) para que un token de refresh robado no pueda reutilizarse indefinidamente. Este endpoint nunca se llama directamente desde los componentes.

## Método HTTP
POST

## URL
`/api/v1/auth/refresh` (URL completa: `https://api.multicine.com/api/v1/auth/refresh`)

## Autenticación
- Basada en cookie. Sin cabecera `Authorization` — el navegador envía la cookie `refresh_token` automáticamente. Como el token viaja en una cookie, la petición debe incluir la cabecera `X-CSRF-Token` (convenciones §2/§3).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `X-CSRF-Token` | Sí | Token CSRF (convenciones §2/§3) — requerido porque el token de refresh está ligado a una cookie |
| `Content-Type` | Sí | `application/json` (cuerpo vacío) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` |
| `X-Request-Id` | Opcional | UUID generado por el cliente, replicado por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{}
```

El token **no** se envía en el cuerpo — proviene de la cookie `refresh_token`.

## Respuestas de éxito

**200 OK** — nuevo token de acceso emitido y cookie de refresh rotada.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresInSeconds": 900
}
```

El backend también vuelve a emitir la cookie `refresh_token` (rotación). El cliente guarda el nuevo token de acceso en memoria y continúa la petición en cola (convenciones §3).

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `REFRESH_TOKEN_EXPIRED` | La sesión terminó → el interceptor cierra sesión, limpia el store de autenticación y redirige al inicio de sesión recordando la ruta prevista (§3) |
| 401 | `INVALID_TOKEN` | Token de refresh malformado/revocado → mismo flujo de cierre de sesión |
| 403 | `FORBIDDEN` | Falló la validación de CSRF → limpiar la cookie, cerrar sesión, redirigir al inicio de sesión |
| 429 | `RATE_LIMITED` | Demasiados refrescos; respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | **No** cerrar sesión; el interceptor puede reintentar una vez después de un breve backoff |

Ejemplo completo — token de refresh caducado (`401`):

```json
{
  "error": {
    "code": "REFRESH_TOKEN_EXPIRED",
    "message": "Tu sesión ha expirado. Inicia sesión de nuevo.",
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- **Nunca llamar a este endpoint desde componentes u hooks.** Lo usa solo el interceptor centralizado del cliente HTTP en `src/services` (convenciones §3).
- Flujo del interceptor ante `401` con código `ACCESS_TOKEN_EXPIRED`:
  1. Si ya hay un refresh en curso, encolar esta petición.
  2. De lo contrario, llamar a `POST /auth/refresh` **una sola vez**.
  3. Al éxito, actualizar el token de acceso en memoria y reproducir las peticiones en cola (cada una exactamente una vez).
  4. Al fallo (`REFRESH_TOKEN_EXPIRED`/`INVALID_TOKEN`/CSRF), limpiar la sesión, notificar al store de autenticación y redirigir al inicio de sesión con `location.state.from` = la ruta original.
- Los `401` concurrentes deben encolarse — nunca disparar refrescos en paralelo (§3).
- Cualquier otro código `401` (`INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`, …) → cerrar sesión inmediatamente, sin refrescar (§3).
- El valor de la cabecera `X-CSRF-Token` se obtiene mediante el bootstrap de CSRF del interceptor (convenciones §2); si falta, no enviar la petición.
- Respetar el 429 de este endpoint: esperar `retryAfterSeconds` antes de otro intento de refresh (§10).

## Reglas de validación
- Frontend: ninguna (sin entrada del usuario). El interceptor solo lo envía cuando se observó un `401 ACCESS_TOKEN_EXPIRED`.

## Reglas de negocio
- El token de refresh se rota en cada refresh exitoso (nueva cookie).
- El token de acceso permanece de corta duración (15 min, convenciones §3) para que nunca se confíe en él más allá de su ventana.
- La persistencia de la sesión depende de `rememberMe` elegido al iniciar sesión (`Max-Age` de la cookie de refresh, ver `POST /auth/login`).

## Notas de seguridad
- La cookie es HttpOnly, Secure, SameSite=Lax (convenciones §3) — el frontend nunca lee su valor.
- `X-CSRF-Token` protege el flujo ligado a cookie contra la falsificación de peticiones en sitios cruzados (§2/§3).
- Nunca registrar el token de acceso ni la cookie de refresh.
- Ante cualquier fallo del refresh, el cliente debe limpiar completamente su sesión — no reintentar en bucle.

## Flujo de ejemplo
```
Protected request returns 401 ACCESS_TOKEN_EXPIRED
↓
Interceptor queues concurrent 401s (single-flight)
↓
POST /auth/refresh (cookie + X-CSRF-Token, body {})
↓
200 → store new accessToken in memory
↓
Replay original request exactly once
↓
Surface result to the caller
(On 401 REFRESH_TOKEN_EXPIRED → logout + redirect to login with intended route)
```
