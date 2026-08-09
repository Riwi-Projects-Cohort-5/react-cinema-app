# POST /api/v1/users

## Historia de usuario relacionada
- **HU-FE-006** — Registro de usuario. Crea la cuenta desde el formulario de registro.

## Propósito
Registra un nuevo usuario en la base de datos. La contraseña se almacena **cifrada con BCrypt**. El endpoint no inicia sesión ni devuelve tokens.

## Método HTTP
POST

## URL
`/api/v1/users` (referencia: `{{baseUrl}}/users`)

## Autenticación
Pública. No se requiere token.

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
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `name` | string | Sí | Nombre del usuario |
| `email` | string | Sí | Correo único (**RN-021**) |
| `password` | string | Sí | Debe cumplir la política de seguridad (**RN-022/RN-023**) |

## Respuestas de éxito

### 201 Created
Usuario creado. No se devuelve la contraseña.

```json
{
  "id": 10,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role_id": 1,
  "failed_login_attempts": 0,
  "locked_until": null,
  "createdAt": "2026-08-08T16:00:00.000Z"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | integer | Id del usuario (convenciones §8) |
| `role_id` | integer | Rol asignado (p. ej. `1` = cliente) |
| `failed_login_attempts` | integer | Contador de intentos fallidos de login (ver `#20`) |
| `locked_until` | string ISO 8601 UTC \| null | Bloqueo temporal activo, si aplica |
| `createdAt` | string ISO 8601 UTC | Fecha de creación (convenciones §7) |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes:

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 400 | Correo ya registrado | Mostrar el mensaje de `error` en el campo de correo |

```json
{
  "error": "El correo electronico ya se encuentra registrado."
}
```

## Consideraciones de frontend
- Validar en el cliente: `name` no vacío, `email` con formato válido, `password` según la política (mínimo de caracteres, mayúscula/minúscula/número/carácter especial — **RN-022/RN-023**).
- Deshabilitar el botón de envío mientras la petición esté en curso; conservar los valores del formulario si falla (sin pérdida de datos).
- Los errores del backend se muestran como banner/mensaje; el 400 de correo duplicado se mapea al campo de correo y ofrece el enlace "¿Ya tienes cuenta? Inicia sesión".
- Al éxito, redirigir al inicio de sesión (el registro no crea sesión).
- Seguir convenciones §13: cargando (spinner en el envío), éxito (redirección a login), error recuperable (reintentar), 429 (cuenta regresiva según §10).

## Reglas de validación
Validar ANTES de enviar:
- `name` no vacío.
- `email` tiene un formato de correo válido.
- `password` cumple la política de seguridad de la plataforma (**RN-022/RN-023**).

## Reglas de negocio
- **RN-021:** el correo electrónico debe ser único.
- **RN-022 / RN-023:** la contraseña debe cumplir las políticas de seguridad.
- El registro no inicia sesión ni emite tokens.

## Notas de seguridad
- **Nunca registrar (loguear) la contraseña** en ninguna capa.
- Nunca devolver la contraseña en ninguna respuesta.
- El backend almacena la contraseña cifrada con BCrypt.

## Flujo de ejemplo
```
User opens /register
↓
Fill name + email + password (strength meter)
↓
Validate form (email format, password policy)
↓
POST /users { name, email, password }
↓
201 Created
↓
Redirect to /login
(On 400 duplicate email → show message on email field + link to login)
```

## Pendiente de confirmación con el backend
- El backend aún no expone en la colección compartida el endpoint de verificación de correo (`POST /auth/verify-email`, #19) ni el flujo de membresía post-registro. Confirmar cuándo estén disponibles.
