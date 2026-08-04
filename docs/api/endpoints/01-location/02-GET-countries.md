# GET /api/v1/countries

## Historia de usuario relacionada
- **HU-FE-002** — Selección de país, departamento y ciudad. Este es el primer paso del asistente de ubicación que impulsa toda la cartelera.
- **HU-FE-020** — Panel administrativo. Reutilizado por el catálogo de administración como lista de referencia para las entidades de nivel país.

## Propósito
Devuelve los países que actualmente tienen **al menos un cine activo**, para que el asistente de ubicación solo ofrezca lugares donde realmente se puedan comprar boletas. Alimenta el primer dropdown del flujo país → departamento → ciudad. Como cambia con poca frecuencia, se cachea agresivamente en el frontend.

## Método HTTP
GET

## URL
`/api/v1/countries` (URL completa: `https://api.multicine.com/api/v1/countries`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza el `name` de cada país |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `search` | string | No | Coincidencia de subcadena sin distinguir mayúsculas sobre `name` y `code` |
| `page` | integer | No | Número de página basado en 1 (predeterminado `1`, convenciones §5) |
| `pageSize` | integer | No | Elementos por página, máximo 100 (predeterminado `20`, convenciones §5) |
| `sortBy` | string | No | Solo se permite `name` (predeterminado `name`) |
| `sortOrder` | enum | No | `asc` \| `desc` (predeterminado `asc`, convenciones §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Lista paginada (envelope según convenciones §5). Los países sin cines activos nunca se incluyen.

```json
{
  "data": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Colombia",
      "code": "CO",
      "hasActiveCinemas": true
    },
    {
      "id": "0f8fad5b-d9cb-469f-a165-70867728950e",
      "name": "México",
      "code": "MX",
      "hasActiveCinemas": true
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 3,
    "totalPages": 1
  }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Convenciones §8 |
| `name` | string | Localizado vía `Accept-Language` |
| `code` | string | ISO 3166-1 alfa-2 (p. ej. `CO`, `MX`) |
| `hasActiveCinemas` | boolean | Siempre `true` aquí (los países inactivos se filtran en el servidor) |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `500`, `503`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | `page`/`pageSize`/`sortBy` inválidos | Mostrar estado de error recuperable con reintento |
| 500 | `SERVER_ERROR` | Falla inesperada del backend | Error genérico reintentable (§13) |
| 503 | `SERVICE_UNAVAILABLE` | Mantenimiento / degradado | Banner no bloqueante (§13) |

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Parámetro de paginación inválido",
    "details": [
      { "field": "pageSize", "message": "pageSize no debe exceder 100" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- Se obtiene una vez cuando se abre el asistente de ubicación y se mantiene vigente: clave de TanStack Query `["countries"]`, `staleTime: 60 * 60 * 1000` (1 h), `gcTime` largo. `refetchOnWindowFocus: false`.
- Carga → filas skeleton; nunca en blanco (convenciones §13).
- Estado vacío → "No hay países disponibles" con una acción de reintento (raro, solo si ningún país tiene cines activos).
- Sin conexión / pérdida de conexión → banner + reintento, según HU-FE transversal (§13).
- El resultado es pequeño y se cachea para la sesión; no se espera una UI de paginación manual (el tamaño de página 20 cubre los datos realistas).
- La selección no se persiste desde este endpoint; alimenta el select de departamentos de `GET /countries/{countryId}/departments`.

## Reglas de validación
- Sin entrada de usuario más allá de los parámetros de consulta; valida `pageSize ≤ 100` y `page ≥ 1` en el cliente antes de enviar.

## Reglas de negocio
- Solo se devuelven países con **al menos un cine activo** — los países sin cines activos se excluyen en el servidor.
- El orden predeterminado es alfabético por `name`, ascendente.

## Notas de seguridad
- Endpoint público, sin autorización, sin datos sensibles expuestos.
- `503` debe renderizar el banner de mantenimiento compartido, no un error duro.

## Flujo de ejemplo
1. El usuario abre el asistente de ubicación → el asistente se monta.
2. El frontend llama a `GET /api/v1/countries` (solo la primera vez; las aperturas posteriores usan el caché de `["countries"]`).
3. Se muestra un skeleton mientras `isLoading`; los países se renderizan como una lista de radio/dropdown.
4. El usuario elige un país → el frontend llama a `GET /countries/{countryId}/departments`.
5. Si la petición falla con `500`/`503` → botón de reintento / banner (§13).
