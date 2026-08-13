# GET /api/v1/movies/{movieId}

## Historia de usuario relacionada
- **HU-FE-004** — Detalle de una película. **HU-FE-029** — Consumo de API pública.

## Propósito
Devuelve toda la información detallada de una película por su ID: ficha técnica (sinopsis, género, clasificación, duración, director, idioma, subtítulos), póster, trailer de YouTube, calificación y un resumen de sus **funciones activas** embebido.

## Método HTTP
GET

## URL
`/api/v1/movies/{movieId}` (referencia: `{{baseUrl}}/movies/1`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `movieId` | integer | Sí | Id de la película (convenciones §8, p. ej. `1`) |

## Parámetros de consulta
Ninguno requerido.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Objeto JSON con la ficha completa de la película, incluyendo `functions`.

```json
{
  "id": 1,
  "title": "Spider-Man: No Way Home",
  "synopsis": "Peter Parker enfrenta las consecuencias de su identidad revelada y solicita ayuda al Doctor Strange.",
  "genre": "Accion",
  "classification": "PG-13",
  "duration": 148,
  "director": "Jon Watts",
  "language": "Ingles",
  "isSubtitled": true,
  "posterUrl": "https://image.tmdb.org/t/p/w500/1g0dhY21LbhE2vWwoKG2hVs2i6E.jpg",
  "trailerUrl": "https://www.youtube.com/watch?v=JfVOs4VSpmA",
  "releaseDate": "2021-12-17",
  "rating": 8.3,
  "isActive": true,
  "functions": [
    {
      "id": 101,
      "startTime": "2026-08-10T15:30:00.000Z",
      "price": 18000,
      "availableSeats": 42
    }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | integer | Id de la película (convenciones §8) |
| `title` / `synopsis` / `genre` / `classification` / `duration` / `director` / `language` | igual que `#6` | Ficha técnica |
| `isSubtitled` | boolean | `true` si se exhibe subtitulada |
| `posterUrl` | string | URL del póster (CDN) |
| `trailerUrl` | string \| null | URL de YouTube del trailer |
| `releaseDate` | string `YYYY-MM-DD` | Fecha de estreno |
| `rating` | number | Calificación 0–10, un decimal |
| `isActive` | boolean | Siempre `true` (las inactivas devuelven `404`) |
| `functions[]` | array | Resumen de funciones activas (`id`, `startTime`, `price`, `availableSeats`) |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `404`, `500`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 404 | La película no existe **o está inactiva** | Mostrar "Película no disponible" con un enlace de vuelta a la cartelera |
| 500 | Falla inesperada del backend | Error genérico reintentable (§13) |

```json
{
  "error": "Pelicula con ID 999 no encontrada o inactiva."
}
```

## Consideraciones de frontend
- **El trailer se reproduce inline** (modal/iframe) — nunca navegar fuera de la pantalla de detalle a una página de video.
- Las funciones del detalle son un resumen embebido; para sala/cine por función usa `GET /movies/{movieId}/functions` (#10). Las recomendaciones se cargan desde `GET /movies/{movieId}/recommendations` (#11).
- Clave de TanStack Query `["movie", movieId]`; `staleTime` ~10 min (los metadatos cambian rara vez); `gcTime` largo para navegación de retroceso instantánea.
- Carga → skeleton del hero + contenido (§13); nunca en blanco.
- Estado de error → "No pudimos cargar esta película" + **enlace de vuelta** a la cartelera (nunca una pantalla muerta).
- Marcar como agotadas las funciones con `availableSeats: 0` (RN-015, contexto visual).

## Reglas de validación
- `movieId` debe ser un entero positivo antes de enviar.

## Reglas de negocio
- **Las películas no publicadas/inactivas devuelven `404`** (no un payload parcial) — trata `404` como "esta película no está a la venta".
- `releaseDate` en el futuro → el detalle se devuelve igual; la lista de funciones puede estar vacía hasta el estreno.

## Notas de seguridad
- Endpoint público; sin datos personales.
- `trailerUrl` debe sanearse/ponerse en una allow-list (dominio de embed) antes de renderizarla en un iframe.

## Flujo de ejemplo
1. El usuario toca una tarjeta en la cartelera → `GET /api/v1/movies/1`.
2. El hero renderiza (póster, trailer, calificación); las funciones del detalle se muestran desde `functions`.
3. Para la ficha completa de funciones (sala/cine) → `#10`; para recomendaciones → `#11`.
4. Si hay `404` → "Película no disponible" + enlace de vuelta a la cartelera.
