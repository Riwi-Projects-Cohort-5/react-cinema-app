# GET /api/v1/orders/{orderId}

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-016** — Cambio de función. **HU-FE-029** — Consumo de API pública. Detalle completo de la orden: tickets, snacks, pago y las ventanas de cambio de función/encuesta.

## Propósito
Devuelve todo lo que necesita la pantalla de detalle de la orden en una sola llamada: la función y las sillas confirmadas, snacks, información de pago, totales y las puertas de elegibilidad para las acciones renderizadas en esa pantalla (`canChangeFunction`, `canCancel`, `surveyEligible` y la ventana de cambio). Evita una dispersión de llamadas pequeñas después de navegar desde "Mis compras".

## Método HTTP
GET

## URL
`/api/v1/orders/{orderId}` (URL completa: `https://api.multicine.com/api/v1/orders/{orderId}`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Solo propietario.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendado | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; los mensajes de error los localiza el backend) |

## Parámetros de ruta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `orderId` | string (UUID v4) | Sí | Id de la orden (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK

```json
{
  "orderId": "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
  "orderNumber": "ORD-2026-000123",
  "status": "CONFIRMED",
  "createdAt": "2026-08-10T18:07:42Z",
  "payment": { "method": "CARD", "status": "APPROVED" },
  "function": {
    "movie": { "id": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f", "title": "El Último Horizonte", "posterUrl": "https://cdn.multicine.com/posters/el-ultimo-horizonte.jpg" },
    "cinema": { "id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", "name": "Multicine El Tesoro" },
    "room": { "id": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", "name": "Sala 3" },
    "startAt": "2026-08-14T21:10:00Z",
    "format": "IMAX"
  },
  "tickets": [
    {
      "id": "3f2e1d0c-9b8a-4f6e-8d5c-4b3a2f1e0d9c",
      "code": "MC-8D4FA2B1",
      "seatLabel": "F-7",
      "status": "ACTIVE"
    }
  ],
  "snacks": [
    { "name": "Combo Familiar", "quantity": 1, "lineTotal": { "amount": 15200, "currency": "COP" } }
  ],
  "totals": {
    "subtotal": { "amount": 53000, "currency": "COP" },
    "savings": { "amount": 4800, "currency": "COP" },
    "taxes": { "amount": 0, "currency": "COP" },
    "total": { "amount": 48200, "currency": "COP" }
  },
  "changeWindow": { "allowed": true, "until": "2026-08-14T19:10:00Z" },
  "canChangeFunction": true,
  "canCancel": false,
  "surveyEligible": true
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `status` | enum | `CONFIRMED` \| `CHANGED` \| `CANCELLED` \| `REFUNDED` |
| `payment` | object | Método + estado del pago; `APPROVED` después de un checkout exitoso |
| `tickets[].status` | enum | `ACTIVE` \| `USED` \| `INVALIDATED` \| `TRANSFERRED` \| `EXPIRED` |
| `totals` | object | COP entero (convenciones §6); `subtotal - savings + taxes = total` |
| `changeWindow.until` | string \| null | ISO 8601 UTC (convenciones §7) — fecha límite de cambio; null cuando no está permitido |
| `surveyEligible` | boolean | True → mostrar la acción "Responder encuesta" (`POST /surveys`) |

## Respuestas de error
Todos los errores usan el envelope de las convenciones §4. Códigos relevantes:

| HTTP | Code | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | La orden pertenece a otro usuario → estado "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | Orden desconocida/eliminada → volver a "Mis compras" |
| 500 | `SERVER_ERROR` | Error reintentable (§13) |

Ejemplo completo — no propietario (`403`):

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para ver esta orden",
    "requestId": "req_01HZ7..."
  }
}
```

## Consideraciones de frontend
- Página de detalle de la orden a la que se llega desde las filas de `GET /orders` (clave `["orders", orderId]`, convenciones §12).
- Muestra **"Cambiar función"** solo cuando `canChangeFunction` (impulsa `GET /orders/{orderId}/available-functions`).
- Muestra **"Responder encuesta"** cuando `surveyEligible` → navega a la encuesta (POST `/surveys`); después de enviarla, invalida `["orders", orderId]` para que la bandera se limpie.
- Renderiza cada ticket como un QR (desde `code`; para mostrar usa el `qrDataUrl` del detalle del ticket) con su insignia de estado; los tickets en `ACTIVE` ofrecen acciones de regenerar/transferir.
- Carga → skeleton; `403` → estado de prohibido; `404` → redirigir al historial.
- Después de cualquier acción de cambio/cancelación, invalida `["orders", orderId]` (y `["orders"]`) para que `canChangeFunction`/`canCancel` se actualicen.

## Reglas de validación
- `orderId` debe ser un UUID v4 válido.
- No hay cuerpo de petición que validar.

## Reglas de negocio
- `canChangeFunction` y `changeWindow` son el veredicto actual del servidor; la bandera de la fila de `GET /orders` puede estar desactualizada — confía en esta respuesta antes de habilitar el CTA.
- `changeWindow.until` normalmente es 2 horas antes de `startAt` (configurable); después de ese momento, `canChangeFunction` es false.
- `canCancel` es independiente de `canChangeFunction` y refleja la política de cancelación.
- `surveyEligible` es true una vez que la fecha de la función de la película ya pasó y el usuario aún no ha respondido.

## Notas de seguridad
- Lectura con alcance por propietario (403 en caso contrario) — la orden contiene datos personales (sillas, método de pago).
- `tickets[].code` otorga acceso; nunca lo registres del lado del cliente.

## Flujo de ejemplo
```
El usuario toca una fila de orden en "Mis compras"
↓
GET /orders/{orderId}
↓
El detalle se renderiza: función, sillas, snacks, totales
↓
"Cambiar función" visible (canChangeFunction) → available-functions
↓
"Responder encuesta" visible (surveyEligible) → POST /surveys
```
