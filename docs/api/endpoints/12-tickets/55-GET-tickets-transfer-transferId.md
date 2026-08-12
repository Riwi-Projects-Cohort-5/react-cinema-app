# GET /api/v1/tickets/transfer/{transferId}

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-017** — Transferencia de entradas. Alias de backlog: `GET /tickets/transfer/status` (rediseñado — el estado se lee del recurso de transferencia).

## Propósito
Devuelve el estado de una transferencia de entradas. Lo usa el **remitente** (después de enviar) para seguir la transferencia a través de PENDING → ACCEPTED/REJECTED/EXPIRED, y el **destinatario** (con el `acceptToken`) en la pantalla de aterrizaje para saber qué esperar antes de aceptar.

## Método HTTP
GET

## URL
`/api/v1/tickets/transfer/{transferId}` (URL completa: `https://api.multicine.com/api/v1/tickets/transfer/{transferId}`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3) como **remitente**, **o** acceso anónimo como **destinatario** pasando el parámetro de consulta `acceptToken`.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Condicional | `Bearer <accessToken>` — requerida salvo que se provea `acceptToken` |
| `Accept` | Recomendada | `application/json` |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `transferId` | string (UUID v4) | Sí | Identificador de la transferencia de `POST /tickets/transfer` (convenciones §8) |

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `acceptToken` | string | No | Token seguro del enlace de correo. Habilita la lectura anónima del **destinatario** (sin `Authorization`). |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK

```json
{
  "transferId": "5e4d3c2b-1a0f-4e9d-8c7b-6a5f4e3d2c1b",
  "status": "PENDING",
  "tickets": [
    { "id": "3f2e1d0c-9b8a-4f6e-8d5c-4b3a2f1e0d9c", "movieTitle": "El Último Horizonte", "functionAt": "2026-08-14T21:10:00Z", "seatLabel": "F-7" },
    { "id": "6e5f4a3b-2c1d-4e0f-9a8b-7c6d5e4f3a2b", "movieTitle": "El Último Horizonte", "functionAt": "2026-08-14T21:10:00Z", "seatLabel": "F-8" }
  ],
  "recipient": { "name": "Carlos Mendoza", "email": "carlos.mendoza@example.com" },
  "expiresAt": "2026-08-13T18:05:00Z",
  "acceptedAt": null
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `status` | enum | `PENDING` \| `ACCEPTED` \| `REJECTED` \| `EXPIRED` |
| `tickets[]` | array | Resumen (sin códigos QR aquí — los QR solo se revelan al titular / al aceptar) |
| `acceptedAt` | string \| null | ISO 8601 UTC (convenciones §7); se define cuando `ACCEPTED` |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | Ni remitente ni `acceptToken` válido → mostrar el estado de enlace inválido |
| 404 | `NOT_FOUND` | Transferencia desconocida |
| 410 | `EXPIRED` | Transferencia vencida antes de aceptar → el remitente ve "venció", el destinatario ve "el enlace venció" |
| 500 | `SERVER_ERROR` | Error con reintento (§13) |

Ejemplo completo — vencida (`410`):

```json
{
  "error": {
    "code": "EXPIRED",
    "message": "El enlace de transferencia venció y ya no puede aceptarse.",
    "requestId": "req_01HZF..."
  }
}
```

## Consideraciones de frontend
- **Vista del remitente**: consultar mientras `PENDING` con `refetchInterval: 15000` (convenciones §12); detenerse en el estado terminal. Mostrar insignias de estado "Pendiente / Aceptada / Rechazada / Vencida" con código de colores.
- Clave de TanStack Query `["ticketTransfers", transferId]`; para el destinatario pasar `acceptToken` como parte de la clave.
- **Aterrizaje del destinatario** (desde el enlace de correo): mostrar el resumen de película/función/asiento y el nombre del remitente antes de decidir aceptar.
- En `410 EXPIRED` → para el remitente, ofrecer "Reintentar transferencia" (nuevo `POST /tickets/transfer`); para el destinatario, mostrar "el enlace venció" sin acción de aceptar.
- Después del estado terminal, invalidar `["tickets"]` para que los cambios de titular se reflejen.

## Reglas de validación
- `transferId` debe ser un UUID v4 válido.
- Proveer exactamente un modo de acceso: `Authorization` (remitente) o `acceptToken` (destinatario) — nunca requerir ambos simultáneamente.

## Reglas de negocio
- `PENDING` → el remitente todavía posee las entradas (QR válido); aceptar transfiere la propiedad e invalida los QR antiguos.
- `REJECTED`/`EXPIRED` → las entradas vuelven/se quedan con el remitente en `ACTIVE` (si aún cumplen sus propias reglas de estado).
- `ACCEPTED` es terminal; desde entonces las entradas pertenecen al destinatario.

## Notas de seguridad
- `acceptToken` es una capacidad — concede la lectura de los metadatos de la transferencia a un llamador anónimo. Tratarlo como una contraseña en el código del cliente: mantenerlo en memoria/URL solo durante la sesión de aterrizaje, nunca registrarlo.
- Los QR de las entradas se omiten intencionalmente en esta lectura hasta la aceptación.

## Flujo de ejemplo
```
El remitente envía la transferencia → pantalla de éxito con enlace
↓
GET /tickets/transfer/{transferId} → PENDING
↓
Consultar cada 15 s (vista del remitente, insignias)
↓
El destinatario abre el enlace (acceptToken) → ve el resumen → acepta vía POST /accept
↓
La consulta resuelve ACCEPTED → remitente: "Aceptada", invalidar ["tickets"]
```
