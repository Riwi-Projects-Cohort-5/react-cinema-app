# DELETE /api/v1/functions/{functionId}/seat-holds/{holdId}

## Historia de usuario relacionada
- **HU-FE-010** — Selección interactiva de sillas. Alias del backlog: `DELETE /reservations/release-seats` (rediseñado por consistencia REST).

## Propósito
Devuelve al pool un conjunto de sillas en hold. Se usa cuando el usuario cancela, abandona el mapa de sillas o la cuenta regresiva de 10 minutos expira. Las liberaciones son idempotentes — repetir la llamada (o llamar para un hold ya expirado) devuelve un 404 que el frontend trata como éxito.

## Método HTTP
DELETE

## URL
`/api/v1/functions/{functionId}/seat-holds/{holdId}` (URL completa: `https://api.multicine.com/api/v1/functions/{functionId}/seat-holds/{holdId}`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `X-Idempotency-Key` | Sí | UUID; seguro de reutilizar para liberaciones repetidas del mismo hold (convenciones §9) |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `functionId` | string (UUID v4) | Sí | Función a la que pertenece el hold |
| `holdId` | string (UUID v4) | Sí | Hold a liberar, de `POST /functions/{functionId}/seat-holds` |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición DELETE.

## Respuestas de éxito

**204 No Content** — sillas liberadas. Sin cuerpo.

## Respuestas de error
Todos los errores usan el envelope de convenciones §4.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` etc. | Problemas de sesión — interceptor (§3) | Refresco silencioso / redirigir al login |
| 403 | `FORBIDDEN` | No es el dueño del hold | Liberar localmente e ignorar; no reintentar |
| 404 | `HOLD_NOT_FOUND` | Hold desconocido o ya expirado/liberado | **Se trata como éxito** (liberación idempotente) |
| 500 | `SERVER_ERROR` | Falla inesperada | Silencioso (disparar y olvidar); el sondeo del mapa de sillas corrige el estado |

Ejemplo completo — el hold ya no existe (`404`):

```json
{
  "error": {
    "code": "HOLD_NOT_FOUND",
    "message": "La reserva de sillas ya no existe o ya expiró",
    "requestId": "req_01HZ6PLQ9WX4..."
  }
}
```

## Consideraciones de frontend
- Se llama en tres lugares: el **botón de cancelar**, el **modal de confirmación de salida** y cuando la **cuenta regresiva llega a cero**.
- En la ruta de expiración de la cuenta regresiva es **disparar y olvidar**: no bloquees la navegación, no muestres errores, no lo esperes antes de redirigir.
- Ignorar `404` (`HOLD_NOT_FOUND`) — el hold ya fue liberado o expiró en el servidor.
- Ante éxito invalidar `["functions", functionId, "seats"]` y `["reservations", "summary"]`.
- No mostrar errores para esta llamada; el sondeo del mapa de sillas reconcilia la disponibilidad real.

## Reglas de validación
- No se necesita validación de cliente; solo disparar cuando el cliente tenga un `holdId` activo.
- Protegerse contra doble disparo (p. ej. botón de cancelar + cleanup de unmount) con un flag/ref de en vuelo.

## Reglas de negocio
- Liberar es **idempotente** — una doble liberación (o liberación después de la expiración) se tolera vía `404`.
- Tras la liberación las sillas vuelven al pool inmediatamente y otro usuario puede tomarlas.
- El servidor también expira automáticamente los holds después de 10 minutos aunque este endpoint nunca se llame.

## Notas de seguridad
- Propiedad aplicada: solo el dueño del hold puede liberarlo (`403` en caso contrario, §3).
- `holdId` es un UUID — no enumerable/adivinable (§8).
- Sin datos personales en la petición; nunca registrar la lista de sillas.

## Flujo de ejemplo
1. La cuenta regresiva llega a 0 durante la selección de sillas.
2. `DELETE /api/v1/functions/{functionId}/seat-holds/{holdId}` (disparar y olvidar, sin espera).
3. `204` → invalidar la consulta del mapa de sillas.
4. "Continuar" queda deshabilitado; al usuario se le muestra el estado de expiración y debe volver a seleccionar.
