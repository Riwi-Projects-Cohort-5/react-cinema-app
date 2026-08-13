# GET /api/v1/cities/{departmentId}

## Historia de usuario relacionada
- **HU-FE-002** — Selección de país, departamento y ciudad. Alias del backlog: `GET /cities/{departmentId}`.

## Propósito
Devuelve las ciudades pertenecientes al departamento especificado. Este es el **último paso** del asistente de ubicación: la ciudad seleccionada se persiste e impulsa cada petición de la cartelera (`cityId`).

## Método HTTP
GET

## URL
`/api/v1/cities/{departmentId}` (referencia: `{{baseUrl}}/cities/1`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `departmentId` | integer | Sí | Id del departamento padre (convenciones §8, p. ej. `1`) |

## Parámetros de consulta
Ninguno requerido.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Arreglo plano de ciudades del departamento (convenciones §5 — sin envelope de paginación).

```json
[
  {
    "id": 1,
    "name": "Medellin",
    "departmentId": 1,
    "isActive": true
  },
  {
    "id": 2,
    "name": "Envigado",
    "departmentId": 1,
    "isActive": true
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | integer | Id de la ciudad (convenciones §8) |
| `name` | string | Nombre de la ciudad |
| `departmentId` | integer | Departamento padre, refleja el parámetro de ruta |
| `isActive` | boolean | Flag de ciudad activa |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `500`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 500 | Error del servidor | Error genérico reintentable (§13) |

## Consideraciones de frontend
- **Select dependiente**: consulta cuando se elige un departamento; deshabilita el select mientras carga.
- Clave de TanStack Query `["cities", departmentId]`; `staleTime` ~30 min.
- **Las ciudades no activas no son seleccionables**: si el backend devuelve `isActive: false` (RN-006 excluye las ciudades sin cines en operación), renderízala deshabilitada con una nota ("Sin cines activos").
- **Cuando cambia el departamento** → limpiar la ciudad seleccionada previamente antes de re-consultar.
- Al confirmar, persistir la ciudad seleccionada (p. ej. `localStorage` con la clave `multicine_city`); el contrato de persistencia en cuenta (`POST /users/location`) está pendiente de confirmación con el backend.
- **Cambiar la ciudad invalida la cartelera**: `queryClient.invalidateQueries(["movies"])` para que las secciones de cartelera se refresquen para la nueva ciudad (HU-FE-003).
- Estado vacío → "No hay ciudades disponibles"; estados sin conexión/recuperables según §13.

## Reglas de validación
- `departmentId` debe ser un entero positivo.
- No permitir confirmar una ciudad con `isActive === false`.
- Persistir la ciudad antes de continuar al siguiente flujo.

## Reglas de negocio
- **RN-006:** se excluyen automáticamente las ciudades que no posean cines en operación; las devueltas son ciudades activas.
- La ciudad seleccionada se envía con las peticiones de la cartelera, así todo el catálogo queda limitado a la ciudad.

## Notas de seguridad
- Endpoint público; datos agregados no sensibles.

## Flujo de ejemplo
1. El usuario elige "Antioquia" → el frontend limpia la ciudad actual.
2. `GET /api/v1/cities/1` se ejecuta; el resultado se cachea bajo `["cities", departmentId]`.
3. Las ciudades activas se renderizan seleccionables; cualquier `isActive: false` se deshabilita.
4. El usuario confirma Medellín → se persiste la ciudad y se refresca la cartelera con el nuevo `cityId`.
