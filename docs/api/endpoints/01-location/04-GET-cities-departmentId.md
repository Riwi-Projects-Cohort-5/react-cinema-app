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
Arreglo de ciudades dentro de la envoltura `{ success, data }` que usa toda la API.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Medellín",
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
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `success` | boolean | Envoltura común a todos los endpoints |
| `data` | array | Lista de ciudades |
| `data[].id` | integer | Id de la ciudad (convenciones §8) |
| `data[].name` | string | Nombre de la ciudad |
| `data[].departmentId` | integer | Departamento padre |
| `data[].isActive` | boolean | Flag de ciudad activa |

> **Ojo con el Mock Server:** ignora el parámetro de ruta y devuelve siempre ciudades con
> `departmentId: 1`, todas activas. No permite ejercitar el caso "sin cines activos" ni la lista
> vacía; para eso usar el respaldo local (`VITE_ENABLE_MOCKS=true`). Verificado el 2026-09-10.

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `500`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 500 | Error del servidor | Error genérico reintentable (§13) |

## Consideraciones de frontend
- **Select dependiente**: consulta cuando se elige un departamento; deshabilita el select mientras carga.
- Clave de TanStack Query `["cities", departmentId]`; `staleTime` ~30 min.
- **Ciudades con `isActive: false`:** se listan como **seleccionables** con el sufijo "· Sin cines
  activos". Al elegirlas se muestra un aviso inline y se bloquea el botón "Confirmar ubicación".
  Decisión de HU-FE-002 / UBI-05 (2026-09-10): se prefirió explicar por qué no se puede continuar
  antes que ofrecer una opción inerte sin explicación. Sustituye la indicación anterior de
  renderizarlas deshabilitadas. RN-006 sigue vigente en backend.
- **Cuando cambia el departamento** → limpiar la ciudad seleccionada previamente antes de re-consultar.
- Al confirmar, persistir la ciudad seleccionada (p. ej. `localStorage` con la clave `multicine_city`); el contrato de persistencia en cuenta (`POST /users/location`) está pendiente de confirmación con el backend.
- **Cambiar la ciudad invalida la cartelera**: `queryClient.invalidateQueries(["movies"])` para que las secciones de cartelera se refresquen para la nueva ciudad (HU-FE-003).
- Estado vacío → "No hay ciudades disponibles"; estados sin conexión/recuperables según §13.
- **Respaldo local (solo desarrollo):** ante red caída o 5xx se sirven datos locales con aviso
  visible; un 4xx sigue siendo error reintentable. Pendiente de retirar antes de pasar a `main`.

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
