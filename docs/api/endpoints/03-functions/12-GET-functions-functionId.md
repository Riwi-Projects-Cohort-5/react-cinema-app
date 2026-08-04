# GET /api/v1/functions/{functionId}

## Historia de usuario relacionada
- **HU-FE-009** — Selección de función y formato. Alimenta el panel de resumen de compra durante la selección de sillas y la restauración de estado tras un refresco.

## Propósito
Devuelve el contexto completo de una sola función: película, cine, sala, horario, estado, disponibilidad de sillas y precios base. Es el payload de referencia para el resumen de compra y para restaurar el estado de selección de sillas tras un refresco de página — el frontend nunca debe reconstruir estos datos solo desde el estado de navegación.

## Método HTTP
GET

## URL
`/api/v1/functions/{functionId}` (URL completa: `https://api.multicine.com/api/v1/functions/{functionId}`)

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza los labels de cine/ciudad/clasificación |

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
  "id": "5e7a4f1b-2c3d-4e5f-9a8b-0c1d2e3f4a5b",
  "movie": {
    "id": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f",
    "title": "El Último Horizonte",
    "posterUrl": "https://cdn.multicine.com/posters/el-ultimo-horizonte.jpg",
    "classification": { "code": "B15", "label": "Mayores de 15 años" }
  },
  "cinema": {
    "id": "6c8b0f3e-4d5e-4a6b-8c7d-0e1f2a3b4c5d",
    "name": "Multicine El Tesoro",
    "address": "Cra 25A #1A Sur-45, El Poblado",
    "city": "Medellín"
  },
  "room": { "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", "name": "Sala 3", "type": "STANDARD" },
  "format": "2D",
  "language": { "mode": "SUBBED" },
  "startAt": "2026-08-10T20:30:00Z",
  "endAt": "2026-08-10T22:52:00Z",
  "status": "AVAILABLE",
  "seatAvailability": { "total": 120, "available": 88, "sold": 29, "locked": 3 },
  "prices": {
    "base": [
      { "seatType": "GENERAL", "price": { "amount": 16500, "currency": "COP" } },
      { "seatType": "PREFERENTIAL", "price": { "amount": 20500, "currency": "COP" } },
      { "seatType": "VIP", "price": { "amount": 28500, "currency": "COP" } }
    ]
  },
  "isCineFlash": true,
  "maxTicketsPerPurchase": 3
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Convenciones §8 |
| `status` | enum | `AVAILABLE` \| `STARTED` \| `CANCELLED` \| `SOLD_OUT` |
| `seatAvailability` | object | `{ total, available, sold, locked }` — `locked` cuenta los holds con tiempo límite de otros usuarios |
| `prices.base` | array | Precio base por `seatType` (`GENERAL` \| `PREFERENTIAL` \| `VIP`), COP entero (convenciones §6). Las promociones NO se aplican aquí — ver `GET /functions/{functionId}/prices`. |
| `isCineFlash` | boolean | `true` → 20% de descuento en boletas, máx. 3 por compra |
| `maxTicketsPerPurchase` | integer | Límite aplicado en el paso de selección de sillas |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `404`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Formato de `functionId` inválido | Mostrar error genérico; bloquear el flujo de compra |
| 404 | `NOT_FOUND` | La función no existe / no es comprable | "La función ya no está disponible" + volver a la película |
| 500 | `SERVER_ERROR` | Falla inesperada del backend | Error genérico reintentable (§13) |

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
- Se renderiza como **panel de resumen** durante la selección de sillas (película, cine, sala, fecha/hora, disponibilidad de sillas, precios base).
- **Deshabilitar "Continuar" cuando `status` es `STARTED`, `CANCELLED` o `SOLD_OUT`**; si el estado cambia mientras el usuario selecciona sillas, mostrar una advertencia y bloquear el flujo.
- Se usa para **restaurar el estado tras un refresco**: lee `functionId` de la ruta, consulta este endpoint y re-renderiza el resumen + precios sin necesitar el payload original de navegación.
- Clave de TanStack Query `["function", functionId]`; `staleTime` ~60 s; `refetchOnWindowFocus: true` (estado/disponibilidad volátiles).
- Skeleton mientras carga; error recuperable + reintento; banner sin conexión (§13).

## Reglas de validación
- `functionId` debe ser un UUID v4 válido.
- Comparar `startAt` (UTC, convenciones §7) contra `Date.now()` para bloquear funciones que empiezan dentro de la sesión.

## Reglas de negocio
- Los precios aquí son **precios base antes de cualquier promoción**; los descuentos Cine Flash/otros se resuelven vía el endpoint de precios y el carrito.
- `isCineFlash` + `maxTicketsPerPurchase` aplican la regla de **máximo 3 boletas** en el paso de selección de sillas.

## Notas de seguridad
- Endpoint público; sin datos personales.
- El servidor es la fuente de verdad para `status`/disponibilidad — nunca confíes en un mapa de sillas cacheado sobre una lectura fresca de la función.

## Flujo de ejemplo
1. El usuario toca "Comprar" en una función → ruta `/funciones/5e7a4f1b-...`.
2. `GET /api/v1/functions/5e7a4f1b-...` → panel de resumen + precios base renderizan.
3. El usuario refresca la página → `functionId` desde la ruta restaura el resumen vía este endpoint.
4. Si la función se volvió `SOLD_OUT` mientras tanto → "Continuar" deshabilitado con una advertencia.
5. El usuario continúa → `GET /functions/{functionId}/seats` carga el mapa de sillas.
