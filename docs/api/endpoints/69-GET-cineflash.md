# GET /api/v1/cineflash

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-019** — Cine Flash. Feed a nivel de promoción: reglas, ventana de tiempo y funciones con descuento vigentes. La lista de tarjetas de películas la sirve `GET /movies/cineflash` (este endpoint es el feed del banner/términos).

## Propósito
Devuelve la promoción **Cine Flash** activa: las reglas (20 % de descuento en entradas, máximo 3, no acumulable), su ventana de tiempo con una cuenta regresiva calculada por el servidor, y las funciones con descuento por ciudad. Alimenta el banner de la promoción, los términos "no acumulable" y la cuenta regresiva que oculta el banner cuando termina la ventana.

## Método HTTP
GET

## URL
`/api/v1/cineflash` (URL completa: `https://api.multicine.com/api/v1/cineflash`)

## Autenticación
- Pública. No se requiere token.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza `terms` y los títulos de películas |
| `X-Request-Id` | Opcional | UUID generado por el cliente, que el servidor repite para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `cityId` | string (UUID v4) | **Sí** | Ámbito de ciudad — las funciones y la ventana de Cine Flash son específicas por ciudad |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — estado de la promoción para la ciudad (cuando la promoción no está vigente, `active` es `false` y `functions` está vacío).

```json
{
  "active": true,
  "discountPercent": 20,
  "maxTicketsPerPurchase": 3,
  "notAccumulableWith": ["MEMBERSHIP", "GIFT_CARD"],
  "window": { "startAt": "2026-08-03T15:00:00Z", "endAt": "2026-08-03T23:30:00Z" },
  "remainingSeconds": 9000,
  "terms": "Aplica únicamente a entradas de cine. Máximo 3 entradas por compra. No acumulable con otras promociones, descuentos de membresía ni bonos de regalo.",
  "functions": [
    {
      "movie": {
        "id": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f",
        "title": "El Último Horizonte",
        "posterUrl": "https://cdn.multicine.com/posters/el-ultimo-horizonte.jpg"
      },
      "functionId": "5e7a4f1b-2c3d-4e5f-9a8b-0c1d2e3f4a5b",
      "cinema": { "id": "c1d2e3f4-5a6b-4c7d-8e9f-0a1b2c3d4e5f", "name": "Multicine Unicentro" },
      "format": "2D",
      "startAt": "2026-08-03T21:10:00Z",
      "previousPrice": { "amount": 22000, "currency": "COP" },
      "cineflashPrice": { "amount": 17600, "currency": "COP" },
      "remainingTickets": 47
    }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `active` | boolean | `false` cuando la ventana de la promoción no ha comenzado o ya terminó para esta ciudad |
| `discountPercent` | integer | Siempre `20` (regla de Cine Flash) |
| `maxTicketsPerPurchase` | integer | Siempre `3` |
| `notAccumulableWith` | string[] | Otros descuentos con los que esta promoción no se puede acumular, p. ej. `["MEMBERSHIP", "GIFT_CARD"]` |
| `window.startAt` / `window.endAt` | string ISO-8601 UTC | Ventana de tiempo de la promoción (convenciones §7) |
| `remainingSeconds` | integer | Segundos calculados por el servidor hasta `window.endAt` (a salvo del desfase de reloj, §7) |
| `terms` | string | Se muestra tal cual; declara explícitamente "no acumulable" |
| `functions[]` | array | Funciones con descuento con `movie`, `functionId` (→ `GET /functions/{functionId}`), `cinema`, `format`, `startAt`, `previousPrice`/`cineflashPrice` enteros en COP (§6) y `remainingTickets` |

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4. Códigos relevantes:

| HTTP | Código | Escenario | Comportamiento del frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Petición mal formada | Error recuperable con reintento |
| 422 | `VALIDATION_ERROR` | `cityId` faltante o inválido | Abrir el asistente de ubicación (`details` sobre `cityId`) |
| 429 | `RATE_LIMITED` | Demasiadas peticiones | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Fallo inesperado | Error genérico con reintento (§13) |

Ejemplo completo — ciudad faltante (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El parámetro cityId es obligatorio",
    "details": [
      { "field": "cityId", "message": "Debes seleccionar una ciudad para ver la promoción Cine Flash" }
    ],
    "requestId": "req_01HZJ..."
  }
}
```

## Consideraciones de frontend
- **Banner**: titular "Cine Flash −20%" + `terms` tal cual; insignia "no acumulable" en el banner.
- **Cuenta regresiva** calculada desde `remainingSeconds` (y `window.endAt`) contra `Date.now()` — nunca un temporizador solo del cliente (convenciones §7). Re-render cada segundo.
- **Refrescar cada 30–60 s** vía `refetchInterval` y `refetchOnWindowFocus: true` (la ventana es limitada en tiempo y volátil).
- Cuando `active` cambia a `false` o la cuenta regresiva llega a cero: **ocultar el banner** e `invalidateQueries(["cineflash"])` (prefijo — coincide con la clave con ámbito de ciudad `["cineflash", cityId]`) además de `invalidateQueries(["movies", "cineflash"])` para que las insignias de las tarjetas de películas desaparezcan.
- Las insignias de las tarjetas de películas las impulsa `GET /movies/cineflash`; mantén ambos feeds sincronizados al invalidar.
- Clave de TanStack Query `["cineflash", cityId]`; `staleTime` ~30 s.
- Skeleton mientras carga; sin conexión → banner + reintento (§13); sin promoción → no mostrar nada (no renderizar un banner vacío).

## Reglas de validación
- `cityId` es requerido y debe ser un UUID v4 válido antes de enviar.
- No acotar nada aquí (no hay paginación); renderizar siempre la cuenta regresiva desde `remainingSeconds`, no desde un temporizador local.
- Cuando `active === false`, no renderizar visuales de la promoción aunque existan `functions` en caché desactualizadas.

## Reglas de negocio
- Cine Flash es **20 % de descuento SOLO en ENTRADAS** (nunca en snacks), **máximo 3 entradas por compra**, **no acumulable** con otras promociones, descuentos de membresía ni tarjetas de regalo.
- El descuento definitivo se aplica en el servidor en el carrito; este feed es informativo.
- `active`, la ventana y `remainingSeconds` son específicos por ciudad — nunca asumas que la ventana de una ciudad aplica a otra.

## Notas de seguridad
- Endpoint público; no contiene datos personales.
- Los precios son solo informativos — el carrito recalcula el precio final en el servidor.

## Flujo de ejemplo
1. La app carga con una ciudad seleccionada → `GET /api/v1/cineflash?cityId=...` → `active: true` → banner con cuenta regresiva y términos.
2. La cuenta regresiva avanza cada segundo desde `remainingSeconds`; el banner se vuelve a consultar cada 30–60 s y al ganar el foco de la ventana.
3. La ventana termina → `active: false` (o la cuenta regresiva llega a cero) → banner oculto.
4. `["cineflash"]` y `["movies", "cineflash"]` invalidados → se eliminan las insignias de las tarjetas de películas.
5. El usuario toca una función → el checkout aplica el máximo de 3 entradas y el precio −20 % en el servidor.
