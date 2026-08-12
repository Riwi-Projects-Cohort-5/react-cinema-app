# GET /api/v1/membership/benefits

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-008** — Perfil y beneficios de membresía. Lista los beneficios/bonos actuales disponibles para el miembro.

## Propósito
Devuelve los beneficios de membresía del usuario autenticado (descuentos, entradas gratis, bonos) con su estado, paginados. Lo usa la pestaña "Beneficios" de la sección de membresía.

## Método HTTP
GET

## URL
`/api/v1/membership/benefits` (URL completa: `https://api.multicine.com/api/v1/membership/benefits`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; el backend localiza los mensajes de error) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, replicado por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | ¿Obligatorio? | Descripción |
|---|---|---|---|
| `status` | enum | No | Filtrar por `AVAILABLE` \| `USED` \| `EXPIRED`. Ausente → todos |
| `page` | integer | No | Número de página basado en 1, por defecto `1` (convenciones §5) |
| `pageSize` | integer | No | Por defecto `20`, máximo `100` (convenciones §5) |

## Cuerpo de la petición
Ninguno.

## Respuestas de éxito

**200 OK** — lista de beneficios paginada (sobre según convenciones §5).

```json
{
  "data": [
    {
      "id": "4d3e2f1a-9b8c-7d6e-5f4a-3b2c1d0e9f8a",
      "name": "Descuento 2x1 en confitería",
      "description": "Aplica al comprar dos productos del mismo tipo",
      "type": "DISCOUNT",
      "value": 50,
      "expiresAt": "2026-09-30T23:59:59Z",
      "status": "AVAILABLE"
    },
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "Bono 10 000 COP",
      "description": "Descuento de 10 000 COP en tu próxima compra",
      "type": "BONUS",
      "value": 10000,
      "expiresAt": "2026-08-15T23:59:59Z",
      "status": "AVAILABLE"
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
| `id` | UUID | Id del beneficio (convenciones §8) |
| `name` / `description` | string | Texto de visualización localizado |
| `type` | enum | `DISCOUNT` \| `FREE` \| `BONUS` |
| `value` | integer | La semántica depende de `type`: porcentaje para `DISCOUNT`, monto en COP para `BONUS` (COP entero, convenciones §6), cantidad para `FREE` |
| `expiresAt` | string \| null | Expiración ISO 8601 UTC (convenciones §7); `null` si nunca expira |
| `status` | enum | `AVAILABLE` \| `USED` \| `EXPIRED` |

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Valor de `status` inválido → restablecer el filtro a los valores por defecto |
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | Sin permiso → estado "No tienes permiso" (§13) |
| 422 | `VALIDATION_ERROR` | Parámetros de paginación inválidos (§5) |
| 500 | `SERVER_ERROR` | Error reintentable (§13) |

Ejemplo completo — filtro inválido (`400`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Filtro inválido",
    "details": [
      { "field": "status", "message": "status debe ser AVAILABLE, USED o EXPIRED" }
    ],
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- Clave de TanStack Query: `["membership", "benefits", { status, page }]`.
- Pestañas de filtro por estado (Disponibles / Usados / Expirados) se mapean al parámetro de consulta `status`; refetchear al cambiar.
- Paginación según convenciones §5: `keepPreviousData` para transiciones suaves de página, `pageSize` ≤ 100.
- Estado vacío por filtro: "Sin beneficios disponibles" con una acción clara (ver películas o revisar el carrito).
- Skeleton de carga; error recuperable con reintento (§13).
- **Aplicar un beneficio** dirige al flujo de carrito/checkout mediante `POST /cart/apply-membership`; después de usar un beneficio, invalidar `["membership", "benefits"]` (y `["membership"]`) para que su estado se actualice a `USED`.
- `expiresAt` → mostrar "vence el ..." (calculado contra UTC, convenciones §7); las filas `EXPIRED` se renderizan atenuadas.
- Las filas `FREE`/`BONUS` pueden mostrar el valor en COP como entero con el formateador `$` (convenciones §6).

## Reglas de validación
- `status` debe ser uno de `AVAILABLE`, `USED`, `EXPIRED` (u omitirse) antes de enviar.
- `page ≥ 1`, `pageSize` de 1–100 (convenciones §5).

## Reglas de negocio
- Un beneficio con `status=AVAILABLE` y un `expiresAt` pasado debe ser tratado por el backend como `EXPIRED`; la UI nunca lo infiere localmente.
- Aplicar un beneficio es una mutación de dinero — `POST /cart/apply-membership` requiere un `X-Idempotency-Key` (§9).
- La disponibilidad de beneficios (`benefitsAvailableCount` en `GET /membership`) es consistente con el conteo `AVAILABLE` de esta lista.

## Notas de seguridad
- Alcance del propietario (§3): solo se devuelven los beneficios del propio miembro.
- Los ids de beneficio son secretos del flujo de canje — nunca registrarlos ni pasarlos por URLs.
- Límite de tasa para evitar la enumeración de beneficios de otros miembros (§10).

## Flujo de ejemplo
```
User opens "Beneficios" tab
↓
GET /membership/benefits?status=AVAILABLE (key ["membership","benefits",{status,page}])
↓
Skeleton → list of available benefits (badge per type)
↓
User taps "Aplicar" on a discount
↓
POST /cart/apply-membership (X-Idempotency-Key) → benefit added to cart
↓
Invalidate ["membership","benefits"] and ["membership"]
↓
Benefit now shows status USED
```
