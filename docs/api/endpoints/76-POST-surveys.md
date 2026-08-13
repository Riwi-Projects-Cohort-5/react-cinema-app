# POST /api/v1/surveys

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-027** — Encuestas de satisfacción. Una respuesta por pedido elegible; la elegibilidad se anuncia con `GET /orders/{orderId}` (`surveyEligible`).

## Propósito
Envía la encuesta de satisfacción posterior a la compra para un pedido elegible. Una encuesta solo se puede enviar **una vez por pedido**, por lo que una clave de idempotencia es obligatoria (convenciones §9 menciona el envío de encuestas explícitamente).

## Método HTTP
POST

## URL
`/api/v1/surveys` (URL completa: `https://api.multicine.com/api/v1/surveys`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). El pedido debe pertenecer al usuario autenticado.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `X-Idempotency-Key` | **Sí** | UUID generado por el cliente por cada envío de encuesta (convenciones §9). Una clave por clic de enviar, reutilizada tal cual en el reintento — nunca en un clic nuevo. |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; los mensajes de error los localiza el backend) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, que el servidor repite para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "orderId": "5a4b3c2d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "ratings": {
    "movie": 5,
    "room": 4,
    "sound": 5,
    "image": 4,
    "comfort": 3,
    "snacks": 4,
    "cleanliness": 5,
    "service": 4,
    "recommendProbability": 5
  },
  "comments": "¡Excelente experiencia! La sala estaba muy limpia y el sonido impecable."
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `orderId` | UUID v4 | Sí | El pedido que se está encuestando (convenciones §8). Debe pertenecer al usuario, estar completado y ser encuestable. |
| `ratings` | object | Sí | Nueve calificaciones enteras, cada una **1–5** (inclusive): `movie`, `room`, `sound`, `image`, `comfort`, `snacks`, `cleanliness`, `service`, `recommendProbability`. Todas requeridas. |
| `comments` | string | No | Texto libre opcional, **≤ 500 caracteres** |

## Respuestas de éxito

**201 Created** — encuesta registrada.

```json
{
  "surveyId": "e1d2c3b4-5f6a-4b7c-8d9e-0f1a2b3c4d5e",
  "message": "Gracias por tu respuesta"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `surveyId` | UUID | Id del registro de la encuesta (convenciones §8) |
| `message` | string | Se muestra tal cual como confirmación |

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento del frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 404 | `NOT_FOUND` | El pedido no existe o no pertenece al usuario |
| 409 | `ALREADY_SUBMITTED` | Ya existe una encuesta para este pedido (una por compra) → deshabilitar el formulario con un mensaje "Ya respondiste esta encuesta" |
| 409 | `NOT_ELIGIBLE` | Pedido no completado o no encuestable → ocultar la encuesta (según `surveyEligible`) |
| 422 | `VALIDATION_ERROR` | Calificaciones faltantes o inválidas (enteros que no estén entre 1–5), `orderId` faltante, o `comments` > 500 caracteres (`details` por campo, §4) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico con reintento (§13) |

Ejemplo completo — ya enviada (`409`):

```json
{
  "error": {
    "code": "ALREADY_SUBMITTED",
    "message": "Ya has respondido la encuesta de esta compra.",
    "requestId": "req_01HZK..."
  }
}
```

Ejemplo completo — calificación inválida (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Algunas calificaciones no son válidas.",
    "details": [
      { "field": "ratings.comfort", "message": "La calificación debe ser un entero entre 1 y 5" }
    ],
    "requestId": "req_01HZL..."
  }
}
```

## Consideraciones de frontend
- **Mostrar la encuesta solo cuando el detalle del pedido diga `surveyEligible`** (desde `GET /orders/{orderId}`). Nunca adivinar la elegibilidad.
- **Estrellas de calificación 1–5** por categoría con etiquetas (película, sala, sonido, imagen, comodidad, snacks, limpieza, servicio, probabilidad de recomendar).
- **Indicador de progreso**: X de 9 categorías calificadas; deshabilitar el envío hasta que las 9 estén definidas.
- **Contador de caracteres de comentarios** (≤ 500) y envío deshabilitado al superar el límite.
- **Una respuesta por compra**: después de un `201` exitoso deshabilitar todo el formulario y mostrar la confirmación (`message`). No permitir editar ni volver a responder.
- Invalidar `["orders", orderId]` al tener éxito para que `surveyEligible` cambie a `false` en el servidor y el formulario desaparezca en la siguiente consulta.
- Mantener la `X-Idempotency-Key` por clic de enviar (§9) — un reintento debe devolver el `201` original y nunca crear una segunda encuesta.
- TanStack Query: `useMutation` con clave `["surveys", orderId]`; al tener éxito `invalidateQueries(["orders", orderId])`.
- Ante `409 ALREADY_SUBMITTED` tratarlo como ya-hecho (mostrar confirmación, deshabilitar el formulario); ante `422` mapear `details` a las estrellas/comentario afectados.
- Carga: solo un spinner en el botón de enviar (el formulario se renderiza en el cliente); error recuperable → toast de reintento.

## Reglas de validación
Validar ANTES de enviar:
- Los nueve valores de `ratings` son enteros en `[1, 5]`; un `0`/`null`/fuera de rango bloquea el envío.
- `comments` recortado y ≤ 500 caracteres.
- `orderId` es un UUID válido.
- Generar `X-Idempotency-Key` exactamente una vez por envío; reutilizarla tal cual en el reintento de ese mismo clic (§9).

## Reglas de negocio
- **Una encuesta por pedido**: `ALREADY_SUBMITTED` bloquea los duplicados; el servidor nunca sobrescribe.
- Solo los pedidos **completados y encuestables** son elegibles (`NOT_ELIGIBLE` en caso contrario); el frontend lo refleja vía `surveyEligible`.
- Las calificaciones son solo enteras (sin puntuaciones fraccionarias); las nueve son obligatorias.

## Notas de seguridad
- Propiedad: solo se pueden encuestar los pedidos del usuario autenticado; otros pedidos devuelven `404` (sin fuga de existencia).
- La encuesta es anónima en los reportes agregados; `orderId` la vincula a la compra solo para la conciliación en el backend.
- Nunca registres los `comments` de texto libre tal cual en cargas de error o análisis.

## Flujo de ejemplo
1. El usuario abre el detalle del pedido → `surveyEligible: true` → se renderiza la tarjeta de la encuesta.
2. El usuario califica 9 categorías (estrellas) y escribe un comentario con un contador de caracteres en vivo.
3. El progreso muestra 9/9 → "Enviar" habilitado → `POST /api/v1/surveys` (`X-Idempotency-Key: k-1`).
4. `201` → confirmación "Gracias por tu respuesta"; formulario deshabilitado.
5. `["orders", orderId]` invalidado → `surveyEligible` ahora es `false` → la encuesta ya no se ofrece.
