# POST /api/v1/ai/chat

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-021** — Chatbot de recomendación de películas. Asistente conversacional que recomienda películas y responde preguntas sobre la cartelera actual; un botón flotante abre la ventana de chat.

## Propósito
Envía un mensaje del usuario al asistente conversacional de recomendación de películas y devuelve la respuesta del asistente más las tarjetas de películas recomendadas. El asistente mantiene **el contexto de la conversación por sesión** (`sessionId`), recuerda la ciudad seleccionada (`cityId`) y puede responder preguntas sobre películas y funciones, pero está restringido por guardarraíles para mantenerse en el tema (solo contenido de cine). Cuando el servicio de IA no está disponible, el frontend muestra un respaldo con la opción de "escalar a soporte".

## Método HTTP
POST

## URL
`/api/v1/ai/chat` (URL completa: `https://api.multicine.com/api/v1/ai/chat`)

## Autenticación
- Público (no se requiere token). Opcional: enviar `Authorization: Bearer <accessToken>` mejora el contexto (el asistente puede referenciar el historial de visualización y la ciudad actual del usuario), pero el chat anónimo funciona por completo. Cuando se devuelve un 401, el interceptor lo maneja (§3); el chat nunca debe fallar para usuarios anónimos.

## Cabeceras
| Cabecera | ¿Requerida? | Descripción |
|---|---|---|
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; las respuestas del asistente son localizadas por el backend) |
| `Authorization` | Opcional | `Bearer <accessToken>` cuando se está autenticado — mejora el contexto (convenciones §2) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "message": "¿Qué películas de terror me recomiendas este fin de semana?",
  "cityId": "1c2b3a4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  "sessionId": "9f8e7d6c-5b4a-4c3d-8e1f-0a2b3c4d5e6f",
  "context": { "movieId": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f" },
  "language": "es"
}
```

| Campo | Tipo | ¿Requerido? | Notas |
|---|---|---|---|
| `message` | string | Sí | Mensaje de texto libre del usuario, de 1 a 1000 caracteres |
| `cityId` | string (UUID v4) | Sí | Ámbito de ciudad — impulsa la relevancia de la cartelera (convenciones §8) |
| `sessionId` | string (UUID v4) | No | Generado por el cliente en el primer mensaje de una conversación, reutilizado para toda la sesión; debe estar presente desde el segundo mensaje en adelante para que el asistente conserve el contexto |
| `context.movieId` | string (UUID v4) | No | Película que se está viendo cuando el usuario pregunta desde una pantalla de detalle |
| `language` | string | Sí | `"es"` (único valor soportado hoy) |

## Respuestas de éxito

**200 OK** — respuesta más tarjetas de películas recomendadas opcionales.

```json
{
  "reply": "Para este fin de semana en Medellín te recomiendo 'La Casa del Silencio', un thriller psicológico con 8.4 de calificación. También está disponible 'Sombra de Medianoche' en funciones nocturnas.",
  "quickReplies": [
    "Ver más recomendaciones",
    "¿Qué hay en 3D?",
    "Cambiar de ciudad"
  ],
  "recommendations": [
    {
      "movieId": "7b1c2d3e-4f5a-4b6c-8d9e-0f1a2b3c4d5e",
      "title": "La Casa del Silencio",
      "posterUrl": "https://cdn.multicine.com/posters/la-casa-del-silencio.jpg",
      "genres": ["Terror", "Suspenso"],
      "rating": { "average": 8.4 },
      "format": "2D",
      "nextFunctionAt": "2026-08-10T21:30:00Z",
      "priceFrom": { "amount": 15500, "currency": "COP" },
      "functionId": "5a4b3c2d-1e2f-4a3b-9c8d-7e6f5a4b3c2d"
    }
  ],
  "sessionId": "9f8e7d6c-5b4a-4c3d-8e1f-0a2b3c4d5e6f",
  "status": "ok"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `reply` | string | Texto del mensaje del asistente, renderizado como burbuja de chat |
| `quickReplies` | string[] | Sugerencias de seguimiento renderizadas como chips; puede estar vacío |
| `recommendations` | array | Tarjetas de películas, de 0 a 6; cada tarjeta mapea a `GET /movies/{movieId}` |
| `recommendations[].rating.average` | number | De 0 a 10, un decimal |
| `recommendations[].priceFrom` | object | Entero COP (convenciones §6) |
| `recommendations[].functionId` | string \| null | Presente cuando se recomienda una función concreta → enlace profundo a `GET /functions/{functionId}` |
| `sessionId` | string (UUID) | Refleja el `sessionId` de la petición, o el creado en el servidor en el primer mensaje |
| `status` | string | Siempre `"ok"` en un 200 |

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Payload malformado (`cityId`, `sessionId`, `language` inválidos) |
| 422 | `VALIDATION_ERROR` | `message` vacío o falta `cityId` → no enviar la petición; mostrar pista en línea |
| 429 | `RATE_LIMITED` | Límite de peticiones de la IA → respetar `retryAfterSeconds` (§10); conservar el mensaje del usuario en el campo |
| 503 | `AI_UNAVAILABLE` | Servicio de IA caído → **respuesta de respaldo** + opción "escalar a soporte" (ver abajo) |
| 500 | `SERVER_ERROR` | Falla inesperada → error recuperable con reintento (§13) |

Ejemplo completo — servicio de IA no disponible (`503`):

```json
{
  "error": {
    "code": "AI_UNAVAILABLE",
    "message": "El asistente no está disponible en este momento. Intenta de nuevo en unos minutos.",
    "requestId": "req_01HZ3KQ8VX2ZP9",
    "retryAfterSeconds": 30
  }
}
```

## Consideraciones de frontend
- **Entrada**: botón flotante (abajo a la derecha) → ventana de chat superpuesta; no bloquear la página.
- **Ciclo de vida de la sesión**: generar un `sessionId` (UUID) en el primer mensaje y mantenerlo en `sessionStorage` para que una recarga de página restaure la conversación mediante `GET /ai/history`. Una acción de "reiniciar conversación" genera un `sessionId` nuevo y limpia `sessionStorage` + la lista de chat.
- **Indicador de escritura** mientras se espera la respuesta; deshabilitar el envío mientras la petición esté en curso (una petición en curso a la vez).
- **Renderizado**: burbuja de texto de la respuesta del asistente + tarjetas de películas (póster, géneros, calificación, hora de la próxima función, precio en COP). Acciones de la tarjeta: "Comprar" (navega al flujo de función/asientos mediante `functionId`) y "Ver detalle" (`GET /movies/{movieId}`).
- **Respuestas rápidas** renderizadas como chips → cada una dispara un mensaje nuevo (opcionalmente enrutadas a `POST /ai/recommendations` para una petición directa).
- **Estado de error**: en `503 AI_UNAVAILABLE` mostrar una burbuja de respaldo local ("El asistente no está disponible") + botón de reintento + **"¿Hablar con soporte?"** que enlaza en profundidad al flujo de PQRS (HU-FE-028). En `429` mostrar la cuenta regresiva (§10) y nunca reintentar automáticamente.
- TanStack Query: **no** almacenar en caché los turnos de chat como estado de servidor; usar solo el estado de mutación. Clave para el historial: `["aiHistory", sessionId]`.
- Enviar siempre el `cityId` actual — la relevancia del asistente depende de él; cuando el usuario cambia de ciudad, reiniciar el contexto de la conversación.
- En éxito con `status: "ok"`, agregar la burbuja del asistente + las tarjetas a la lista local de la conversación.

## Reglas de validación
Valida ANTES de enviar:
- `message` recortado, no vacío, ≤ 1000 caracteres (mostrar un contador de caracteres).
- `cityId` presente (desde la selección de ubicación); `language` fijo en `"es"`.
- `sessionId` es un UUID válido en los mensajes posteriores al primero.
- Deshabilitar el envío mientras una petición esté en curso o la IA tenga límite de peticiones.

## Reglas de negocio
- El asistente responde **solo** sobre películas, funciones, formatos, precios y recomendaciones del catálogo de Multicine; las preguntas fuera de alcance reciben una respuesta elegante de "solo hablo de cine" (guardarraíles en el servidor).
- El contexto se mantiene **por sesión**: el asistente recuerda mensajes previos y la ciudad dentro de un `sessionId`.
- Las recomendaciones provienen de la misma cartelera que ve el usuario (mismo `cityId`) — el asistente nunca sugiere películas no publicadas o fuera de ventana.
- El chat **no** crea estado de dinero/reservas → no se requiere `X-Idempotency-Key` (§9).

## Notas de seguridad
- Endpoint público; cuando está autenticado, el backend puede usar el historial de visualización **solo en el servidor** — las señales personales nunca se devuelven en `reply`/tarjetas.
- Mantener el `sessionId` fuera de analíticas y registros en lo posible; es un portador del contenido de la conversación.
- No dejar que el asistente exponga datos internos: tiene guardarraíles y no puede responder sobre inventario, ingresos u otros usuarios.

## Flujo de ejemplo
1. El usuario toca el botón flotante de chat → se abre la ventana; si existe un `sessionId` almacenado, `GET /ai/history` restaura los mensajes previos.
2. El usuario escribe "¿Qué películas de terror me recomiendas?" → el cliente valida y envía `POST /ai/chat` con `cityId`, `sessionId`, `language: "es"`.
3. Aparece el indicador de escritura → 200 con `reply` + 2 tarjetas de películas → se renderizan burbujas + tarjetas.
4. El usuario toca el chip de respuesta rápida "Ver más recomendaciones" → envía un mensaje de seguimiento en la misma sesión.
5. El usuario toca "Comprar" en una tarjeta → navega al flujo de funciones usando `functionId`.
6. La IA devuelve `503 AI_UNAVAILABLE` → burbuja de respaldo + enlace "¿Hablar con soporte?" (PQRS).
7. El usuario toca "reiniciar conversación" → `sessionId` nuevo, `sessionStorage` limpio, chat nuevo.
