# /api/v1/admin/* — Admin API conventions & resource catalog

## Historia de usuario relacionada
- **HU-FE-020** — Panel administrativo. **No es un endpoint único**: este documento define el **patrón CRUD uniforme** para todo el panel administrativo (todos los recursos del rol `ADMIN`) además de un catálogo de recursos y dos ejemplos totalmente desarrollados. Los detalles por módulo se añaden aquí a medida que se implementan los módulos.

## Propósito
El panel administrativo abarca ~20 módulos de CRUD completo. En lugar de un contrato por recurso, cada recurso de administración sigue **el mismo patrón REST**, **las mismas envolturas de error/paginación** y **el mismo modelo de permisos**. Este documento es la única fuente de verdad para ese patrón: ruta base, verbos estándar, query params comunes, ejemplos desarrollados para `GET /api/v1/admin/movies` y `POST /api/v1/admin/functions`, y el catálogo completo de recursos con acciones específicas de cada módulo.

## Método HTTP
Varía — ver la tabla de verbos estándar abajo. Todos bajo la ruta base `/api/v1/admin`.

## URL
`/api/v1/admin/{resource}` (URL completa: `https://api.multicine.com/api/v1/admin/{resource}`)

## Autenticación
- Rol requerido: **ADMIN** (Bearer JWT, convenciones §3). Los roles Manager/Customer nunca llegan a estas rutas.
- **Cumplimiento en dos capas**: el frontend oculta los ítems de menú y las acciones para las que el admin no tiene permiso (UX), **y** el backend siempre vuelve a imponer cada acción (403 FORBIDDEN) — la restricción en la UI nunca es una frontera de seguridad.

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | En peticiones con cuerpo: `application/json` (o `multipart/form-data` para subidas, §11) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` — localiza etiquetas/nombres de enums |
| `X-Idempotency-Key` | En creaciones/acciones | UUID generado por el cliente, reutilizado en el reintento — requerida en `POST` (crear) y `POST /{resource}/{id}/{action}` (convenciones §9) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, que el servidor repite para trazabilidad |

## Parámetros de ruta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` (p. ej. `movieId`, `functionId`) | string (UUID v4) | En rutas de ítem | Id del recurso (convenciones §8) |

## Parámetros de consulta (rutas de listado)
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `page` | integer | No | Página base 1 (por defecto `1`, convenciones §5) |
| `pageSize` | integer | No | Máximo 100 (por defecto `20`, §5) |
| `search` | string | No | Subcadena sin distinguir mayúsculas sobre el nombre/título/código del recurso |
| `sortBy` | string | No | Campo definido por el módulo (el defecto varía) |
| `sortOrder` | enum | No | `asc` \| `desc` (por defecto `asc`, §5) |
| `active` | boolean | No | Filtrar estado eliminado-suave/activo donde aplique |
| *filtros de módulo* | varía | No | Filtros por recurso (p. ej. `cityId`, `cinemaId`, `status`, `category`, `dateFrom`/`dateTo`) |

## Verbos estándar (todos los recursos)
| Verbo | Ruta | Propósito | Éxito |
|---|---|---|---|
| GET | `/admin/{resource}` | Listar con filtros + paginación (envoltura §5) | 200 |
| POST | `/admin/{resource}` | Crear (`X-Idempotency-Key` requerida) | 201 |
| GET | `/admin/{resource}/{id}` | Detalle | 200 |
| PUT | `/admin/{resource}/{id}` | Actualizar (semántica de fusión) | 200 |
| DELETE | `/admin/{resource}/{id}` | **Eliminación suave** | 204 |
| POST | `/admin/{resource}/{id}/{action}` | Acción de módulo (p. ej. publicar, cancelar, bloquear) | 200/204 |

## Cuerpo de la petición
Definido por el módulo, JSON (o multipart para subidas). Cada creación sigue las convenciones de campos: UUIDs para relaciones (§8), COP entero para dinero (§6), marcas de tiempo ISO 8601 UTC (§7), enums en snake_case.

## Respuestas de éxito
- Listas: envoltura paginada según convenciones §5.
- Creaciones/actualizaciones: el payload del recurso (o una confirmación estilo `{ id, isActive }` para alternar flags).
- Acciones: confirmación mínima (`200` con un payload pequeño o `204`).
- Eliminaciones: **204 No Content** (eliminación suave — las referencias históricas siguen siendo válidas).

