# POST /api/v1/auth/logout

## Historia de usuario relacionada
- **HU-FE-007** — Inicio de sesión y autenticación segura. Termina la sesión; invalida el `refreshToken` en el servidor.

## Propósito
Cierra la sesión activa del usuario e invalida su `refreshToken` en la base de datos. El frontend también descarta su `accessToken` y `refreshToken` en memoria y todos los datos en caché (convenciones §3).

## Método HTTP
POST

## URL
`/api/v1/auth/logout` (referencia: `{{baseUrl}}/auth/logout`)

## Autenticación
Autenticado — se envía `Authorization: Bearer <accessToken>` (convenciones §3). El servidor invalida el refresh token de la sesión.

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno (petición POST sin cuerpo).

## Respuestas de éxito

**200 OK** — sesión cerrada, refresh token invalidado en el servidor.

```json
{
  "message": "Sesion cerrada correctamente."
}
```

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`).

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 401 | Token de acceso inválido/expirado | **Ignorar**: aun así limpiar la sesión local y redirigir |
| 429 | Rate limit | Respetar la cabecera `Retry-After` (§10); no bloquear el cierre de sesión local |
| 500 | Falla inesperada | Registrar el fallo pero **nunca bloquear la UI** — el cliente siempre debe terminar la sesión local |

## Consideraciones de frontend
- Limpiar el token de acceso y de refresh en memoria (auth store / Zustand).
- `queryClient.clear()` — descartar **todos** los datos en caché de TanStack Query (convenciones §3); las siguientes lecturas de pantalla deben refetchear.
- Restablecer el store de autenticación al estado sin sesión.
- Redirigir al inicio de sesión (o al home) después de la limpieza local.
- Esta llamada debe ser **fire-and-forget con catch**: siempre intentar invalidar el refresh token en el servidor, pero nunca bloquear la UI por el resultado. Incluso si el token de acceso ya caducó, aun así enviar la petición.
- No disparar el interceptor de refresh por `401` en los errores de este endpoint — el logout no debe provocar un refresh.
- Protegerse contra doble clic: deshabilitar el botón de cerrar sesión mientras la petición esté en curso.
- 429/500: aun así completar el cierre de sesión local; opcionalmente mostrar un mensaje no bloqueante ("No pudimos cerrar la sesión en el servidor").

## Reglas de validación
- Frontend: ninguna (sin entrada del usuario).

## Reglas de negocio
- Del lado del servidor, el `refreshToken` se revoca en la base de datos; las llamadas posteriores a `/auth/refresh` (#21) con ese token fallan.
- El logout es idempotente desde la perspectiva del cliente — llamarlo sin sesión activa es seguro.

## Notas de seguridad
- Nunca incluir el token en la URL; el access token viaja solo en la cabecera `Authorization`.
- Limpiar los datos sensibles en caché del lado del cliente (`queryClient.clear()`) para evitar que otro usuario vea PII en caché en un dispositivo compartido.
- Nunca registrar el token de acceso ni el refresh.

## Flujo de ejemplo
```
User clicks "Cerrar sesión"
↓
Fire-and-forget POST /auth/logout (Authorization: Bearer <accessToken>)
↓
Clear in-memory accessToken + refreshToken (auth store)
↓
queryClient.clear() (drop all cached data)
↓
Redirect to /login (or /)
(Errors never block this flow)
```
