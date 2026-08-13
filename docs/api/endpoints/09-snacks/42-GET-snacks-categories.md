# GET /api/v1/snacks/categories

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-012** — Compra de productos de confitería.

## Propósito
Devuelve las categorías de confitería usadas para filtrar el catálogo (`GET /snacks`), ordenadas para su visualización. Cambian raramente, por lo que el frontend puede cachearlas agresivamente.

## Método HTTP
GET

## URL
`/api/v1/snacks/categories` (URL completa: `https://api.multicine.com/api/v1/snacks/categories`)

## Autenticación
Público. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza los nombres de las categorías |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — lista de categorías ordenada.

```json
{
  "data": [
    { "id": "66666666-6666-4666-8666-666666666601", "name": "Combos", "order": 1 },
    { "id": "66666666-6666-4666-8666-666666666602", "name": "Crispetas", "order": 2 },
    { "id": "66666666-6666-4666-8666-666666666603", "name": "Bebidas", "order": 3 },
    { "id": "66666666-6666-4666-8666-666666666604", "name": "Snacks dulces", "order": 4 }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Se usa como `categoryId` en `GET /snacks` (convenciones §8) |
| `name` | string | Localizado mediante `Accept-Language` |
| `order` | integer | Orden de visualización, ascendente |

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4. Código relevante: `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 500 | `SERVER_ERROR` | Fallo inesperado | Error recuperable con reintento (convenciones §13) |

Ejemplo completo:

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Ocurrió un error inesperado. Intenta de nuevo.",
    "requestId": "req_01HZ4QWX..."
  }
}
```

## Consideraciones de frontend
- Renderizar **chips/pestañas de categorías**; «Todos» es el valor por defecto implícito (sin `categoryId`).
- Clave de TanStack Query `["snacks", "categories"]`; usar un **`staleTime` largo** (p. ej. 10 min) — esta lista cambia raramente.
- Chips con skeleton mientras se cargan; ante error, degradar a mostrar el catálogo sin pestañas (no bloqueante).

## Reglas de validación
- Ninguna — solo lectura.

## Reglas de negocio
- Las categorías son globales; la disponibilidad de los ítems dentro de ellas aún depende del cine (`GET /snacks`).
- El orden lo define el servidor mediante `order`.

## Notas de seguridad
- Endpoint público; sin datos personales.

## Flujo de ejemplo
1. La página de confitería se monta → `GET /api/v1/snacks/categories` (cacheada).
2. Se renderizan los chips: Todos | Combos | Crispetas | Bebidas | Snacks dulces.
3. El usuario toca «Crispetas» → `GET /snacks?categoryId=...`.
