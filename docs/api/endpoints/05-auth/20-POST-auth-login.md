# POST /api/v1/auth/login

## Historia de usuario relacionada
- **HU-FE-007** — Inicio de sesión y autenticación segura. También la consume HU-FE-029 (consumo de API pública). Único punto de entrada para iniciar una sesión.

## Propósito
Autentica a un usuario con correo + contraseña. Si es exitoso, emite un `accessToken` JWT de corta duración (15 min, **RN-028**) y un `refreshToken` de larga duración (7 días, **RN-029**). **Ambos tokens viajan en el cuerpo JSON** (no en cookies).

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
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role_id": 1
  }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `accessToken` | string | JWT, válido 15 minutos (**RN-028**) |
| `refreshToken` | string | JWT, válido 7 días (**RN-029**); se envía en el cuerpo de `#21`/`#22` |
| `user.id` | integer | Id del usuario |
| `user.role_id` | integer | Rol del usuario (p. ej. `1` = cliente) |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`).

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 401 | Credenciales inválidas | Mostrar el mensaje (p. ej. "Credenciales inválidas. Intento fallido 1 de 5.") |
| 423 | Cuenta bloqueada temporalmente | Mostrar el mensaje de bloqueo (~15 min) y deshabilitar el envío con cuenta regresiva |
| 429 | Rate limit | Respetar la cabecera `Retry-After` (§10) |
| 500 / 503 | Error de servidor | Error genérico reintentable / banner de mantenimiento (§13) |

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
- Guardar el `accessToken` **en memoria** (Zustand/context, convenciones §3) — nunca en `localStorage`/`sessionStorage`.
- Guardar también el `refreshToken` para renovar la sesión (`#21`) — mantenerlo fuera del almacenamiento persistente mientras la política del proyecto lo permita.
- Al éxito: obtener el perfil si aplica y redirigir a la ruta prevista (`location.state?.from`), por defecto al home.
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
200 → store accessToken + refreshToken in memory (Zustand)
↓
Redirect to location.state?.from (or /)
(On 423 → countdown ~15 min)
```

## Confirmación y pendientes
- La colección compartida no incluye `rememberMe` ni CAPTCHA en login. Confirmar si el backend los soporta antes de exponerlos en la UI.
