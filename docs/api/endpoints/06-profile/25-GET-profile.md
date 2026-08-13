# GET /api/v1/profile

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-008** — Perfil y beneficios de membresía. También la consume HU-FE-029 (consumo de API pública). Carga los datos actuales del usuario para "Mi cuenta" y para el proveedor de autenticación al iniciar sesión.

## Propósito
Devuelve los datos personales y de contacto del usuario autenticado, además de un resumen de su membresía. Es la fuente única de verdad que cargan el guard de autenticación/proveedor de perfil después del inicio de sesión y cada vez que se abre la pantalla de perfil.

## Método HTTP
GET

## URL
`/api/v1/profile` (URL completa: `https://api.multicine.com/api/v1/profile`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; el backend localiza los mensajes de error) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, replicado por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno.

## Respuestas de éxito

**200 OK** — perfil y resumen de membresía.

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
    "email": "valentina.rojas@example.com",
    "phone": "3012345678",
    "avatarUrl": "https://cdn.multicine.com/avatars/7f1a2b3c.png",
    "city": { "id": "8f7e6d5c-4b3a-4c2d-9e1f-0a1b2c3d4e5f", "name": "Medellín" },
    "favoriteCinemaId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "emailVerified": true,
    "isActive": true
  },
  "membership": {
    "level": "BASIC",
    "points": 320,
    "qrCodeUrl": "https://cdn.multicine.com/memberships/7f1a2b3c/qr.png"
  }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `user.id` | UUID | Convenciones §8 |
| `user.documentType` / `documentNumber` | string | PII; **solo lectura** en la UI — la edición está restringida (ver `PUT /profile`) |
| `user.birthDate` | string | `YYYY-MM-DD` (convenciones §7) |
| `user.gender` | string \| null | `M` \| `F` \| `O`, opcional |
| `user.city` | object \| null | `{ id, name }` de la ciudad preferida |
| `user.emailVerified` | boolean | `false` cuando hay un cambio de correo pendiente de confirmación |
| `user.isActive` | boolean | Indicador de cuenta activa |
| `membership` | object \| null | `null` cuando el usuario aún no tiene membresía → estado vacío "sin membresía" |

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Lo maneja el interceptor (refresh silencioso o logout, §3) |
| 403 | `FORBIDDEN` | Autenticado pero sin permiso → estado "No tienes permiso" (§13) |
| 500 | `SERVER_ERROR` | Error genérico reintentable con botón de reintento (§13) |

Ejemplo completo — sesión caducada (`401`):

```json
{
  "error": {
    "code": "ACCESS_TOKEN_EXPIRED",
    "message": "Tu sesión ha expirado. Inicia sesión de nuevo.",
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- Lo carga el guard de ruta protegida / proveedor de autenticación justo después del inicio de sesión (ver `POST /auth/login`), así que la mayoría de pantallas nunca esperan por él directamente.
- Clave de TanStack Query: `["profile"]`. `staleTime` corto (p. ej. 30 s) para que los datos del perfil se mantengan frescos tras ediciones.
- Estado de carga skeleton mientras obtiene (nunca en blanco, §13); estado de error con reintento.
- Si `membership` es `null`, mostrar el estado vacío "Sin membresía" con una CTA "Activar membresía" (ver `POST /memberships`).
- `emailVerified: false` → mostrar una insignia "correo por confirmar" en el campo de correo (hay un correo de verificación pendiente).
- Tras el éxito de `PUT /profile`, `queryClient.invalidateQueries({ queryKey: ["profile"] })` refresca esta caché; no se necesita recarga manual.
- Banner de sin conexión / conexión perdida con reintento según §13.

## Reglas de validación
- Ninguna (llamada de solo lectura). La pantalla de perfil puede requerir igualmente los datos de `["profile"]` para renderizar el formulario de edición prellenado.

## Reglas de negocio
- `documentType` / `documentNumber` son **inmutables** — este endpoint es de solo lectura para ellos (la edición se rechaza en `PUT /profile`).
- El resumen de membresía aquí es informativo; la tarjeta completa vive en `GET /membership`.
- `avatarUrl`, `city`, `favoriteCinemaId` y los campos de contacto son editables mediante `PUT /profile`.

## Notas de seguridad
- Devuelve PII (número de documento, birthDate, teléfono) — solo se sirve al usuario autenticado; nunca cachearla en `localStorage` (convenciones §3).
- Las cabeceras de caché deben desalentar el cacheo de esta respuesta por CDN.
- El frontend nunca registra el cuerpo de la respuesta.

## Flujo de ejemplo
```
User logs in
↓
Auth provider fetches GET /profile (key ["profile"])
↓
Skeleton loading state
↓
200 → profile populated in the store
↓
Guard renders protected route
(Membership null → "Sin membresía" empty state with CTA)
```
