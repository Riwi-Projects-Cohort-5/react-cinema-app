# POST /api/v1/auth/login

## Historia de usuario relacionada
- **HU-FE-007** — Inicio de sesión y autenticación segura. También la consume HU-FE-029 (consumo de API pública). Único punto de entrada para iniciar una sesión.

## Propósito
Autentica a un usuario con correo + contraseña. Si es exitoso, emite un `accessToken` JWT de corta duración (15 min, **RN-028**) y el identificador del usuario. El frontend conserva ambos valores en memoria.

## Método HTTP
POST

## URL
`/api/v1/auth/login` (referencia: `{{baseUrl}}/auth/login`)

## Autenticación
Pública (sin cabecera Authorization).

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
  "email": "john.doe@example.com",
  "password": "password123"
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `email` | string | Sí | Correo del usuario |
| `password` | string | Sí | Contraseña en texto plano (solo en el cable a través de HTTPS) |

## Respuestas de éxito

**200 OK** — autenticado. Devuelve ambos tokens y un resumen del usuario.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "1",
  "message": "Login successful",
  "TokenType": "Bearer"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `accessToken` | string | JWT, válido 15 minutos (**RN-028**) |
| `userId` | string | Identificador del usuario autenticado |
| `message` | string | Mensaje de confirmación del backend |
| `TokenType` | string | Tipo de token, normalmente `Bearer` |

## Respuestas de error
Las respuestas de error siguen el formato definido en las convenciones de API; el `400` del contrato actual devuelve el mensaje en la raíz (`{ "message": "..." }`).

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 400 | Credenciales inválidas según el contrato actual | Mostrar `message` en el formulario y no notificar como error genérico |
| 401 | Credenciales inválidas | Mostrar el mensaje (p. ej. "Credenciales inválidas. Intento fallido 1 de 5.") |
| 423 | Cuenta bloqueada temporalmente | Mostrar el mensaje de bloqueo (~15 min) y deshabilitar el envío con cuenta regresiva |
| 429 | Rate limit | Respetar la cabecera `Retry-After` (§10) |
| 500 / 503 | Error de servidor | Error genérico reintentable / banner de mantenimiento (§13) |

Ejemplo — credenciales inválidas (`400`):

```json
{
  "message": "Invalid credentials"
}
```

Ejemplo — credenciales inválidas (`401`):

```json
{
  "error": "Credenciales invalidas. Intento fallido 1 de 5."
}
```

Ejemplo — cuenta bloqueada (`423`):

```json
{
  "error": "Cuenta bloqueada temporalmente por exceder 5 intentos fallidos. Intenta de nuevo en 15 minutos."
}
```

## Consideraciones de frontend
- Toggle mostrar/ocultar contraseña en el input de contraseña.
- Guardar el `accessToken` y `userId` **en memoria** mediante Zustand — nunca en `localStorage`/`sessionStorage`.
- Para iniciar sesión, validar únicamente que el correo tenga formato válido y que la contraseña no esté vacía; la pantalla no muestra un indicador de fortaleza.
- Al éxito: obtener el perfil si aplica y redirigir a la ruta prevista (`location.state?.from`), por defecto al home.
- En `400`, mostrar el `message` recibido por el backend dentro del formulario.
- En `401` mostrar el mensaje del backend (incluye el conteo de intentos fallidos); en `423` mostrar cuenta regresiva de ~15 min.
- En 429, mostrar el mensaje informativo y respetar la espera proporcionada por el servidor (§10); no reintentar de inmediato.
- Los flujos de sesión caducada los gestiona el interceptor (§3), no esta pantalla.

## Reglas de validación
Validar ANTES de enviar:
- `email` tiene un formato de correo válido.
- `password` no está vacía (sin requisito de fortaleza al iniciar sesión).
- Ambos campos recortados antes de enviar.

## Reglas de negocio
- **RN-027:** si el usuario falla 5 intentos consecutivos, la cuenta se bloquea por 15 minutos (HTTP `423 Locked`).
- **RN-028:** el Access Token tiene vigencia de 15 minutos.
- **RN-029:** el Refresh Token tiene vigencia de 7 días.
- **RN-030:** cada inicio de sesión desactiva e invalida el Refresh Token previo.

## Notas de seguridad
- El token de acceso vive solo en memoria (convenciones §3) — nunca se persiste.
- Nunca almacenar credenciales (correo/contraseña) del lado del cliente.
- Nunca registrar contraseñas; evitar registrar el token de acceso o refresh.

## Flujo de ejemplo
```
User clicks "Iniciar sesión"
↓
Validate form (email format, password non-empty)
↓
POST /auth/login { email, password }
↓
200 → store accessToken + userId in memory (Zustand)
↓
Redirect to location.state?.from (or /)
(On 423 → countdown ~15 min)
```

## Confirmación y pendientes
- La colección compartida no incluye `rememberMe` ni CAPTCHA en login. Confirmar si el backend los soporta antes de exponerlos en la UI.
