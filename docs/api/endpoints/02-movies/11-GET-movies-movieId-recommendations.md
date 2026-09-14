# GET /api/v1/movies/{movieId}/recommendations

## Historia de usuario relacionada
- **HU-FE-004** — Detalle de una película (el carrusel "También te puede gustar" debajo del hero del detalle).

## Propósito
Devuelve películas similares pertenecientes al **mismo género** que la película especificada por `{movieId}`, **excluyendo la película actual**. Alimenta el carrusel de recomendaciones de la pantalla de detalle.

## Método HTTP
GET

## URL
`/api/v1/movies/{movieId}/recommendations` (referencia: `{{baseUrl}}/movies/1/recommendations`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `movieId` | integer | Sí | Id de la película origen (convenciones §8, p. ej. `1`) |

## Parámetros de consulta
Ninguno requerido.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Arreglo plano de películas recomendadas (convenciones §5 — sin envelope de paginación).

```json
[
  {
    "id": 2,
    "title": "Spider-Man: Beyond the Spider-Verse",
    "genre": "Animación / Acción",
    "imageUrl": "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800"
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | integer | Convenciones §8; enlaza con `GET /movies/{movieId}` |
| `title` | string | Título |
| `genre` | string | Género en display |
| `imageUrl` | string | URL del póster/imagen |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `404`, `500`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 404 | La película origen no existe/no está publicada | Ocultar la sección del carrusel |
| 500 | Falla inesperada del backend | Ocultar la sección con un chip de reintento opcional |

## Consideraciones de frontend
- Carrusel horizontal **"También te puede gustar"**; cada tarjeta navega al detalle de `GET /movies/{movieId}`.
- Clave de TanStack Query `["movieRecommendations", movieId]`; `staleTime` ~10 min; consultada de forma perezosa después del hero (convenciones §12).
- Skeleton para el carrusel mientras carga; **ocultar toda la sección cuando el arreglo está vacío** (o tras un `404`/`500`).
- Este es un bloque secundario y no crítico — su falla nunca debe afectar el hero de la película ni la lista de funciones.

## Reglas de validación
- `movieId` debe ser un entero positivo antes de enviar.

## Reglas de negocio
- La película origen nunca se incluye.
- Las recomendaciones son del mismo género que la película origen.

## Notas de seguridad
- Endpoint público; sin datos personales.

## Flujo de ejemplo
1. El detalle de la película se monta → el hero renderiza → la consulta de recomendaciones se dispara en paralelo con la de funciones.
2. `GET /api/v1/movies/1/recommendations` → carrusel de tarjetas.
3. El usuario toca una tarjeta → navega al detalle de esa película.
4. Arreglo vacío (o un error) → sección oculta; el resto de la página no se afecta.
