# Multicine API — Convenciones compartidas

> Este documento define las convenciones que aplican a **todos** los endpoints de este contrato de
> API. Cada documento de endpoint de esta carpeta asume estas convenciones y solo documenta lo
> específico de ese endpoint. Lee este documento primero.

## 1. URL base y versionado

- URL base: `https://api.multicine.com`
- Todos los endpoints viven bajo `/api/v1` (los de administración bajo `/api/v1/admin`).
- La versión de la API se configura **en un único lugar** en el frontend (un archivo de configuración
  leído desde `VITE_API_BASE_URL`), nunca por componente.
- Ejemplo de `VITE_API_BASE_URL`: `https://api.multicine.com/api/v1`
- Cambiar la versión de la API debe requerir un único cambio de configuración — ningún componente
  puede hardcodear una URL.
- Los endpoints base listados en **HU-FE-029** deben resolverse siempre contra esta URL base
  versionada.

## 2. Cabeceras comunes

| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | En endpoints autenticados | `Bearer <accessToken>` |
| `Content-Type` | En peticiones con cuerpo | `application/json` (o `multipart/form-data` para subida de archivos) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz). Los mensajes de error los localiza el backend. |
| `X-Request-Id` | Opcional | Id de petición generado por el cliente (UUID). El servidor lo devuelve para trazabilidad. |
| `X-Idempotency-Key` | En mutaciones de dinero/reservas | Garantiza ejecución exactamente una vez (ver §9). |
| `X-CSRF-Token` | En `/auth/refresh` y `/auth/logout` | Requerida porque el refresh token viaja en una cookie (ver §3). |

## 3. Autenticación

### Access token
- JWT de corta duración (por defecto 15 minutos) devuelto por `POST /api/v1/auth/login` y
  `POST /api/v1/auth/refresh`.
- Se envía como `Authorization: Bearer <token>`.
- **Se guarda en memoria** (estado de React / Zustand / context) — nunca en `localStorage` ni
  `sessionStorage`.

### Refresh token
- JWT de larga duración almacenado por el backend en una cookie **HttpOnly, Secure, SameSite=Lax**
  llamada `refresh_token`.
- El frontend nunca la lee; el navegador la envía automáticamente en `/auth/refresh`.

### Flujo de renovación de token (gestionado por el interceptor central del cliente HTTP)
1. Una petición devuelve `401`.
2. El interceptor revisa el código del cuerpo de la respuesta:
   - `ACCESS_TOKEN_EXPIRED` → llamar a `POST /auth/refresh` una sola vez.
   - Si el refresh tiene éxito → reintentar la petición original **exactamente una vez** y luego
     exponer el resultado.
   - Si el refresh falla → limpiar la sesión, notificar al store de autenticación y redirigir al
     login (recordando la ruta a la que se dirigía).
3. Las peticiones concurrentes que fallen con `401` mientras hay un refresh en curso se **ponen en
   cola** y se reintentan cuando el refresh resuelva — nunca lanzar refreshes en paralelo.
4. Cualquier otro código `401` (`INVALID_TOKEN`, `ACCOUNT_DISABLED`, …) → cerrar sesión de inmediato.

### Cierre de sesión
- `POST /api/v1/auth/logout` invalida la cookie de refresh en el servidor; el cliente limpia el
  access token en memoria y toda la caché de TanStack Query (`queryClient.clear()`).

## 4. Envelope de error estándar

Toda respuesta no-2xx (excepto fallos de descarga binaria en bruto) usa esta forma:

```json
{
  "error": {
    "code": "EMAIL_ALREADY_REGISTERED",
    "message": "El correo ya está registrado",
    "details": [
      { "field": "email", "message": "Este correo ya está en uso" },
      { "field": "phone", "message": "Formato de celular inválido" }
    ],
    "requestId": "req_01HZ...",
    "retryAfterSeconds": 30
  }
}
```

