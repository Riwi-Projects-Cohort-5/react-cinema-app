# GET /api/v1/functions/{functionId}/prices

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-009** — Selección de función y formato (matriz de precios y desglose de promociones durante la selección de sillas).

## Propósito
Devuelve la matriz de precios por tipo de silla más todas las promociones aplicables a la función (incluyendo Cine Flash y la información de descuento de membresía del usuario con sesión iniciada). Permite que el frontend recalcule el total en curso **sin recargar la página** a medida que se seleccionan los tipos de silla.

## Método HTTP
GET

## URL
`/api/v1/functions/{functionId}/prices` (URL completa: `https://api.multicine.com/api/v1/functions/{functionId}/prices`)

## Autenticación
Pública. Auth opcional: `membershipDiscount` solo se llena para un miembro autenticado; para peticiones anónimas es `null`.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Condicional | `Bearer <accessToken>` si hay sesión iniciada — habilita `membershipDiscount` (convenciones §2, §3) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` — localiza los campos `description` |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `functionId` | string (UUID v4) | Sí | Id de la función (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK

```json
{
  "currency": "COP",
  "basePrices": [
    { "seatType": "GENERAL", "price": { "amount": 16500, "currency": "COP" } },
    { "seatType": "PREFERENTIAL", "price": { "amount": 20500, "currency": "COP" } },
    { "seatType": "VIP", "price": { "amount": 28500, "currency": "COP" } }
  ],
  "promotions": [
    {
      "type": "PERCENT",
      "discountPercent": 10,
      "description": "10% de descuento en funciones antes de las 5:00 p.m.",
      "appliesTo": "TICKETS",
      "rules": "Válido solo de lunes a jueves"
    }
  ],
  "membershipDiscount": {
    "active": true,
    "description": "5% adicional por ser miembro CineClub"
  },
  "cineFlash": { "active": true, "discountPercent": 20, "maxTicketsPerPurchase": 3 }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `currency` | string | Siempre `COP` (convenciones §6) |
| `basePrices` | array | `{ seatType, price }` con `seatType` en `GENERAL` \| `PREFERENTIAL` \| `VIP`; los montos son COP enteros |
| `promotions` | array | Promociones aplicables. `type` es `PERCENT` (tiene `discountPercent`) o `FIXED` (tiene `amount`, COP entero). `appliesTo` es `TICKETS` \| `SNACKS`; `rules` es legible para humanos |
| `membershipDiscount` | object \| null | `active` + `description` cuando el usuario califica; `null` para anónimos o no miembros |
| `cineFlash` | object \| null | `{ active, discountPercent: 20, maxTicketsPerPurchase: 3 }` o `null` cuando no está activo |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `404`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Formato de `functionId` inválido | Mostrar error genérico; bloquear el flujo de compra |
| 404 | `NOT_FOUND` | La función no existe / no es comprable | "La función ya no está disponible" + volver a la película |
| 500 | `SERVER_ERROR` | Falla inesperada del backend | Error recuperable con reintento (§13) |

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "La función no está disponible",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **El total en curso se recalcula en el cliente a medida que se seleccionan los tipos de silla** — solo aritmética de COP enteros (convenciones §6); nunca flotantes. Suma `basePrice × count` y luego aplica los descuentos aplicables (Cine Flash y/o promos percent/fixed).
- Mostrar una línea de promo **"Ahorras $X"** (Δ entre el monto base y el descontado) una vez que aplique cualquier descuento.
- Cine Flash → badge **"−20%"** + aviso **"Máximo 3 entradas por compra"** (usa `cineFlash.maxTicketsPerPurchase`).
- Clave de TanStack Query `["functionPrices", functionId]`; `staleTime` ~5 min (los precios son estables); re-consultar cuando cambie la membresía del usuario.
- Auth opcional: envía el token cuando exista para que `membershipDiscount` refleje la realidad; trata las secciones `null` como "no aplica".
- Skeleton de carga para la matriz de precios; error → reintento sin perder las sillas ya seleccionadas.

## Reglas de validación
- `functionId` UUID v4 válido.
- Antes de enviar cualquier dinero al backend después (carrito), siempre re-derivar los totales desde el carrito del servidor — nunca solo desde esta estimación del cliente.

## Reglas de negocio
- **Cine Flash: 20% de descuento solo en boletas**, **no acumulable** con otras promociones — si `cineFlash.active`, mostrar Cine Flash como el descuento aplicado e ignorar `promotions` para boletas (aún mostrarlas como informativas).
- `membershipDiscount` **se reporta aquí pero se aplica después en el carrito** (`POST /cart/apply-membership`) — mostrarlo como vista previa, no como total final.

## Notas de seguridad
- Endpoint público; `membershipDiscount` solo revela si el usuario actual califica, nunca detalles de la cuenta.
- Los montos son datos autoritativos del servidor — nunca codifiques un porcentaje en el cliente para el precio final.

## Flujo de ejemplo
1. La pantalla de selección de sillas se monta → `GET /api/v1/functions/5e7a4f1b-.../prices` (con token si hay sesión).
2. El usuario selecciona 2 sillas VIP → el cliente calcula `2 × 28500`.
3. Cine Flash activo → el cliente aplica 20% → muestra "Ahorras $11.400" + "Máximo 3 entradas".
4. El usuario continúa → el carrito (servidor) re-deriva el total autoritativo, incluyendo cualquier descuento de membresía.
