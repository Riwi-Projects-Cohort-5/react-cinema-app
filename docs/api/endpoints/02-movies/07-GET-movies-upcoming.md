# GET /api/v1/movies/upcoming

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida (`GET /movies/upcoming` responde 404 en el mock). El contrato de abajo es la propuesta
> del frontend derivada del backlog; confirmar ruta, payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-005** — Próximos estrenos. Alias del backlog para el detalle: `GET /movies/upcoming/{id}` → reutiliza `GET /movies/{movieId}` (las películas próximas son películas). Este endpoint es el listado; la pantalla de detalle es `GET /movies/{movieId}`.

## Propósito
Devuelve las películas aún no estrenadas, ordenadas por fecha de estreno ascendente, con datos de cuenta regresiva (`estimatedDays`, `releaseCityDate` ajustada por ciudad). Alimenta la sección "Próximos estrenos" y su flujo de suscripción "Notificarme".

## Método HTTP
GET

## URL
`/api/v1/movies/upcoming` (URL completa: `https://api.multicine.com/api/v1/movies/upcoming`)

Sub-ruta estática — nunca colisiona con `/movies/{movieId}` porque los ids son UUIDs (convenciones §8).

## Autenticación
Pública. Cuando se está autenticado, `notifiedByUser` refleja la suscripción del usuario para cada película.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Condicional | `Bearer <accessToken>` si hay sesión iniciada — enriquece `notifiedByUser` (convenciones §2, §3) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` — localiza el label de `classification` y `synopsis` |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cityId` | string (UUID v4) | No | Ámbito de ciudad → calcula `releaseCityDate` por ciudad |
| `genre` | string | No | Filtrar por slug/id de género |
| `dateFrom` | string `YYYY-MM-DD` | No | Inicio de la ventana de estreno (predeterminado hoy) |
| `dateTo` | string `YYYY-MM-DD` | No | Fin de la ventana de estreno, inclusive |
| `sortOrder` | enum | No | `asc` \| `desc` (predeterminado `asc` — primero los estrenos más próximos; convenciones §5) |
| `page` | integer | No | Número de página basado en 1 (predeterminado `1`, §5) |
| `pageSize` | integer | No | Máximo 100 (predeterminado `20`, §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Lista paginada (envelope según convenciones §5).

```json
{
  "data": [
    {
      "id": "8a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      "title": "El Último Horizonte",
      "posterUrl": "https://cdn.multicine.com/posters/el-ultimo-horizonte.jpg",
      "trailerUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "synopsis": "Un astronauta...",
      "genres": ["Ciencia ficción", "Aventura"],
      "classification": { "code": "B15", "label": "Mayores de 15 años" },
      "releaseDate": "2026-08-28",
      "releaseCityDate": "2026-08-27",
      "estimatedDays": 25,
      "notifiedByUser": false
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 12, "totalPages": 1 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Convenciones §8 |
| `releaseDate` | string `YYYY-MM-DD` | Estreno nacional (convenciones §7) |
| `releaseCityDate` | string `YYYY-MM-DD` | Estreno ajustado por ciudad (puede variar por ciudad); `null` cuando no se envía `cityId` |
| `estimatedDays` | integer | Días hasta `releaseCityDate`; calculado en el servidor para evitar desviaciones de reloj |
| `notifiedByUser` | boolean | `false` para anónimos; significativo solo con un token válido |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `422`, `429`, `500`, `503`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Formato inválido de `dateFrom`/`dateTo` | Error recuperable con reintento |
| 422 | `VALIDATION_ERROR` | `cityId` inválido | Recuperable; no enviar una ciudad inválida |
| 429 | `RATE_LIMITED` | Demasiadas peticiones | Respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Falla inesperada | Error genérico reintentable (§13) |
| 503 | `SERVICE_UNAVAILABLE` | Mantenimiento/degradado | Banner no bloqueante (§13) |

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Formato de fecha inválido",
    "details": [
      { "field": "dateTo", "message": "dateTo debe usar el formato YYYY-MM-DD" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Temporizador de cuenta regresiva** calculado desde `releaseDate` vs `Date.now()`; re-render cada segundo (`setInterval`/`useEffect`) hasta el día del estreno, y luego cambia la tarjeta a "Ya en cartelera".
- Usa los deltas del servidor (`estimatedDays`, `releaseCityDate`) para evitar desviaciones de reloj (convenciones §7).
- Filtra por rango de fechas y género vía parámetros de consulta (replica el patrón de la cartelera — mantén los filtros en la URL).
- Clave de TanStack Query `["movies", "upcoming", { cityId, genre, dateFrom, dateTo }]`; `staleTime` ~5 min (las fechas de estreno cambian rara vez).
- **Botón "Notificarme"**: anónimo → mostrar el modal de autenticación y, tras iniciar sesión, llamar a `POST /notifications/upcoming`; suscrito (`notifiedByUser: true`) → renderizar el estado deshabilitado "Notificado".
- Estado vacío → "No hay próximos estrenos en este rango de fechas".
- Estados sin conexión/recuperables/vacíos según §13.

## Reglas de validación
- `dateFrom ≤ dateTo`; ambos `YYYY-MM-DD`.
- `cityId` UUID válido si se proporciona.
- Solo mostrar el botón "Notificarme" cuando la película aún sea próxima.

## Reglas de negocio
- Ordenado ascendentemente por `releaseDate` por defecto (primero las más próximas) — no reordenar en el cliente.
- **La fecha de estreno puede variar por ciudad** (`releaseCityDate` puede diferir de `releaseDate`); usa el valor ajustado por ciudad para la cuenta regresiva cuando se envía `cityId`.

## Notas de seguridad
- `notifiedByUser` solo es significativo con una petición autenticada; para anónimos siempre es `false` — nunca lo derives de un flag almacenado.

## Flujo de ejemplo
1. La sección se monta → `GET /api/v1/movies/upcoming?cityId=...` → tarjetas con cuentas regresivas.
2. El `estimatedDays` de una tarjeta llega a 0 → la tarjeta cambia a "Ya en cartelera" (enlace a `GET /movies/{movieId}`).
3. Un usuario anónimo toca "Notificarme" → modal de autenticación → tras iniciar sesión → `POST /notifications/upcoming`.
4. El usuario vuelve → `notifiedByUser: true` → botón deshabilitado "Notificado".
