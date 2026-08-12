# POST /api/v1/tickets/{ticketId}/regenerate

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-014** — Entradas digitales y factura. **HU-FE-016** — Cambio de función. Alias de backlog: `POST /tickets/regenerate` (rediseñado — la acción está acotada al elemento, la entrada).

## Propósito
Regenera el código QR de una entrada, **invalidando de inmediato el código anterior**. Es la herramienta del usuario cuando un QR pudo filtrarse o capturarse en pantalla, y el backend también lo usa internamente después de un cambio de función. El nuevo QR se devuelve listo para renderizar.

## Método HTTP
POST

## URL
`/api/v1/tickets/{ticketId}/regenerate` (URL completa: `https://api.multicine.com/api/v1/tickets/{ticketId}/regenerate`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Solo titular actual.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `ticketId` | string (UUID v4) | Sí | Identificador de la entrada (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{}
```

Se requiere un cuerpo JSON vacío `{}`.

## Respuestas de éxito

**200 OK** — QR regenerado; el código anterior ya no es válido.

```json
{
  "ticketId": "3f2e1d0c-9b8a-4f6e-8d5c-4b3a2f1e0d9c",
  "newCode": "MC-4C9E7D2F",
  "qrDataUrl": "data:image/png;base64,iVBORw0KGgo...",
  "message": "El código anterior ya no es válido"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `newCode` | string | Nuevo código legible/alnumérico (convenciones §8) |
| `qrDataUrl` | string | URI `data:` del nuevo QR de alto contraste |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No es el titular → "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | Entrada desconocida |
| 409 | `NOT_ELIGIBLE` | No elegible: la entrada ya está `USED`, fuera de la ventana, o se alcanzó el límite de regeneraciones (`details` lleva la razón) |
| 410 | `INVALIDATED` | La entrada ya está invalidada → mostrar el estado invalidado (ver `GET /tickets/{ticketId}`) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Error con reintento (§13) |

Ejemplo completo — límite alcanzado (`409`):

```json
{
  "error": {
    "code": "NOT_ELIGIBLE",
    "message": "Esta entrada ya no puede regenerar su código.",
    "details": [
      { "field": "ticketId", "message": "Se alcanzó el límite de regeneraciones permitidas (3)" }
    ],
    "requestId": "req_01HZD..."
  }
}
```

## Consideraciones de frontend
- **Modal de confirmación antes de llamar**: "El QR anterior dejará de funcionar. ¿Deseas generar uno nuevo?" — hacer explícita la consecuencia.
- Carga en el botón; deshabilitar el doble envío (§9) mientras esté en vuelo.
- En éxito: reemplazar el QR mostrado con `qrDataUrl`; mostrar el `message`; **invalidar `["tickets", ticketId]`** y `["tickets"]` (cambiaron código/estado).
- `409 NOT_ELIGIBLE` → explicar la razón desde `details` (usada / ventana / límite); ocultar la acción después.
- Exponer la acción solo cuando `canRegenerate` sea `true` en la lista/detalle.

## Reglas de validación
- `ticketId` debe ser un UUID v4 válido.
- Enviar `{}` con `Content-Type: application/json`.

## Reglas de negocio
- El **código anterior se invalida de inmediato** al tener éxito (el QR viejo deja de otorgar ingreso).
- **Regeneraciones limitadas por entrada** (p. ej. máx. 3, configurable en el servidor) — se aplican incluso si la interfaz muestra `canRegenerate`.
- Solo las entradas **`ACTIVE`** pueden regenerarse; las entradas `USED`/`EXPIRED`/`INVALIDATED` nunca califican.
- La regeneración también es el mecanismo detrás de las entradas con cambio de función (allí se emiten nuevos códigos).

## Notas de seguridad
- Acotado al titular (403 en caso contrario); `newCode`/`qrDataUrl` son credenciales de ingreso — nunca registrarlos.
- La acción es segura por idempotencia según la semántica del §9 solo donde el servidor lo decida; el cliente siempre confirma antes de enviar para evitar invalidar un QR válido sin intención.
- No se requiere `X-Idempotency-Key` aquí — la operación es una transición de estado pura sin dinero involucrado, pero el diálogo de confirmación es la barrera de UX.

## Flujo de ejemplo
```
El usuario teme que capturaron su QR → "Regenerar código"
↓
Modal de confirmación: "El QR anterior dejará de funcionar"
↓
POST /tickets/{ticketId}/regenerate {}
↓
200 → mostrar nuevo QR (newCode) + "El código anterior ya no es válido"
↓
Invalidar ["tickets", ticketId] + ["tickets"]
```
