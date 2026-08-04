# GET /api/v1/movies/{movieId}

## Historia de usuario relacionada
- **HU-FE-004** — Detalle de una película. **HU-FE-005** — Próximos estrenos (la pantalla de detalle de próximos estrenos reutiliza este endpoint; alias del backlog `GET /movies/upcoming/{id}` → `GET /movies/{movieId}`, las películas próximas son películas). **HU-FE-029** — Consumo de API pública.

## Propósito
Devuelve el detalle completo de una sola película: metadatos, reparto, medios (poster/banner/trailer), calificación y contexto de precios. Es el payload principal de la pantalla de detalle de la película; las funciones y recomendaciones **no** están embebidas aquí — se cargan de forma perezosa (lazy) mediante endpoints separados para que el hero renderice rápido.

## Método HTTP
GET

## URL
`/api/v1/movies/{movieId}` (URL completa: `https://api.multicine.com/api/v1/movies/{movieId}`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza `synopsis`, `classification.label`, géneros |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `movieId` | string (UUID v4) | Sí | Id de la película (convenciones §8) |

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cityId` | string (UUID v4) | No | Ámbito de ciudad → `priceFrom` refleja la función activa más barata para esa ciudad. Omitirlo → `priceFrom` es el mínimo general de la película. |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK

```json
{
  "id": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f",
  "title": "El Último Horizonte",
  "synopsis": "Una astronauta queda atrapada en la órbita de un planeta desconocido...",
  "director": "Ana Torres",
  "actors": ["María Pérez", "Juan Gómez", "Luisa Martínez"],
  "genres": ["Ciencia ficción", "Aventura"],
  "durationMinutes": 142,
  "classification": { "code": "B15", "label": "Mayores de 15 años", "minAge": 15 },
  "releaseDate": "2026-08-10",
  "languages": ["Español", "Inglés"],
  "formats": ["2D", "3D", "IMAX"],
  "posterUrl": "https://cdn.multicine.com/posters/el-ultimo-horizonte.jpg",
  "bannerUrl": "https://cdn.multicine.com/banners/el-ultimo-horizonte.jpg",
  "trailerUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "rating": { "average": 8.2, "count": 341 },
  "priceFrom": { "amount": 16500, "currency": "COP" },
  "isPremiere": true,
  "isCineFlash": false
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Convenciones §8 |
| `classification.minAge` | integer | Para la nota de restricción de edad en la pantalla de detalle |
| `releaseDate` | string `YYYY-MM-DD` | Puede estar en el futuro (película próxima) |
| `trailerUrl` | string \| null | URL de embed inline (segura para iframe); `null` cuando no hay trailer |
| `priceFrom` | object | COP entero (convenciones §6); la boleta activa más barata para `cityId` cuando se proporciona |
| `isCineFlash` | boolean | Si alguna de sus funciones actuales es Cine Flash |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `404`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Formato de `movieId` inválido | Mostrar error genérico, no reintentar en bucle |
| 404 | `NOT_FOUND` | La película no existe **o está no publicada/inactiva** | Mostrar "Película no disponible" con un enlace de vuelta a la cartelera |
| 500 | `SERVER_ERROR` | Falla inesperada del backend | Error genérico reintentable (§13) |

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "La película no está disponible",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **El trailer se reproduce inline** (modal/iframe) — nunca navegar fuera de la pantalla de detalle a una página de video.
- Las funciones y recomendaciones son **lazy**: consultas separadas con claves `["movieFunctions", movieId, cityId, date]` y `["movieRecommendations", movieId]`, consultadas después de que el hero renderice.
- Clave de TanStack Query `["movie", movieId]`; `staleTime` ~10 min (los metadatos cambian rara vez); `gcTime` largo para navegación de retroceso instantánea.
- Carga → skeleton del hero + contenido (§13); nunca en blanco.
- Estado de error → "No pudimos cargar esta película" + **enlace de vuelta** a la cartelera (nunca una pantalla muerta).
- También sirve la pantalla de **detalle de próximos estrenos** (HU-FE-005): mostrar una cuenta regresiva + CTA "Notificarme" cuando `releaseDate` está en el futuro.
- `priceFrom` usa `cityId` de la selección de ubicación; omítelo cuando la ubicación sea desconocida.

## Reglas de validación
- `movieId` debe ser un UUID v4 válido antes de enviar.
- `cityId`, si se envía, debe ser un UUID v4 válido.

## Reglas de negocio
- **Las películas no publicadas/inactivas devuelven `404`** (no un payload parcial) — trata `404` como "esta película no está a la venta".
- `releaseDate` en el futuro → el detalle se devuelve igual y se muestra la cuenta regresiva; la lista de funciones puede estar vacía hasta el estreno.

## Notas de seguridad
- Endpoint público; sin datos personales.
- `trailerUrl` debe sanearse/ponerse en una allow-list (dominio de embed) antes de renderizarla en un iframe.

## Flujo de ejemplo
1. El usuario toca una tarjeta en la cartelera → `GET /api/v1/movies/3f2c1a9b-...?cityId=...`.
2. El hero renderiza (poster, trailer, calificación); placeholders skeleton para las secciones de funciones y recomendaciones debajo.
3. `GET /movies/{movieId}/functions` y `GET /movies/{movieId}/recommendations` se disparan en paralelo cuando el hero se monta.
4. El usuario reproduce el trailer en un modal — sin navegación.
5. Si hay `404` → "Película no disponible" + enlace de vuelta a la cartelera.