## Respuestas de error
Todos los errores usan la envoltura de convenciones §4. Los códigos relevantes para las rutas de administración:

| HTTP | Código | Significado / comportamiento del frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | El admin no tiene el permiso específico → ocultar la acción y mostrar "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | Recurso faltante → refrescar la lista |
| 409 | `CONFLICT` | Conflicto de estado (código duplicado, recurso en uso, conflicto de asientos) |
| 422 | `VALIDATION_ERROR` | Falló la validación de campos; `details` mapea a los campos del formulario |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Error con reintento (§13) |

Ejemplo completo — permiso denegado (`403`):

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para ejecutar esta acción",
    "details": [
      { "field": "permission", "message": "El rol no incluye el permiso PROMOTIONS_WRITE" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Catálogo de recursos

| Módulo | Recurso | CRUD estándar | Acciones específicas del módulo |
|---|---|---|---|
| **Catálogos** | `countries`, `departments`, `cities`, `cinemas`, `rooms`, `seats`, `room-types`, `schedules`, `holidays` | ✔ | — |
| **Películas** | `movies`, `trailers`, `formats`, `languages`, `classifications` | ✔ | `POST /movies/{id}/publish`, `POST /movies/{id}/unpublish` |
| **Funciones** | `functions`, `prices`, `promotions` (a nivel de función), `cine-flash` | ✔ | `POST /functions/{id}/cancel` |
| **Confitería** | `products`, `categories`, `inventory`, `promotions`, `combos` | ✔ | — |
| **Usuarios** | `users`, `memberships`, `roles`, `permissions`, `blocks` | ✔ | `POST /users/{id}/block`, `POST /users/{id}/unblock` |
| **Ventas** | `orders`, `payments`, `invoices`, `refunds`, `history` | ✔ (principalmente lectura) | `POST /refunds`, `POST /orders/{id}/cancel` |
| **Seguridad** | `audit`, `logs`, `login-attempts`, `sessions`, `parameters` | Lectura + `PUT` | — |

Notas de las convenciones de administración:
- Las rutas de acción (`/{id}/{action}`) son POST con `X-Idempotency-Key` (§9); nunca chocan con los sub-paths UUID (§8).
- Los campos de dinero en los recursos de Ventas/Promociones son enteros en COP (§6).
- Los filtros reflejan los endpoints públicos (`GET /movies`, `GET /functions`), pero las listas de administración además exponen filas inactivas/no publicadas/eliminadas-suaves.

## Ejemplo desarrollado 1 — GET /api/v1/admin/movies

Lista películas con filtros de administración (incluidas las no publicadas) usando la envoltura paginada estándar.

```
GET /api/v1/admin/movies?status=DRAFT&cityId=1c2b3a4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d&sortBy=createdAt&sortOrder=desc&page=1&pageSize=20
```

```json
{
  "data": [
    {
      "id": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f",
      "title": "El Último Horizonte",
      "posterUrl": "https://cdn.multicine.com/posters/el-ultimo-horizonte.jpg",
      "genres": ["Ciencia ficción", "Aventura"],
      "classification": "B15",
      "status": "DRAFT",
      "isPublished": false,
      "releaseDate": "2026-08-10",
      "createdAt": "2026-07-20T14:30:00Z",
      "updatedAt": "2026-07-28T09:12:00Z"
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 42, "totalPages": 3 }
}
```

Notas de frontend: tabla con `search`, filtro de estado, cabeceras `sortBy`/`sortOrder` y paginación (`keepPreviousData`, §5); las filas con `isPublished: false` renderizan una acción "Publicar" → `POST /admin/movies/{id}/publish`.

## Ejemplo desarrollado 2 — POST /api/v1/admin/functions

Crea una función de proyección para una película en una sala.

```json
{
  "movieId": "3f2c1a9b-1b2c-4d3e-9f8a-0a1b2c3d4e5f",
  "roomId": "7a6b5c4d-3e2f-4a1b-8c9d-0e1f2a3b4c5d",
  "startsAt": "2026-08-10T18:45:00Z",
  "format": "2D",
  "isCineFlash": false
}
```

```json
{
  "functionId": "5a4b3c2d-1e2f-4a3b-9c8d-7e6f5a4b3c2d",
  "startsAt": "2026-08-10T18:45:00Z",
  "status": "SCHEDULED"
}
```

Notas de frontend: formulario con selectores de película/sala y un selector de fecha-hora (America/Bogota, serializado en UTC — §7); el backend rechaza los horarios de sala superpuestos con `409 CONFLICT`; al tener éxito invalidar claves estilo `["adminFunctions", ...]`; una acción "Cancelar función" → `POST /admin/functions/{id}/cancel`.

## Consideraciones de frontend
- **Tablas en todas partes**: filtros del lado del servidor + búsqueda + cabeceras ordenables + paginación (envoltura §5), `keepPreviousData` para un paginado fluido (§12). Los filtros viven en la URL para que las recargas los conserven.
- **Modales de confirmación antes de acciones destructivas**: eliminar (`DELETE`) y acciones de módulo como cancelar (`/functions/{id}/cancel`) y bloquear (`/users/{id}/block`) siempre se confirman con un mensaje descriptivo.
- **Formularios con validación**: mapear los `422 details` a los campos; validar enums/fechas/dinero del lado del cliente primero; una `X-Idempotency-Key` por intención de creación/acción, reutilizada en el reintento (§9).
- **Navegación con permisos**: los ítems de menú y las acciones de fila se renderizan solo cuando el rol del admin tiene el permiso (desde `GET /profile`/roles); una acción oculta nunca se llama — y si se llama (UI desactualizada), el manejador de 403 muestra el estado de permiso (§13).
- **Exportar reportes**: URLs generadas por el servidor (p. ej. `GET /admin/orders/export?from=...&to=...`) que abren una descarga; se regeneran por petición, nunca se guardan en caché indefinidamente.
- **Visibilidad de la traza de auditoría**: Seguridad → audit expone quién cambió qué; las acciones administrativas destructivas muestran un enlace "Auditoría" desde la fila afectada.
- Carga → skeletons de tabla; vacío → "Sin resultados" con un "Limpiar filtros" claro; error → reintento; sesión expirada manejada por el interceptor (§3).

## Reglas de validación
- Aplicar la misma validación del lado del cliente que en los flujos públicos/del propietario correspondientes (enums, dinero como COP entero, fechas `to > from`, UUIDs).
- Nunca enviar `pageSize > 100` (§5); usar filtros en lugar de consultar tablas completas.

## Reglas de negocio
- Las eliminaciones son **eliminaciones suaves** (204) — los registros históricos (pedidos, auditoría) conservan sus referencias; los flags `active`/status distinguen filas vivas de archivadas.
- Los campos de dinero son enteros en COP (§6); los rangos de reporte respetan las ventanas `from`/`to`.
- Las acciones de mutación sobre dinero/estado de reservas requieren `X-Idempotency-Key` (§9).

## Notas de seguridad
- Solo ADMIN de punta a punta; el cumplimiento del backend (403 FORBIDDEN) es la autoridad — la restricción en el frontend es solo UX.
- Los módulos sensibles (usuarios, pagos, auditoría) devuelven campos restringidos; el cliente nunca renderiza secretos (instrumentos de pago, contraseñas).
- Todas las mutaciones administrativas quedan en la traza de auditoría; las acciones destructivas se registran con actor + marca de tiempo.

## Flujo de ejemplo
1. El admin inicia sesión → el rol incluye ADMIN + permisos de módulo → el shell de administración renderiza el menú permitido.
2. El admin abre Películas → `GET /admin/movies?page=1` → skeleton de tabla → filas incl. `DRAFT`.
3. El admin toca "Publicar" en un borrador → confirmar → `POST /admin/movies/{id}/publish` (clave de idempotencia) → la fila cambia a `isPublished: true`, lista invalidada.
4. El admin abre Funciones → "Crear función" → formulario → `POST /admin/functions` → 201 → fila nueva; un choque de horario de sala devuelve `409 CONFLICT` → error en línea.
5. El admin elimina un recurso tipo promoción → modal de confirmación → 204 → fila eliminada-suave filtrada por `active=false`.
6. El admin abre Seguridad → audit → ve las acciones de publicar/cancelar con actor + marca de tiempo.
