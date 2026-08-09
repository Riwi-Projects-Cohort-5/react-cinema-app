# GET /api/v1/movies/weekly

## Historia de usuario relacionada
- **HU-FE-003** — Visualización de la cartelera semanal. La cartelera de los próximos 7 días con sus funciones.

## Propósito
Devuelve la cartelera de películas con proyecciones en los **próximos 7 días** a partir de la fecha y hora actual, incluyendo por cada película su arreglo de `functions` con la sala (`room`) y el cine (`cinema`).

## Método HTTP
GET

## URL
`/api/v1/movies/weekly` (referencia: `{{baseUrl}}/movies/weekly`)

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
Arreglo plano de películas con funciones de la próxima semana (convenciones §5 — sin envelope de paginación).

```json
[
  {
    "id": 1,
    "title": "Spider-Man: No Way Home",
    "genre": "Accion",
    "classification": "PG-13",
    "duration": 148,
    "posterUrl": "https://image.tmdb.org/t/p/w500/1g0dhY21LbhE2vWwoKG2hVs2i6E.jpg",
    "functions": [
      {
        "id": 101,
        "movieId": 1,
        "roomId": 5,
        "startTime": "2026-08-10T15:30:00.000Z",
        "endTime": "2026-08-10T18:00:00.000Z",
        "price": 18000,
        "availableSeats": 42,
        "isActive": true,
        "room": {
          "id": 5,
          "name": "Sala 1 IMAX",
          "format": "IMAX",
          "cinema": {
            "id": 1,
            "name": "Multicine El Tesoro",
            "city": "Medellin",
            "address": "Carrera 25 #1a-45"
          }
        }
      }
    ]
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` / `title` / `genre` / `classification` / `duration` / `posterUrl` | igual que `#6` | Resumen de película para la tarjeta |
| `functions[]` | array | Funciones dentro de la ventana de 7 días |
| `functions[].id` | integer | Id de la función; se pasa a `GET /functions/{functionId}` |
| `functions[].startTime` / `endTime` | string ISO 8601 UTC | Convenciones §7 |
| `functions[].price` | integer | Precio de boleta en COP (convenciones §6) |
| `functions[].availableSeats` | integer | Sillas disponibles en el momento de la consulta |
| `functions[].room` | object | Sala con su `format` y el `cinema` asociado |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `500`, `503`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 500 | Falla inesperada del backend | Error genérico reintentable (§13) |
| 503 | Mantenimiento / degradado | Banner no bloqueante (§13) |

## Consideraciones de frontend
- Clave de TanStack Query `["movies", "weekly"]`; `staleTime` ~60 s; `refetchOnWindowFocus: true` (la disponibilidad es volátil).
- Carga → esqueletos de tarjeta; nunca en blanco (§13).
- Estado vacío → "No hay funciones para los próximos 7 días" con acción de reintento.
- **Horarios agotados** (`availableSeats: 0`): marcar el chip de hora deshabilitado/agotado, aún visible para contexto.
- Los horarios deben formatearse a `America/Bogota` desde `startTime` (convenciones §7).

## Reglas de validación
- Ninguna del cliente (GET sin parámetros).

## Reglas de negocio
- **RN-010:** solo se incluyen películas y funciones **activas**.
- **RN-012:** el rango de consulta cubre exactamente los próximos 7 días desde la fecha/hora actual.
- Cada película incluye su arreglo `functions`, con `room` y `cinema` embebidos.

## Notas de seguridad
- Endpoint público; no contiene datos personales.

## Flujo de ejemplo
1. La cartelera semanal se monta → `GET /api/v1/movies/weekly` → esqueletos → tarjetas con horarios.
2. Los horarios por película se agrupan por cine/sala usando `functions[].room.cinema`.
3. El usuario elige una función `AVAILABLE` → navegar al flujo de selección de sillas con `functionId`.

## Pendiente de confirmación con el backend
- Endpoint confirmado en la colección Postman compartida (incluye `functions`, `room` y `cinema`
  embebidos, con las reglas **RN-010** y **RN-012**). El respaldo coincide con la guía de HU-FE-003.
- El backend no documenta parámetros de consulta (p. ej. `cityId`); confirmar si los aceptará cuando
  los exponga.
