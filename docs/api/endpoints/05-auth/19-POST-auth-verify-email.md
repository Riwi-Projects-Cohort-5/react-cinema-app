# POST /api/v1/auth/verify-email

## Historia de usuario relacionada
- **HU-FE-006** — Registro de usuario. Se invoca cuando el usuario abre el enlace de activación enviado por `POST /auth/register`. Confirma el correo; la cuenta se vuelve activa y el flujo de membresía (HU-FE-006) puede comenzar.

## Propósito
Confirma la dirección de correo usando el token de un solo uso del enlace de activación. Al éxito, la cuenta se vuelve activa y queda lista para iniciar sesión. Según la historia, el usuario **no** entra automáticamente tras la verificación — el frontend muestra una pantalla de confirmación con un botón para ir al inicio de sesión.

## Método HTTP
POST

## URL
`/api/v1/auth/verify-email` (URL completa: `https://api.multicine.com/api/v1/auth/verify-email`)

## Autenticación
- Público. La petición se autoriza mediante el `token` de un solo uso en el cuerpo (sin token Bearer).

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
Ninguno. El token de activación viaja en el cuerpo de la petición; el enlace de correo solo lo lleva en la query string (`/verify-email?token=...`) para que lo lea el cliente.

## Cuerpo de la petición
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `token` | string | Sí | Token de un solo uso del enlace de activación. Caduca 24 h después del registro. |

## Respuestas de éxito

**200 OK** — correo confirmado, cuenta activada.

```json
{
  "message": "Cuenta activada",
  "loginRedirect": true
}
```

`loginRedirect: true` le indica al frontend mostrar una pantalla de confirmación "Cuenta activada" con una llamada a la acción para iniciar sesión. El usuario **no** se conecta automáticamente.

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `INVALID_TOKEN` | Token malformado → mostrar estado de enlace inválido con opción de reenvío |
| 404 | `ACCOUNT_NOT_FOUND` | No hay cuenta para este token → ofrecer reenviar / contactar soporte |
| 409 | `ALREADY_VERIFIED` | El correo ya está verificado → redirigir al inicio de sesión directamente (el enlace fue reutilizado) |
| 410 | `TOKEN_EXPIRED` | Token caducado (24 h) → mostrar la opción "reenviar activación" |
| 429 | `RATE_LIMITED` | Demasiados intentos; respetar `retryAfterSeconds` (§10) |

Ejemplo completo — token caducado (`410`):

```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "El enlace de activación ha expirado",
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- El enlace de correo abre la app en `/verify-email?token=...`. Leer el token de la query string y llamar a este endpoint automáticamente al montar.
- Estado de carga (skeleton/spinner) mientras verifica — nunca en blanco (convenciones §13).
- Éxito → pantalla "Cuenta activada" con un botón primario para iniciar sesión (`/login`). **No** navegar automáticamente al dashboard.
- `410 TOKEN_EXPIRED` → mostrar una acción "reenviar activación" (el reenvío está fuera del alcance de este endpoint; conectarlo a un flujo de reenvío) más un enlace de vuelta al inicio de sesión.
- `400 INVALID_TOKEN` / `404 ACCOUNT_NOT_FOUND` → estado de enlace inválido; ofrecer reenvío + contacto de soporte.
- `409 ALREADY_VERIFIED` → tratar como éxito: redirigir al inicio de sesión (la cuenta está bien).
- Después del éxito, la CTA de membresía (HU-FE-006) queda disponible — ver `POST /memberships`; esta pantalla puede mostrar "Activar membresía".
- 429 → deshabilitar el botón de reintento y mostrar la cuenta regresiva proporcionada por el servidor (§10).
- Guarda: si `token` falta/es inválido en la URL, mostrar el estado de enlace inválido sin llamar a la API.

## Reglas de validación
- Frontend: `token` debe estar presente y no vacío en la query string de la URL antes de llamar; ninguna otra validación del cliente.

## Reglas de negocio
- El token es de un solo uso: una segunda llamada con el mismo token devuelve `409 ALREADY_VERIFIED` (o `400 INVALID_TOKEN`).
- El token caduca 24 h después del registro (`410 TOKEN_EXPIRED`).
- Tras la verificación, la cuenta está `ACTIVE` y la membresía se puede crear (`POST /memberships`, HU-FE-006).
- La verificación no crea una sesión — no se devuelven tokens/cookies.

## Notas de seguridad
- El token de activación es una capacidad secreta: nunca registrarlo ni guardarlo en `localStorage`; leerlo solo desde la URL.
- No auto-iniciar sesión al éxito (evita la creación silenciosa de sesiones desde un enlace interceptado sin la contraseña).
- Límite de tasa por IP para evitar la fuerza bruta sobre el token.

## Flujo de ejemplo
```
User clicks "Activar cuenta" in the email
↓
Link opens /verify-email?token=...
↓
Read token from query string
↓
POST /auth/verify-email { token }
↓
Show loading state
↓
200 → "Cuenta activada" screen with "Iniciar sesión" button
↓
User clicks → redirect to /login
```
