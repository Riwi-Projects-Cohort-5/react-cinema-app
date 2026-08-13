# POST /api/v1/auth/reset-password

## Historia de usuario relacionada
- **HU-FE-007** — Inicio de sesión y autenticación segura. Establece una nueva contraseña usando el token temporal recibido por correo desde `POST /auth/forgot-password` (#23).

## Propósito
Restablece la contraseña del usuario utilizando el token temporal de recuperación recibido por correo. Al éxito, el usuario es redirigido al inicio de sesión. Las reglas de contraseña coinciden con el registro (HU-FE-006, **RN-022/RN-023**).

## Método HTTP
POST

## URL
`/api/v1/auth/reset-password` (referencia: `{{baseUrl}}/auth/reset-password`)

## Autenticación
- Público. Autorizado por el `token` temporal en el cuerpo (sin token Bearer).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno. El token viaja en el cuerpo; el enlace de correo solo lo lleva en la query string (`/reset-password?token=...`).

## Cuerpo de la petición
```json
{
  "token": "recovery-token-xyz123",
  "newPassword": "NewSecurePassword123!"
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `token` | string | Sí | Token temporal de recuperación recibido por correo |
| `newPassword` | string | Sí | Debe cumplir la política de seguridad (**RN-022/RN-023**) |

## Respuestas de éxito

**200 OK** — contraseña actualizada.

```json
{
  "message": "Contrasena actualizada exitosamente. Puedes iniciar sesion con tu nueva clave."
}
```

El frontend muestra un toast de éxito y redirige al inicio de sesión.

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `400`, `429`, `500`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 400 | Token inválido/revocado o contraseña débil | Mostrar el mensaje de `error`; token inválido → estado de enlace inválido con "solicitar nuevo enlace" |
| 429 | Rate limit | Respetar la cabecera `Retry-After` (§10) |
| 500 | Falla inesperada | Error genérico reintentable (§13) |

Ejemplo — token inválido/revocado (`400`):

```json
{
  "error": "Token de recuperacion invalido o expirado."
}
```

## Consideraciones de frontend
- El enlace de correo abre la app en `/reset-password?token=...`; leer el token de la query string y pasarlo en el cuerpo.
- Si `token` falta/es inválido en la URL, mostrar el estado de enlace inválido sin llamar a la API.
- Medidor de fortaleza de contraseña + mismas reglas que el registro (mínimo de caracteres, mayúscula/minúscula/número/especial — **RN-022/RN-023**).
- La confirmación de contraseña se valida solo en el cliente (la API no recibe `confirmPassword`).
- Al éxito: toast "Contraseña actualizada" y redirigir a `/login` (sin auto-iniciar sesión).
- En `400` con token inválido → acción "reenviar enlace" (dirige a `POST /auth/forgot-password`, #23) + enlace de vuelta al inicio de sesión.
- 429 → deshabilitar el envío y respetar la cuenta regresiva proporcionada por el servidor (§10).
- Spinner de carga al enviar; deshabilitar el botón mientras esté en curso (evita restablecimientos duplicados).
- Seguir los estados de convenciones §13: cargando, éxito (toast + redirección), error recuperable (reintentar), cuenta regresiva de 429.

## Reglas de validación
Validar ANTES de enviar:
- `token` presente y no vacío.
- `newPassword` cumple la política de seguridad de la plataforma (**RN-022/RN-023**).
- El campo "confirmar contraseña" coincide con `newPassword` (validación solo del cliente).

## Reglas de negocio
- El token de restablecimiento es de un solo uso y caduca (enviado por `POST /auth/forgot-password`, #23).
- Un restablecimiento exitoso puede revocar otras sesiones activas en el servidor; el cliente debe iniciar sesión de nuevo de todas formas.

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
Fill new password + confirm (strength meter + equality check, client-only)
↓
POST /auth/reset-password { token, newPassword }
↓
200 → toast "Contraseña actualizada"
↓
Redirect to /login
```
