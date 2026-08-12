# GET /api/v1/dashboard

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-025** — Dashboard gerencial. El dashboard de negocio exclusivo para MANAGER: tarjetas de KPI, tendencias, comparación de períodos y listas top.

## Propósito
Devuelve los KPIs y tendencias de negocio para el período y ámbito (ciudad/cine) seleccionados, incluyendo una comparación con el período anterior para cada KPI, series de tiempo y películas/ciudades/cines top. Una sola respuesta agregada alimenta toda la pantalla del dashboard — el frontend no hace ninguna agregación. Las cifras de comparación llegan precalculadas para que la UI pueda renderizar los chips de variación ▲/▼ sin matemática adicional.

## Método HTTP
GET

## URL
`/api/v1/dashboard` (URL completa: `https://api.multicine.com/api/v1/dashboard`)

## Autenticación
- Rol requerido: **MANAGER** (Bearer JWT, convenciones §3). La ruta del dashboard está oculta para otros roles y el backend la refuerza con 403 FORBIDDEN.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` — localiza las etiquetas de los KPI |
| `X-Request-Id` | Opcional | UUID generado por el cliente, que el servidor repite para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `from` | string `YYYY-MM-DD` | **Sí** | Inicio del período (convenciones §7) |
| `to` | string `YYYY-MM-DD` | **Sí** | Fin del período, inclusive; `to >= from` |
| `compareFrom` | string `YYYY-MM-DD` | No | Inicio de la ventana de comparación (por defecto, la misma duración inmediatamente anterior a `from`) |
| `compareTo` | string `YYYY-MM-DD` | No | Fin de la ventana de comparación |
| `cityId` | string (UUID v4) | No | Acotar a una ciudad |
| `cinemaId` | string (UUID v4) | No | Acotar a un cine (se ignora sin ciudad) |
| `groupBy` | enum | No | `DAY` \| `WEEK` \| `MONTH` (por defecto `DAY`; `MONTH` solo es válido para períodos largos) |

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — payload agregado del dashboard.

```json
{
  "period": { "from": "2026-07-01", "to": "2026-07-31" },
  "comparison": { "previousPeriod": { "from": "2026-06-01", "to": "2026-06-30" } },
  "kpis": [
    { "key": "SALES", "value": 12540, "variationPercent": 8.4, "previousValue": 11568 },
    { "key": "REVENUE", "value": 1482350000, "variationPercent": 5.2, "previousValue": 1409100000 },
    { "key": "TICKETS", "value": 67200, "variationPercent": 6.1, "previousValue": 63338 },
    { "key": "OCCUPANCY", "value": 62.4, "variationPercent": -2.1, "previousValue": 64.5 },
    { "key": "SNACKS", "value": 389200000, "variationPercent": 3.0, "previousValue": 377864078 },
    { "key": "CINEFLASH", "value": 84500, "variationPercent": 12.7, "previousValue": 74978 },
    { "key": "GIFTCARDS", "value": 23500000, "variationPercent": 1.5, "previousValue": 23152709 },
    { "key": "MEMBERSHIPS", "value": 1120, "variationPercent": 4.0, "previousValue": 1077 },
    { "key": "ACTIVE_USERS", "value": 48320, "variationPercent": 2.8, "previousValue": 47003 },
    { "key": "CONVERSION", "value": 11.7, "variationPercent": 0.9, "previousValue": 11.6 },
    { "key": "CANCELLATIONS", "value": 310, "variationPercent": -5.4, "previousValue": 328 },
    { "key": "TRANSFERS", "value": 178, "variationPercent": 3.5, "previousValue": 172 }
  ],
  "series": [
    { "date": "2026-07-01", "revenue": 47800000, "tickets": 2150, "occupancy": 58.1 },
    { "date": "2026-07-02", "revenue": 52200000, "tickets": 2410, "occupancy": 61.3 }
  ],
  "topMovies": [
    { "movieId": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f", "title": "El Último Horizonte", "revenue": 184500000, "tickets": 8120 }
  ],
  "topCities": [
    { "city": "Medellín", "revenue": 620000000 }
  ],
  "topCinemas": [
    { "cinemaId": "1c2b3a4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", "name": "Multicine Santa Fe", "revenue": 310500000 }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `kpis[].key` | enum | `SALES` \| `REVENUE` \| `TICKETS` \| `OCCUPANCY` \| `SNACKS` \| `CINEFLASH` \| `GIFTCARDS` \| `MEMBERSHIPS` \| `ACTIVE_USERS` \| `CONVERSION` \| `CANCELLATIONS` \| `TRANSFERS` |
| `kpis[].value` | number | Los KPI de dinero (`REVENUE`, `SNACKS`, `GIFTCARDS`) son enteros en COP (convenciones §6); `OCCUPANCY`/`CONVERSION` son porcentajes con un decimal |
| `kpis[].variationPercent` | number \| null | Cambio porcentual vs. el período anterior; null cuando no hay datos previos comparables |
| `series[].date` | string | `YYYY-MM-DD` cuando `groupBy=DAY`, si no, la etiqueta del bucket (inicio de semana / mes); ISO 8601 UTC (convenciones §7) |
| `topMovies` / `topCities` / `topCinemas` | array | Listas top-5, limitadas en el servidor |

## Respuestas de error
Todos los errores usan la envoltura compartida (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento del frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No es MANAGER → estado "No tienes permiso" (§13) |
| 422 | `VALIDATION_ERROR` | Fechas malas (`to` antes de `from`, formato inválido), `groupBy` malo → el panel de filtros muestra el error |
| 500 | `SERVER_ERROR` | Fallo inesperado → error recuperable con reintento (§13) |

Ejemplo completo — fechas inválidas (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revisa el rango de fechas del reporte",
    "details": [
      { "field": "to", "message": "La fecha final debe ser posterior o igual a la inicial" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Layout skeleton** que refleje la cuadrícula del dashboard (fila de KPI + gráficos + listas top) mientras carga; nunca en blanco (§13).
- **Filtros** (ciudad / cine / período / `groupBy`) cambian los query params → **re-consultar todo** desde este único endpoint, sin recargar. Mantener `keepPreviousData` para que los gráficos no parpadeen mientras carga un período nuevo (§12).
- **Flechas de comparación**: renderizar `▲`/`▼` + `variationPercent` por tarjeta de KPI; verde para lo positivo (excepto `CANCELLATIONS`, donde la polaridad está invertida — que baje es bueno), rojo para lo negativo; `null` → "sin comparación".
- **Exportar PDF/Excel en el cliente** desde el mismo payload cargado (hoja/builder o PDF de cliente), **o** mediante un endpoint de exportación del servidor que se añada luego — nunca re-consultar datos crudos solo para exportar.
- **Estado vacío por KPI**: `value: 0` (o un KPI faltante) → "sin datos" en la tarjeta en lugar de una flecha 0 % extraña.
- **Re-render responsive de gráficos** cuando el contenedor cambia de tamaño (ResizeObserver) y cuando `groupBy` cambia la densidad de los buckets.
- Clave de TanStack Query `["dashboard", { from, to, cityId, cinemaId, groupBy }]`; `staleTime` ~60s; las acciones de exportación leen los datos en caché.
- `from`/`to` por defecto: últimos 30 días terminando hoy; el panel de filtros los persiste en la URL.

## Reglas de validación
Validar ANTES de enviar:
- `from`/`to` tienen formato `YYYY-MM-DD`; `to >= from`; ventana ≤ 366 días.
- `groupBy` ∈ { `DAY`, `WEEK`, `MONTH` } (y `MONTH` solo para ventanas de ≥ ~60 días — el backend puede rechazarlo con 422 en caso contrario).
- `cityId`/`cinemaId` son UUIDs; `cinemaId` se envía solo junto con `cityId`.

## Reglas de negocio
- Todas las agregaciones son del lado del servidor sobre el ámbito efectivo; los KPI de dinero son enteros en COP (§6).
- `comparison.previousPeriod` es la ventana inmediatamente anterior de igual longitud (o el override `compareFrom`/`compareTo`).
- `variationPercent` es null cuando el período anterior no tiene datos (primer mes de operaciones) — la UI debe manejar null, no 0.
- Las listas top están limitadas (top 5) en el servidor; no tienen paginación.

## Notas de seguridad
- Solo MANAGER, reforzado por el backend (403 FORBIDDEN). La ruta tiene control de permisos en el frontend y el payload nunca se guarda en caché fuera de la sesión del manager.
- Ingresos/ocupación son datos de negocio sensibles — no registres el payload; respeta el rastreo de `X-Request-Id` sin registrar el cuerpo.

## Flujo de ejemplo
1. El manager abre el dashboard → valores por defecto (`from` = hoy−30, `groupBy=DAY`) → `GET /dashboard?from=...&to=...`.
2. Cuadrícula skeleton → tarjetas de KPI con chips ▲/▼ + gráficos de ingresos/ocupación + listas top.
3. El manager cambia de ciudad → cambian los params → re-consulta con `keepPreviousData` → todas las secciones se actualizan.
4. El manager cambia `groupBy` a `WEEK` → los buckets de la serie se re-renderizan a granularidad semanal.
5. El manager hace clic en "Exportar Excel" → el cliente construye el archivo desde el payload en caché (sin petición nueva).
6. `CANCELLATIONS` bajó 5.4 % → se renderiza en verde (bajar es bueno) vía su polaridad invertida.
