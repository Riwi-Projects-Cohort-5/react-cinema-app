# POST /api/v1/tickets/transfer

## Historia de usuario relacionada
- **HU-FE-017** — Transferencia de entradas. Inicia una transferencia PENDING; el QR actual sigue siendo válido hasta que el destinatario acepte.

## Propósito
Transfiere una o más entradas `ACTIVE` a otra persona. El backend crea una transferencia **PENDING** con un enlace de aceptación seguro y mantiene el QR del remitente válido hasta que el destinatario acepte (momento en el que el QR se invalida y la propiedad se transfiere). La respuesta incluye el enlace compartible para el remitente.

## Método HTTP
POST

## URL
`/api/v1/tickets/transfer` (URL completa: `https://api.multicine.com/api/v1/tickets/transfer`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Titular actual de cada entrada en `ticketIds`.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; los mensajes de error son localizados por el backend) |
| `X-Idempotency-Key` | **Sí** | UUID generado por el cliente por cada envío de transferencia (convenciones §9). Evita transferencias duplicadas en reintentos. |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "ticketIds": [
    "3f2e1d0c-9b8a-4f6e-8d5c-4b3a2f1e0d9c",
    "6e5f4a3b-2c1d-4e0f-9a8b-7c6d5e4f3a2b"
  ],
  "recipient": {
    "firstName": "Carlos",
    "lastName": "Mendoza",
    "email": "carlos.mendoza@example.com",
    "documentType": "CC",
    "documentNumber": "1017234567"
  }
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `ticketIds` | UUID[] | Sí | Solo entradas `ACTIVE` que posee el usuario; todas deben ser transferibles (convenciones §8) |
| `recipient.firstName` / `lastName` | string | Sí | Nombre del destinatario (se muestra en la pantalla de aceptación) |
| `recipient.email` | string | Sí | Correo válido — el enlace de aceptación seguro se envía a esta dirección |
| `recipient.documentType` / `documentNumber` | string | Sí | Documento del destinatario (verificación de identidad al aceptar) |

## Respuestas de éxito

**201 Created** — transferencia creada; enlace listo para compartir.

```json
{
  "transferId": "5e4d3c2b-1a0f-4e9d-8c7b-6a5f4e3d2c1b",
  "status": "PENDING",
  "tickets": [
    { "id": "3f2e1d0c-9b8a-4f6e-8d5c-4b3a2f1e0d9c", "code": "MC-8D4FA2B1", "qrDataUrl": "data:image/png;base64,iVBORw0KGgo..." },
    { "id": "6e5f4a3b-2c1d-4e0f-9a8b-7c6d5e4f3a2b", "code": "MC-7C3FA2D5", "qrDataUrl": "data:image/png;base64,iVBORw0KGgo..." }
  ],
  "recipientEmail": "carlos.mendoza@example.com",
  "expiresAt": "2026-08-13T18:05:00Z"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `transferId` | UUID | Para `GET /tickets/transfer/{transferId}` (convenciones §8) |
| `status` | enum | Siempre `PENDING` en la creación |
| `expiresAt` | string | ISO 8601 UTC (convenciones §7); el enlace seguro vence aquí (p. ej. 72 h) |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No es el titular de una entrada listada → quitar esa entrada de la selección |
| 404 | `NOT_FOUND` | Una entrada listada es desconocida |
| 409 | `TICKET_NOT_TRANSFERABLE` | Entrada no transferible (estado / función iniciada / fuera de la ventana) → deseleccionarla |
| 409 | `ALREADY_TRANSFERRED` | La entrada ya tiene una transferencia pendiente/completa |
| 422 | `VALIDATION_ERROR` | Campos del destinatario inválidos / formato de correo; `details` se mapea a campos (§4) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Error con reintento (§13) |

Ejemplo completo — validación (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Corrige los datos del destinatario",
    "details": [
      { "field": "recipient.email", "message": "El correo del destinatario no es válido" },
      { "field": "recipient.documentNumber", "message": "El documento es obligatorio" }
    ],
    "requestId": "req_01HZE..."
  }
}
```

## Consideraciones de frontend
- Interfaz de selección múltiple que lista solo las entradas **transferibles** (condicionado por `canTransfer` de `GET /tickets`); la selección solo-transferibles se aplica en el cliente y el servidor la vuelve a verificar.
- Formulario del destinatario con los tres campos: nombre, correo, documento. Validar el formato del correo antes de enviar.
- **Modal de advertencia** de que el QR actual dejará de funcionar **una vez aceptado** (no de inmediato) — tranquilizar al remitente de que conserva el QR hasta que el destinatario acepte.
- En éxito: **pantalla de éxito con el enlace de aceptación seguro** para copiar/compartir (además de confirmación por correo). Proveer botones "copiar enlace" y de compartir nativos.
- Luego navegar a/consultar `GET /tickets/transfer/{transferId}` (vista del remitente, clave `["ticketTransfers", transferId]`).
- Invalidar `["tickets"]` después de cualquier estado terminal (ACCEPTED/REJECTED/EXPIRED).

## Reglas de validación
- `ticketIds` no vacío, todos UUID válidos, todos `ACTIVE` y `canTransfer === true`.
- `recipient.email` con formato válido; `firstName`/`lastName`/`documentNumber` no vacíos.
- Deshabilitar el envío mientras esté en vuelo; proteger el modal de confirmación contra doble clic (§9).

## Reglas de negocio
- El enlace de transferencia lleva un **token seguro** (la aceptación lo requiere — ver `POST /tickets/transfer/{transferId}/accept`).
- El enlace **vence** (p. ej. 72 h, `expiresAt`); después la transferencia queda `EXPIRED` y las entradas se quedan con el remitente.
- El **titular actual conserva el QR válido hasta `ACCEPTED`** — sin huecos de usabilidad.
- Una transferencia puede abarcar varias entradas del mismo pedido/función.

## Notas de seguridad
- Acotado al titular (403 en caso contrario) — solo puedes transferir tus propias entradas `ACTIVE`.
- Los QR de `ticketIds` no son revelados por este endpoint excepto al titular.
- Los datos de `recipient` son personales — recoger solo los campos requeridos para la identidad al aceptar; nunca registrar el número de documento completo.
- El token de aceptación es la capacidad del destinatario — el cliente nunca debe incrustarlo en analítica/URLs más allá del enlace de correo previsto.

## Flujo de ejemplo
```
El usuario selecciona entradas transferibles en "Mis entradas"
↓
Completa el formulario del destinatario (nombre, correo, documento)
↓
Modal de advertencia: "El QR actual dejará de funcionar al aceptar"
↓
POST /tickets/transfer { ticketIds, recipient }  (clave k-t1)
↓
201 → pantalla de éxito con el enlace de aceptación seguro (copiar/compartir)
↓
Consultar GET /tickets/transfer/{transferId}
```
