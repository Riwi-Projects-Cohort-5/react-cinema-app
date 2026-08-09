# GET /api/v1/departments/{countryId}

## Historia de usuario relacionada
- **HU-FE-002** — Selección de país, departamento y ciudad. Segundo nivel del selector geográfico.

## Propósito
Devuelve los departamentos pertenecientes al país especificado en el parámetro de ruta `:countryId`. Alimenta el segundo dropdown del asistente de ubicación. Se consulta bajo demanda cuando se selecciona un país — nunca por adelantado.

## Método HTTP
GET

## URL
`/api/v1/departments/{countryId}` (referencia: `{{baseUrl}}/departments/1`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `countryId` | integer | Sí | Id del país padre (convenciones §8, p. ej. `1`) |

## Parámetros de consulta
Ninguno requerido.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Arreglo plano de departamentos del país (convenciones §5 — sin envelope de paginación).

```json
[
  {
    "id": 1,
    "name": "Antioquia",
    "countryId": 1
  },
  {
    "id": 2,
    "name": "Cundinamarca",
    "countryId": 1
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | integer | Id del departamento (convenciones §8) |
| `name` | string | Nombre del departamento |
| `countryId` | integer | País padre, refleja el parámetro de ruta |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `500`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 500 | Error del servidor | Error genérico reintentable (§13) |

## Consideraciones de frontend
- **Select dependiente**: consulta solo cuando se elige un país (sin prefetch de los departamentos de todos los países).
- Clave de TanStack Query `["departments", countryId]`; `staleTime` ~30 min; `refetchOnWindowFocus: false`.
- Mientras carga, el select de departamentos está deshabilitado y muestra un spinner/skeleton.
- **Cuando cambia el país**: limpia el departamento actual **y** la selección de ciudad descendente (HU-FE-002) antes de consultar los nuevos departamentos — nunca muestres hijos obsoletos.
- Estado vacío → "No hay departamentos disponibles" con la opción de volver y cambiar de país.
- Error recuperable → mensaje + botón de reintento (§13); sin conexión → banner + reintento.

## Reglas de validación
- `countryId` debe ser un entero positivo; valida antes de enviar.
- Solo permite avanzar a la selección de ciudad cuando se elige un departamento.

## Reglas de negocio
- Los departamentos se devuelven en un orden estable para que la UI no se reordene entre consultas.

## Notas de seguridad
- Endpoint público; sin datos sensibles.

## Flujo de ejemplo
1. El usuario elige "Colombia" en el asistente.
2. El frontend limpia el estado de departamento + ciudad y deshabilita ambos selects descendentes.
3. `GET /api/v1/departments/1` se ejecuta; el resultado se cachea bajo `["departments", countryId]`.
4. Los departamentos se renderizan; el usuario elige uno → `GET /cities/{departmentId}`.
5. Si falla → estado de error recuperable con reintento (§13).
