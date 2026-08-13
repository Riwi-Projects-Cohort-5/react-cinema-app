# GET /api/v1/reservations/summary

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-010** — Selección interactiva de sillas.

## Propósito
Devuelve el hold de sillas activo actual del usuario junto con su película, función, totales y cualquier promoción aplicada. Se usa para **restaurar el estado de selección de sillas/checkout** cuando el usuario recarga la página o vuelve a mitad de la compra — el frontend reconstruye la UI a partir de esta única respuesta en lugar de recordar algo localmente.

## Método HTTP
GET

## URL
`/api/v1/reservations/summary` (URL completa: `https://api.multicine.com/api/v1/reservations/summary`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §3) |
| `Accept-Language` | Opcional | `es` — localiza `classification.label` |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — hold activo restaurado (o `hold: null`).

```json
{
  "hold": {
    "id": "ab1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e",
    "functionId": "9a8b7c6d-5e4f-4a3b-8c9d-1e2f3a4b5c6d",
    "expiresAt": "2026-08-10T20:40:00Z",
    "remainingSeconds": 412,
    "seats": [
      {
        "seatId": "11111111-1111-4111-8111-111111111112",
        "seatLabel": "F12",
        "seatType": "STANDARD",
        "price": { "amount": 16500, "currency": "COP" }
      },
      {
        "seatId": "11111111-1111-4111-8111-111111111113",
        "seatLabel": "F13",
        "seatType": "STANDARD",
        "price": { "amount": 16500, "currency": "COP" }
      }
    ]
  },
  "movie": {
    "id": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f",
    "title": "El Último Horizonte",
    "posterUrl": "https://cdn.multicine.com/posters/el-ultimo-horizonte.jpg",
    "classification": { "code": "B15", "label": "Mayores de 15 años" }
  },
  "function": {
    "startAt": "2026-08-10T20:30:00Z",
    "endAt": "2026-08-10T22:52:00Z",
    "format": "2D",
    "cinema": { "id": "c1a2b3c4-5d6e-7f80-9a1b-2c3d4e5f6a7b", "name": "Cine Colombia Santafé" },
    "room": { "id": "r1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d", "name": "Sala 7" }
  },
  "totals": {
    "subtotal": { "amount": 33000, "currency": "COP" },
    "discounts": { "amount": 6600, "currency": "COP" },
    "taxes": { "amount": 0, "currency": "COP" },
    "total": { "amount": 26400, "currency": "COP" }
  },
  "promotionApplied": { "type": "CINEFLASH", "discountPercent": 20, "maxTickets": 3 }
}
```

Variante vacía — sin hold activo (las pantallas de mapa de sillas/checkout deben redirigir):

```json
{
  "hold": null,
  "movie": null,
  "function": null,
  "totals": null,
  "promotionApplied": null
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `hold` | object \| null | Hold activo actual; `null` cuando no hay ninguno (expirado, liberado o consumido) |
| `hold.remainingSeconds` | integer | Tiempo restante calculado por el servidor — maneja la cuenta regresiva desde esto (evita desviaciones de reloj, §7) |
| `totals` | object | Subtotal de boletas menos la promoción, antes de los cambios de carrito/IVA (convenciones §6) |
| `promotionApplied` | object \| null | p. ej. `CINEFLASH` con `discountPercent: 20`, `maxTickets: 3` |
| `taxes` | object | 0 en esta etapa — el IVA aplica a la confitería del carrito; las boletas están exentas |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `401`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` etc. | Problemas de sesión — interceptor (§3) | Refresco silencioso / redirigir al login |
| 500 | `SERVER_ERROR` | Falla inesperada | Error recuperable con reintento (§13) |

Ejemplo completo:

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Ocurrió un error inesperado. Intenta de nuevo.",
    "requestId": "req_01HZ5MKQ8VX2Z"
  }
}
```

## Consideraciones de frontend
- Llamar **al montar** las pantallas de selección de sillas y checkout; reconstruir las sillas seleccionadas y la cuenta regresiva desde `hold` — nunca confíes en el almacenamiento local.
- Cuenta regresiva: calcular desde `remainingSeconds` (delta del servidor) — no guardar un momento de selección y calcular localmente (§7).
- **Estado vacío** (`hold: null`): mostrar "Tu reserva expiró o no existe" y redirigir a la página de la película/funciones.
- "Continuar" → `POST /api/v1/cart` con `hold.id`.
- Mostrar el banner de promoción cuando `promotionApplied.type === "CINEFLASH"` ("Cine Flash: 20% off en boletas, máx. 3").
- Clave `["reservations", "summary"]`; re-consultar al enfocar la ventana (un hold pudo expirar en otro lugar).

## Reglas de validación
- Ninguna — solo lectura; pero condiciona la pantalla de selección de sillas a esta llamada para que el mapa nunca muestre una selección vacía intermitente.

## Reglas de negocio
- **Un hold activo por usuario**; crear un nuevo hold reemplaza al anterior.
- Ciclo de vida hold/carrito: hold (10 min) → carrito (10 min desde el hold). Este endpoint refleja solo la etapa del hold.
- Cine Flash: 20% de descuento solo en boletas, máximo 3 boletas, no acumulable.

## Notas de seguridad
- Autenticado y limitado al llamador — devuelve el hold *del* usuario, nunca el de otro.
- Sin datos sensibles más allá de lo que el usuario ya seleccionó.

## Flujo de ejemplo
1. El usuario recarga la página de selección de sillas a mitad de la compra.
2. `GET /api/v1/reservations/summary` → `hold` presente con 412 s restantes.
3. Las sillas F12/F13 se re-renderizan seleccionadas; la cuenta regresiva reanuda en 06:52.
4. El usuario hace clic en "Continuar" → `POST /api/v1/cart` con `holdId`.
