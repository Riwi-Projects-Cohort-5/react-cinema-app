# POST /api/v1/auth/login

## Historia de usuario relacionada
- **HU-FE-007** — Inicio de sesión y autenticación segura. También la consume HU-FE-029 (consumo de API pública). Único punto de entrada para iniciar una sesión; aquí se establece la cookie de refresh.

## Propósito
Autentica a un usuario con correo + contraseña e inicia una sesión. Devuelve un token de acceso de corta duración (guardado en memoria por el frontend, convenciones §3) y establece una cookie `refresh_token` de larga duración (HttpOnly, Secure, SameSite=Lax). `rememberMe` solo influye en la duración del token de refresh.

## Método HTTP
POST

## URL
`/api/v1/auth/login` (URL completa: `https://api.multicine.com/api/v1/auth/login`)

## Autenticación
- Público (sin cabecera Authorization). Puede requerirse CAPTCHA tras fallos repetidos (ver `captchaToken?`).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; el backend localiza los mensajes de error) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, replicado por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "email": "valentina.rojas@example.com",
  "password": "ClaveSegura#2026",
  "rememberMe": true,
  "captchaToken": "03AFcWeA2sx...Q7"
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `email` | string | Sí | Correo del usuario |
| `password` | string | Sí | Contraseña en texto plano (solo en el cable a través de HTTPS) |
| `rememberMe` | boolean | No | `true` → el token de refresh dura ~30 días; `false`/ausente → ~1 día (solo sesión). **No** cambia el token de acceso. |
| `captchaToken` | string | No | Requerido cuando el backend lo exige después de intentos fallidos |

## Respuestas de éxito

**200 OK** — autenticado. La respuesta incluye el token de acceso **y** establece la cookie de refresh.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresInSeconds": 900,
  "user": {
    "id": "7f1a2b3c-4d5e-6f78-9abc-1d2e3f4a5b6c",
    "email": "valentina.rojas@example.com",
    "firstName": "Valentina",
    "lastName": "Rojas",
    "roles": ["CUSTOMER"],
    "membershipLevel": "BASIC",
    "avatarUrl": "https://cdn.multicine.com/avatars/7f1a2b3c.png"
  }
}
```

Cabecera de respuesta (gestionada por el backend; el cliente nunca la lee):
```
Set-Cookie: refresh_token=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth; Max-Age=2592000
```

| Campo | Tipo | Notas |
|---|---|---|
| `accessToken` | string | JWT, válido por `expiresInSeconds` (900 s = 15 min, convenciones §3) |
| `tokenType` | string | Siempre `Bearer` |
| `user.id` | UUID | Convenciones §8 |
| `user.roles` | string[] | p. ej. `CUSTOMER` (roles de admin/gerente para apps de staff) |
| `user.membershipLevel` | string \| null | p. ej. `BASIC`; `null` cuando aún no hay membresía |
| `user.avatarUrl` | string \| null | URL de CDN, opcional |

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes — cada `401` se mapea a una UX distinta:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | Correo/contraseña incorrectos → "Correo o contraseña incorrectos" |
| 401 | `EMAIL_NOT_VERIFIED` | La cuenta existe, el correo no está verificado → CTA "verifica tu correo" con reenvío |
| 401 | `ACCOUNT_LOCKED` | Demasiados fallos → mostrar cuenta regresiva usando `retryAfterSeconds` (§4) |
| 401 | `ACCOUNT_INACTIVE` | Usuario deshabilitado → mensaje de contacto con soporte |
| 400 | `VALIDATION_ERROR` / `INVALID_CAPTCHA` | Payload malformado o CAPTCHA rechazado |
| 429 | `RATE_LIMITED` | Demasiados intentos; respetar `retryAfterSeconds` (§10) |
| 500 / 503 | `SERVER_ERROR` / `SERVICE_UNAVAILABLE` | Reintentable / banner de mantenimiento (§13) |

Ejemplo completo — cuenta bloqueada (`401`):

```json
{
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Demasiados intentos fallidos. Intenta de nuevo más tarde.",
    "requestId": "req_01HZ8...",
    "retryAfterSeconds": 300
  }
}
```

Ejemplo completo — correo no verificado (`401`):

```json
{
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Debes verificar tu correo antes de iniciar sesión.",
    "requestId": "req_01HZ9..."
  }
}
```

## Consideraciones de frontend
- Toggle mostrar/ocultar contraseña en el input de contraseña.
- El checkbox "Recuérdame" se mapea a `rememberMe`; solo afecta la duración del token de refresh, no el comportamiento actual de la UX.
- Guardar el token de acceso **en memoria** (Zustand/context, convenciones §3) — nunca en `localStorage`/`sessionStorage`.
- La cookie de refresh la gestiona el navegador; el cliente nunca la toca.
- Mapear cada código `401` a un mensaje específico (tabla anterior). `EMAIL_NOT_VERIFIED` → pantalla/CTA para reenviar la verificación; `ACCOUNT_LOCKED` → botón con cuenta regresiva usando `retryAfterSeconds`.
- Spinner de carga al enviar; deshabilitar el envío mientras está en curso.
- Al éxito: obtener el perfil (`GET /profile`, clave `["profile"]`) y redirigir a la ruta prevista (`location.state?.from` desde el guard de autenticación), por defecto al home.
- En 429, mostrar el mensaje informativo y respetar la espera proporcionada por el servidor (§10); no reintentar de inmediato.
- Los flujos de sesión caducada los gestiona el interceptor (§3), no esta pantalla.

## Reglas de validación
Validar ANTES de enviar:
- `email` tiene un formato de correo válido.
- `password` no está vacía (sin requisito de fortaleza al iniciar sesión).
- Ambos campos recortados antes de enviar.

## Reglas de negocio
- Después de `ACCOUNT_LOCKED`, los intentos posteriores quedan bloqueados hasta que transcurra `retryAfterSeconds`; la UI debe mostrar la cuenta regresiva.
- Las cuentas no verificadas nunca pueden autenticarse (`EMAIL_NOT_VERIFIED`) — sin bypass silencioso de inicio de sesión.
- `rememberMe` cambia solo el `Max-Age` del token de refresh (sesión ~1 día vs ~30 días).

## Notas de seguridad
- El token de acceso vive solo en memoria (convenciones §3) — nunca se persiste.
- El token de refresh es una cookie HttpOnly, Secure, SameSite=Lax (convenciones §3); el frontend nunca la lee.
- Nunca almacenar credenciales (correo/contraseña) del lado del cliente; no pre-rellenar la contraseña desde cachés de autocompletado más allá de lo que gestiona el navegador.
- El CAPTCHA se activa automáticamente después de intentos sospechosos — el cliente debe volver a renderizar el reto cuando el backend lo solicite.
- Nunca registrar contraseñas; evitar registrar el token de acceso.

## Flujo de ejemplo
```
User clicks "Iniciar sesión"
↓
Validate form (email format, password non-empty)
↓
POST /auth/login { email, password, rememberMe }
↓
Store accessToken in memory (Zustand)
↓
Fetch profile (GET /profile)
↓
Redirect to location.state?.from (or /)
```
