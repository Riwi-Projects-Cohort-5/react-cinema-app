# GET /api/v1/recommendations/history

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-022** — Recomendaciones personalizadas. La lista "Mi actividad" — una auditoría de las recomendaciones mostradas, en las que se hizo clic y ocultas para el usuario autenticado.

## Propósito
Devuelve la actividad de recomendaciones del usuario: qué películas se le recomendaron, cuándo, y si hizo clic u ocultó cada una. Es una lectura informativa que alimenta la sección "Mi actividad" del perfil y le da al usuario transparencia sobre el motor de personalización. No tiene un rol principal de compra ni de navegación.

## Método HTTP
GET

## URL
`/api/v1/recommendations/history` (URL completa: `https://api.multicine.com/api/v1/recommendations/history`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `page` | integer | No | Página basada en 1 (por defecto `1`, convenciones §5) |
| `pageSize` | integer | No | Máximo 100 (por defecto `20`, §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — lista paginada (envoltorio según convenciones §5).

```json
{
  "data": [
    {
      "movieId": "7b1c2d3e-4f5a-4b6c-8d9e-0f1a2b3c4d5e",
      "title": "El Último Horizonte",
      "shownAt": "2026-08-10T18:00:00Z",
      "clicked": true,
      "hidden": false
    },
    {
      "movieId": "4c5d6e7f-8a9b-4c0d-8e1f-2a3b4c5d6e7f",
      "title": "La Comedia del Año",
      "shownAt": "2026-08-09T21:15:00Z",
      "clicked": false,
      "hidden": true
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 34, "totalPages": 2 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `data[].movieId` | UUID | Convenciones §8; enlaza a `GET /movies/{movieId}` |
| `data[].shownAt` | string | ISO 8601 UTC — cuándo se mostró la recomendación (convenciones §7) |
| `data[].clicked` | boolean | El usuario tocó la tarjeta (cualquier acción) |
| `data[].hidden` | boolean | El usuario descartó la recomendación (acción de ocultar) |

## Respuestas de error
Todos los errores usan el envoltorio compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 500 | `SERVER_ERROR` | Fallo inesperado → error recuperable con reintento (§13) |

Ejemplo completo — fallo genérico (`500`):

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Ocurrió un error inesperado. Intenta de nuevo.",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- Lista **"Mi actividad"** en Perfil → Recomendaciones; mayormente informativa.
- Filas simples: miniatura del póster, título, "Mostrada el {fecha}" y etiquetas de estado — "Clic" si `clicked`, "Oculta" si `hidden`, de lo contrario "Sin acción".
- Tocar la fila → navegar al detalle de `GET /movies/{movieId}` (solo navegación, sin contrato adicional).
- Clave de TanStack Query `["recommendationsHistory", { page, pageSize }]`; `staleTime` ~5 min; `keepPreviousData` para la paginación (§5, §12). Esta lista **no** necesita invalidación de caché en acciones de ocultar (registra el historial, no es la fuente de verdad de lo que se muestra).
- Carga → esqueletos; vacío → "Aún no tienes actividad de recomendaciones".
- Estado de error → mensaje + reintento (§13).

## Reglas de validación
- `page` ≥ 1; ajustar `pageSize` a 1–100 (§5).

## Reglas de negocio
- El historial es de solo añadido y limitado al usuario — `shownAt`, `clicked` y `hidden` se registran en el servidor a medida que el usuario interactúa.
- Una película puede aparecer más de una vez si se recomendó en ocasiones distintas.
- Ocultar una película (vía `PUT /recommendations/preferences`) se refleja aquí con `hidden: true`, pero la lista real de exclusiones vive en el payload de preferencias.

## Notas de seguridad
- Solo autenticado; el payload revela gustos/comportamiento — nunca registrarlo en logs ni almacenarlo en caché fuera de la caché de consultas del propio usuario.
- El cliente no debe exponer la actividad de otro usuario; el endpoint está limitado al propietario del lado del servidor.

## Flujo de ejemplo
1. El usuario abre Perfil → "Mi actividad" → `GET /recommendations/history?page=1`.
2. Esqueletos → filas con fecha + etiquetas de estado.
3. El usuario toca una fila → navega al detalle de la película.
4. El usuario pagina para ver actividad más antigua → `keepPreviousData` mantiene la lista estable mientras se consulta.
