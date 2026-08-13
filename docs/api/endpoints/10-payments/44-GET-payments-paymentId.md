# GET /api/v1/payments/{paymentId}

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-013** — Proceso de pago seguro. Alias de backlog: `GET /payments/status` (rediseñado para consistencia REST — el estado se lee del recurso).

## Propósito
Consulta el estado de una intención de pago: mientras está `PENDING` (a la espera del gateway) y justo después de que el usuario regrese de la redirección. Es la fuente autoritativa del frontend para el resultado del pago y decide si confirmar la orden (`APPROVED`), mostrar un reintento (`DECLINED`) o mostrar un estado «pendiente» (aún `PENDING` después del ida y vuelta con el gateway).

## Método HTTP
GET

## URL
`/api/v1/payments/{paymentId}` (URL completa: `https://api.multicine.com/api/v1/payments/{paymentId}`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Solo el usuario que creó la intención (el propietario del carrito) puede leerla.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; los mensajes de error los localiza el backend) |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `paymentId` | string (UUID v4) | Sí | Id devuelto por `POST /payments` (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK

```json
{
  "paymentId": "7c5d3e2f-9b8a-4c1d-8e2f-6a5b4c3d2e1f",
  "status": "APPROVED",
  "amount": { "amount": 48200, "currency": "COP" },
  "method": "PSE",
  "provider": {
    "name": "PAYU",
    "gatewayReference": "PAY-2026-0008819"
  },
  "orderId": "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
  "failureReason": null,
  "updatedAt": "2026-08-10T18:07:42Z"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `status` | enum | `PENDING` \| `APPROVED` \| `DECLINED` |
| `amount` | object | Entero COP (convenciones §6) |
| `method` | enum | `CARD` \| `PSE` \| `NEQUI` \| `DAVIPLATA` |
| `provider.gatewayReference` | string | Referencia del proveedor para soporte/trazabilidad |
| `orderId` | UUID \| null | Se completa una vez que la orden está confirmada (mediante `POST /orders` o el webhook asíncrono) |
| `failureReason` | string \| null | Se completa en `DECLINED` (p. ej. `INSUFFICIENT_FUNDS`, `CARD_DECLINED`, `TIMEOUT`) para mensajería |

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (convenciones §3) |
| 403 | `FORBIDDEN` | El pago pertenece a otro usuario → nunca mostrarlo; tratar como error de sesión/propiedad |
| 404 | `NOT_FOUND` | `paymentId` desconocido → volver al carrito/checkout |
| 500 | `SERVER_ERROR` | Error reintentable (convenciones §13) |

Ejemplo completo — no es el propietario (`403`):

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para consultar este pago",
    "requestId": "req_01HZ4..."
  }
}
```

## Consideraciones de frontend
- **Consultar mientras `PENDING`** con `refetchInterval: 3000`; abandonar el bucle de consulta tras ~2 minutos y pasar al estado «pendiente».
- Clave de TanStack Query `["payments", paymentId]`; `staleTime: 0`, `refetchInterval` solo mientras `status === "PENDING"` (detener el intervalo una vez que se resuelva).
- **`APPROVED`** → llamar a `POST /orders` con la **misma `X-Idempotency-Key`** usada para la intención y luego navegar a la confirmación de la orden.
- **`DECLINED`** → detener la consulta, mostrar una pantalla de reintento: mensaje desde `failureReason` y un botón de vuelta a la selección del método de pago (un nuevo intento de pago = clave de idempotencia **nueva**; nunca reutilizar la clave del clic anterior para una intención nueva).
- **`PENDING` después del timeout / al regresar** → mostrar «Tu pago está pendiente de confirmación» con una acción «Revisar más tarde». La orden se confirma **asincrónicamente mediante webhook** — los boletos llegan por correo y la orden aparece en `GET /orders` sin acción del usuario. No afirmar que falló.
- Seguridad al navegar atrás/refrescar: si el usuario reingresa a esta pantalla, retomar la consulta desde el estado en caché en lugar de re-crear el pago.

## Reglas de validación
- `paymentId` debe ser un UUID v4 válido.
- No hay cuerpo de petición que validar.

## Reglas de negocio
- El resultado de la consulta es autoritativo para el flujo de compra; el propio evento de éxito del widget es solo una pista.
- `DECLINED` es definitivo para esa intención — reintentar significa un nuevo `POST /payments`.
- `PENDING` puede persistir mientras el gateway liquida; un webhook reconcilia `APPROVED` → orden incluso si el frontend dejó de consultar.
- Que `orderId` aparezca en un pago `APPROVED` significa que la orden ya existe — NO llamar a `POST /orders` de nuevo (la idempotencia lo devolvería de todas formas).

## Notas de seguridad
- Solo lectura para el propietario (403 para otros) — los datos de pago son sensibles.
- `gatewayReference` y `paymentId` son identificadores de trazabilidad; no registrarlos en payloads de analítica del cliente.
- Ningún dato de tarjeta sale/entra del cliente en este endpoint (Notas de seguridad de `POST /payments`).

## Flujo de ejemplo
```
El usuario regresa del gateway (o el widget confirma)
↓
GET /payments/{paymentId} → PENDING → consultar cada 3 s (máx. ~2 min)
↓
APPROVED → POST /orders { paymentId } (misma clave de idempotencia k-1)
↓
Navegar a la pantalla de confirmación con los boletos
(o)
DECLINED → pantalla de reintento → «Cambiar método de pago»
(o)
PENDING más allá del timeout → estado «pendiente» + revisar más tarde
```

## Conciliación con el backlog
Mapeado desde el `GET /payments/status` del backlog — el estado se lee como una propiedad del recurso de pago (`GET /payments/{paymentId}`), según el mandato de consistencia REST.
