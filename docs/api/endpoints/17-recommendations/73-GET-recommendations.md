# GET /api/v1/recommendations

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-022** — Recomendaciones personalizadas. La fila "Recomendado para ti" de la pantalla de inicio — personalizada únicamente para el usuario autenticado, con una explicación del "por qué" por tarjeta y una acción de ocultar/descartar.

## Propósito
Devuelve las recomendaciones de películas **personalizadas** del usuario — derivadas de su historial de visualización, calificaciones y preferencias — como una lista paginada de tarjetas de película. Cada tarjeta incluye un `reason` en texto plano ("¿Por qué esta recomendación?") para que el usuario entienda la recomendación, y el cliente puede ofrecer una acción de ocultar que alimenta `PUT /recommendations/preferences` para que las películas ocultas nunca vuelvan a aparecer.

## Método HTTP
GET

## URL
`/api/v1/recommendations` (URL completa: `https://api.multicine.com/api/v1/recommendations`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Esta sección solo se renderiza para usuarios con sesión iniciada; los visitantes anónimos nunca la llaman.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` — localiza `reason` y los géneros |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `limit` | integer | No | Máximo de ítems en el carrusel (por defecto `10`, el servidor lo limita a `20`) |
| `page` | integer | No | Página basada en 1 (por defecto `1`, convenciones §5) |
| `pageSize` | integer | No | Máximo 100 (por defecto `20`, §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — lista paginada (envoltorio según convenciones §5).

```json
{
  "data": [
    {
      "movieId": "7b1c2d3e-4f5a-4b6c-8d9e-0f1a2b3c4d5e",
      "title": "El Último Horizonte",
      "posterUrl": "https://cdn.multicine.com/posters/el-ultimo-horizonte.jpg",
      "genres": ["Ciencia ficción", "Aventura"],
      "rating": { "average": 8.2 },
      "reason": "Viste 'Código Andromeda' y te gustó",
      "priceFrom": { "amount": 16500, "currency": "COP" }
    }
  ],
  "pagination": { "page": 1, "pageSize": 10, "totalItems": 14, "totalPages": 2 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `data[].movieId` | UUID | Convenciones §8; enlaza a `GET /movies/{movieId}` |
| `data[].reason` | string | El "por qué" — siempre presente, se renderiza en un tooltip/título corto |
| `data[].priceFrom` | object | COP entero (convenciones §6) |

## Respuestas de error
Todos los errores usan el envoltorio compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3); los visitantes anónimos nunca deben llegar a esto |
| 403 | `FORBIDDEN` | Autenticado pero sin derecho a recomendaciones → **ocultar la sección** (sin pantalla de error) |
| 500 | `SERVER_ERROR` | Fallo inesperado → ocultar la sección con un chip de reintento sutil (§13) |

Ejemplo completo — sin derecho (`403`):

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para ver recomendaciones",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Renderizar solo para usuarios autenticados** (guard de autenticación). Anónimo → sección completamente ausente.
- Carrusel horizontal de tarjetas (póster, géneros, calificación, `priceFrom`); acciones por tarjeta: "Ver detalle" (`GET /movies/{movieId}`), "Comprar" (flujo de funciones) y la acción de **ocultar (descartar)**.
- **"¿Por qué esta recomendación?"** — `reason` mostrado en un tooltip (hover) / modal de información (touch) debajo del título de la tarjeta.
- **Acción de ocultar** → llamar a `PUT /recommendations/preferences` con el `hiddenMovieIds` actual **más** este `movieId`; aplicar una **eliminación optimista** de la tarjeta y **rollback en caso de error** (§12). Al tener éxito, la tarjeta desaparece; el backend garantiza que no vuelva a aparecer.
- Clave de TanStack Query `["recommendations", { page, pageSize }]`; `staleTime` ~5 min; `keepPreviousData` para la paginación (§5, §12). Después de una mutación de ocultar/preferencias, `invalidateQueries({ queryKey: ["recommendations"] })`.
- **Carga**: esqueletos de tarjeta; **vacío**: "Aún no tenemos recomendaciones para ti" + un CTA para calificar películas / explorar la cartelera; **error**: no bloqueante (la sección se oculta; el resto del inicio sigue funcionando, §13).
- La paginación dispersa es suficiente — el carrusel obtiene la primera página y pagina solo cuando se toca "ver más".

## Reglas de validación
- `page` ≥ 1; ajustar `pageSize` a 1–100 (§5); ajustar `limit` a 1–20.
- Disparar la petición solo cuando el usuario esté autenticado; de lo contrario, omitirla por completo.

## Reglas de negocio
- Las recomendaciones se calculan a partir del historial de visualización + preferencias explícitas; `hiddenMovieIds` se **excluyen siempre** y nunca vuelven a aparecer.
- Solo se recomiendan películas activas y en cartelera (las mismas reglas de catálogo que `GET /movies`).
- El `reason` se genera en el servidor y no debe reconstruirse en el cliente.

## Notas de seguridad
- Endpoint solo autenticado; `reason` revela señales de gustos — nunca almacenar en caché este payload más allá de la sesión/caché del propio usuario, y nunca registrarlo en logs.
- El 403 debe ocultar la sección, no filtrar si las recomendaciones existen.

## Flujo de ejemplo
1. El usuario con sesión iniciada llega al inicio → autenticado → se dispara `GET /recommendations?limit=10`.
2. Esqueletos → carrusel de tarjetas con subtítulos `reason`.
3. El usuario pasa el cursor sobre una tarjeta → tooltip "¿Por qué esta recomendación?" con `reason`.
4. El usuario toca ocultar (X) → `PUT /recommendations/preferences` con el `hiddenMovieIds` anexado → eliminación optimista; ante un fallo, la tarjeta se restaura.
5. Éxito de la mutación → `invalidateQueries(["recommendations"])` → la película oculta desaparece de las siguientes búsquedas.
6. Datos vacíos → "Aún no tenemos recomendaciones para ti" con una acción hacia la cartelera.
