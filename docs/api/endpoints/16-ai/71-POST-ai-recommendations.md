# POST /api/v1/ai/recommendations

## Historia de usuario relacionada
- **HU-FE-021** — Chatbot de recomendación de películas. Petición de recomendación directa y sin estado — usada por los chips de respuesta rápida ("recomiéndame algo", "sugiéreme una comedia") y como la entrada no conversacional del asistente.

## Propósito
Devuelve un conjunto de películas recomendadas de la cartelera actual según las preferencias y la ciudad dadas, **sin** los turnos conversacionales de `POST /ai/chat`. Cada recomendación lleva una `reason` en texto plano para que las tarjetas puedan explicarse solas. Es el hermano sin estado del endpoint de chat — no hay sesión, no hay historial de conversación, solo preferencias de entrada → tarjetas de películas de salida.

## Método HTTP
POST

## URL
`/api/v1/ai/recommendations` (URL completa: `https://api.multicine.com/api/v1/ai/recommendations`)

## Autenticación
- Público (no se requiere token). Opcional: `Authorization: Bearer <accessToken>` permite al backend incorporar señales del historial de visualización, pero las peticiones anónimas devuelven un conjunto válido basado en preferencias.

## Cabeceras
| Cabecera | ¿Requerida? | Descripción |
|---|---|---|
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (etiquetas/razones del asistente localizadas por el backend) |
| `Authorization` | Opcional | `Bearer <accessToken>` cuando se está autenticado — mejora la personalización (convenciones §2) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "preferences": {
    "genres": ["Comedia", "Romance"],
    "languages": ["DUBBED"],
    "formats": ["2D", "IMAX"],
    "mood": "relajada"
  },
  "cityId": "1c2b3a4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  "limit": 5
}
```

| Campo | Tipo | ¿Requerido? | Notas |
|---|---|---|---|
| `preferences.genres` | string[] | No | Slugs/etiquetas de géneros a priorizar; arreglo vacío = sin restricción |
| `preferences.languages` | string[] | No | `DUBBED` \| `SUBBED` |
| `preferences.formats` | string[] | No | `2D` \| `3D` \| `IMAX` |
| `preferences.mood` | string | No | Pista de estado de ánimo en texto libre ("relajada", "de acción", "para ver en familia") |
| `cityId` | string (UUID v4) | Sí | Ámbito de ciudad — las recomendaciones provienen de esta cartelera (convenciones §8) |
| `limit` | integer | No | Máximo de elementos, por defecto `5`, el servidor limita a `20` |

## Respuestas de éxito

**200 OK** — lista simple de tarjetas de películas recomendadas (sin sobre de paginación; feed de tamaño fijo).

```json
{
  "recommendations": [
    {
      "movieId": "7b1c2d3e-4f5a-4b6c-8d9e-0f1a2b3c4d5e",
      "title": "Amor en Otoño",
      "posterUrl": "https://cdn.multicine.com/posters/amor-en-otono.jpg",
      "genres": ["Romance", "Comedia"],
      "rating": { "average": 7.8 },
      "reason": "Es una comedia romántica perfecta para una noche relajada",
      "functionId": "5a4b3c2d-1e2f-4a3b-9c8d-7e6f5a4b3c2d",
      "priceFrom": { "amount": 14800, "currency": "COP" }
    }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `recommendations[].movieId` | UUID | Convenciones §8; enlaza a `GET /movies/{movieId}` |
| `recommendations[].reason` | string | Explicación en texto plano mostrada bajo el título |
| `recommendations[].functionId` | string \| null | Presente cuando se recomienda una función concreta → enlace profundo para comprar |
| `recommendations[].priceFrom` | object | Entero COP (convenciones §6) |

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Payload malformado (`cityId` inválido, enum inválido en `languages`/`formats`) |
| 422 | `VALIDATION_ERROR` | Falta `cityId`, `limit` fuera de rango, preferencias vacías que aun así requieren ciudad |
| 429 | `RATE_LIMITED` | Límite de peticiones de la IA → respetar `retryAfterSeconds` (§10); deshabilitar los chips brevemente |
| 503 | `AI_UNAVAILABLE` | Servicio de IA caído → respaldo + opción "escalar a soporte" |
| 500 | `SERVER_ERROR` | Falla inesperada → error recuperable con reintento (§13) |

Ejemplo completo — falla de validación (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El parámetro cityId es obligatorio",
    "details": [
      { "field": "cityId", "message": "Selecciona una ciudad para ver recomendaciones" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Puntos de disparo**: chips de respuesta rápida en la ventana de chat, el botón "recomiéndame algo" de la home y el CTA del estado vacío de la cartelera.
- Renderizar el mismo componente de tarjeta de película que el endpoint de chat (póster, géneros, calificación, `reason`, precio, acciones "Comprar"/"Ver detalle"). `reason` se muestra como una leyenda bajo el título.
- Navegación de tarjetas: "Ver detalle" → `GET /movies/{movieId}`; "Comprar" → flujo de función/asientos mediante `functionId`.
- **Carga**: skeletons para la fila de tarjetas; nunca en blanco (§13).
- **Vacío**: `recommendations` vacío → "No encontramos películas con esos gustos" + una acción de "Limpiar preferencias" que reintenta con preferencias vacías.
- **Error**: en `503 AI_UNAVAILABLE` mostrar un mensaje de respaldo + reintento + "¿Hablar con soporte?" (PQRS); en `429` respetar la cuenta regresiva (§10) y no reintentar automáticamente.
- TanStack Query: mutación sin clave; puedes guardar el resultado en caché brevemente bajo `["aiRecommendations", cityId, preferences]` con un `staleTime` corto (p. ej. 2 min) ya que los chips repiten peticiones idénticas.

## Reglas de validación
Valida ANTES de enviar:
- `cityId` presente; si no, abrir primero el asistente de ubicación — nunca disparar la petición sin ciudad.
- `limit` limitado a 1–20 (por defecto 5).
- Enums validados contra los literales documentados (`DUBBED`, `SUBBED`, `2D`, `3D`, `IMAX`) antes de enviar.
- Deshabilitar el chip/botón mientras la petición esté en curso.

## Reglas de negocio
- Las recomendaciones siempre provienen de la cartelera actual del usuario (`cityId`) — mismas reglas de catálogo que `GET /movies` (solo activas y en ventana).
- Las preferencias son una **pista**, no un contrato: si nada coincide exactamente, el backend se flexibiliza hacia géneros cercanos en lugar de devolver un conjunto vacío.
- Este endpoint no tiene estado (sin `sessionId`); la continuidad de la conversación vive solo en `POST /ai/chat`.
- No se crea estado de dinero/reservas → no se requiere `X-Idempotency-Key` (§9).

## Notas de seguridad
- Endpoint público; las señales del historial de visualización se usan solo en el servidor y nunca se devuelven en el payload.
- Los guardarraíles del asistente aplican también aquí — las respuestas se restringen al contenido del catálogo de Multicine.

## Flujo de ejemplo
1. El usuario toca el chip de respuesta rápida "Sugiéreme una comedia" en la ventana de chat.
2. El cliente llena `preferences.genres: ["Comedia"]` + el `cityId` actual y envía `POST /ai/recommendations`.
3. Se renderizan skeletons → 200 con 3 tarjetas, cada una con su `reason`.
4. El usuario toca "Comprar" en una tarjeta → navega con `functionId`.
5. `503 AI_UNAVAILABLE` → respaldo + enlace "¿Hablar con soporte?".
