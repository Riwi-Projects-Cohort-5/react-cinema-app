# GET /api/v1/movies/{movieId}/functions

## Historia de usuario relacionada
- **HU-FE-004** — Detalle de una película (el paso "Comprar" desde la pantalla de detalle). **HU-FE-009** — Selección de función y formato.

## Propósito
Lista las **funciones futuras** de una película con su estado, disponibilidad de sillas, sala (con formato) y cine. Es el paso donde el usuario elige una función específica antes de seleccionar las sillas.

## Método HTTP
GET

## URL
`/api/v1/movies/{movieId}/functions` (referencia: `{{baseUrl}}/movies/1/functions`)

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
Arreglo plano de funciones futuras (convenciones §5 — sin envelope de paginación). Las funciones agotadas (`availableSeats: 0`) se incluyen para identificarse visualmente.

```json
[
  {
    "id": 101,
    "movieId": 1,
    "startTime": "2026-08-10T15:30:00.000Z",
    "price": 18000,
    "availableSeats": 42,
    "room": {
      "name": "Sala 1 IMAX",
      "format": "IMAX",
      "cinema": {
        "name": "Multicine El Tesoro"
      }
    }
  },
  {
    "id": 102,
    "movieId": 1,
    "startTime": "2026-08-10T19:00:00.000Z",
    "price": 18000,
    "availableSeats": 0,
    "room": {
      "name": "Sala 2 3D",
      "format": "3D",
      "cinema": {
        "name": "Multicine El Tesoro"
      }
    }
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | integer | Id de la función; se pasa a `GET /functions/{functionId}` |
| `movieId` | integer | Película padre |
| `startTime` | string ISO 8601 UTC | Convenciones §7 |
| `price` | integer | Precio de boleta en COP (convenciones §6) |
| `availableSeats` | integer | Sillas disponibles; `0` = agotada (RN-015) |
| `room.name` | string | Nombre de la sala |
| `room.format` | string | `2D` \| `3D` \| `IMAX` \| `VIP` |
| `room.cinema.name` | string | Nombre del complejo de cine |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `404`, `500`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 404 | La película no existe/no está publicada | Enlace de vuelta a la cartelera |
| 500 | Falla inesperada del backend | Error genérico reintentable (§13) |

## Consideraciones de frontend
- **Selector de fecha/hora** construido desde `startTime`; solo se muestran funciones futuras.
- **Funciones agotadas** (`availableSeats: 0`) se muestran **deshabilitadas** pero visibles para contexto ("Agotada", RN-015).
- **"Comprar" navega a la selección de sillas conservando el `functionId` elegido** — pásalo vía params/estado de la ruta.
- Clave de TanStack Query `["movieFunctions", movieId]`; `staleTime` ~60 s; `refetchOnWindowFocus: true` (la disponibilidad es volátil).
- Skeleton mientras carga; estado vacío → "No hay funciones disponibles" con un reinicio/reintento; sin conexión → banner + reintento (§13).
- Los horarios deben formatearse a `America/Bogota` desde `startTime` (convenciones §7).

## Reglas de validación
- `movieId` debe ser un entero positivo antes de enviar.

## Reglas de negocio
- **RN-014:** solo se muestran funciones donde `startTime >= fecha_actual`.
- **RN-015:** funciones con `availableSeats = 0` se retornan para identificarse visualmente como Agotadas.
- Las funciones inactivas se ocultan en el servidor.

## Notas de seguridad
- Endpoint público; sin datos personales.

## Flujo de ejemplo
1. El usuario abre el detalle de la película → la sección de funciones se consulta.
2. `GET /api/v1/movies/1/functions` → tarjetas de función agrupadas por cine.
3. Las funciones agotadas se muestran deshabilitadas; el usuario elige una disponible.
4. El usuario toca "Comprar" en una función → navegar a `/funciones/{functionId}` conservando `functionId`.
