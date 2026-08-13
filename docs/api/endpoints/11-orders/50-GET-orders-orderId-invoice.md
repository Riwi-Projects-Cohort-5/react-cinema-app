# GET /api/v1/orders/{orderId}/invoice

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-014** — Entradas digitales y factura. Alias del backlog: `GET /invoice/{id}` (rediseñado — la factura vive bajo la orden a la que pertenece).

## Propósito
Sirve la factura de la orden en dos formatos con un solo endpoint: los **metadatos JSON** por defecto, o el **binario PDF** cuando `format=pdf`. La descarga del PDF (`Content-Disposition: attachment`) es lo que dispara el botón "Descargar factura"; el JSON se usa para previsualizar la factura en pantalla.

## Método HTTP
GET

## URL
`/api/v1/orders/{orderId}/invoice` (URL completa: `https://api.multicine.com/api/v1/orders/{orderId}/invoice`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Solo propietario.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendado | `application/json` (o `application/pdf` para la descarga) |

## Parámetros de ruta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `orderId` | string (UUID v4) | Sí | Id de la orden (convenciones §8) |

## Parámetros de consulta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `format` | enum | No | `pdf` → PDF binario con `Content-Disposition: attachment; filename=factura-{orderNumber}.pdf`; ausente → metadatos JSON |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — metadatos JSON de la factura (por defecto).

```json
{
  "invoiceId": "c1b2a3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "invoiceNumber": "FAC-2026-008321",
  "orderNumber": "ORD-2026-000123",
  "issuedAt": "2026-08-10T18:07:42Z",
  "merchant": { "name": "Multicine S.A.S.", "NIT": "900.123.456-7" },
  "items": [
    { "description": "Entrada IMAX - El Último Horizonte", "quantity": 2, "unitPrice": { "amount": 20500, "currency": "COP" } },
    { "description": "Combo Familiar", "quantity": 1, "unitPrice": { "amount": 15200, "currency": "COP" } }
  ],
  "taxes": { "amount": 0, "currency": "COP" },
  "total": { "amount": 48200, "currency": "COP" },
  "downloadUrl": "https://api.multicine.com/api/v1/orders/9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d/invoice?format=pdf"
}
```

**200 OK — PDF** (cuando `format=pdf`): binario `application/pdf` crudo, cabeceras:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=factura-ORD-2026-000123.pdf
```

| Campo | Tipo | Notas |
|---|---|---|
| `invoiceNumber` | string | Número de factura legible para humanos (convenciones §8; no es un UUID) |
| `items[].unitPrice` | object | COP entero (convenciones §6) |
| `taxes` | object | IVA según las reglas de facturación; `0` cuando está exento |
| `downloadUrl` | string | Enlace de conveniencia para que el cliente construya la petición del PDF |

## Respuestas de error
Todos los errores usan el envelope de las convenciones §4 (peticiones JSON; los fallos de descarga binaria cruda se manejan en la capa HTTP). Códigos relevantes:

| HTTP | Code | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No propietario → "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | La orden aún no tiene factura → deshabilitar el CTA de descarga |
| 500 | `SERVER_ERROR` | Error reintentable; toast + reintento en la descarga |

Ejemplo completo — prohibido (`403`):

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para descargar esta factura",
    "requestId": "req_01HZA..."
  }
}
```

## Consideraciones de frontend
- **"Descargar factura"** → petición con `format=pdf` y `responseType: 'blob'` (mediante el cliente HTTP centralizado), luego dispara la descarga del navegador desde el blob; nombra el archivo según el filename de `Content-Disposition` o `factura-{orderNumber}.pdf`.
- Muestra un toast en caso de éxito ("Factura descargada") y en caso de fallo con una acción de **reintento** (error recuperable §13).
- La misma descarga está disponible desde la lista de `GET /orders` (`invoiceId` presente → se muestra el CTA).
- Vista previa JSON: renderiza items, merchant y totales; el dinero formateado como COP sin decimales (§6).
- TanStack Query: metadatos JSON con clave `["orders", orderId, "invoice"]`; el PDF es una descarga de un solo uso — no almacenes el blob en caché.

## Reglas de validación
- `orderId` debe ser un UUID v4 válido.
- `format` debe ser `pdf` o estar ausente.

## Reglas de negocio
- La factura existe para toda orden con al menos un item pagado; se crea en la confirmación de la orden.
- `total` siempre equivale al total pagado de la orden (§6 COP entero).
- Una factura por orden; los cambios de función se reflejan como items de línea/notas separados, no como una factura nueva.

## Notas de seguridad
- Alcance por propietario (403 en caso contrario) — las facturas contienen datos personales de compra (el NIT es del comercio, no del usuario).
- La descarga del PDF sigue requiriendo `Authorization`; no debe ser accesible sin el token.

## Flujo de ejemplo
```
Detalle de la orden → "Descargar factura" (o fila de GET /orders)
↓
GET /orders/{orderId}/invoice?format=pdf (responseType: blob)
↓
Blob → descarga con anchor como factura-ORD-2026-000123.pdf
↓
Toast "Factura descargada" (fallo → toast + reintento)
```
