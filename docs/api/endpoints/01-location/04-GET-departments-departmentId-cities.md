# GET /api/v1/departments/{departmentId}/cities

## Historia de usuario relacionada
- **HU-FE-002** — Selección de país, departamento y ciudad. Alias del backlog: `GET /cities/{departmentId}` (rediseñado por consistencia REST como recurso anidado del departamento).

## Propósito
Devuelve las ciudades de un departamento que tienen al menos un cine activo. Este es el **último paso** del asistente de ubicación: la ciudad seleccionada se persiste e impulsa cada petición de la cartelera (`cityId`). Las ciudades sin cines activos se devuelven pero se marcan para que la UI pueda deshabilitarlas.

## Método HTTP
GET

## URL
`/api/v1/departments/{departmentId}/cities` (URL completa: `https://api.multicine.com/api/v1/departments/{departmentId}/cities`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza el `name` de cada ciudad |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `departmentId` | string (UUID v4) | Sí | Id del departamento padre (convenciones §8) |

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `search` | string | No | Coincidencia de subcadena sin distinguir mayúsculas sobre `name` |
| `page` | integer | No | Número de página basado en 1 (predeterminado `1`, convenciones §5) |
| `pageSize` | integer | No | Elementos por página, máximo 100 (predeterminado `20`, convenciones §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Lista paginada (envelope según convenciones §5).

```json
{
  "data": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "name": "Medellín",
      "departmentId": "0f8fad5b-d9cb-469f-a165-70867728950e",
      "hasActiveCinemas": true,
      "cinemasCount": 4
    },
    {
      "id": "b6f8c0a4-6d0e-4f2e-9a1c-1d2e3f4a5b6c",
      "name": "Rionegro",
      "departmentId": "0f8fad5b-d9cb-469f-a165-70867728950e",
      "hasActiveCinemas": false,
      "cinemasCount": 0
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Convenciones §8 |
| `name` | string | Localizado vía `Accept-Language` |
| `departmentId` | UUID | Departamento padre, refleja el parámetro de ruta |
| `hasActiveCinemas` | boolean | `false` → la ciudad se devuelve para mostrarse pero debe deshabilitarse en la UI |
| `cinemasCount` | integer | Número de cines activos (0 cuando está inactiva) |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `404`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Formato de `departmentId` o parámetros de paginación inválidos | Mostrar estado de error recuperable con reintento |
| 404 | `NOT_FOUND` | El departamento no existe | Reiniciar el flujo de ubicación; sugerir retroceder un paso |
| 500 | `SERVER_ERROR` | Falla inesperada del backend | Error genérico reintentable (§13) |

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "El departamento no existe",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Select dependiente**: consulta cuando se elige un departamento; deshabilita el select mientras carga.
- Clave de TanStack Query `["cities", departmentId]`; `staleTime` ~30 min.
- **Las ciudades inactivas no son seleccionables**: renderiza `hasActiveCinemas === false` como opción deshabilitada con una nota ("Sin cines activos").
- **Cuando cambia el departamento** → limpiar la ciudad seleccionada previamente antes de re-consultar.
- Al confirmar, si está autenticado: llamar a `POST /users/location` con `{ cityId }` (disparar y olvidar). Si es anónimo: persistir solo en `localStorage` con la clave `multicine_city`.
- **Cambiar la ciudad invalida la cartelera**: `queryClient.invalidateQueries(["movies"])` y `["cineflash"]` para que las secciones de cartelera y Cine Flash se refresquen para la nueva ciudad automáticamente (HU-FE-003/HU-FE-019).
- Estado vacío → "No hay ciudades disponibles"; estados sin conexión/recuperables según §13.

## Reglas de validación
- `departmentId` debe ser un UUID v4 válido.
- No permitir confirmar una ciudad con `hasActiveCinemas === false`.
- Persistir en `localStorage` (`multicine_city`) antes de llamar al servidor cuando hay sesión iniciada.

## Reglas de negocio
- Solo las ciudades con cines activos son seleccionables — el resto se devuelven para mostrarse pero deben deshabilitarse.
- El `cityId` de la ciudad seleccionada se envía con cada petición de la cartelera (`GET /movies`, `GET /movies/cineflash`, `GET /movies/{id}/functions`), así todo el catálogo queda limitado a la ciudad.

## Notas de seguridad
- Endpoint público; `cinemasCount` son datos agregados no sensibles.

## Flujo de ejemplo
1. El usuario elige "Antioquia" → el frontend limpia la ciudad actual.
2. `GET /api/v1/departments/0f8fad5b-.../cities` se ejecuta; el resultado se cachea bajo `["cities", departmentId]`.
3. Medellín (activa) es seleccionable; Rionegro se renderiza deshabilitada.
4. El usuario confirma Medellín → se guarda en `localStorage.multicine_city`; si hay sesión, se dispara `POST /users/location`.
5. `["movies"]` y `["cineflash"]` se invalidan → la cartelera se recarga con el nuevo `cityId`.
