# GET /api/v1/countries/{countryId}/departments

## Historia de usuario relacionada
- **HU-FE-002** — Selección de país, departamento y ciudad. Alias del backlog: `GET /departments/{countryId}` (rediseñado por consistencia REST como recurso anidado del país).

## Propósito
Devuelve los departamentos que tienen al menos un cine activo para un país dado, alimentando el segundo dropdown del asistente de ubicación. Se consulta bajo demanda cuando se selecciona un país — nunca por adelantado.

## Método HTTP
GET

## URL
`/api/v1/countries/{countryId}/departments` (URL completa: `https://api.multicine.com/api/v1/countries/{countryId}/departments`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza el `name` de cada departamento |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `countryId` | string (UUID v4) | Sí | Id del país padre (convenciones §8) |

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
Lista paginada (envelope según convenciones §5). Los departamentos sin cines activos se excluyen.

```json
{
  "data": [
    {
      "id": "0f8fad5b-d9cb-469f-a165-70867728950e",
      "name": "Antioquia",
      "countryId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "hasActiveCinemas": true
    },
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "name": "Bogotá D.C.",
      "countryId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "hasActiveCinemas": true
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
| `countryId` | UUID | País padre, refleja el parámetro de ruta |
| `hasActiveCinemas` | boolean | Siempre `true` aquí (los departamentos inactivos se filtran en el servidor) |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `404`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Formato de `countryId` o parámetros de paginación inválidos | Mostrar estado de error recuperable con reintento |
| 404 | `NOT_FOUND` | El país no existe | Tratar como un estado de ubicación roto; sugerir volver a abrir el asistente |
| 500 | `SERVER_ERROR` | Falla inesperada del backend | Error genérico reintentable (§13) |

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "El país no existe",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Select dependiente**: consulta solo cuando se elige un país (sin prefetch de los departamentos de todos los países).
- Clave de TanStack Query `["departments", countryId]`; `staleTime` ~30 min; `refetchOnWindowFocus: false`.
- Mientras carga, el select de departamentos está deshabilitado y muestra un spinner/skeleton.
- **Cuando cambia el país**: limpia el departamento actual **y** la selección de ciudad descendente (HU-FE-002) antes de consultar los nuevos departamentos — nunca muestres hijos obsoletos.
- Estado vacío → "No hay departamentos disponibles" con la opción de volver y cambiar de país.
- Error recuperable → mensaje + botón de reintento (§13); sin conexión → banner + reintento.

## Reglas de validación
- `countryId` debe ser un UUID v4 válido; valida antes de enviar.
- Solo permite avanzar a la selección de ciudad cuando se elige un departamento.

## Reglas de negocio
- Solo se devuelven departamentos con al menos un cine activo (filtro en el servidor).
- Los departamentos se devuelven en un orden estable (por nombre) para que la UI no se reordene entre consultas.

## Notas de seguridad
- Endpoint público; sin datos sensibles.
- Un `404` implica que el país seleccionado fue eliminado o mal escrito — reinicia el flujo de ubicación.

## Flujo de ejemplo
1. El usuario elige "Colombia" en el asistente.
2. El frontend limpia el estado de departamento + ciudad y deshabilita ambos selects descendentes.
3. `GET /api/v1/countries/9b1deb4d-.../departments` se ejecuta; el resultado se cachea bajo `["departments", countryId]`.
4. Los departamentos se renderizan; el usuario elige uno → `GET /departments/{departmentId}/cities`.
5. Si hay `404` → mostrar "El país no existe", volver a abrir la selección de país.
