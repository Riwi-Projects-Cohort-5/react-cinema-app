# POST /api/v1/auth/register

## Historia de usuario relacionada
- **HU-FE-006** — Registro de usuario. Crea la cuenta desde el asistente de registro por pasos; la cuenta se crea **INACTIVA** y solo se activa después de la verificación del correo (`POST /auth/verify-email`).

## Propósito
Crea una cuenta de usuario de Multicine. El endpoint **no** inicia la sesión ni devuelve tokens: la cuenta comienza INACTIVA hasta que el correo se verifica. La membresía se crea/activa solo después de la verificación (ver `POST /auth/verify-email` y `POST /memberships`).

## Método HTTP
POST

## URL
`/api/v1/auth/register` (URL completa: `https://api.multicine.com/api/v1/auth/register`)

## Autenticación
- Público. Se requiere un token de CAPTCHA válido (`captchaToken`) (antibot). No se inicia ninguna sesión.

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
  "personal": {
    "firstName": "Valentina",
    "lastName": "Rojas",
    "documentType": "CC",
    "documentNumber": "1032456789",
    "birthDate": "2001-04-12",
    "gender": "F"
  },
  "contact": {
    "email": "valentina.rojas@example.com",
    "phone": "3012345678"
  },
  "password": "ClaveSegura#2026",
  "preferences": {
    "cityId": "8f7e6d5c-4b3a-4c2d-9e1f-0a1b2c3d4e5f",
    "favoriteCinemaId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
  },
  "consents": {
    "dataProcessing": true,
    "terms": true,
    "commercialEmail": true
  },
  "captchaToken": "03AFcWeA2sx...Q7"
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `personal.firstName` | string | Sí | 2–50 caracteres |
| `personal.lastName` | string | Sí | 2–50 caracteres |
| `personal.documentType` | enum | Sí | `CC` \| `CE` \| `TI` \| `PASSport` (convenciones §8) |
| `personal.documentNumber` | string | Sí | El formato depende del tipo (p. ej. CC: 8–10 dígitos) |
| `personal.birthDate` | string | Sí | `YYYY-MM-DD` (convenciones §7), no debe ser futura |
| `personal.gender` | enum | No | `M` \| `F` \| `O` |
| `contact.email` | string | Sí | Correo válido; debe coincidir con el campo de confirmación en el cliente |
| `contact.phone` | string | Sí | Celular colombiano `3XXXXXXXXX` (10 dígitos) |
| `password` | string | Sí | Mínimo 10 caracteres, mayúscula + minúscula + número + carácter especial (ver Reglas de validación) |
| `preferences.cityId` | UUID | Sí | Ciudad por defecto (convenciones §8) |
| `preferences.favoriteCinemaId` | UUID | No | Cine favorito opcional |
| `consents.dataProcessing` | boolean | Sí | Debe ser `true` |
| `consents.terms` | boolean | Sí | Debe ser `true` |
| `consents.commercialEmail` | boolean | No | Correos de marketing opt-in, por defecto `false` |
| `captchaToken` | string | Sí | Verifica que es un humano; el servidor lo revalida con el proveedor de CAPTCHA |

## Respuestas de éxito

**201 Created** — cuenta creada, a la espera de verificación. No se devuelve ningún token.

```json
{
  "userId": "7f1a2b3c-4d5e-6f78-9abc-1d2e3f4a5b6c",
  "requiresEmailVerification": true,
  "message": "Cuenta creada. Revisa tu correo para activar tu cuenta."
}
```

El frontend **no debe** navegar al dashboard — debe mostrar la pantalla de "verifica tu correo".

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` / `INVALID_CAPTCHA` | Payload malformado o CAPTCHA rechazado → mostrar el error del captcha y volver a renderizarlo |
| 409 | `EMAIL_ALREADY_REGISTERED` | El correo ya está en uso → mapear al campo de correo |
| 409 | `DOCUMENT_ALREADY_REGISTERED` | El número de documento ya está en uso → mapear al campo de documento |
| 422 | `VALIDATION_ERROR` | Falló la validación de campos; `details` se mapea a los campos (§4) |
| 429 | `RATE_LIMITED` | Demasiados intentos; respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — validación de campos (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Verifica los campos marcados",
    "details": [
      { "field": "contact.email", "message": "El correo no es válido" },
      { "field": "password", "message": "La contraseña debe tener al menos 10 caracteres" }
    ],
    "requestId": "req_01HZ8..."
  }
}
```

