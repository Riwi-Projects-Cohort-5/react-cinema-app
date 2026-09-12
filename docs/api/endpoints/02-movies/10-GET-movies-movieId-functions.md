# GET /api/v1/movies/{movieId}/functions

## Historia de usuario relacionada
- **HU-FE-004** — Detalle de una película (el paso "Comprar" desde la pantalla de detalle). **HU-FE-009** — Selección de función y formato.

## Propósito
Lista las **funciones futuras** de una película con su sala (con formato), horario y precio, filtradas por ciudad. Es el paso donde el usuario elige una función específica antes de seleccionar las sillas.

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
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cityId` | integer | No | Id de la ciudad para filtrar funciones. |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Arreglo plano de funciones futuras (convenciones §5 — sin envelope de paginación).

```json
[
  {
    "id": 1,
    "movieId": 1,
    "cinemaId": 1,
    "room": "Sala 1",
    "format": "2D",
    "startTime": "2026-09-10T14:30:00.000Z",
    "price": 18000
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | integer | Id de la función; se pasa a `GET /functions/{functionId}` |
| `movieId` | integer | Película padre |
| `cinemaId` | integer | Id del cine |
| `room` | string | Nombre de la sala |
| `format` | string | `2D` \| `3D` \| `IMAX` \| `VIP` |
| `startTime` | string ISO 8601 UTC | Convenciones §7 |
| `price` | integer | Precio de boleta en COP (convenciones §6) |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `404`, `500`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 404 | La película no existe/no está publicada | Enlace de vuelta a la cartelera |
| 500 | Falla inesperada del backend | Error genérico reintentable (§13) |

## Consideraciones de frontend
- **Selector de fecha/hora** construido desde `startTime`; solo se muestran funciones futuras.
- **"Comprar" navega a la selección de sillas conservando el `functionId` elegido** — pásalo vía params/estado de la ruta.
- Clave de TanStack Query `["movieFunctions", movieId, cityId]`; el `cityId` se obtiene de la ubicación seleccionada del usuario (feature location).
- Skeleton mientras carga; estado vacío → "No hay funciones disponibles" con un reinicio/reintento; sin conexión → banner + reintento (§13).
- Los horarios deben formatearse a `America/Bogota` desde `startTime` (convenciones §7).

## Reglas de validación
- `movieId` debe ser un entero positivo antes de enviar.

## Reglas de negocio
- **RN-014:** solo se muestran funciones donde `startTime >= fecha_actual`.
- Las funciones inactivas se ocultan en el servidor.

## Notas de seguridad
- Endpoint público; sin datos personales.

## Flujo de ejemplo
1. El usuario abre el detalle de la película → la sección de funciones se consulta.
2. `GET /api/v1/movies/1/functions` → tarjetas de función agrupadas por cine.
3. El usuario elige una función disponible y toca 'Comprar' → navegar a `/funciones/{functionId}` conservando `functionId`.
