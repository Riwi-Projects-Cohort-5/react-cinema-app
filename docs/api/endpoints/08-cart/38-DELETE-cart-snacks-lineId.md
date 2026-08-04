# DELETE /api/v1/cart/snacks/{lineId}

## Historia de usuario relacionada
- **HU-FE-012** — Compra de productos de confitería. Alias de backlog: `DELETE /cart/snacks` (rediseñado para consistencia REST — con alcance por ítem).

## Propósito
Elimina una línea de snacks del carrito activo (p. ej. el botón «Quitar» junto a un producto). Eliminar una línea ya eliminada devuelve `404`, que el frontend tolera.

## Método HTTP
DELETE

## URL
`/api/v1/cart/snacks/{lineId}` (URL completa: `https://api.multicine.com/api/v1/cart/snacks/{lineId}`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `X-Idempotency-Key` | Sí | UUID por intención de eliminar; se reutiliza al reintentar (convenciones §9) |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `lineId` | string (UUID v4) | Sí | Id de la línea de snacks de `GET /cart` |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición DELETE.

## Respuestas de éxito

**204 No Content** — línea eliminada. Sin cuerpo.

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` etc. | Problemas de sesión — interceptor (convenciones §3) | Refresco silencioso / redirección al inicio de sesión |
| 404 | `LINE_NOT_FOUND` | La línea ya fue eliminada | **Tolerar** — tratar como éxito |
| 409 | `CART_EXPIRED` | El carrito expiró mientras se editaba | Toast + invalidar → estado vacío |
| 500 | `SERVER_ERROR` | Fallo inesperado | Error recuperable (convenciones §13) |

Ejemplo completo:

```json
{
  "error": {
    "code": "LINE_NOT_FOUND",
    "message": "El producto ya no está en el carrito",
    "requestId": "req_01HZ8PLQ9WX4..."
  }
}
```

## Consideraciones de frontend
- **Botón de eliminar** junto a cada línea de snacks; confirmación ligera opcional para ítems costosos (combos).
- **Eliminación optimista**: quitar la fila de inmediato; ante error re-consultar `["cart"]` y mostrar un toast.
- Invalidar `["cart"]` en caso de éxito para que el contador de la insignia y los totales se reconcilien.
- `404` → eliminar la fila silenciosamente (ya no existe).

## Reglas de validación
- Ninguna — proteger solo contra dobles clics en la misma línea.

## Reglas de negocio
- Eliminar una línea de snacks no afecta la retención de sillas subyacente.
- La eliminación es idempotente; una línea faltante se tolera (`404`).

## Notas de seguridad
- Autenticado; `lineId` debe pertenecer al carrito del llamante.
- La idempotencia evita efectos secundarios de doble eliminación (convenciones §9).

## Flujo de ejemplo
1. El usuario toca el ícono de basura en Combo Familiar.
2. `DELETE /api/v1/cart/snacks/{lineId}` → eliminación optimista de la fila.
3. `204` → `["cart"]` invalidada; los totales se actualizan.
