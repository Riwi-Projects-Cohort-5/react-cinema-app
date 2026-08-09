# GET /api/v1/movies/today

## Historia de usuario relacionada
- **HU-FE-003** — Visualización de la cartelera semanal. Vista "hoy" de la cartelera.

## Propósito
Devuelve las películas que poseen funciones programadas para el día de hoy (desde las 00:00 hasta las 23:59 del día actual), con un resumen de sus funciones del día.

## Método HTTP
GET

## URL
`/api/v1/movies/today` (referencia: `{{baseUrl}}/movies/today`)

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
Arreglo plano de películas con funciones del día actual (convenciones §5 — sin envelope de paginación).

```json
[
  {
    "id": 1,
    "title": "Spider-Man: No Way Home",
    "genre": "Accion",
    "functions": [
      {
        "id": 101,
        "startTime": "2026-08-08T19:00:00.000Z",
        "price": 18000,
        "availableSeats": 15
      }
    ]
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` / `title` / `genre` | igual que `#6` | Resumen de película |
| `functions[]` | array | Funciones del día (resumen: sin sala embebida) |
| `functions[].id` | integer | Id de la función; se pasa a `GET /functions/{functionId}` |
| `functions[].startTime` | string ISO 8601 UTC | Convenciones §7 |
| `functions[].price` | integer | Precio de boleta en COP (convenciones §6) |
| `functions[].availableSeats` | integer | Sillas disponibles |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `500`, `503`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 500 | Falla inesperada del backend | Error genérico reintentable (§13) |
| 503 | Mantenimiento / degradado | Banner no bloqueante (§13) |

## Consideraciones de frontend
- Clave de TanStack Query `["movies", "today"]`; `staleTime` ~60 s; `refetchOnWindowFocus: true`.
- Carga → esqueletos de tarjeta; nunca en blanco (§13).
- Estado vacío → "No hay funciones para hoy" con acción de reintento.
- **Horarios agotados** (`availableSeats: 0`): marcar el chip de hora deshabilitado/agotado, aún visible para contexto.
- Los horarios deben formatearse a `America/Bogota` desde `startTime` (convenciones §7).

## Reglas de validación
- Ninguna del cliente (GET sin parámetros).

## Reglas de negocio
- Solo se incluyen películas con funciones del día de hoy (00:00–23:59 del día actual).
- Solo funciones y películas activas.

## Notas de seguridad
- Endpoint público; no contiene datos personales.

## Flujo de ejemplo
1. La vista "hoy" de la cartelera se monta → `GET /api/v1/movies/today` → esqueletos → tarjetas con horarios del día.
2. El usuario elige una función disponible → navegar al flujo de selección de sillas con `functionId`.

## Pendiente de confirmación con el backend
- Endpoint confirmado en la colección Postman compartida (películas con funciones del día actual,
  00:00–23:59). El respaldo coincide con la guía de HU-FE-003.
- El backend no documenta parámetros de consulta (p. ej. `cityId`); confirmar si los aceptará cuando
  los exponga.
