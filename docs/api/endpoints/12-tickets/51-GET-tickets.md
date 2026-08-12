# GET /api/v1/tickets

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-014** — Entradas digitales y factura. La billetera "Mis entradas" para el titular actual de la entrada, con filtros y paginación.

## Propósito
Devuelve las entradas del usuario autenticado (solo las que **posee** actualmente) en todos los pedidos, con filtros por pedido y estado. Cada fila tiene lo suficiente para renderizar la lista de la billetera, las pestañas de estado y el modal de vista de QR sin llamadas adicionales.

## Método HTTP
GET

## URL
`/api/v1/tickets` (URL completa: `https://api.multicine.com/api/v1/tickets`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Siempre acotado al usuario autenticado (titular actual).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; los mensajes de error son localizados por el backend) |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `orderId` | string (UUID v4) | No | Filtrar a las entradas de un solo pedido |
| `status` | enum | No | `ACTIVE` \| `USED` \| `INVALIDATED` \| `TRANSFERRED` \| `EXPIRED` |
| `sortBy` | enum | No | `functionAt` (por defecto — las más próximas primero) |
| `sortOrder` | enum | No | `asc` \| `desc` (por defecto `asc`, §5) |
| `page` | integer | No | Base 1 (por defecto `1`, §5) |
| `pageSize` | integer | No | Máximo 100 (por defecto `20`, §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Envoltorio paginado según convenciones §5.

```json
{
  "data": [
    {
      "id": "3f2e1d0c-9b8a-4f6e-8d5c-4b3a2f1e0d9c",
      "orderId": "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
      "movieTitle": "El Último Horizonte",
      "functionAt": "2026-08-14T21:10:00Z",
      "cinemaName": "Multicine El Tesoro",
      "roomName": "Sala 3",
      "seatLabel": "F-7",
      "format": "IMAX",
      "code": "MC-8D4FA2B1",
      "qrDataUrl": "data:image/png;base64,iVBORw0KGgo...",
      "status": "ACTIVE",
      "canTransfer": true,
      "canRegenerate": true
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 5, "totalPages": 1 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Para `GET /tickets/{ticketId}` (convenciones §8) |
| `status` | enum | `ACTIVE` \| `USED` \| `INVALIDATED` \| `TRANSFERRED` \| `EXPIRED` — controla la pestaña y la insignia |
| `canTransfer` | boolean | Solo `true` para `ACTIVE`, dentro de la ventana de transferencia; habilita la selección múltiple de transferencia |
| `canRegenerate` | boolean | Solo `true` para `ACTIVE`, con regeneraciones restantes > 0 |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 500 | `SERVER_ERROR` | Error recuperable con reintento (§13) |

Ejemplo completo — falla del servidor (`500`):

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Ocurrió un error inesperado. Intenta de nuevo.",
    "requestId": "req_01HZB..."
  }
}
```

## Consideraciones de frontend
- Billetera "Mis entradas" con **pestañas de filtro** por estado (Activas / Usadas / Invalidadas / Transferidas / Expiradas) que se mapean al parámetro `status`.
- Clave de TanStack Query `["tickets", { orderId, status, page, pageSize, sort }]`; `keepPreviousData` para la paginación (§5, §12).
- Carga → esqueletos de tarjeta (§13); **estado vacío** por pestaña, p. ej. "Aún no tienes entradas" / "No hay entradas transferidas".
- El modal de vista de QR se abre desde una fila usando `qrDataUrl`; las filas en estado no `ACTIVE` muestran una insignia en lugar de acciones.
- **Solo las entradas `ACTIVE` muestran las acciones `canTransfer`/`canRegenerate`** (se verifican contra las banderas, no se asumen).
- Después de las acciones de regenerar/transferir/aceptar, invalidar `["tickets"]` (y la clave del pedido) para que los estados se actualicen.
- `functionAt` en UTC (convenciones §7) → mostrar en `America/Bogota`; las insignias de próximos ("Hoy", "Mañana") se calculan en el cliente.

## Reglas de validación
- Validar `status` contra `ACTIVE|USED|INVALIDATED|TRANSFERRED|EXPIRED`.
- `orderId` debe ser un UUID v4 válido al filtrar.
- Limitar `pageSize ≤ 100` (§5).

## Reglas de negocio
- Solo aparecen las entradas que el usuario **posee actualmente** — las entradas transferidas salen de la billetera del remitente (pasan a ser del destinatario).
- El estado lo deriva el servidor: `EXPIRED` después de que pase la hora de la función; `USED` después de la validación en puerta; `INVALIDATED` después de regenerar/cambiar/aceptar transferencia.
- Las acciones de transferir y regenerar solo están disponibles en entradas `ACTIVE` dentro de sus ventanas.

## Notas de seguridad
- Acotado al propietario (titular actual); `code` otorga el acceso — nunca registrarlo ni compartirlo fuera de la vista de QR.
- `qrDataUrl` se renderiza a demanda; trátalo como sensible (es la credencial de ingreso).

## Flujo de ejemplo
```
El usuario abre "Mis entradas"
↓
GET /tickets (por defecto: ACTIVE primero, por functionAt)
↓
Esqueletos → tarjetas de entrada
↓
Pestaña "Transferidas" → volver a consultar con status=TRANSFERRED
↓
Toca una tarjeta → GET /tickets/{ticketId} detalle / modal QR
```
