# GET /api/v1/movies/{movieId}/recommendations

## Historia de usuario relacionada
- **HU-FE-004** — Detalle de una película (el carrusel "También te puede gustar" debajo del hero del detalle).

## Propósito
Devuelve un conjunto pequeño de películas relacionadas con la película dada (mismos géneros, calificación/público similares) para poblar el carrusel de recomendaciones en la pantalla de detalle. Cuando el usuario está autenticado, el conjunto se enriquece con sus señales de gustos — pero la forma de la respuesta es idéntica.

## Método HTTP
GET

## URL
`/api/v1/movies/{movieId}/recommendations` (URL completa: `https://api.multicine.com/api/v1/movies/{movieId}/recommendations`)

## Autenticación
Pública (auth opcional). Con `Authorization`, el backend puede clasificar las recomendaciones usando el historial del usuario. Las peticiones anónimas aún devuelven un conjunto válido basado en géneros.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Condicional | `Bearer <accessToken>` si hay sesión iniciada — mejora la clasificación (convenciones §2, §3) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` — localiza `title`/géneros |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `movieId` | string (UUID v4) | Sí | Id de la película origen (convenciones §8) |

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `limit` | integer | No | Máximo de elementos a devolver (predeterminado `6`, el servidor limita a `20`) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Una lista simple — **sin envelope de paginación** (es un feed de carrusel de tamaño fijo).

```json
{
  "data": [
    {
      "id": "7b1c2d3e-4f5a-4b6c-8d9e-0f1a2b3c4d5e",
      "title": "Código Andromeda",
      "posterUrl": "https://cdn.multicine.com/posters/codigo-andromeda.jpg",
      "genres": ["Suspenso", "Ciencia ficción"],
      "rating": { "average": 7.9 },
      "priceFrom": { "amount": 15000, "currency": "COP" }
    }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Convenciones §8; enlaza con `GET /movies/{movieId}` |
| `rating.average` | number | 0–10, un decimal (usado para una pequeña leyenda) |
| `priceFrom` | object | COP entero (convenciones §6) |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `404`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | `movieId`/`limit` inválidos | Ocultar la sección del carrusel (no crítica) |
| 404 | `NOT_FOUND` | La película origen no existe/no está publicada | Ocultar la sección del carrusel |
| 500 | `SERVER_ERROR` | Falla inesperada del backend | Ocultar la sección con un chip de reintento opcional |

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "La película no existe",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- Carrusel horizontal **"También te puede gustar"**; cada tarjeta navega al detalle de `GET /movies/{movieId}`.
- Clave de TanStack Query `["movieRecommendations", movieId]`; `staleTime` ~10 min; consultada de forma perezosa después del hero (convenciones §12).
- Skeleton para el carrusel mientras carga; **ocultar toda la sección cuando `data` está vacía** (o tras un `404`/`400`).
- Este es un bloque secundario y no crítico — su falla nunca debe afectar el hero de la película ni la lista de funciones.
- Si la película actual es Cine Flash, las recomendaciones solo son destinos de navegación — sin lógica de promo aquí.

## Reglas de validación
- `movieId` UUID v4 válido.
- Limitar `limit` a 1–20 antes de enviar; tratar la ausencia como 6.

## Reglas de negocio
- La película origen nunca se incluye.
- Las recomendaciones son películas ya disponibles (en `GET /movies`) — una película solo de próximos estrenos no se recomienda.

## Notas de seguridad
- Endpoint público; cuando se está autenticado, el backend usa el historial del lado del servidor y nunca devuelve señales personales en el payload.

## Flujo de ejemplo
1. El detalle de la película se monta → el hero renderiza → la consulta de recomendaciones se dispara en paralelo con la de funciones.
2. `GET /api/v1/movies/3f2c1a9b-.../recommendations?limit=6` → carrusel de tarjetas.
3. El usuario toca una tarjeta → navega al detalle de esa película.
4. `data` vacía (o un error) → sección oculta; el resto de la página no se afecta.
