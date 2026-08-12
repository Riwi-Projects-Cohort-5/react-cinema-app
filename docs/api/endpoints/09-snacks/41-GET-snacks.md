# GET /api/v1/snacks

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-012** — Compra de productos de confitería.

## Propósito
Catálogo de confitería con alcance a la ciudad/cine seleccionados (el inventario es por cine). Devuelve productos paginados con precio, categoría, estado de stock y promociones activas para que el frontend pueda renderizar la tienda, los filtros y las insignias de promoción.

## Método HTTP
GET

## URL
`/api/v1/snacks` (URL completa: `https://api.multicine.com/api/v1/snacks`)

## Autenticación
Público. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza nombres/categorías |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cinemaId` | string (UUID v4) | No | Alcance del cine para inventario/precios. Si se omite → cine por defecto de la ciudad seleccionada |
| `categoryId` | string (UUID v4) | No | Filtrar por categoría (de `GET /snacks/categories`) |
| `search` | string | No | Subcadena sin distinguir mayúsculas y minúsculas sobre `name` |
| `sortBy` | enum | No | `price` \| `name` (por defecto `name`) |
| `sortOrder` | enum | No | `asc` \| `desc` (por defecto `asc`, convenciones §5) |
| `page` | integer | No | Página basada en 1 (por defecto `1`, convenciones §5) |
| `pageSize` | integer | No | Máx. 100 (por defecto `20`, convenciones §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — lista paginada (envoltura según convenciones §5).

```json
{
  "data": [
    {
      "id": "77777777-7777-4777-8777-777777777701",
      "name": "Combo Familiar",
      "description": "Crispetas grandes, 2 gaseosas medianas y nachos",
      "imageUrl": "https://cdn.multicine.com/snacks/combo-familiar.jpg",
      "price": { "amount": 38500, "currency": "COP" },
      "category": { "id": "66666666-6666-4666-8666-666666666601", "name": "Combos" },
      "isAvailable": true,
      "isSoldOut": false,
      "isPromotion": true,
      "promotion": { "type": "COMBO", "discountPercent": 15, "combo": true },
      "availableQuantity": 23
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 12, "totalPages": 1 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `price` | object | Entero COP (convenciones §6) |
| `category` | object | `{ id, name }` — fuente del filtro |
| `isSoldOut` | boolean | Agotado → tarjeta deshabilitada con insignia |
| `isPromotion` / `promotion` | boolean / object \| null | Promo activa para la ventana actual; `promotion.discountPercent` impulsa el precio tachado |
| `availableQuantity` | integer | Stock restante para este cine (limita los steppers) |

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4. Códigos relevantes: `400`, `422`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Parámetro de enum/paginación inválido | Error recuperable con reintento |
| 422 | `VALIDATION_ERROR` | `cinemaId` faltante o inválido | Abrir el asistente de ubicación |
| 500 | `SERVER_ERROR` | Fallo inesperado | Error reintentable (convenciones §13) |

Ejemplo completo:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El parámetro cinemaId no es válido",
    "details": [
      { "field": "cinemaId", "message": "Debes seleccionar un cine para ver la confitería" }
    ],
    "requestId": "req_01HZ5JKQ8VX2Z"
  }
}
```

## Consideraciones de frontend
- **Pestañas de categorías** desde `GET /snacks/categories`; al cambiar de pestaña → re-consultar con `categoryId`.
- **Búsqueda con debounce** (~400 ms) sobre `search`; mantener la consulta en los parámetros de búsqueda de React Router.
- Clave de TanStack Query `["snacks", { categoryId, search, cinemaId }]`; `keepPreviousData` para una paginación fluida (convenciones §5).
- **Skeleton** en la cuadrícula mientras se carga (convenciones §13); **estado vacío** «Sin resultados» + «Limpiar filtros».
- **Tarjetas agotadas** deshabilitadas con una insignia «Agotado».
- **Insignia de promoción** (`−15%`) con precio tachado; derivar el precio con descuento de `promotion.discountPercent` solo en COP entero (convenciones §6).
- Limitar el stepper de agregar al carrito a `availableQuantity`.

## Reglas de validación
- Validar `sortBy`/`sortOrder` contra los literales documentados.
- Limitar `pageSize ≤ 100`; `page ≥ 1`.
- Aplicar debounce a `search` para evitar ráfagas de peticiones (convenciones §10).

## Reglas de negocio
- El catálogo es **por ciudad/cine** (el inventario es por cine) — los precios/stock varían según la ubicación.
- Los ítems agotados se marcan (`isSoldOut`) pero aún se listan (informativo).
- Las promociones solo se muestran mientras están activas (`isPromotion` + `promotion` para la ventana actual).

## Notas de seguridad
- Endpoint público; sin datos personales.
- Usar paginación — nunca solicitar un `pageSize` mayor a 100 (convenciones §5).

## Flujo de ejemplo
1. El usuario abre la pestaña de confitería para su cine.
2. `GET /api/v1/snacks?cinemaId=...&page=1` → skeleton → cuadrícula de productos.
3. El usuario toca la pestaña «Combos» → re-consultar con `categoryId`.
4. El usuario busca «combo» → re-consulta con debounce; los resultados se estrechan.
