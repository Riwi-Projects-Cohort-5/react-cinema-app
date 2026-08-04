# POST /api/v1/auth/logout

## Historia de usuario relacionada
- **HU-FE-007** — Inicio de sesión y autenticación segura. Termina la sesión; invalida el token de refresh en el servidor y limpia la cookie.

## Propósito
Termina la sesión actual revocando el token de refresh en el servidor y limpiando la cookie `refresh_token`. El frontend también descarta su token de acceso en memoria y todos los datos en caché (convenciones §3).

## Método HTTP
POST

## URL
`/api/v1/auth/logout` (URL completa: `https://api.multicine.com/api/v1/auth/logout`)

## Autenticación
- Basada en cookie. No se necesita cabecera `Authorization` — la cookie `refresh_token` es la sesión. Como el token viaja en una cookie, la petición debe incluir la cabecera `X-CSRF-Token` (convenciones §2/§3).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `X-CSRF-Token` | Sí | Token CSRF (convenciones §2/§3) |
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

El token de refresh a revocar proviene de la cookie, no del cuerpo.

## Respuestas de éxito

**204 No Content** — sesión terminada, token de refresh revocado, cookie limpiada en el servidor. Sin cuerpo.

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `INVALID_TOKEN` / `ACCESS_TOKEN_EXPIRED` | La sesión ya no existe → **ignorar**: aun así limpiar la sesión local y redirigir |
| 403 | `FORBIDDEN` | Falla de CSRF → aun así limpiar la sesión local y redirigir |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (§10); no bloquear el cierre de sesión local |
| 500 | `SERVER_ERROR` | Registrar el fallo pero **nunca bloquear la UI** — el cliente siempre debe terminar la sesión local |

Ejemplo completo — error genérico (aun así se maneja del lado del cliente como best-effort):

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Error inesperado",
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- Limpiar el token de acceso en memoria (auth store / Zustand).
- `queryClient.clear()` — descartar **todos** los datos en caché de TanStack Query (convenciones §3); las siguientes lecturas de pantalla deben refetchear.
- Restablecer el store de autenticación al estado sin sesión.
- Redirigir al inicio de sesión (o al home) después de la limpieza local.
- Esta llamada debe ser **fire-and-forget con catch**: siempre intentar limpiar la cookie del servidor, pero nunca bloquear la UI por el resultado. Incluso si el token de acceso ya caducó, aun así enviar la petición (la cookie puede seguir siendo válida).
- No disparar el interceptor de refresh por 401 en los errores de este endpoint — el logout no debe provocar un refresh.
- Protegerse contra doble clic: deshabilitar el botón de cerrar sesión mientras la petición esté en curso.
- 429/500: aun así completar el cierre de sesión local; opcionalmente mostrar un mensaje no bloqueante ("No pudimos cerrar la sesión en el servidor").

## Reglas de validación
- Frontend: ninguna (sin entrada del usuario).

## Reglas de negocio
- Del lado del servidor, el token de refresh se revoca y la cookie caduca; las llamadas posteriores a `/auth/refresh` con esa cookie fallan.
- El logout es idempotente desde la perspectiva del cliente — llamarlo sin sesión activa es seguro.

## Notas de seguridad
- Nunca incluir el token de acceso en la URL; no es necesario para el logout (la cookie lleva la sesión).
- `X-CSRF-Token` evita el logout/falsificación de cookies entre sitios (§2/§3).
- Limpiar los datos sensibles en caché del lado del cliente (`queryClient.clear()`) para evitar que otro usuario vea PII en caché en un dispositivo compartido.
- Nunca registrar el token de refresh.

## Flujo de ejemplo
```
User clicks "Cerrar sesión"
↓
Fire-and-forget POST /auth/logout (cookie + X-CSRF-Token)
↓
Clear in-memory accessToken (auth store)
↓
queryClient.clear() (drop all cached data)
↓
Redirect to /login (or /)
(Errors never block this flow)
```
