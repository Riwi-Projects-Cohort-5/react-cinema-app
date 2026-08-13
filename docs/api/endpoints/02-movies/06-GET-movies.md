# GET /api/v1/movies

## Historia de usuario relacionada
- **HU-FE-003** — Visualización de la cartelera semanal. **HU-FE-019** — Cine Flash (badges en la cartelera). **HU-FE-029** — Consumo de API pública.
- Las ventanas de semana/hoy y el filtrado combinado son endpoints separados del backend: `GET /movies/weekly` (#88), `GET /movies/today` (#89) y `GET /movies/filter` (#90).

## Propósito
Devuelve el **catálogo general de películas** activas (`isActive = true`), ordenadas por fecha de estreno descendente. Es la fuente de referencia de las tarjetas de película; los horarios por ventana se consultan en `#88`/`#89`/`#90`.

## Método HTTP
GET

## URL
`/api/v1/movies` (referencia: `{{baseUrl}}/movies`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno requerido.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Arreglo plano de películas activas (convenciones §5 — sin envelope de paginación), ordenadas por `releaseDate` descendente.

```json
[
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
    "isActive": true
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | integer | Id de la película (convenciones §8); se pasa a `GET /movies/{movieId}` |
| `title` | string | Título |
| `synopsis` | string | Sinopsis |
| `genre` | string | Género en display (p. ej. `Accion`) |
| `classification` | string | Clasificación de edad (p. ej. `PG-13`) |
| `duration` | integer | Duración en minutos |
| `director` | string | Director |
| `language` | string | Idioma original (p. ej. `Ingles`) |
| `isSubtitled` | boolean | `true` si se exhibe subtitulada |
| `posterUrl` | string | URL del póster (CDN) |
| `trailerUrl` | string \| null | URL de YouTube del trailer |
| `releaseDate` | string `YYYY-MM-DD` | Fecha de estreno |
| `rating` | number | Calificación 0–10, un decimal |
| `isActive` | boolean | Siempre `true` (las inactivas se filtran en el servidor) |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `500`, `503`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 500 | Falla inesperada del backend | Error genérico reintentable (§13) |
| 503 | Mantenimiento / degradado | Banner no bloqueante (§13) |

## Consideraciones de frontend
- Clave de TanStack Query `["movies"]`; `staleTime` ~10 min (el catálogo cambia poco); `refetchOnWindowFocus: false`.
- Carga → esqueletos de tarjeta; nunca en blanco (§13).
- Estado vacío → "No encontramos películas" con una acción clara de reintento.
- Para horarios por ventana (7 días / hoy / filtros) usa `#88`, `#89` y `#90` en lugar de reconstruir la lógica en el cliente.
- Las películas inactivas/no publicadas nunca aparecen.

## Reglas de validación
- Ninguna del cliente (GET sin parámetros).

## Reglas de negocio
- Solo se devuelven películas **activas** (`isActive = true`), ordenadas por `releaseDate` descendente.
- El catálogo es global; el filtrado por ciudad/ventana vive en los endpoints `#88`–`#90`.

## Notas de seguridad
- Endpoint público; no contiene datos personales.

## Flujo de ejemplo
1. La sección de cartelera se monta → `GET /api/v1/movies` → esqueletos → tarjetas del catálogo.
2. El usuario abre una ventana de 7 días → `GET /movies/weekly` para los horarios.
3. El usuario aplica filtros → `GET /movies/filter` con los criterios en la Query String.
4. El usuario toca una tarjeta → detalle `GET /movies/{movieId}`.