Ejemplo completo — duplicado (`409`):

```json
{
  "error": {
    "code": "EMAIL_ALREADY_REGISTERED",
    "message": "El correo ya está registrado",
    "details": [
      { "field": "contact.email", "message": "Este correo ya está en uso" }
    ],
    "requestId": "req_01HZ9..."
  }
}
```

## Consideraciones de frontend
- Asistente por pasos: personal → contacto → seguridad → preferencias → consentimientos. No enviar todo el cuerpo hasta el último paso.
- Validación por campos a nivel de cliente en cada paso (ver Reglas de validación); solo enviar los campos del paso actual y dejar que la librería de formularios los agregue.
- Medidor de fortaleza de la contraseña en el paso de seguridad; las comprobaciones de confirmar-contraseña y confirmar-correo son solo del cliente (la API nunca recibe los valores de confirmación).
- Deshabilitar el botón de envío mientras la petición esté en curso; conservar el estado del asistente si la petición falla (sin pérdida de datos).
- Los errores del backend se mapean a los campos mediante `error.details[].field`; los errores globales (429, 500) muestran un banner en la parte superior del asistente.
- En 409 EMAIL_ALREADY_REGISTERED ofrecer el enlace "¿Ya tienes cuenta? Inicia sesión".
- Al éxito, transicionar a la pantalla de "verifica tu correo" (sin redirección al dashboard). Guardar localmente el `userId` recién creado si la pantalla lo necesita.
- CAPTCHA: renderizar un reto nuevo cuando devuelva `INVALID_CAPTCHA`.
- Seguir convenciones §13: cargando (spinner en el envío), éxito (pantalla de verificación), error recuperable (reintentar), 429 (cuenta regresiva en el botón según §10).

## Reglas de validación
Validar ANTES de enviar (del lado del cliente; el servidor aplica las mismas reglas):
- Todos los campos obligatorios presentes (firstName, lastName, documentType, documentNumber, birthDate, email, phone, password, cityId, ambos consentimientos obligatorios, captchaToken).
- `contact.email` tiene un formato de correo válido Y es igual al campo "confirmar correo".
- `password` mínimo 10 caracteres con al menos una mayúscula, una minúscula, un dígito y un carácter especial; es igual al campo "confirmar contraseña".
- `birthDate` es una fecha `YYYY-MM-DD` válida y **no** es futura.
- `phone` coincide con `3\d{9}` (celular colombiano de 10 dígitos).
- `documentNumber` no vacío y coincide con el patrón del `documentType` elegido.
- `consents.dataProcessing === true` y `consents.terms === true` (bloquear el envío si no).
- CAPTCHA completado antes de enviar.

## Reglas de negocio
- La cuenta se crea con `emailVerified=false`, `isActive=false` (INACTIVA) — el inicio de sesión devuelve `EMAIL_NOT_VERIFIED` hasta que se verifique.
- La membresía se crea/activa solo después de la verificación del correo (HU-FE-006), no en el registro.
- El CAPTCHA es obligatorio; el servidor revalida `captchaToken` con el proveedor.
- El registro está limitado por IP/correo (ver §10).

## Notas de seguridad
- **Nunca registrar (loguear) la contraseña** en ninguna capa; nunca registrar `captchaToken` (puede contener un secreto de sesión).
- Nunca devolver la contraseña ni el número de documento completo en ninguna respuesta.
- Los datos del documento son PII — manejarlos bajo la política de privacidad de la aplicación; los consentimientos se almacenan para auditoría.
- El CAPTCHA evita la creación masiva de cuentas por bots; el límite de tasa (429) lo complementa.
- `confirmPassword`/`confirmEmail` nunca salen del cliente.

## Flujo de ejemplo
```
User opens /register
↓
Wizard step 1 (personal): fill + validate document/birthDate
↓
Wizard step 2 (contact): fill + validate email match + phone
↓
Wizard step 3 (security): password + strength meter + confirm match
↓
Wizard step 4 (preferences): city (required) + favorite cinema (optional)
↓
Wizard step 5 (consents): accept required consents + optional commercial email
↓
Solve CAPTCHA
↓
POST /auth/register
↓
201 Created
↓
Show "verify your email" screen (do NOT navigate to dashboard)
```
