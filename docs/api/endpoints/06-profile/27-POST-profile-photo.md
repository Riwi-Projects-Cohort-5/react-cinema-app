# POST /api/v1/profile/photo

## Historia de usuario relacionada
- **HU-FE-008** — Perfil y beneficios de membresía. Característica opcional ("cuando esté disponible"): subir o reemplazar la foto de perfil.

## Propósito
Sube o reemplaza la foto de perfil del usuario autenticado. El backend valida el archivo y lo almacena, devolviendo la URL de CDN del nuevo avatar.

## Método HTTP
POST

## URL
`/api/v1/profile/photo` (URL completa: `https://api.multicine.com/api/v1/profile/photo`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `multipart/form-data` — **no** establecerla manualmente; el cliente HTTP define el boundary automáticamente (§11) |
| `Accept` | Recomendada | `application/json` |
| `X-Request-Id` | Opcional | UUID generado por el cliente, replicado por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Form-data con un único campo de archivo `photo`:

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `photo` | file | Sí | JPEG, PNG o WebP, máximo **5 MB** |

Las reglas del lado del cliente son solo una cortesía — el backend es la autoridad en MIME y tamaño.

## Respuestas de éxito

**200 OK** — foto subida/reemplazada.

```json
{
  "avatarUrl": "https://cdn.multicine.com/avatars/7f1a2b3c.png?ts=1754265000"
}
```

- `avatarUrl` es el **único** valor que el frontend puede almacenar (nunca el blob del archivo). El parámetro de consulta `ts` invalida la caché del CDN.

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Payload multipart malformado |
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 413 | `TOO_LARGE` | El archivo supera los 5 MB → pre-validar el tamaño, mostrar el mensaje "La imagen supera los 5 MB" |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Tipo MIME incorrecto → pre-validar el tipo, mostrar el mensaje |
| 422 | `VALIDATION_ERROR` | Falló el procesamiento/validación de la imagen; `details` se mapea a `photo` |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Error reintentable (§13) |

Ejemplo completo — archivo demasiado grande (`413`):

```json
{
  "error": {
    "code": "TOO_LARGE",
    "message": "La imagen supera el tamaño máximo de 5 MB",
    "details": [
      { "field": "photo", "message": "Reduce la imagen e inténtalo de nuevo" }
    ],
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- Vista previa antes de subir (URL de objeto local); validar tipo/tamaño **antes** de enviar (§11).
- Redimensionado/compresión del lado del cliente antes de subir (p. ej. canvas → JPEG/WebP ≤ 5 MB) para evitar 413.
- Mostrar el progreso de subida por archivo (Axios `onUploadProgress`); permitir cancelar.
- Al éxito: actualizar el avatar en todas partes (cabecera/nav/perfil) usando la `avatarUrl` devuelta y `queryClient.invalidateQueries({ queryKey: ["profile"] })`.
- Toast de error con acción "Reintentar"; en 413/415 conservar el archivo para comprimir/reintentar en el cliente (§11) en lugar de volver a elegirlo.
- Deshabilitar el botón mientras sube (evita envíos duplicados — una foto nueva reemplaza la anterior, no se necesita clave de idempotencia).
- En 401, el interceptor maneja refresh/logout (§3).

## Reglas de validación
Validar ANTES de enviar:
- Tipo de archivo ∈ { `image/jpeg`, `image/png`, `image/webp` }.
- Tamaño del archivo ≤ 5 MB (después de la compresión del cliente).
- Un solo archivo (un único campo `photo`).

## Reglas de negocio
- El backend es la autoridad en MIME y tamaño — las comprobaciones del cliente son solo conveniencias de UX.
- Subir una foto nueva **reemplaza** la anterior (sin multi-versionado en este endpoint).
- No se crea estado de dinero ni de reservas, por lo que no se requiere `X-Idempotency-Key` (§9).

## Notas de seguridad
- Guardar solo la `avatarUrl` devuelta en el estado — nunca el blob del archivo (evita fugas de memoria y persistencia accidental).
- El backend revalida MIME/tamaño y elimina metadatos (EXIF/GPS) en el servidor; el frontend no debe confiar solo en las comprobaciones del cliente.
- Las subidas tienen alcance del propietario (§3); límite de tasa para evitar abuso (§10).
- Revocar las URLs de objeto de la vista previa (`URL.revokeObjectURL`) cuando el componente se desmonta.

## Flujo de ejemplo
```
User clicks the avatar on the profile
↓
File picker (accept="image/jpeg,image/png,image/webp")
↓
Client validates type + size
↓
Preview shown (object URL) + optional crop/resize
↓
Compress if > 5 MB
↓
POST /profile/photo (FormData, onUploadProgress)
↓
200 → avatarUrl
↓
Update header/nav avatar + invalidate ["profile"]
↓
Toast "Foto actualizada"
(413/415 → compress & retry, or pick another file)
```
