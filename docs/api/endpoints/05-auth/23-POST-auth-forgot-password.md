# POST /api/v1/auth/forgot-password

## Historia de usuario relacionada
- **HU-FE-007** — Inicio de sesión y autenticación segura. Solicita un correo de restablecimiento de contraseña para el flujo de inicio de sesión.

## Propósito
Inicia el proceso de restablecimiento de contraseña enviando un enlace de recuperación al correo indicado. El cambio real se hace mediante `POST /auth/reset-password`. La respuesta es genérica (exista o no la cuenta) para evitar la enumeración de usuarios.

## Método HTTP
POST

## URL
`/api/v1/auth/forgot-password` (referencia: `{{baseUrl}}/auth/forgot-password`)

## Autenticación
- Público (sin sesión requerida).

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
  "email": "john.doe@example.com"
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `email` | string | Sí | Formato de correo válido; recortado |

## Respuestas de éxito

**200 OK** — respuesta genérica tanto si la cuenta existe como si no.

```json
{
  "message": "Se ha enviado un enlace de recuperacion a tu correo electronico."
}
```

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `400`, `429`, `500`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 400 | Formato de correo inválido | Mostrar el mensaje de `error` en el campo de correo |
| 429 | Rate limit | Respetar la cabecera `Retry-After` (§10); mostrar cuenta regresiva |
| 500 | Falla inesperada | Error genérico reintentable (§13) |

**Deliberadamente no hay `404`/`409` para correos desconocidos** — antienumeración (Reglas de negocio).

## Consideraciones de frontend
- Validar el formato de correo antes de enviar; bloquear el envío mientras sea inválido.
- Al éxito mostrar la pantalla genérica: "Revisa tu correo" con una nota de que, si la cuenta existe, se envió un enlace. **No** revelar si la cuenta existe.
- Enfriamiento en la acción de reenvío (cuenta regresiva de 60 s en el botón) — evita 429 accidentales.
- Ofrecer un enlace "Volver al inicio de sesión".
- Deshabilitar el botón de envío mientras esté en curso; spinner de carga en el botón.
- Seguir los estados de convenciones §13: cargando, éxito (pantalla genérica), error recuperable (reintentar), cuenta regresiva de 429.

## Reglas de validación
Validar ANTES de enviar:
- `email` tiene un formato de correo válido.
- `email` está recortado y no vacío.

## Reglas de negocio
- Nunca revelar si un correo está registrado (respuesta genérica) — antienumeración.
- Límite de tasa **agresivo** por IP/correo para evitar enumeración masiva y correo-bombas (§10).
- Solo las cuentas existentes reciben el correo; el token interno es de un solo uso y caduca (ver `POST /auth/reset-password`).

## Notas de seguridad
- Las respuestas genéricas evitan la enumeración de cuentas.
- No registrar correos más allá de lo que permite la política de privacidad; nunca registrar tokens de restablecimiento.

## Flujo de ejemplo
```
User clicks "¿Olvidaste tu contraseña?"
↓
Validate email format
↓
POST /auth/forgot-password { email }
↓
200 → show generic "Revisa tu correo" screen
↓
Show cooldown (60s) on resend
↓
User returns to login
```
