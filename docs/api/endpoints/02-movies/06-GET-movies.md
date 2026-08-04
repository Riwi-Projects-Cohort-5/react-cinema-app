# GET /api/v1/movies

## Historia de usuario relacionada
- **HU-FE-003** — Visualización de la cartelera semanal. **HU-FE-019** — Cine Flash (badges en la cartelera). **HU-FE-029** — Consumo de API pública. Alias del backlog: `GET /movies/weekly`, `GET /movies/today`, `GET /movies/filter` (todo consolidado aquí — las ventanas de semana/hoy y el filtrado son parámetros de consulta de este único endpoint).

## Propósito
La **cartelera principal**: películas con sus funciones para la ciudad y la ventana de fechas seleccionadas, más filtros (género, formato, idioma, disponibilidad, Cine Flash…). Es el corazón de la plataforma y el GET más sensible al caché. Todo el filtrado, ordenamiento y paginación ocurren en el servidor.

## Método HTTP
GET

## URL
`/api/v1/movies` (URL completa: `https://api.multicine.com/api/v1/movies`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza los labels (`classification.label`, géneros) |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cityId` | string (UUID v4) | **Sí** | Ámbito de ciudad de la cartelera (desde la selección de ubicación) |
| `date` | string `YYYY-MM-DD` | No | Inicio de la ventana. Omitirlo junto con `dateTo` → por defecto hoy (convenciones §7) |
| `dateTo` | string `YYYY-MM-DD` | No | Fin de la ventana, **inclusive**. Omitirlo → ventana de un solo día |
| `genre` | string | No | Slug/id de género para filtrar |
| `classification` | string | No | Código, p. ej. `B15` |
| `language` | enum | No | `DUBBED` \| `SUBBED` |
| `format` | string | No | `2D` \| `3D` \| `IMAX` |
| `roomType` | string | No | `STANDARD` \| `PREFERENTIAL` \| `VIP` |
| `cinemaId` | string (UUID v4) | No | Filtrar a un solo cine |
| `availability` | enum | No | `AVAILABLE` \| `SOLD_OUT` |
| `cineflash` | boolean | No | `true` → solo películas con funciones Cine Flash |
| `search` | string | No | Subcadena sin distinguir mayúsculas sobre el título |
| `sortBy` | enum | No | `releaseDate` \| `title` \| `rating` (predeterminado `releaseDate`) |
| `sortOrder` | enum | No | `asc` \| `desc` (predeterminado `desc`, convenciones §5) |
| `page` | integer | No | Número de página basado en 1 (predeterminado `1`, §5) |
| `pageSize` | integer | No | Máximo 100 (predeterminado `20`, §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Lista paginada (envelope según convenciones §5). Cada elemento incluye un `functionsSummary` para la ventana solicitada, de modo que las tarjetas puedan renderizar horarios sin una segunda petición.

```json
{
  "data": [
    {
      "id": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f",
      "title": "El Último Horizonte",
      "posterUrl": "https://cdn.multicine.com/posters/el-ultimo-horizonte.jpg",
      "genres": ["Ciencia ficción", "Aventura"],
      "classification": { "code": "B15", "label": "Mayores de 15 años" },
      "durationMinutes": 142,
      "director": "Ana Torres",
      "languages": ["Español", "Inglés"],
      "formats": ["2D", "3D", "IMAX"],
      "rating": { "average": 8.2, "count": 341 },
      "isPremiere": true,
      "isCineFlash": false,
      "priceFrom": { "amount": 16500, "currency": "COP" },
      "functionsSummary": {
        "date": "2026-08-10",
        "formats": ["2D", "3D"],
        "times": ["15:30", "18:45", "21:10"]
      }
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 24, "totalPages": 2 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Convenciones §8 |
| `classification` | object | `{ code, label }` — label localizado vía `Accept-Language` |
| `rating.average` | number | 0–10, un decimal |
| `priceFrom` | object | Boletas más baratas de la función activa para esta ciudad (convenciones §6, COP entero) |
| `functionsSummary` | object | Horarios/formatos para la ventana solicitada; `times` son `HH:mm` en `America/Bogota` |
| `isCineFlash` | boolean | Refleja la disponibilidad de `GET /movies/cineflash` para esta ciudad |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `422`, `429`, `500`, `503`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Valor de parámetro inválido (`date` incorrecta, enum, paginación) | Error recuperable con reintento |
| 422 | `VALIDATION_ERROR` | Falta `cityId` | Abrir el asistente de ubicación (`details` de `cityId` en §4) |
| 429 | `RATE_LIMITED` | Demasiadas peticiones | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Falla inesperada | Error genérico reintentable (§13) |
| 503 | `SERVICE_UNAVAILABLE` | Mantenimiento/degradado | Banner no bloqueante (§13) |

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El parámetro cityId es obligatorio",
    "details": [
      { "field": "cityId", "message": "Debes seleccionar una ciudad para ver la cartelera" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Selector de fecha de 7 días** construido desde `date` (y opcionalmente `dateTo`); la cartelera re-consulta al cambiar.
- **Los filtros viven en la URL** (search params de React Router) para que las recargas y los compartidos los conserven; cambiar un filtro = `setSearchParams` + re-consultar, sin recargar la página.
- Clave de TanStack Query `["movies", { cityId, date, dateTo, filters }]`; `staleTime` ~60 s; `refetchOnWindowFocus: true` (la disponibilidad es volátil). Usa `keepPreviousData` para una paginación fluida (§5, §12).
- Carga → esqueletos de tarjeta; nunca en blanco (§13).
- Estado vacío → "No encontramos películas con estos filtros" + un botón **"Limpiar filtros"** que reinicia los search params.
- Las funciones agotadas se marcan visualmente (chips de hora deshabilitados); las películas inactivas/no publicadas nunca aparecen.
- Las películas Cine Flash llevan el badge `−20%` (datos reflejados de `GET /movies/cineflash`).
- La disponibilidad es volátil — marca los horarios como agotados desde la respuesta y deja que `refetchOnWindowFocus` los refresque.

## Reglas de validación
- **`cityId` es obligatorio antes de cualquier petición.** Si no hay ciudad guardada (sin `localStorage.multicine_city`, sin autenticación), abre primero el asistente de ubicación — nunca dispares la petición sin ciudad.
- Valida `date`/`dateTo` como `YYYY-MM-DD`; `dateTo >= date`; limita `pageSize ≤ 100`.
- Valida los enums contra los literales documentados antes de enviar.

## Reglas de negocio
- Solo se devuelven películas **activas** y funciones de la ciudad (convenciones de gestión de catálogo).
- Las funciones que **ya empezaron** o están **canceladas** se excluyen de la cartelera.
- Las funciones agotadas se identifican (`availability: SOLD_OUT`) pero se siguen mostrando como información.
- Funciones Cine Flash: **máximo 3 boletas** por compra, **20% de descuento**, **solo boletas** (nunca confitería), **no acumulables** con otras promociones.

## Notas de seguridad
- Endpoint público; no contiene datos personales.
- Todo el filtrado es del lado del servidor — nunca envíes un `pageSize` sobredimensionado para "traer todo"; usa paginación (§5).

## Flujo de ejemplo
1. El usuario tiene la ciudad "Medellín" seleccionada → la cartelera se monta con `cityId` y la fecha de hoy.
2. `GET /api/v1/movies?cityId=...&date=2026-08-10` → esqueletos → tarjetas.
3. El usuario toca "Viernes" en el selector de fecha → `setSearchParams({ date: '2026-08-14' })` → re-consulta.
4. El usuario aplica "Solo IMAX" → los parámetros crecen → re-consulta; la URL sigue siendo compartible.
5. El usuario toca una tarjeta → detalle `GET /movies/{movieId}`.
