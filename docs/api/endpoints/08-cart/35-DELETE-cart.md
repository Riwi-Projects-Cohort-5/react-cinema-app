# DELETE /api/v1/cart

## Historia de usuario relacionada
- **HU-FE-011** — Carrito de compras.

## Propósito
Vacía/abandona el carrito activo: elimina las líneas de snacks, libera la retención de sillas subyacente y libera las sillas. Se usa para «Vaciar carrito» o cuando el usuario abandona la compra. Vaciar un carrito inexistente devuelve `404`, que el frontend trata como éxito.

## Método HTTP
DELETE

## URL
`/api/v1/cart` (URL completa: `https://api.multicine.com/api/v1/cart`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `X-Idempotency-Key` | Sí | UUID por intención de vaciar; se reutiliza al reintentar (convenciones §9) |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición DELETE.

## Respuestas de éxito

**204 No Content** — carrito vaciado y sillas liberadas. Sin cuerpo.

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` etc. | Problemas de sesión — interceptor (convenciones §3) | Refresco silencioso / redirección al inicio de sesión |
| 404 | `CART_NOT_FOUND` | No hay carrito activo | **Tratado como éxito** (no hay nada que vaciar) |
| 500 | `SERVER_ERROR` | Fallo inesperado | Error reintentable (convenciones §13) |

Ejemplo completo — sin carrito activo (`404`):

```json
{
  "error": {
    "code": "CART_NOT_FOUND",
    "message": "No tienes un carrito activo",
    "requestId": "req_01HZ1QWX..."
  }
}
```

## Consideraciones de frontend
- Confirmar siempre primero con un **modal** («¿Vaciar el carrito? Se liberarán tus sillas»).
- En caso de éxito: `queryClient.setQueryData(["cart"], { cart: null })` (o invalidar `["cart"]`) y navegar a la cartelera.
- Además, invalidar `["reservations", "summary"]`.
- Tratar `404` como éxito — el estado vacío ya es el estado objetivo.
- El backend libera la **retención de sillas** subyacente cuando se vacía el carrito, por lo que no se requiere una llamada separada a `DELETE .../seat-holds/{holdId}`; no disparar ambas para evitar un 404 espurio.

## Reglas de validación
- Ninguna — pero resguardar la acción destructiva detrás del modal de confirmación.

## Reglas de negocio
- Vaciar el carrito libera la retención subyacente y devuelve las sillas al grupo disponible.
- Un carrito vaciado significa que otro usuario puede tomar esas sillas de inmediato.
- Idempotente: vaciar un carrito inexistente se tolera (`404`).

## Notas de seguridad
- Autenticado; solo el propietario puede vaciar su carrito.
- La propiedad y la liberación de la retención se validan en el servidor — nunca confiar en el cliente para liberar sillas.

## Flujo de ejemplo
1. Pantalla del carrito: el usuario toca «Vaciar carrito» → modal de confirmación.
2. `DELETE /api/v1/cart` → `204`.
3. `["cart"]` invalidada → estado vacío; navegar a la cartelera.
