# POST /api/v1/pqrs

## Historia de usuario relacionada
- **HU-FE-028** — PQRS (Peticiones, Quejas, Reclamos, Sugerencias y Felicitaciones). Crea una nueva solicitud PQRS con adjuntos opcionales; la respuesta expone el **número de radicado** oficial y el `estimatedResponseAt` basado en el SLA.

## Propósito
Crea una solicitud PQRS en una de las cinco categorías (PETICION, QUEJA, RECLAMO, SUGERENCIA, FELICITACION) con un asunto, descripción y hasta tres adjuntos opcionales. La respuesta devuelve el número de radicado oficial — la referencia que el usuario debe conservar — y la fecha estimada de respuesta calculada a partir del SLA. Requiere idempotencia para que un doble envío nunca cree dos radicados.

## Método HTTP
POST

## URL
`/api/v1/pqrs` (URL completa: `https://api.multicine.com/api/v1/pqrs`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `multipart/form-data` — **no** configurarla manualmente; el cliente HTTP establece el boundary automáticamente (§11) |
| `Accept` | Recomendada | `application/json` |
| `X-Idempotency-Key` | Sí | UUID generado por el cliente por envío (una clave por clic en "Enviar", reutilizada al reintentar — convenciones §9) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
`multipart/form-data` (convenciones §11):

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `category` | enum | Sí | `PETICION` \| `QUEJA` \| `RECLAMO` \| `SUGERENCIA` \| `FELICITACION` |
| `subject` | string | Sí | Título corto, de 3 a 120 caracteres |
| `description` | string | Sí | Texto del cuerpo, de 10 a 3000 caracteres |
| `files[]` | archivo(s) | No | ≤ **3 archivos**, cada uno `pdf`/`jpg`/`png`, ≤ **5 MB** cada uno |

Las comprobaciones de tipo/tamaño del lado del cliente son una cortesía — el backend es la autoridad en MIME y tamaño (§11).

## Respuestas de éxito

**201 Created** — solicitud radicada; el número de radicado es la referencia oficial.

```json
{
  "pqrsId": "8a7b6c5d-4e3f-4a2b-8c1d-0e9f8a7b6c5d",
  "radicadoNumber": "PQRS-2026-004521",
  "status": "RECEIVED",
  "createdAt": "2026-08-10T22:41:00Z",
  "estimatedResponseAt": "2026-08-20T22:41:00Z"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `pqrsId` | UUID | Convenciones §8; se usa para las llamadas de detalle/comentarios |
| `radicadoNumber` | string | Referencia oficial legible por humanos (`PQRS-YYYY-NNNNNN`) — se muestra con un botón de copiar |
| `status` | enum | Inicial `RECEIVED` |
| `createdAt` | string | ISO 8601 UTC (convenciones §7) |
| `estimatedResponseAt` | string | Fecha límite del SLA (ISO 8601 UTC) — impulsa la cuenta regresiva mostrada al usuario |

## Respuestas de error
Todos los errores usan el envoltorio compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 422 | `VALIDATION_ERROR` | `category`, `subject` o `description` faltantes o no válidos → mapear `details` a los campos |
| 413 | `TOO_LARGE` | Un archivo supera los 5 MB → prevalidar; conservar el archivo sobredimensionado con un mensaje y permitir reintentar (§11) |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Tipo de archivo incorrecto → prevalidar el MIME antes de enviar |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Fallo inesperado → error reintentable (§13) |

Ejemplo completo — validación (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Completa los campos obligatorios",
    "details": [
      { "field": "category", "message": "Selecciona el tipo de solicitud" },
      { "field": "subject", "message": "El asunto debe tener al menos 3 caracteres" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Selector de categoría** con las cinco opciones documentadas; cada una muestra una pista (p. ej. la diferencia entre QUEJA y RECLAMO).
- **Contador de caracteres** en `description` (máx. 3000) y `subject` (máx. 120).
- **Adjuntos**: fila por archivo con progreso de subida (Axios `onUploadProgress`), vista previa (imágenes), eliminar, y **validación de tipo/tamaño del lado del cliente antes de enviar** (§11). Rechazar `pdf`/`jpg`/`png` > 5 MB o más de 3 archivos con mensajes en línea.
- **Envío**: se genera una `X-Idempotency-Key` (UUID) por intención de envío y se reutiliza al reintentar el mismo envío (§9). Deshabilitar el botón mientras está en vuelo.
- **Pantalla de éxito**: héroe con el número de radicado + **botón de copiar** (`navigator.clipboard`), el `estimatedResponseAt` formateado en `America/Bogota` (convenciones §7) y un CTA "Ver mis solicitudes" → `GET /pqrs`.
- Ante `413`/`415`, conservar el archivo infractor en la lista con una etiqueta de error y un reintento (el usuario puede eliminarlo o volver a elegirlo) — nunca reenviar todo el formulario a ciegas (§11).
- Al tener éxito, invalidar `["pqrs"]` para que la lista refleje la nueva solicitud.

## Reglas de validación
Validar ANTES de enviar:
- `category` ∈ los cinco literales documentados.
- `subject` recortado, de 3 a 120 caracteres; `description` recortada, de 10 a 3000 caracteres.
- Archivos: ≤ 3, cada MIME ∈ { `application/pdf`, `image/jpeg`, `image/png` }, cada uno ≤ 5 MB.

## Reglas de negocio
- El **número de radicado** es la referencia oficial de la solicitud — el usuario debe verlo de forma destacada y poder copiarlo.
- **SLA**: `estimatedResponseAt` = `createdAt` + ventana de SLA por categoría (p. ej. 10 días calendario para QUEJA/RECLAMO). El frontend lo renderiza como cuenta regresiva.
- Los estados inician en `RECEIVED` y pasan a `IN_PROGRESS`, `RESOLVED` o `REJECTED` a través del flujo de trabajo del personal.
- Los envíos duplicados son imposibles gracias a `X-Idempotency-Key` — el reintento de la misma clave devuelve el resultado **original** `201` (§9).

## Notas de seguridad
- Solo autenticado; PQRS está limitado al propietario y sujeto a límite de tasa (§10).
- Los adjuntos pueden contener datos personales — el backend los almacena de forma privada y solo el propietario/el personal pueden descargarlos.
- Nunca registrar en logs la `description` ni el contenido de los adjuntos; el número de radicado no es sensible pero es la referencia oficial de la cuenta.

## Flujo de ejemplo
1. El usuario abre "Radicar solicitud" → selector de categoría, asunto, descripción y selector de adjuntos.
2. El usuario adjunta 2 imágenes → el cliente valida MIME/tamaño → las vistas previas se renderizan con barras de progreso en la subida.
3. El usuario envía → el cliente genera `X-Idempotency-Key` → `POST /pqrs` (FormData).
4. 201 → pantalla de éxito con `PQRS-2026-004521`, botón de copiar y cuenta regresiva de `estimatedResponseAt`.
5. El usuario toca "Ver mis solicitudes" → `GET /pqrs` (invalidado) muestra la nueva fila `RECEIVED`.
6. La red se cae al enviar → la misma `X-Idempotency-Key` se reutiliza al reintentar → sin radicado duplicado.
