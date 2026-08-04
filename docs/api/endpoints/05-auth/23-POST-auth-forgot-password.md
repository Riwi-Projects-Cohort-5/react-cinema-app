# POST /api/v1/auth/forgot-password

## Historia de usuario relacionada
- **HU-FE-007** — Inicio de sesión y autenticación segura. Solicita un correo de restablecimiento de contraseña para el flujo de inicio de sesión.

## Propósito
Inicia el proceso de restablecimiento de contraseña enviando un enlace de restablecimiento al correo indicado. La respuesta es **siempre** genérica (exista o no la cuenta) para evitar la enumeración de usuarios. Aquí no ocurre ningún restablecimiento — el cambio real se hace mediante `POST /auth/reset-password`.

## Método HTTP
POST

## URL
`/api/v1/auth/forgot-password` (URL completa: `https://api.multicine.com/api/v1/auth/forgot-password`)

## Autenticación
- Público (sin sesión requerida).

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
Ninguno.

## Cuerpo de la petición
```json
{
  "email": "valentina.rojas@example.com"
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `email` | string | Sí | Formato de correo válido; recortado |

## Respuestas de éxito

**200 OK** — respuesta genérica tanto si la cuenta existe como si no.

```json
{
  "message": "Si el correo existe, recibirás un enlace para restablecer tu contraseña."
}
```

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 422 | `VALIDATION_ERROR` | Formato de correo inválido; `details` se mapea al campo de correo |
| 429 | `RATE_LIMITED` | Demasiadas peticiones; respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

**Deliberadamente no hay `404`/`409` para correos desconocidos** — antienumeración (Reglas de negocio).

Ejemplo completo — validación (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Verifica los campos marcados",
    "details": [
      { "field": "email", "message": "El correo no es válido" }
    ],
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- Validar el formato de correo antes de enviar; bloquear el envío mientras sea inválido.
- Al éxito mostrar la pantalla genérica: "Revisa tu correo" con una nota de que, si la cuenta existe, se envió un enlace. **No** revelar si la cuenta existe.
- Enfriamiento en la acción de reenvío (cuenta regresiva de 60 s en el botón) — evita 429 accidentales.
- Ofrecer un enlace "Volver al inicio de sesión".
- 429 → respetar `retryAfterSeconds` con cuenta regresiva (§10); mostrar el mensaje informativo "Demasiadas solicitudes. Intenta de nuevo en X segundos."
- Deshabilitar el botón de envío mientras esté en curso; spinner de carga en el botón.
- Seguir los estados de convenciones §13: cargando, éxito (pantalla genérica), error recuperable (reintentar), cuenta regresiva de 429.

## Reglas de validación
Validar ANTES de enviar:
- `email` tiene un formato de correo válido.
- `email` está recortado y no vacío.

## Reglas de negocio
- Nunca revelar si un correo está registrado (devolver siempre el mismo mensaje 200) — antienumeración.
- Límite de tasa **agresivo** por IP/correo (p. ej. ventana corta, pocos intentos) para evitar enumeración masiva y correo-bombas (§10).
- Solo las cuentas existentes reciben el correo; el token interno es de un solo uso y caduca (ver `POST /auth/reset-password`).

## Notas de seguridad
- Las respuestas genéricas evitan la enumeración de cuentas — nunca añadir un mensaje más amigable para usuarios existentes.
- No registrar el correo enviado más allá de lo que permite la política de privacidad; nunca registrar tokens de restablecimiento.
- Los enlaces de restablecimiento incrustan un token de un solo uso; nunca deben incluirse en las respuestas de error.

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
