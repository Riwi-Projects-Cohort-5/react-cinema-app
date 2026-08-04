# DELETE /api/v1/promotions/{promotionId}

## Historia de usuario relacionada
- **HU-FE-026** — Administración de promociones y cupones. Elimina una promoción desde el panel de administración. Alias en backlog: `DELETE /promotions` (acotado por ítem para consistencia REST).

## Propósito
Elimina suavemente (soft delete) una promoción: deja de mostrarse y aplicarse, pero las referencias históricas (pedidos, cupones, entradas de auditoría) siguen siendo válidas. Eliminar es permanente desde la perspectiva del administrador — no hay deshacer — por lo que el frontend debe mostrar una confirmación contundente y manejar el caso de conflicto `409` (una promoción aún referenciada por cupones activos) sugiriendo en su lugar la desactivación.

## Método HTTP
DELETE

## URL
`/api/v1/promotions/{promotionId}` (URL completa: `https://api.multicine.com/api/v1/promotions/{promotionId}`)

## Autenticación
- Rol requerido: **ADMIN** (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `X-Request-Id` | Opcional | UUID generado por el cliente, devuelto por el servidor para trazabilidad |

## Parámetros de ruta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `promotionId` | string (UUID v4) | Sí | Id de la promoción (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición DELETE.

## Respuestas de éxito

**204 No Content** — promoción eliminada suavemente. Sin cuerpo. El cliente trata cualquier 2xx como éxito.

## Respuestas de error
Todos los errores usan el envelope compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento del frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No es ADMIN → estado "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | La promoción no existe → refresca la lista |
| 409 | `IN_USE` | La promoción aún está referenciada por **cupones activos** → muestra el mensaje de conflicto y ofrece "Desactivar" en su lugar |
| 500 | `SERVER_ERROR` | Fallo inesperado → error reintentable (§13) |

Ejemplo completo — conflicto (`409`):

```json
{
  "error": {
    "code": "IN_USE",
    "message": "Esta promoción está asociada a cupones activos y no puede eliminarse",
    "details": [
      { "field": "promotionId", "message": "Desactiva los cupones asociados o desactiva la promoción" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Modal de confirmación** antes de llamar: "¿Eliminar promoción? Esta acción no se puede deshacer." con el nombre de la promoción y un botón "Eliminar" con estilo destructivo.
- **Ante `409 IN_USE`**: no falles en silencio — muestra el mensaje de conflicto y ofrece una acción **"Desactivar en su lugar"** que llama `PUT /promotions/{promotionId}` con `isActive: false` (patrón §12: optimista/refetch con rollback en error).
- En éxito: elimina la fila de la lista (es aceptable una eliminación optimista con rollback en error) y `queryClient.invalidateQueries({ queryKey: ["promotions"] })` para que el feed público descarte la promoción.
- Eliminar no es en sí una mutación de dinero, pero es destructivo — el modal es obligatorio; nunca elimines con un clic en la fila.
- Cargando: spinner en el botón dentro del modal mientras está en curso; deshabilitado mientras está pendiente.

## Reglas de validación
- `promotionId` debe ser un UUID v4 válido antes de la petición.
- Confirma siempre en un modal; exige un segundo clic explícito para enviar el DELETE.

## Reglas de negocio
- Eliminar es un **soft delete**: la promoción ya no aplica ni se muestra, pero las referencias de pedidos/cupones/auditoría siguen siendo resolubles (integridad de datos).
- Una promoción referenciada por cupones **activos** devuelve `409 IN_USE` — la alternativa segura es la desactivación, que es reversible.
- No hay endpoint de restauración; la eliminación es definitiva para el operador.

## Notas de seguridad
- Solo ADMIN, aplicado por el backend (403 FORBIDDEN).
- Acción destructiva — la eliminación se registra en el trail de auditoría (ver `GET-admin-conventions.md`).

## Flujo de ejemplo
1. El administrador abre la tabla de promociones → toca el icono de eliminar en una fila.
2. Modal de confirmación: "¿Eliminar promoción? Esta acción no se puede deshacer." → "Eliminar".
3. `DELETE /promotions/{promotionId}` → 204 → fila eliminada, `["promotions"]` invalidada, el feed público la descarta.
4. Alternativamente, la promoción está referenciada por cupones activos → `409 IN_USE` → el modal cambia a "Desactivar en su lugar".
5. El administrador confirma la desactivación → `PUT` con `isActive: false` → 200 → la insignia cambia a "Inactiva".
