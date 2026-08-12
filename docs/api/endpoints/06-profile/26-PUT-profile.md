# PUT /api/v1/profile

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-008** — Perfil y beneficios de membresía. Guarda las ediciones del formulario de "Mi cuenta" (campos personales, de contacto y de preferencias).

## Propósito
Actualiza los campos personales permitidos del usuario autenticado. Los campos de identidad (`documentType`, `documentNumber`) son inmutables y se rechazan si se envían. Cambiar el correo dispara un flujo de re-verificación: el campo queda marcado como pendiente hasta que el nuevo correo se confirma.

## Método HTTP
PUT

## URL
`/api/v1/profile` (URL completa: `https://api.multicine.com/api/v1/profile`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
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
  "firstName": "Valentina",
  "lastName": "Rojas",
  "phone": "3012345678",
  "gender": "F",
  "birthDate": "2001-04-12",
  "cityId": "8f7e6d5c-4b3a-4c2d-9e1f-0a1b2c3d4e5f",
  "favoriteCinemaId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "email": "valentina.nueva@example.com"
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `firstName` | string | No | 2–50 caracteres |
| `lastName` | string | No | 2–50 caracteres |
| `phone` | string | No | Celular colombiano `3XXXXXXXXX` (10 dígitos) |
| `gender` | enum | No | `M` \| `F` \| `O` |
| `birthDate` | string | No | `YYYY-MM-DD` (convenciones §7), no futura |
| `cityId` | UUID | No | Ciudad preferida (convenciones §8) |
| `favoriteCinemaId` | UUID | No | Cine favorito opcional |
| `email` | string | No | Cambiarlo dispara la re-verificación (ver Reglas de negocio) |

Solo se actualizan los campos presentes (semántica de actualización parcial).

## Respuestas de éxito

**200 OK** — perfil actualizado.

```json
{
  "user": {
    "id": "7f1a2b3c-4d5e-6f78-9abc-1d2e3f4a5b6c",
    "firstName": "Valentina",
    "lastName": "Rojas",
    "documentType": "CC",
    "documentNumber": "1032456789",
    "birthDate": "2001-04-12",
    "gender": "F",
    "email": "valentina.nueva@example.com",
    "phone": "3012345678",
    "avatarUrl": "https://cdn.multicine.com/avatars/7f1a2b3c.png",
    "city": { "id": "8f7e6d5c-4b3a-4c2d-9e1f-0a1b2c3d4e5f", "name": "Medellín" },
    "favoriteCinemaId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "emailVerified": false,
    "isActive": true
  },
  "emailPendingVerification": true
}
```

- `emailPendingVerification: true` aparece **solo** cuando se cambió `email`; `user.emailVerified` queda entonces en `false` hasta que la nueva dirección se confirma.

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Payload malformado (p. ej. campos no editables como `documentNumber` presentes) |
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | Intentar editar campos **no editables** (documentType/documentNumber) o sin permiso → error en el campo / "No tienes permiso" |
| 404 | `NOT_FOUND` | `cityId` / `favoriteCinemaId` no existe → mapear al campo de ciudad |
| 409 | `EMAIL_ALREADY_REGISTERED` | El nuevo correo ya está en uso → mapear al campo de correo |
| 422 | `VALIDATION_ERROR` | Falló la validación de campos; `details` se mapea a los campos (§4) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — correo ya en uso (`409`):

```json
{
  "error": {
    "code": "EMAIL_ALREADY_REGISTERED",
    "message": "El correo ya está registrado",
    "details": [
      { "field": "email", "message": "Este correo ya está en uso" }
    ],
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- Formulario prellenado desde `GET /profile` (clave `["profile"]`); los campos de documento se renderizan de solo lectura (inputs deshabilitados).
- Estado de guardado (spinner al enviar, deshabilitar el botón); actualización optimista opcional con rollback al error (§12).
- Toast de éxito ("Perfil actualizado"); cuando `emailPendingVerification: true` mostrar la advertencia "Debes verificar tu nuevo correo".
- Invalidar `["profile"]` y `["membership"]` tras el éxito — sin recarga necesaria (la respuesta ya trae el objeto de usuario fresco).
- Los errores del backend se mapean a los campos mediante `error.details[].field`; los errores globales (429, 500) muestran un banner (§13).
- `403` por campos no editables → mostrar explicación en línea ("El documento no se puede modificar").
- El campo de correo muestra una insignia "pendiente de verificación" mientras `emailVerified === false`.

## Reglas de validación
Validar ANTES de enviar:
- `email` tiene un formato de correo válido **y** coincide con el campo de confirmación de correo (si el input de correo permite confirmación).
- `phone` coincide con `3\d{9}` cuando está presente.
- `birthDate` es una fecha `YYYY-MM-DD` válida, no futura.
- `firstName`/`lastName` de 2–50 caracteres.
- Los campos de documento se excluyen del payload (son de solo lectura).
- Enviar solo los campos que el usuario realmente cambió (envío de campos sucios) para evitar 422 espurios.

## Reglas de negocio
- `documentType` / `documentNumber` son inmutables — el servidor rechaza los intentos de cambiarlos (`403`).
- Cambiar `email` establece `emailVerified=false` y envía un correo a la nueva dirección; la dirección antigua sigue siendo usable hasta que la nueva se confirma.
- `cityId`/`favoriteCinemaId` deben referenciar recursos de ubicación existentes (`404` de lo contrario).
- No se crea estado de dinero ni de reservas, por lo que no se requiere `X-Idempotency-Key` (§9).

## Notas de seguridad
- Las actualizaciones de PII (teléfono, birthDate) deben tener límite de tasa para evitar scraping/abuso (§10).
- Nunca registrar el correo/teléfono enviado más allá de lo que permite la política de privacidad.
- Solo el usuario autenticado puede editar su propio perfil (alcance del propietario, §3).
- La respuesta replica los campos de documento — renderizarlos pero nunca guardarlos fuera del store de autenticación.

## Flujo de ejemplo
```
User opens "Mi cuenta" (GET /profile pre-fills the form)
↓
User edits phone + changes email
↓
Validate (phone format, email match)
↓
PUT /profile { phone, email }
↓
200 → toast "Perfil actualizado"
↓
invalidate ["profile"] and ["membership"]
↓
Show "verifica tu nuevo correo" badge on the email field
```
