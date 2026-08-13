# PUT /api/v1/recommendations/preferences

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-022** — Recomendaciones personalizadas. Alias del backlog: `POST /recommendations/preferences` (verbo semántico → put de recurso). Soportar la acción de descartar "ocultar esta recomendación" y el editor de preferencias.

## Propósito
Establece las preferencias de recomendaciones del usuario — géneros, idiomas y formatos preferidos — **y** la lista de películas ocultas. La lista oculta es la fuente de verdad del lado del servidor para el botón "ocultar/descartar" de las tarjetas de recomendación: el frontend envía la lista completa anexada y el backend garantiza que esas películas nunca vuelvan a aparecer. Todos los campos son opcionales y reemplazar el arreglo reemplaza la lista (un arreglo vacío la limpia).

## Método HTTP
PUT

## URL
`/api/v1/recommendations/preferences` (URL completa: `https://api.multicine.com/api/v1/recommendations/preferences`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "genres": ["Ciencia ficción", "Aventura"],
  "languages": ["DUBBED"],
  "formats": ["2D", "IMAX"],
  "hiddenMovieIds": [
    "4c5d6e7f-8a9b-4c0d-8e1f-2a3b4c5d6e7f",
    "7b1c2d3e-4f5a-4b6c-8d9e-0f1a2b3c4d5e"
  ]
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `genres` | string[] | No | Etiquetas/slugs de géneros preferidos; un arreglo vacío limpia |
| `languages` | string[] | No | `DUBBED` \| `SUBBED`; un arreglo vacío limpia |
| `formats` | string[] | No | `2D` \| `3D` \| `IMAX`; un arreglo vacío limpia |
| `hiddenMovieIds` | string[] (UUID v4) | No | Películas que el usuario descartó; el backend **reemplaza** la lista almacenada con lo enviado (el cliente envía la lista completa anexada). Un arreglo vacío deja de ocultar todo. |

## Respuestas de éxito

**200 OK** — preferencias almacenadas; devuelve el estado actual (el frontend lo usa para sincronizar su estado local del editor).

```json
{
  "preferences": {
    "genres": ["Ciencia ficción", "Aventura"],
    "languages": ["DUBBED"],
    "formats": ["2D", "IMAX"],
    "hiddenMovieIds": [
      "4c5d6e7f-8a9b-4c0d-8e1f-2a3b4c5d6e7f",
      "7b1c2d3e-4f5a-4b6c-8d9e-0f1a2b3c4d5e"
    ]
  }
}
```

## Respuestas de error
Todos los errores usan el envoltorio compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 422 | `VALIDATION_ERROR` | Valor de enum no válido en `languages`/`formats` o UUID incorrecto en `hiddenMovieIds` → mapear `details` a los inputs del editor |
| 500 | `SERVER_ERROR` | Fallo inesperado → hacer rollback de la actualización optimista y mostrar reintento (§13) |

Ejemplo completo — enum no válido (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Algunos valores de preferencias no son válidos",
    "details": [
      { "field": "languages", "message": "El valor 'FRENCH' no es válido" },
      { "field": "hiddenMovieIds", "message": "El id no es un UUID válido" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- Dos puntos de entrada comparten este endpoint:
  1. **Ocultar/descartar en una tarjeta de recomendación** — leer el `hiddenMovieIds` actual (de `GET /recommendations` o de la caché de preferencias), anexar el `movieId`, hacer PUT de la lista completa, aplicar la **eliminación optimista** de la tarjeta y **rollback en caso de error** (§12).
  2. **Pantalla del editor de preferencias** — toggles para géneros/idiomas/formatos; guardar envía los arreglos completos (vacío = limpio).
- Al tener éxito, `queryClient.invalidateQueries({ queryKey: ["recommendations"] })` para que los ítems ocultos desaparezcan del carrusel "Recomendado para ti"; también invalidar `["recommendationsHistory"]` si esa lista está montada.
- Clave de TanStack Query para precargar: `["recommendationsPreferences"]` (poblar desde un GET del mismo recurso o desde la última respuesta exitosa). La mutación usa `onMutate` (snapshot) → `onError` (rollback) → `onSettled` (invalidate) (§12).
- El botón de ocultar se deshabilita mientras su PUT está en vuelo (una ocultación a la vez por tarjeta).
- Como todos los campos son opcionales, una llamada de solo ocultar envía únicamente `hiddenMovieIds` (los campos de gustos sin cambios se omiten, no se sobrescriben — el backend fusiona los campos omitidos).

## Reglas de validación
Validar ANTES de enviar:
- Los valores de `genres`, `languages`, `formats` provienen de los conjuntos permitidos documentados.
- Las entradas de `hiddenMovieIds` son UUID v4; deduplicar antes de enviar.
- Preferir enviar **solo los campos modificados** (semántica de fusión) para no pisar las preferencias de gustos con una acción de ocultar.

## Reglas de negocio
- `hiddenMovieIds` es de **tipo reemplazo** (lo que envías es lo que se almacena) para la lista oculta — el cliente debe enviar la lista completa anexada, nunca un solo id, o las películas ocultas previamente volverían a aparecer.
- Los campos opcionales omitidos se **dejan sin cambios** (fusión), de modo que una acción de ocultar no borra las preferencias de gustos.
- Las películas ocultas nunca vuelven a aparecer en `GET /recommendations`.
- Sin estado de dinero/compra → no se requiere `X-Idempotency-Key` (§9).

## Notas de seguridad
- Solo autenticado; el endpoint está limitado al propietario — las preferencias solo aplican al llamante.
- Las preferencias de gustos son datos personales; no registrar el payload en logs y tratar la caché de consultas como privada del usuario.

## Flujo de ejemplo
1. El usuario toca ocultar (X) en una tarjeta de recomendación del carrusel.
2. El cliente lee el `hiddenMovieIds = ["4c5d6e7f-..."]` actual, anexa `"7b1c2d3e-..."`.
3. Eliminación optimista de la tarjeta → `PUT /recommendations/preferences { hiddenMovieIds: [..., "7b1c2d3e-..."] }`.
4. 200 → invalidar `["recommendations"]` → la película permanece oculta.
5. Ante un error → rollback: la tarjeta vuelve y un toast ofrece reintentar.
6. Más tarde, el usuario abre el editor de preferencias y desactiva un toggle de género → PUT con el arreglo `genres` actualizado (fusión).
