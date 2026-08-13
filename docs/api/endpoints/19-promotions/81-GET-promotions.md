# GET /api/v1/promotions

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-029** — Consumo de API pública (visualización pública de promociones activas). **HU-FE-026** — Administración de promociones y cupones (el lado de lectura orientado al cliente de las promociones creadas por el administrador).

## Propósito
Devuelve las promociones **activas** para su visualización: banners promocionales, insignias de descuento y sus condiciones. Solo se devuelven las promociones que estén activas **y** dentro de su ventana de validez (según la ciudad seleccionada, opcionalmente filtradas por tipo), de modo que el frontend pueda renderizar los banners y un modal de "ver términos" sin hacer cálculos de fechas locales. Este es el lado público, de solo lectura, del módulo de promociones; la administración vive bajo los endpoints ADMIN.

## Método HTTP
GET

## URL
`/api/v1/promotions` (URL completa: `https://api.multicine.com/api/v1/promotions`)

## Autenticación
- Público. No se requiere token.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza `description`/`terms` |
| `X-Request-Id` | Opcional | UUID generado por el cliente, devuelto por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `cityId` | string (UUID v4) | No | Limita las promociones a una ciudad (contexto de cartelera) |
| `type` | enum | No | `TWO_FOR_ONE` \| `PERCENTAGE` \| `COMBO` \| `BIRTHDAY` \| `MEMBERSHIP` \| `SEASONAL` \| `BLACK_FRIDAY` \| `CINE_FLASH` |
| `page` | integer | No | Página basada en 1 (por defecto `1`, convenciones §5) |
| `pageSize` | integer | No | Máximo 100 (por defecto `20`, §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — lista paginada (envelope según convenciones §5). Solo promociones activas y dentro de su ventana.

```json
{
  "data": [
    {
      "id": "6e5f4a3b-2c1d-4e5f-8a9b-0c1d2e3f4a5b",
      "name": "Dos por uno martes",
      "description": "Compra dos boletas y paga una en todas las funciones 2D de los martes.",
      "type": "TWO_FOR_ONE",
      "bannerUrl": "https://cdn.multicine.com/banners/dos-por-uno-martes.jpg",
      "validity": { "from": "2026-08-01T00:00:00Z", "to": "2026-08-31T23:59:59Z" },
      "scope": { "all": false, "cinemas": ["1c2b3a4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d"], "cities": [], "movies": [] },
      "terms": "Válido solo los martes. Máximo 4 boletas por transacción."
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 3, "totalPages": 1 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `data[].id` | UUID | Convenciones §8 |
| `data[].type` | enum | Uno de los ocho tipos de promoción |
| `data[].bannerUrl` | string \| null | Imagen hero para el banner; null → renderiza un banner tipográfico |
| `data[].validity` | object | Ventana ISO 8601 UTC (convenciones §7) — siempre dentro de la ventana de visualización |
| `data[].scope` | object | Booleano `all` + arreglos opcionales de ids `movies`/`cinemas`/`cities` |
| `data[].terms` | string | Texto legal/condiciones que se muestran en el modal "ver términos" |

## Respuestas de error
Todos los errores usan el envelope compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento del frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Valor inválido de `type`/paginación → sección de banner oculta (no bloqueante) |
| 500 | `SERVER_ERROR` | Fallo inesperado → oculta la sección con un chip discreto de reintento (§13) |

Ejemplo completo — filtro inválido (`400`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El valor del parámetro type no es válido",
    "details": [
      { "field": "type", "message": "Selecciona un tipo de promoción válido" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Carrusel/apilado de banners** en la pantalla de inicio; cada banner es una tarjeta clicable (navega al landing de la promoción o al filtro de catálogo correspondiente) con una acción "Ver términos" que abre el modal de condiciones usando `terms`.
- Solo se devuelven las promociones ACTIVAS y dentro de su ventana — el cliente **no** hace cálculos locales de ventana de fechas.
- Clave de TanStack Query `["promotions", { cityId, type, page, pageSize }]`; **`staleTime` largo (p. ej. 15 min)** ya que las promociones cambian con poca frecuencia; `refetchOnWindowFocus: true` para que un usuario que regresa vea los banners actualizados (§12).
- Cargando → skeletons de banners; vacío → no se renderiza la sección de banners; error → sección oculta (nunca bloquea la página, §13).
- El filtro `type` se usa en secciones dedicadas (p. ej. "Cine Flash" `CINE_FLASH`); de lo contrario omítelo para el feed genérico de banners.
- Esta lectura también es la que reutiliza la vista previa del administrador tras crear/editar (invalida `["promotions"]` desde las pantallas de administración).

## Reglas de validación
- Valida `type` contra los ocho literales documentados antes de enviar.
- `page` ≥ 1; limita `pageSize` a 1–100 (§5).
- Envía `cityId` solo cuando hay una ciudad seleccionada (alcance opcional).

## Reglas de negocio
- Solo se devuelven las promociones con `isActive: true` **y** `now ∈ validity` — las promociones próximas o vencidas nunca aparecen para los clientes.
- El alcance se aplica en el servidor (las promociones `all` aplican en todas partes; de lo contrario, los arreglos restringen a películas/cines/ciudades).
- `terms` es el texto de condiciones autoritativo — el modal debe renderizarlo tal cual.

## Notas de seguridad
- Endpoint público; no contiene datos personales.
- El payload solo expone datos de marketing — nunca campos internos de administración (p. ej. `maxRedemptions`).

## Flujo de ejemplo
1. El home se monta con la ciudad "Medellín" → `GET /promotions?cityId=...`.
2. Skeletons de banners → carrusel con 3 banners activos.
3. El usuario toca "Ver términos" en un banner → el modal renderiza `terms` tal cual.
4. Una promoción `CINE_FLASH` está dentro de su ventana → aparece la insignia en la sección Cine Flash.
5. Termina la ventana de la promoción → el siguiente refetch al ganar foco descarta el banner automáticamente (sin lógica de fechas en el cliente).
