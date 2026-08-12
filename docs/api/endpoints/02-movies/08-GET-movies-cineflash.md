# GET /api/v1/movies/cineflash

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida (`GET /movies/cineflash` responde 404 en el mock). El contrato de abajo es la propuesta
> del frontend derivada del backlog; confirmar ruta, payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-019** — Cine Flash. Alias del backlog: `GET /cineflash` (aplanado bajo `/movies` por consistencia REST; este endpoint es el feed de precios/funciones por película que consume el frontend para la sección Cine Flash y los badges de la cartelera).

## Propósito
Devuelve las películas que actualmente tienen funciones con descuento **Cine Flash** para la ciudad seleccionada, incluyendo el descuento aplicado, el precio anterior vs. el precio con descuento, la expiración de la promoción y las funciones elegibles con boletas restantes. Alimenta la sección "Cine Flash −20%" y los badges de la cartelera.

## Método HTTP
GET

## URL
`/api/v1/movies/cineflash` (URL completa: `https://api.multicine.com/api/v1/movies/cineflash`)

Sub-ruta estática — nunca colisiona con `/movies/{movieId}` porque los ids son UUIDs (convenciones §8).

## Autenticación
Pública. No se requiere token.

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |
| `Accept-Language` | Opcional | `es` — localiza `title` |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cityId` | string (UUID v4) | **Sí** | Ámbito de ciudad — las funciones Cine Flash son específicas de la ciudad |
| `page` | integer | No | Número de página basado en 1 (predeterminado `1`, convenciones §5) |
| `pageSize` | integer | No | Elementos por página, máximo 100 (predeterminado `20`, convenciones §5) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK
Lista paginada (envelope según convenciones §5) más un `activeWindow` de nivel superior que describe la ventana de tiempo actual de Cine Flash.

```json
{
  "data": [
    {
      "movieId": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f",
      "title": "El Último Horizonte",
      "posterUrl": "https://cdn.multicine.com/posters/el-ultimo-horizonte.jpg",
      "discountPercent": 20,
      "previousPrice": { "amount": 22000, "currency": "COP" },
      "cineflashPrice": { "amount": 17600, "currency": "COP" },
      "maxTicketsPerPurchase": 3,
      "expiresAt": "2026-08-03T23:30:00Z",
      "functions": [
        {
          "functionId": "5e7a4f1b-2c3d-4e5f-9a8b-0c1d2e3f4a5b",
          "format": "2D",
          "startAt": "2026-08-03T21:10:00Z",
          "remainingTickets": 47
        }
      ]
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 2, "totalPages": 1 },
  "activeWindow": { "startAt": "2026-08-03T15:00:00Z", "endAt": "2026-08-03T23:30:00Z" }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `movieId` | UUID | Convenciones §8 |
| `discountPercent` | integer | Siempre `20` (regla de Cine Flash) |
| `previousPrice` / `cineflashPrice` | object | COP entero (convenciones §6); `cineflashPrice` = `previousPrice − 20%` |
| `expiresAt` | string ISO-8601 UTC | Fin de la promoción por película (convenciones §7) |
| `functions[].functionId` | UUID | Enlaza con `GET /functions/{functionId}` |
| `activeWindow` | object | Ventana global de la promoción `startAt`/`endAt` (ISO-8601 UTC); cuando está fuera de ella la lista está vacía |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `422`, `429`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Parámetros de paginación inválidos | Error recuperable con reintento |
| 422 | `VALIDATION_ERROR` | Falta/es inválido `cityId` | Abrir el asistente de ubicación (`details` de `cityId` en §4) |
| 429 | `RATE_LIMITED` | Demasiadas peticiones | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Falla inesperada | Error genérico reintentable (§13) |

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El parámetro cityId es obligatorio",
    "details": [
      { "field": "cityId", "message": "Debes seleccionar una ciudad para ver promociones Cine Flash" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- Badge **"Cine Flash −20%"** en cada tarjeta; `previousPrice` se renderiza tachado junto a `cineflashPrice`.
- **Cuenta regresiva al fin de la promo**: calcular desde `expiresAt` (y `activeWindow.endAt`) vs `Date.now()` usando los deltas del servidor (convenciones §7) — nunca confíes en el reloj del cliente para la decisión del fin.
- **Refrescar cada 30–60 s** vía `refetchInterval` y/o `refetchOnWindowFocus: true` (la ventana está limitada por tiempo).
- Cuando la ventana termina (la cuenta regresiva llega a cero o respuesta vacía): **eliminar los visuales de la promoción** (tachado, badge) e `invalidateQueries(["cineflash"])`; también refrescar `["movies"]` para que los badges de la cartelera desaparezcan.
- Clave de TanStack Query `["cineflash", cityId]`; `staleTime` ~30 s dada la ventana volátil.
- Skeleton mientras carga; estado vacío → "No hay promociones Cine Flash en este momento"; sin conexión → banner + reintento (§13).

## Reglas de validación
- `cityId` obligatorio antes de enviar; UUID v4 válido.
- Limitar `pageSize ≤ 100`, `page ≥ 1`.
- Renderizar siempre una cuenta regresiva que refleje el valor de `expiresAt` del servidor, no solo un estado local de temporizador.

## Reglas de negocio
- Cine Flash es **20% de descuento SOLO en boletas** (nunca confitería), **máximo 3 boletas por compra**, **no acumulable** con otras promociones.
- Una película desaparece de este feed cuando su ventana de promoción termina (pasó `expiresAt`) — el frontend debe dejar de mostrar los visuales de la promoción en ese punto.

## Notas de seguridad
- Endpoint público; sin datos personales.
- Los precios son solo informativos — el precio definitivo siempre se recalcula en el servidor en el carrito.

## Flujo de ejemplo
1. La sección Cine Flash se monta → `GET /api/v1/movies/cineflash?cityId=...` → tarjetas con badges `−20%`.
2. El usuario ve `previousPrice` tachado y una cuenta regresiva en vivo hasta `expiresAt`.
3. La sección re-consulta cada 30–60 s y al enfocar la ventana.
4. La ventana termina → lista vacía / pasó `expiresAt` → se eliminan los badges, se invalidan `["cineflash"]` y `["movies"]`.
5. El usuario toca una tarjeta → detalle `GET /movies/{movieId}`.
