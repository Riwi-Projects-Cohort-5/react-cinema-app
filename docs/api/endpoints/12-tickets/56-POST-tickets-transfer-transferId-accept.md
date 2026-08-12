# POST /api/v1/tickets/transfer/{transferId}/accept

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-017** — Transferencia de entradas. Alias de backlog: `POST /tickets/transfer/accept` (rediseñado — la acción está acotada al elemento, la transferencia). Cubre la sub-historia "Solicitar registro cuando el destinatario no tenga cuenta".

## Propósito
Acepta una transferencia de entradas desde el enlace de correo seguro: la propiedad pasa al destinatario, los QR del remitente se invalidan y las nuevas entradas (con códigos QR nuevos) se devuelven al destinatario. El destinatario puede ser **anónimo** — se autentica con el `acceptToken` seguro. Si no tiene cuenta, primero se registra (HU-FE-017) y luego vuelve a aceptar.

## Método HTTP
POST

## URL
`/api/v1/tickets/transfer/{transferId}/accept` (URL completa: `https://api.multicine.com/api/v1/tickets/transfer/{transferId}/accept`)

## Autenticación
- **Público con token seguro.** No se requiere cabecera `Authorization` — el `acceptToken` del cuerpo autentica al destinatario.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `transferId` | string (UUID v4) | Sí | Identificador de la transferencia del enlace de correo (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "acceptToken": "x7T9vQ2mK4pR8sW1eB0nF3"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `acceptToken` | string | Sí | Token seguro incrustado en el enlace/correo de aceptación. Identifica y autentica al destinatario. |

## Respuestas de éxito

**200 OK** — transferencia aceptada, el destinatario ahora es el titular.

```json
{
  "status": "ACCEPTED",
  "tickets": [
    {
      "id": "3f2e1d0c-9b8a-4f6e-8d5c-4b3a2f1e0d9c",
      "code": "MC-2F8B5A7C",
      "qrDataUrl": "data:image/png;base64,iVBORw0KGgo..."
    }
  ],
  "newHolder": { "name": "Carlos Mendoza", "documentType": "CC", "documentNumber": "1017234567" }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `tickets[].code` | string | Nuevo código legible (QR nuevo — el anterior es inválido) |
| `tickets[].qrDataUrl` | string | URI `data:` para renderizar de inmediato las nuevas entradas del destinatario |
| `newHolder` | object | La identidad del destinatario tal como quedó registrada en la transferencia |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `INVALID_TOKEN` | `acceptToken` faltante/incorrecto → "El enlace de transferencia no es válido" |
| 403 | `FORBIDDEN` | Desajuste del destinatario — el documento del usuario con sesión no coincide con `recipient.documentNumber` → solicitar verificar la identidad |
| 404 | `NOT_FOUND` | Transferencia desconocida |
| 410 | `EXPIRED` | Transferencia vencida → "El enlace venció" |
| 410 | `ALREADY_ACCEPTED` | Ya aceptada → mostrar el estado actual (estado terminal similar a idempotente) |
| 410 | `REJECTED` | La transferencia fue rechazada por el remitente/destinatario → no se puede aceptar |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (§10) |

Ejemplo completo — vencida (`410`):

```json
{
  "error": {
    "code": "EXPIRED",
    "message": "Este enlace de transferencia ya venció y no puede aceptarse.",
    "requestId": "req_01HZG..."
  }
}
```

## Consideraciones de frontend
- **Pantalla de aterrizaje desde el enlace de correo**: renderizar el resumen de la transferencia (de `GET /tickets/transfer/{transferId}?acceptToken=...`), luego la acción de aceptar.
- **Si el destinatario es anónimo**: solicitar inicio de sesión o **registro** (sub-historia de HU-FE-017) *antes* de aceptar. Si se registra en el momento, devolverlo al mismo enlace para volver a aceptar. Aceptar requiere que la cuenta que acepta coincida con el documento `recipient` de la transferencia.
- En éxito: mostrar el **nuevo QR** más el mensaje de que el anterior es inválido; invalidar `["tickets"]` para el nuevo titular.
- En `410 ALREADY_ACCEPTED` → mostrar el estado actual (y la vista del nuevo titular) en lugar de un error.
- En desajuste `403` → pantalla de confirmación de identidad ("Este enlace fue emitido para otro documento").
- Mantener `acceptToken` en memoria/URL solo durante la sesión; nunca persistirlo (Notas de seguridad).

## Reglas de validación
- `acceptToken` no vacío; `transferId` un UUID v4 válido.
- Si el usuario tiene sesión, el documento de la cuenta autenticada debe coincidir con `recipient.documentNumber` antes de enviar.

## Reglas de negocio
- Aceptar **invalida de inmediato los QR del remitente** (los códigos antiguos dejan de otorgar ingreso); se emiten códigos nuevos al destinatario.
- `ACCEPTED` es terminal; la transferencia nunca puede revertirse a través de este endpoint.
- Si el destinatario es anónimo y no está registrado, la aceptación se bloquea hasta que se cree una cuenta y coincida con el documento del destinatario (regla de registro primero).

## Notas de seguridad
- `acceptToken` es la capacidad del destinatario — nunca almacenarlo, nunca enviarlo a través de analítica; eliminarlo de las URLs antes de salir de la pantalla de aceptación.
- No hay datos de tarjeta/dinero involucrados; la transferencia es solo movimiento de titular.
- El `documentNumber` del destinatario es dato personal sensible — verificar en el servidor, nunca registrarlo en el cliente.

## Flujo de ejemplo
```
El destinatario abre el enlace de correo (acceptToken en la URL)
↓
GET /tickets/transfer/{transferId}?acceptToken=... → resumen
↓
¿Anónimo? → iniciar sesión o registrarse (HU-FE-017) → volver al enlace
↓
POST /tickets/transfer/{transferId}/accept { acceptToken }
↓
200 → mostrar nuevo QR + "el QR anterior ya no es válido"
↓
Invalidar ["tickets"] (billetera del nuevo titular)
```
