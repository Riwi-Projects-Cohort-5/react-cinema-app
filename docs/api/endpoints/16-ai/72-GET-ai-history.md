# GET /api/v1/ai/history

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-021** — Chatbot de recomendación de películas. Restaura una conversación cuando el usuario reabre la ventana de chat o recarga la página. Alias del backlog: `POST /ai/history` (el historial es una **lectura**, de ahí el GET).

## Propósito
Devuelve el historial de mensajes de una sesión de chat para que el frontend pueda restaurar la conversación exactamente como la dejó el usuario. El historial se limita por `sessionId` (que el cliente genera y mantiene en `sessionStorage`), **no** por la cuenta del usuario — un usuario autenticado recupera su propio historial solo a través de su `sessionId` almacenado. Si la sesión no existe, el cliente empieza de nuevo.

## Método HTTP
GET

## URL
`/api/v1/ai/history` (URL completa: `https://api.multicine.com/api/v1/ai/history`)

## Autenticación
- Basada en sesión (enviar `sessionId` como parámetro de consulta). Autenticado opcional: incluir `Authorization: Bearer <accessToken>` para que la sesión pueda vincularse a la cuenta como respaldo; el uso anónimo funciona solo con `sessionId`.

## Cabeceras
| Cabecera | ¿Requerida? | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (convenciones §2) |
| `Authorization` | Opcional | `Bearer <accessToken>` cuando se está autenticado (convenciones §2) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | ¿Requerido? | Descripción |
|---|---|---|---|
| `sessionId` | string (UUID v4) | **Sí** | La sesión de chat a restaurar (convenciones §8) |
| `limit` | integer | No | Máximo de mensajes a devolver (los más antiguos primero), por defecto `100`, el servidor limita a `200` |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — la conversación completa, mensaje más antiguo primero.

```json
{
  "sessionId": "9f8e7d6c-5b4a-4c3d-8e1f-0a2b3c4d5e6f",
  "messages": [
    {
      "id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
      "role": "USER",
      "content": "¿Qué películas de terror me recomiendas este fin de semana?",
      "createdAt": "2026-08-10T20:15:00Z",
      "movieCardIds": []
    },
    {
      "id": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
      "role": "ASSISTANT",
      "content": "Para este fin de semana en Medellín te recomiendo 'La Casa del Silencio'...",
      "createdAt": "2026-08-10T20:15:02Z",
      "movieCardIds": ["7b1c2d3e-4f5a-4b6c-8d9e-0f1a2b3c4d5e"]
    }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `sessionId` | UUID | Refleja la sesión solicitada |
| `messages[].role` | enum | `USER` \| `ASSISTANT` |
| `messages[].createdAt` | string | ISO 8601 UTC (convenciones §7) |
| `messages[].movieCardIds` | string[] (UUID) | Tarjetas de películas adjuntas a una burbuja del asistente; el cliente resuelve los datos completos de las tarjetas desde su caché local o mediante `GET /movies/{movieId}` |

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `limit` malformado |
| 422 | `VALIDATION_ERROR` | `sessionId` ausente/inválido → no llamar; tratar como chat nuevo |
| 404 | `NOT_FOUND` | La sesión no existe → **iniciar una conversación nueva** (con un `sessionId` nuevo) |
| 500 | `SERVER_ERROR` | Falla inesperada → abrir el chat vacío con un reintento silencioso (§13) |

Ejemplo completo — sesión no encontrada (`404`):

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "La conversación no existe o ha expirado",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- Al abrir la ventana de chat: leer `sessionId` de `sessionStorage`; si está presente, `GET /ai/history?sessionId=...` → renderizar los mensajes como burbujas (restaurando la conversación). Si está ausente → chat vacío nuevo.
- **Manejo del 404**: limpiar el `sessionId` almacenado, generar uno nuevo e iniciar vacío — nunca mostrar "no encontrado" al usuario.
- Desplazarse al último mensaje después del renderizado; renderizado perezoso de conversaciones largas (solo las últimas N burbujas en el DOM).
- "Reiniciar conversación" limpia `sessionStorage`, genera un `sessionId` nuevo y reinicia la interfaz.
- Clave de TanStack Query `["aiHistory", sessionId]`; `staleTime` ~0 (el historial es pequeño y barato de volver a consultar al abrir); conservar el último payload exitoso en memoria para que una reapertura rápida no muestre un parpadeo vacío.
- Mostrar un skeleton mínimo (un par de placeholders de burbuja) mientras se restaura.

## Reglas de validación
- Solo llamar con un `sessionId` UUID válido desde `sessionStorage`.
- Limitar `limit` a 1–200 antes de enviar.

## Reglas de negocio
- El historial está vinculado por `sessionId`, no por la cuenta del usuario: el cliente es dueño de la continuidad de la sesión mediante `sessionStorage` (§3 nunca almacena tokens en `sessionStorage`, pero el `sessionId` del chat no es un token de autenticación).
- Las sesiones más antiguas que la ventana de retención del backend (p. ej. 30 días) devuelven `404`.
- El historial es de solo lectura desde la perspectiva del cliente — un "limpiar historial" es la acción local de "reiniciar conversación", no un endpoint DELETE.

## Notas de seguridad
- El `sessionId` otorga acceso al contenido de esa conversación — trátalo como una credencial; no lo registres, no lo pongas en el historial de URLs y límpialo con "reiniciar conversación".
- Las señales personales nunca aparecen en los payloads del historial más allá de los propios mensajes del usuario.

## Flujo de ejemplo
1. El usuario abre la ventana de chat → `sessionStorage` tiene el `sessionId` `9f8e7d6c-...`.
2. `GET /ai/history?sessionId=9f8e7d6c-...` → 200 con 6 mensajes → conversación restaurada.
3. Un mensaje lleva `movieCardIds` → el cliente hidrata las tarjetas (caché o peticiones de detalle).
4. El usuario recarga la página → botón de chat → mismo `sessionId` → historial restaurado de nuevo.
5. El usuario toca "reiniciar conversación" → `sessionStorage` limpio, UUID nuevo, chat vacío.
6. Un `sessionId` obsoleto devuelve `404` → el cliente genera un UUID nuevo e inicia de cero.
