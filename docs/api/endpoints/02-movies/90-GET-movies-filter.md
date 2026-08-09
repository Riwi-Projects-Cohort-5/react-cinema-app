# GET /api/v1/movies/filter

## Historia de usuario relacionada
- **HU-FE-003** — Visualización de la cartelera semanal. Filtrado combinado de la cartelera.

## Propósito
Filtra la cartelera según los criterios enviados en la Query String, de forma **combinatoria** (los parámetros se combinan como filtros). Útil para los filtros de la cartelera (género, formato, clasificación, idioma, cine, disponibilidad).

## Método HTTP
GET

## URL
`/api/v1/movies/filter` (referencia: `{{baseUrl}}/movies/filter`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Todos opcionales — se combinan como filtros.

| Nombre | Tipo | Descripción |
|---|---|---|
| `date` | string `YYYY-MM-DD` | Fecha específica (p. ej. `2026-08-10`) |
| `genre` | string | Género cinematográfico (p. ej. `Accion`) |
| `classification` | string | Clasificación de edad (p. ej. `PG-13`) |
| `language` | string | Idioma original (p. ej. `Ingles`) |
| `format` | string | Formato de sala: `2D` \| `3D` \| `IMAX` \| `VIP` |
| `cinemaId` | integer | ID del complejo de cine |
| `available` | boolean | Si es `true`, excluye funciones sin asientos disponibles (RN-011) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Arreglo plano de películas que cumplen los filtros, con sus funciones (convenciones §5 — sin envelope de paginación).

```json
[
  {
    "id": 1,
    "title": "Spider-Man: No Way Home",
    "genre": "Accion",
    "functions": [
      {
        "id": 101,
        "price": 18000,
        "availableSeats": 42,
        "room": {
          "name": "Sala 1 IMAX",
          "format": "IMAX"
        }
      }
    ]
  }
]
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` / `title` / `genre` | igual que `#6` | Resumen de película |
| `functions[]` | array | Funciones que cumplen los filtros |
| `functions[].id` | integer | Id de la función; se pasa a `GET /functions/{functionId}` |
| `functions[].price` | integer | Precio de boleta en COP (convenciones §6) |
| `functions[].availableSeats` | integer | Sillas disponibles |
| `functions[].room` | object | `{ name, format }` de la sala |

## Respuestas de error
Todas usan el envelope de convenciones §4 (`{ "error": "..." }`). Códigos relevantes: `400`, `500`.

| HTTP | Escenario | Comportamiento de frontend |
|---|---|---|
| 400 | Valor de parámetro inválido (p. ej. `date` malformada) | Error recuperable con reintento (§13) |
| 500 | Falla inesperada del backend | Error genérico reintentable (§13) |

## Consideraciones de frontend
- **Los filtros viven en la URL** (search params de React Router) para que las recargas y los compartidos los conserven; cambiar un filtro = `setSearchParams` + re-consultar.
- Clave de TanStack Query `["movies", "filter", { date, genre, classification, language, format, cinemaId, available }]`; `staleTime` ~60 s; `refetchOnWindowFocus: true`.
- Carga → esqueletos de tarjeta; nunca en blanco (§13).
- Estado vacío → "No encontramos películas con estos filtros" + botón **"Limpiar filtros"** que reinicia los search params.
- **Horarios agotados** (`availableSeats: 0`): marcarlos deshabilitados cuando `available` no es `true` (contexto).
- Valida los enums contra los literales documentados antes de enviar.

## Reglas de validación
- Validar `date` como `YYYY-MM-DD`.
- Enviar `available` como `true`/`false` cuando se use.

## Reglas de negocio
- **RN-011:** cuando `available=true`, se filtran únicamente las funciones con `availableSeats > 0`.
- Los filtros son combinatorios (AND); omitir un parámetro no filtra por él.

## Notas de seguridad
- Endpoint público; no contiene datos personales.
- Todo el filtrado es del lado del servidor — no descargues el catálogo completo para filtrar en el cliente.

## Flujo de ejemplo
1. El usuario aplica "Acción + solo IMAX + disponibles" → `GET /api/v1/movies/filter?genre=Accion&available=true&format=IMAX`.
2. Las tarjetas resultantes se renderizan; cada función lleva su sala y formato.
3. El usuario elige una función → navegar al flujo de selección de sillas con `functionId`.

## Pendiente de confirmación con el backend
- La colección Postman incluye este endpoint con los parámetros aquí documentados. Confirmar el soporte de `cityId` como filtro cuando el backend lo exponga.
