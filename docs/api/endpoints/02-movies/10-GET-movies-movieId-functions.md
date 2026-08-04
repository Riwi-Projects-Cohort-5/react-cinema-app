# GET /api/v1/movies/{movieId}/functions

## Historia de usuario relacionada
- **HU-FE-004** — Detalle de una película (el paso "Comprar" desde la pantalla de detalle). **HU-FE-009** — Selección de función y formato.

## Propósito
Lista las funciones de una película para una ciudad y una fecha seleccionadas, con el estado por función, disponibilidad de sillas, formato/idioma y el flag de Cine Flash. Es el paso donde el usuario elige una función y un formato específicos antes de seleccionar las sillas.

## Método HTTP
GET

## URL
`/api/v1/movies/{movieId}/functions` (URL completa: `https://api.multicine.com/api/v1/movies/{movieId}/functions`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza los nombres de cine/sala |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `movieId` | string (UUID v4) | Sí | Id de la película (convenciones §8) |

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cityId` | string (UUID v4) | **Sí** | Ámbito de ciudad — las funciones se filtran por cine-ciudad |
| `date` | string `YYYY-MM-DD` | No | Funciones en esta fecha (predeterminado hoy, convenciones §7) |
| `format` | string | No | `2D` \| `3D` \| `IMAX` — filtrar por formato |
| `cinemaId` | string (UUID v4) | No | Filtrar a un solo cine |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Lista paginada (envelope según convenciones §5).

```json
{
  "data": [
    {
      "id": "5e7a4f1b-2c3d-4e5f-9a8b-0c1d2e3f4a5b",
      "movieId": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f",
      "cinema": { "id": "6c8b0f3e-4d5e-4a6b-8c7d-0e1f2a3b4c5d", "name": "Multicine El Tesoro" },
      "room": { "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", "name": "Sala 3", "type": "STANDARD" },
      "format": "2D",
      "language": { "mode": "SUBBED" },
      "startAt": "2026-08-10T20:30:00Z",
      "endAt": "2026-08-10T22:52:00Z",
      "status": "AVAILABLE",
      "seatAvailability": { "total": 120, "available": 88, "sold": 29, "locked": 3 },
      "priceFrom": { "amount": 16500, "currency": "COP" },
      "promotion": { "type": "CINEFLASH", "discountPercent": 20, "maxTickets": 3 }
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 14, "totalPages": 1 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Id de la función (convenciones §8); se pasa a `GET /functions/{functionId}` |
| `language.mode` | enum | `DUBBED` \| `SUBBED` |
| `status` | enum | `AVAILABLE` \| `STARTED` \| `CANCELLED` \| `SOLD_OUT` |
| `seatAvailability.locked` | integer | Sillas actualmente en hold de otros usuarios (holds con tiempo límite) — informativo |
| `priceFrom` | object | Boleta más barata para esta función (COP entero, convenciones §6) |
| `promotion` | object \| null | `{ type: "CINEFLASH", discountPercent, maxTickets }` cuando aplica, si no `null` |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `404`, `422`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Parámetros inválidos de `date`/`format`/paginación | Error recuperable con reintento |
| 404 | `NOT_FOUND` | La película no existe/no está publicada | Enlace de vuelta a la cartelera |
| 422 | `VALIDATION_ERROR` | Falta `cityId` | Abrir el asistente de ubicación (`details` de `cityId` en §4) |
| 500 | `SERVER_ERROR` | Falla inesperada del backend | Error genérico reintentable (§13) |

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El parámetro cityId es obligatorio",
    "details": [
      { "field": "cityId", "message": "Debes seleccionar una ciudad para ver funciones" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Selector de fecha de 7 días** + **filtro de formato**; ambos impulsan la consulta (mantenerlos en la URL como la cartelera).
- Solo se muestran funciones futuras; los elementos `STARTED`/`SOLD_OUT`/`CANCELLED` están **deshabilitados** (aún visibles para contexto).
- **"Comprar" navega a la selección de sillas conservando el `functionId` elegido** — pásalo vía params/estado de la ruta para que `GET /functions/{functionId}` pueda restaurar el resumen después de un refresco.
- Clave de TanStack Query `["movieFunctions", movieId, cityId, date, format]`; `staleTime` ~60 s; `refetchOnWindowFocus: true` (la disponibilidad es volátil).
- Skeleton mientras carga; estado vacío → "No hay funciones disponibles para este día" con un reinicio de fecha/formato; sin conexión → banner + reintento (§13).
- Las funciones Cine Flash muestran el badge `−20%` y se marcan para la regla de máx. 3 más adelante.

## Reglas de validación
- `cityId` obligatorio antes de cualquier petición — si no hay ciudad guardada, abre primero el asistente de ubicación.
- `date` debe ser `YYYY-MM-DD`; `format` debe ser un literal documentado; limitar la paginación (§5).

## Reglas de negocio
- Las funciones inactivas (no publicadas) se ocultan en el servidor; `CANCELLED`/`STARTED`/`SOLD_OUT` se devuelven para contexto pero no son comprables.
- Las funciones se filtran por ciudad (la disponibilidad de una película difiere por ciudad).
- El flag `promotion.type: CINEFLASH` aplica **máximo 3 boletas** y **20% de descuento solo en boletas** al construir el carrito después.

## Notas de seguridad
- Endpoint público; sin datos personales.
- `seatAvailability.locked` cuenta holds de *otros* usuarios — nunca expongas quién los tiene.

## Flujo de ejemplo
1. El usuario abre el detalle de la película → la sección de funciones se monta con la `date` de hoy y el `cityId` guardado.
2. `GET /api/v1/movies/3f2c1a9b-.../functions?cityId=...&date=2026-08-10` → tarjetas de función agrupadas por cine.
3. El usuario cambia el selector de fecha → re-consulta; los filtros permanecen en la URL.
4. El usuario toca "Comprar" en una función `AVAILABLE` → navegar a `/funciones/{functionId}` conservando `functionId`.
5. Ante `422` (falta ciudad) → el asistente de ubicación se abre antes de mostrar las funciones.
