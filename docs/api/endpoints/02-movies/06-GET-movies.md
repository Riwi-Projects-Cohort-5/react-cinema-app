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
Arreglo plano de películas activas (convenciones §5 — sin envelope de paginación).

```json
[
  {
    "id": 1,
    "title": "Dune: Parte 2",
    "synopsis": "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.",
    "genre": "Ciencia Ficción / Aventura",
    "rating": "PG-13",
    "duration": 166,
    "imageUrl": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
    "bannerUrl": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
    "trailerUrl": "https://www.youtube.com/watch?v=Way9Dexny3w",
    "isActive": true
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | integer | Id de la película (convenciones §8); se pasa a `GET /movies/{movieId}` |
| `title` | string | Título |
| `synopsis` | string | Sinopsis |
| `genre` | string | Género en display (p. ej. `Ciencia Ficción / Aventura`) |
| `rating` | string | Clasificación / calificación de edad (p. ej. `PG-13`, `ATP`, `+16`) |
| `duration` | integer | Duración en minutos |
| `imageUrl` | string | URL del póster (w=800) |
| `bannerUrl` | string | URL del banner / backdrop (w=1200) |
| `trailerUrl` | string \| null | URL de YouTube del trailer |
| `isActive` | boolean | Siempre `true` (las inactivas se filtran en el servidor) |

> **Nota sobre campos adicionales:** Los campos `director`, `cast` y `releaseDate` solo están presentes en el endpoint de detalle (`GET /movies/{movieId}` #9), no en este listado.

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