- `details` se completa para `422` (validación) y a veces `409` (p. ej. lista de sillas que ya no
  están disponibles). Los nombres de campo coinciden con los del cuerpo de la petición para que los
  formularios puedan mapear errores a sus inputs.
- `retryAfterSeconds` se completa para `429` y bloqueo de cuenta (`401` con `ACCOUNT_LOCKED`).

### Códigos de error comunes

| HTTP | Código | Significado / comportamiento en frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Petición malformada / payload inválido |
| 401 | `INVALID_CREDENTIALS` | Email/contraseña incorrectos |
| 401 | `EMAIL_NOT_VERIFIED` | La cuenta existe pero el email no está verificado |
| 401 | `ACCOUNT_LOCKED` | Bloqueo temporal; respetar `retryAfterSeconds` |
| 401 | `ACCOUNT_INACTIVE` | Usuario deshabilitado |
| 401 | `ACCESS_TOKEN_EXPIRED` | Disparar refresh silencioso + un reintento |
| 401 | `REFRESH_TOKEN_EXPIRED` | Sesión terminada → cerrar sesión |
| 401 | `INVALID_TOKEN` | Token malformado/revocado → cerrar sesión |
| 403 | `FORBIDDEN` | Autenticado pero sin permiso (rol/permiso/ownership) |
| 404 | `NOT_FOUND` | Recurso inexistente o no publicado |
| 409 | `CONFLICT` | Conflicto de estado (duplicado, silla ocupada, carrito vencido, ya hecho…) |
| 409 | `HOLD_EXPIRED` | La reserva de silla venció → volver a bloquear |
| 409 | `CART_EXPIRED` | La ventana de tiempo del carrito terminó → recrear |
| 422 | `VALIDATION_ERROR` | Falló la validación de campos; `details` trae mensajes por campo |
| 429 | `RATE_LIMITED` | Demasiadas peticiones; respetar `Retry-After` |
| 500 | `SERVER_ERROR` | Error inesperado → mostrar error genérico reintentable |
| 503 | `SERVICE_UNAVAILABLE` | Mantenimiento/degradado → mostrar banner no bloqueante |

## 5. Paginación

Todos los endpoints de listado devuelven este envelope:

```json
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 137,
    "totalPages": 7
  }
}
```

Parámetros de consulta (consistentes en todos lados):

| Parámetro | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `page` | integer | 1 | Número de página base 1 |
| `pageSize` | integer | 20 | Máximo 100 |
| `sortBy` | string | varía | Campo por el que ordenar |
| `sortOrder` | enum | `asc` | `asc` \| `desc` |

Frontend (TanStack Query): `keepPreviousData` para paginación fluida, `pageSize` limitado a 100,
scroll infinito solo donde la UI lo amerite (usar `page` + `pageSize`, no cursor, por consistencia).

## 6. Dinero y moneda

- Todos los montos son enteros que representan **COP (pesos colombianos) sin decimales**.
- Forma JSON: `{ "amount": 12500, "currency": "COP" }`.
- Nunca hacer aritmética de moneda en componentes con punto flotante; calcular totales en el cliente
  solo en COP entero (y preferir re-derivar los totales desde la respuesta del carrito del servidor).

## 7. Fechas y zonas horarias

- Los timestamps son strings **ISO 8601 UTC** con sufijo `Z`, p. ej. `2026-08-10T23:30:00Z`.
- Las fechas sin hora (`birthDate`, `releaseDate`, agendamiento `sendAt`) usan `YYYY-MM-DD`.
- Mostrar en `America/Bogota`; las cuentas regresivas deben calcularse contra `Date.now()` (UTC)
  menos los deltas de `remainingSeconds`/`expiresAt` del servidor para evitar deriva por desfase de
  reloj.
- Librerías frontend: `date-fns` + `date-fns-tz` (o equivalente); nunca `new Date("YYYY-MM-DD")`
  sin especificar la intención de zona horaria.

## 8. IDs y enums

- Todos los ids de recursos son **strings UUID v4**. El `code` de los bonos de regalo y el `qrCode`
  de las entradas son legibles por humanos/alfanuméricos y se documentan por endpoint.
