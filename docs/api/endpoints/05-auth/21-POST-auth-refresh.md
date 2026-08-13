# POST /api/v1/auth/refresh

## Historia de usuario relacionada
- **HU-FE-007** — Inicio de sesión y autenticación segura. También HU-FE-029. Rota el token de acceso de forma transparente; lo usa **solo** el interceptor centralizado del cliente HTTP (convenciones §3).

## Propósito
Solicita un nuevo `accessToken` enviando el `refreshToken` válido en el **cuerpo JSON**. El refresh exitoso rota el token (**RN-030**): el `refreshToken` anterior queda invalidado en la base de datos, por lo que el cliente debe reemplazar el valor almacenado con el que devuelva la respuesta. Este endpoint nunca se llama directamente desde los componentes.

## Método HTTP
POST

## URL
`/api/v1/auth/refresh` (referencia: `{{baseUrl}}/auth/refresh`)

## Autenticación
Pública — la renovación se autoriza por el propio `refreshToken` enviado en el cuerpo. Sin cabecera `Authorization`.

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `refreshToken` | string | Sí | Token de refresco emitido por `POST /auth/login` (#20) |

## Respuestas de éxito

**200 OK** — nuevo token de acceso emitido.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `accessToken` | string | JWT, válido 15 minutos (**RN-028**) |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`).

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 401 | `refreshToken` inválido/revocado/expirado | La sesión terminó → el interceptor cierra sesión, limpia el store de autenticación y redirige al inicio de sesión recordando la ruta prevista (§3) |
| 429 | Rate limit | Respetar la cabecera `Retry-After` (§10); esperar antes de otro intento de refresh |
| 500 | Falla inesperada del backend | **No** cerrar sesión; el interceptor puede reintentar una vez después de un breve backoff |

Ejemplo — token de refresh inválido (`401`):

```json
{
  "error": "Refresh token invalido o expirado."
}
```

## Consideraciones de frontend
- **Nunca llamar a este endpoint desde componentes u hooks.** Lo usa solo el interceptor centralizado del cliente HTTP en `src/services` (convenciones §3).
- Flujo del interceptor ante `401` (access token expirado):
  1. Si ya hay un refresh en curso, encolar esta petición.
  2. De lo contrario, llamar a `POST /auth/refresh` con el `refreshToken` guardado **una sola vez**.
  3. Al éxito, actualizar el token de acceso en memoria (y el `refreshToken` rotado) y reproducir las peticiones en cola (cada una exactamente una vez).
  4. Al fallo (`401`), limpiar la sesión, notificar al store de autenticación y redirigir al inicio de sesión con `location.state.from` = la ruta original.
- Los `401` concurrentes deben encolarse — nunca disparar refrescos en paralelo (§3).
- El `refreshToken` se guarda en memoria y se reemplaza con el que devuelva el backend; nunca persistir el token (convenciones §3).
- Respetar el 429 de este endpoint: esperar antes de otro intento de refresh (§10).

## Reglas de validación
- Frontend: ninguna (sin entrada del usuario). El interceptor solo lo envía cuando se observó un `401`.

## Reglas de negocio
- El `refreshToken` se **rota** en cada refresh exitoso (**RN-030**); el anterior queda invalidado en el servidor.
- El token de acceso permanece de corta duración (15 min, **RN-028**) para que nunca se confíe en él más allá de su ventana.

## Notas de seguridad
- Los tokens viajan en el cuerpo JSON (no en cookies) — nunca registrar el token de acceso ni el refresh.
- Ante cualquier fallo del refresh, el cliente debe limpiar completamente su sesión — no reintentar en bucle.

## Flujo de ejemplo
```
Protected request returns 401 (access token expired)
↓
Interceptor queues concurrent 401s (single-flight)
↓
POST /auth/refresh { "refreshToken": "..." }
↓
200 → store new accessToken (and rotated refreshToken) in memory
↓
Replay original request exactly once
↓
Surface result to the caller
(On 401 → logout + redirect to login with intended route)
```
