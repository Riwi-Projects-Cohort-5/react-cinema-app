# POST /api/v1/auth/reset-password

## Historia de usuario relacionada
- **HU-FE-007** — Inicio de sesión y autenticación segura. Establece una nueva contraseña usando el token de un solo uso entregado por `POST /auth/forgot-password`.

## Propósito
Completa el restablecimiento de contraseña estableciendo una nueva, autorizada por el token de un solo uso del correo de restablecimiento. Al éxito, el usuario es redirigido al inicio de sesión. Las reglas de contraseña coinciden con el registro (HU-FE-006).

## Método HTTP
POST

## URL
`/api/v1/auth/reset-password` (URL completa: `https://api.multicine.com/api/v1/auth/reset-password`)

## Autenticación
- Público. Autorizado por el `token` de un solo uso en el cuerpo (sin token Bearer).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` |
| `X-Request-Id` | Opcional | UUID generado por el cliente, replicado por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno. El token viaja en el cuerpo; el enlace de correo solo lo lleva en la query string (`/reset-password?token=...`).

## Cuerpo de la petición
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NuevaClave#2026",
  "confirmPassword": "NuevaClave#2026"
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `token` | string | Sí | Token de un solo uso del correo de restablecimiento |
| `newPassword` | string | Sí | Mínimo 10 caracteres, mayúscula + minúscula + número + carácter especial (ver Reglas de validación) |
| `confirmPassword` | string | Sí | Debe coincidir con `newPassword`; se valida en el cliente y se vuelve a comprobar en el servidor |

## Respuestas de éxito

**200 OK** — contraseña actualizada.

```json
{
  "message": "Contraseña actualizada"
}
```

El frontend muestra un toast de éxito y redirige al inicio de sesión.

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `INVALID_TOKEN` | Token malformado/revocado → estado de enlace inválido con "solicitar nuevo enlace" |
| 400 | `VALIDATION_ERROR` | Contraseña débil / confirmación que no coincide → mapear a los campos de contraseña |
| 410 | `TOKEN_EXPIRED` | Enlace de restablecimiento caducado → ofrecer "reenviar enlace" (volver a forgot-password) |
| 422 | `VALIDATION_ERROR` | Falló la validación de campos; `details` se mapea a los campos |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — token caducado (`410`):

```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "El enlace para restablecer la contraseña ha expirado.",
    "requestId": "req_01HZ8..."
  }
}
```

Ejemplo completo — contraseña débil (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Verifica los campos marcados",
    "details": [
      { "field": "newPassword", "message": "Debe incluir mayúscula, minúscula, número y un carácter especial" }
    ],
    "requestId": "req_01HZ9..."
  }
}
```

## Consideraciones de frontend
- El enlace de correo abre la app en `/reset-password?token=...`; leer el token de la query string y pasarlo en el cuerpo.
- Si `token` falta/es inválido en la URL, mostrar el estado de enlace inválido sin llamar a la API.
- Medidor de fortaleza de contraseña + mismas reglas que el registro (mínimo 10 caracteres, mayúscula/minúscula/número/especial).
- La confirmación de contraseña debe coincidir con `newPassword` antes de habilitar el envío.
- Al éxito: toast "Contraseña actualizada" y redirigir a `/login` (sin auto-iniciar sesión).
- `410 TOKEN_EXPIRED` → acción "reenviar enlace" (dirige a `POST /auth/forgot-password`) + enlace de vuelta al inicio de sesión.
- 429 → deshabilitar el envío y respetar la cuenta regresiva proporcionada por el servidor (§10).
- Spinner de carga al enviar; deshabilitar el botón mientras esté en curso (evita restablecimientos duplicados).
- Seguir los estados de convenciones §13: cargando, éxito (toast + redirección), error recuperable (reintentar), cuenta regresiva de 429.

## Reglas de validación
Validar ANTES de enviar:
- `token` presente y no vacío.
- `newPassword` mínimo 10 caracteres con al menos una mayúscula, una minúscula, un dígito y un carácter especial.
- `confirmPassword` coincide con `newPassword`.

## Reglas de negocio
- El token de restablecimiento es de un solo uso y caduca (normalmente ~24 h, igual que el token de activación).
- Un restablecimiento exitoso puede revocar otras sesiones activas en el servidor; el cliente debe iniciar sesión de nuevo de todas formas.
- `confirmPassword` se vuelve a validar en el servidor — no se confía solo en la validación del cliente.

## Notas de seguridad
- El token de restablecimiento es una capacidad secreta: leerlo solo desde la URL, nunca registrarlo ni guardarlo en `localStorage`.
- Nunca auto-iniciar sesión después del restablecimiento — el usuario debe autenticarse con la nueva contraseña.
- Nunca devolver la contraseña o el token en las respuestas; nunca registrar la contraseña.
- Límite de tasa por IP/token para evitar fuerza bruta sobre tokens débiles (§10).

## Flujo de ejemplo
```
User clicks the reset link in the email
↓
Link opens /reset-password?token=...
↓
Read token from query string
↓
Fill new password + confirm (strength meter + equality check)
↓
POST /auth/reset-password { token, newPassword, confirmPassword }
↓
200 → toast "Contraseña actualizada"
↓
Redirect to /login
```