- Los enums son strings **snake_case** (p. ej. `payment_method: "PSE"`, `seat_state: "RESERVED"`,
  `status: "PENDING"`).
- Como los ids son UUIDs, las sub-rutas estáticas como `/movies/upcoming` y `/movies/cineflash`
  nunca pueden colisionar con `/movies/{movieId}` — mantener los ids como UUIDs para preservar esa
  garantía.

## 9. Claves de idempotencia

- Requerida (en `X-Idempotency-Key`) en todo endpoint mutador que crea estado de dinero/reservas:
  reservas de silla, creación de carrito, pagos, confirmación de orden, compra/canje de bono de
  regalo, canje de puntos, transferencia de entradas, creación de PQRS, envío de encuestas, cambio
  de función, creación de cupones/promociones.
- El cliente debe generar un UUID por intención de usuario (una clave por clic de "Comprar",
  reutilizada al reintentar ese mismo clic — nunca en un clic *nuevo*). Esto es lo que garantiza
  "la compra no se envía dos veces".
- Si una petición con la misma clave se reintenta, el servidor devuelve el resultado **original**
  (mismo status, mismo cuerpo) en lugar de ejecutarse dos veces.

## 10. Rate limiting (429)

- El backend responde `429` con la cabecera `Retry-After` (segundos) y `retryAfterSeconds` en el
  cuerpo.
- Comportamiento en frontend (HU-FE-029):
  - **No** reintentar de inmediato.
  - Mostrar un mensaje informativo ("Demasiadas solicitudes. Intenta de nuevo en X segundos.").
  - Respetar el tiempo proporcionado por el servidor antes de re-habilitar la acción (cuenta
    regresiva en el botón).
  - Deshabilitar temporalmente la acción que disparó la ráfaga.
  - Registrar el evento en la herramienta de monitoreo (no bloqueante).

## 11. Subida de archivos

- Usar `multipart/form-data` (Axios define el boundary automáticamente — no fijar `Content-Type`
  manualmente para FormData).
- Los endpoints de subida documentan tipos aceptados, tamaño máximo y cantidad máxima por petición.
- Mostrar progreso de subida por archivo, validar tipo/tamaño **antes** de enviar, y poder
  cancelar/quitar archivos.
- En caso de fallo, el archivo puede reintentarse individualmente sin reenviar todo el formulario.

## 12. Capa de datos en frontend (Axios + TanStack Query)

- **Un cliente HTTP centralizado** (en `src/services`); todas las peticiones pasan por él. Ningún
  componente llama `axios`/`fetch` directamente.
- Interceptores: adjuntar `Authorization`, refrescar-una-vez-y-reintentar en `401`, deduplicar
  peticiones GET idénticas en vuelo (in-flight map), soportar cancelación con `AbortController` vía
  la `signal` de TanStack Query.
- Las query keys siguen la ruta: `["movies", { cityId, date }]`, `["cart"]`, `["orders", orderId]`.
- La guía de caché/staleness por endpoint está incluida en cada documento. Éxito de mutación →
  `queryClient.invalidateQueries()` sobre las keys afectadas.
- Se recomiendan actualizaciones optimistas para cantidades del carrito y edición de perfil, con
  rollback en caso de error.

## 13. Estados de pantalla obligatorios (HU-FE transversal)

Toda pantalla que lea datos debe implementar y alternar entre:

- Cargando (skeleton, nunca vacío)
- Éxito (contenido)
- Vacío ("Sin resultados" con una acción clara)
- Error recuperable (mensaje + botón de reintentar)
- Error no recuperable (mensaje + redirección/soporte)
- Sin conexión / conexión perdida (banner + reintento)
- Sesión expirada (modal → refresh silencioso o redirección al login)
- Prohibido (403 → estado "No tienes permiso")

Se espera que estos estados se reutilicen mediante un componente compartido; cada documento de
endpoint lista los estados específicos que importan para esa pantalla.
