# GET /api/v1/tickets/{ticketId}

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-014** — Entradas digitales y factura. Detalle de una sola entrada para mostrar y descargar (QR, función, cine, asiento, precio, titular, transferencia).

## Propósito
Devuelve una entrada completa: el QR para escanear, el contexto de función/cine/asiento, el precio, los datos del titular y — cuando hay una transferencia en curso — el estado de la transferencia. Respalda la pantalla de detalle de la entrada, la vista de QR y el enlace de PDF "Descargar entrada".

## Método HTTP
GET

## URL
`/api/v1/tickets/{ticketId}` (URL completa: `https://api.multicine.com/api/v1/tickets/{ticketId}`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Solo propietario/titular.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; los mensajes de error son localizados por el backend) |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `ticketId` | string (UUID v4) | Sí | Identificador de la entrada (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK

```json
{
  "id": "3f2e1d0c-9b8a-4f6e-8d5c-4b3a2f1e0d9c",
  "code": "MC-8D4FA2B1",
  "status": "ACTIVE",
  "qr": {
    "dataUrl": "data:image/png;base64,iVBORw0KGgo...",
    "note": "Presenta este código en la entrada del cine"
  },
  "movie": { "id": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f", "title": "El Último Horizonte" },
  "function": { "id": "8d7c6b5a-4e3f-4d2c-8b1a-0f9e8d7c6b5a", "startAt": "2026-08-14T21:10:00Z", "endAt": "2026-08-14T23:32:00Z", "format": "IMAX", "language": { "mode": "SUBBED" } },
  "cinema": { "id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", "name": "Multicine El Tesoro", "address": "Cra 25A #1A Sur-45, Medellín" },
  "room": { "id": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", "name": "Sala 3" },
  "seat": { "label": "F-7", "type": "PREFERENTIAL" },
  "price": { "amount": 20500, "currency": "COP" },
  "holder": { "name": "Valentina Rojas", "documentType": "CC", "documentNumber": "1036654123" },
  "transfer": null,
  "canRegenerate": true
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `code` | string | Código QR legible/alnumérico (convenciones §8; no es un UUID) |
| `status` | enum | `ACTIVE` \| `USED` \| `INVALIDATED` \| `TRANSFERRED` \| `EXPIRED` |
| `qr.dataUrl` | string | QR de alto contraste para escanear |
| `function.startAt`/`endAt` | string | ISO 8601 UTC (convenciones §7) |
| `holder` | object | `documentType`/`documentNumber` anulables en algunos métodos; sensibles — enmascararlos en los registros |
| `transfer` | object \| null | Presente cuando una transferencia está `PENDING`/`ACCEPTED` (ver `POST /tickets/transfer`) |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No es el titular → "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | Entrada desconocida |
| 410 | `INVALIDATED` | La entrada fue invalidada (p. ej. regenerada/transferida) → mostrar el estado claro "entrada invalidada" a continuación |
| 500 | `SERVER_ERROR` | Error con reintento (§13) |

Ejemplo completo — entrada invalidada (`410`):

```json
{
  "error": {
    "code": "INVALIDATED",
    "message": "Esta entrada fue invalidada porque el código fue regenerado o transferido.",
    "requestId": "req_01HZC..."
  }
}
```

## Consideraciones de frontend
- Renderizar `qr.dataUrl` **en alto contraste y a pantalla completa** para escanear; mantener el brillo alto y un borde de zona de silencio limpio.
- "Descargar entrada" → descargar el PDF de la entrada **a través de la URL provista** (descarga de blob como la factura) — ver Reglas de negocio para el origen de la URL.
- Si `transfer` está presente, mostrar su estado en línea ("Transferencia pendiente de aceptar") y un enlace al estado de la transferencia.
- En **`410 INVALIDATED`** → estado dedicado "entrada invalidada" con la razón (regenerada / transferida / cambió la función) y un CTA para regenerar si aplicara `canRegenerate`, o al detalle del pedido en caso contrario.
- `status === "EXPIRED"` → vista atenuada, "Función ya finalizó" en lugar de acciones.
- Clave de TanStack Query `["tickets", ticketId]`; invalidar después de regenerar/transferir/aceptar.

## Reglas de validación
- `ticketId` debe ser un UUID v4 válido.
- No hay cuerpo de petición que validar.

## Reglas de negocio
- La entrada pertenece al **titular actual**; después de aceptar una transferencia cambia de titular y el antiguo titular ya no puede leerla (403).
- `code` cambia solo mediante regeneración (el código anterior se invalida de inmediato).
- `status` lo deriva el servidor y es definitivo; el cliente nunca lo adivina.

## Notas de seguridad
- Acotado al propietario/titular (403 en caso contrario); `code` y `qr.dataUrl` son credenciales de ingreso — nunca registrarlos ni incluirlos en eventos de analítica.
- `holder.documentNumber` es dato personal sensible — enmascararlo en todas partes salvo en la vista explícita del titular.
- La descarga del PDF de la entrada también debe estar autenticada (la URL provista lleva el token de portador a través del cliente).

## Flujo de ejemplo
```
El usuario toca una entrada en "Mis entradas"
↓
GET /tickets/{ticketId}
↓
QR de alto contraste a pantalla completa + detalles de función/asiento
↓
"Descargar entrada" → descarga de blob a través de la URL provista
(transferencia pendiente → mostrar insignia de estado; 410 INVALIDATED → estado dedicado)
```
