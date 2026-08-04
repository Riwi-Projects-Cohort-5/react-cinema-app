# GET /api/v1/giftcards

## Historia de usuario relacionada
- **HU-FE-018** — Bonos de regalo digitales. Listado de los bonos de regalo comprados/recibidos por el usuario; la compra es `POST /giftcards`, la consulta de saldo es `GET /giftcards/{code}`, el canje es `POST /giftcards/redeem`.

## Propósito
Devuelve los bonos de regalo del usuario autenticado (comprados y recibidos), cada uno con su monto, saldo actual, estado, vencimiento y el código/QR para usarlos. Alimenta la sección "Mis bonos" con información de saldo + vencimiento y una revelación de "ver código/QR".

## Método HTTP
GET

## URL
`/api/v1/giftcards` (URL completa: `https://api.multicine.com/api/v1/giftcards`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Devuelve los bonos de regalo del propio usuario autenticado.

## Cabeceras
| Cabecera | ¿Requerida? | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; etiquetas localizadas) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, repetido por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | ¿Requerido? | Descripción |
|---|---|---|---|
| `status` | enum | No | Filtrar por `ACTIVE` \| `REDEEMED` \| `EXPIRED` \| `PENDING_PAYMENT`. Si está ausente → todos. |
| `page` | integer | No | Número de página basado en 1 (por defecto `1`, convenciones §5) |
| `pageSize` | integer | No | Elementos por página, máximo 100 (por defecto `20`, convenciones §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — listado paginado (sobre según convenciones §5).

```json
{
  "data": [
    {
      "id": "8c7b6a59-4d3e-4f2a-8b1c-9d0e1f2a3b4c",
      "code": "MC-7F3K-9QX2",
      "amount": { "amount": 80000, "currency": "COP" },
      "balance": { "amount": 45000, "currency": "COP" },
      "status": "ACTIVE",
      "expiresAt": "2026-12-31",
      "recipientName": "Camila Gómez",
      "sendAt": "2026-08-25",
      "qrDataUrl": "https://cdn.multicine.com/qr/mc-7f3k-9qx2.png"
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 3, "totalPages": 1 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Convenciones §8 |
| `code` | string \| null | Código del bono; `null` mientras esté `PENDING_PAYMENT` |
| `amount` / `balance` | object | Entero COP (convenciones §6); `balance` ≤ `amount` y disminuye a medida que se usa |
| `status` | enum | `ACTIVE` \| `REDEEMED` \| `EXPIRED` \| `PENDING_PAYMENT` |
| `expiresAt` | string `YYYY-MM-DD` \| null | Fin del período de validez del bono |
| `recipientName` | string | Para quién era el bono (puede ser el mismo usuario) |
| `sendAt` | string `YYYY-MM-DD` \| null | Fecha de envío programado/real |
| `qrDataUrl` | string \| null | URL de la imagen QR para el modal de revelación; `null` mientras esté `PENDING_PAYMENT` |

## Respuestas de error
Todos los errores usan el sobre de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 429 | `RATE_LIMITED` | Respeta `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — falla inesperada (`500`):

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Ocurrió un error inesperado. Intenta de nuevo.",
    "requestId": "req_01HZF..."
  }
}
```

## Consideraciones de frontend
- **Filas del listado**: monto y `balance` restante formateados en COP, fecha de vencimiento, insignia de estado. Las filas `PENDING_PAYMENT` muestran "Pago pendiente" con un CTA para reanudar el pago.
- **Modal "Ver código / QR"**: abrir solo para bonos `ACTIVE` usando `code` + `qrDataUrl`; revelar el código con botón de copiar. Nunca renderizar código/QR para `PENDING_PAYMENT` (de todos modos son `null`).
- Estado vacío → "Aún no tienes bonos de regalo" con un CTA para comprar uno (`POST /giftcards`).
- Clave de TanStack Query `["giftcards", { status, page, pageSize }]`; `keepPreviousData` para la paginación (§5).
- Invalidar `["giftcards"]` después de que se apruebe el pago de una compra, después de canjear, y después de aplicar un bono en el carrito.
- Skeleton mientras carga; error recuperable → mensaje + reintento; sin conexión → banner + reintento (§13).

## Reglas de validación
- `page ≥ 1`, `pageSize` limitado a `[1, 100]` (convenciones §5).
- `status` se envía solo con un valor de enum válido.

## Reglas de negocio
- Los bonos **expiran después de un período de validez** (`expiresAt`); una vez expirados son inutilizables y se muestran como `EXPIRED`.
- **El saldo disminuye a medida que el bono se canjea/se usa** (`balance` < `amount` después de un uso parcial; `REDEEMED` cuando se consume por completo).
- Los bonos `PENDING_PAYMENT` nunca llevan código/QR; solo lo obtienen una vez que el pago asociado es aprobado.

## Notas de seguridad
- Solo el propietario ve sus bonos de regalo; `code`/`qrDataUrl` son sensibles — revelarlos en un modal bajo demanda, nunca registrarlos ni almacenarlos a largo plazo.
- No persistas `code`/`qrDataUrl` en analíticas ni en reportes de errores.

## Flujo de ejemplo
1. "Mis bonos" se monta → `GET /api/v1/giftcards?page=1` → filas con saldo + vencimiento.
2. Una fila `PENDING_PAYMENT` muestra "Pago pendiente" → reanudar el flujo de pago.
3. El usuario toca "Ver código" en un bono `ACTIVE` → modal con QR + código + botón de copiar.
4. El bono se usa parcialmente en el carrito → `balance` disminuye en la siguiente consulta (`["giftcards"]` invalidado).
5. El bono se usa por completo → el estado cambia a `REDEEMED`.
