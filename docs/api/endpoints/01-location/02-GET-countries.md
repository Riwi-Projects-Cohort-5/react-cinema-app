# GET /api/v1/countries

## Historia de usuario relacionada
- **HU-FE-002** — Selección de país, departamento y ciudad. Este es el primer paso del asistente de ubicación que impulsa toda la cartelera.
- **HU-FE-020** — Panel administrativo. Reutilizado por el catálogo de administración como lista de referencia para las entidades de nivel país.

## Propósito
Devuelve la lista de países registrados en la plataforma. Alimenta el primer dropdown del flujo país → departamento → ciudad. Como cambia con poca frecuencia, se cachea agresivamente en el frontend.

## Método HTTP
GET

## URL
`/api/v1/countries` (referencia: `{{baseUrl}}/countries`)

> **Entorno actual:** servido por el Mock Server de Postman publicado por backend
> (`https://0acd4ae3-b876-4834-9a3f-7adce0625778.mock.pstmn.io/api/v1`). Devuelve ejemplos
> guardados, no datos vivos.

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno requerido.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Arreglo de países dentro de la envoltura `{ success, data }` que usa toda la API.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Colombia",
      "isActive": true
    }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `success` | boolean | Envoltura común a todos los endpoints |
| `data` | array | Lista de países |
| `data[].id` | integer | Id de país (convenciones §8) |
| `data[].name` | string | Nombre del país |
| `data[].isActive` | boolean | País habilitado en la plataforma |

> Verificado contra el Mock Server el 2026-09-10. Hoy solo devuelve Colombia.

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `500`, `503`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 500 | Falla inesperada del backend | Error genérico reintentable (§13) |
| 503 | Mantenimiento / degradado | Banner no bloqueante (§13) |

## Consideraciones de frontend
- Se obtiene una vez cuando se abre el asistente de ubicación y se mantiene vigente: clave de TanStack Query `["countries"]`, `staleTime: 60 * 60 * 1000` (1 h), `gcTime` largo. `refetchOnWindowFocus: false`.
- Carga → filas skeleton; nunca en blanco (convenciones §13).
- Estado vacío → "No hay países disponibles" con una acción de reintento.
- Los países con `isActive: false` **no se listan** en el asistente de ubicación: no son elegibles y
  no hay requisito de producto que obligue a explicarlos (a diferencia de las ciudades, ver `#4`).
- **Respaldo local (solo desarrollo):** si la petición falla por red o 5xx, el frontend sirve
  `features/location/services/location.mock.ts` y lo advierte en pantalla. Un 4xx **no** activa el
  respaldo: se trata como error reintentable. Pendiente de retirar antes de pasar a `main`.
- Sin conexión / pérdida de conexión → banner + reintento, según HU-FE transversal (§13).
- El resultado es pequeño y se cachea para la sesión; no se espera una UI de paginación manual.
- La selección no se persiste desde este endpoint; alimenta el select de departamentos de `GET /departments/{countryId}`.

## Reglas de validación
- Sin entrada de usuario; ninguna validación del cliente requerida.

## Reglas de negocio
- Devuelve los países registrados en la plataforma, en el orden que exponga el backend.

## Notas de seguridad
- Endpoint público, sin autorización, sin datos sensibles expuestos.
- `503` debe renderizar el banner de mantenimiento compartido, no un error duro.

## Flujo de ejemplo
1. El usuario abre el asistente de ubicación → el asistente se monta.
2. El frontend llama a `GET /api/v1/countries` (solo la primera vez; las aperturas posteriores usan el caché de `["countries"]`).
3. Se muestra un skeleton mientras `isLoading`; los países se renderizan como una lista de radio/dropdown.
4. El usuario elige un país → el frontend llama a `GET /departments/{countryId}`.
5. Si la petición falla con `500`/`503` → botón de reintento / banner (§13).
