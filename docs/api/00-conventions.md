# Multicine API — Convenciones compartidas

> Este documento define las convenciones que aplican a **todos** los endpoints de este contrato de
> API. Cada documento de endpoint de esta carpeta asume estas convenciones y solo documenta lo
> específico de ese endpoint. Lee este documento primero.
>
> **Sincronización con el backend:** los valores de este documento reflejan la colección Postman
> compartida por el backend. Donde el backend aún no implementa una convención (paginación,
> idempotencia), se indica explícitamente para que el frontend no asuma comportamientos inexistentes.

## 1. URL base y versionado

- La URL base la provee el backend y se configura **en un único lugar** en el frontend (un archivo de
  configuración leído desde `VITE_API_BASE_URL`), nunca por componente.
- Referencia práctica: `{{baseUrl}}/{recurso}` (p. ej. `{{baseUrl}}/countries`,
  `{{baseUrl}}/auth/login`). El valor real (dev, QA, producción) se mapea a `VITE_API_BASE_URL`.
- Los endpoints listados en **HU-FE-029** deben resolverse siempre contra esta URL base.

## 2. Cabeceras comunes

| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | En endpoints autenticados | `Bearer <accessToken>` |
| `Content-Type` | En peticiones con cuerpo | `application/json` (o `multipart/form-data` para subida de archivos) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es`. Los mensajes de error los localiza el backend (a confirmar su soporte por endpoint). |
| `X-Request-Id` | Opcional | Id de petición generado por el cliente (UUID). El servidor lo devuelve para trazabilidad. |
| `X-Idempotency-Key` | Prevista en mutaciones de dinero/reservas | Prevista por el contrato para garantizar ejecución exactamente una vez (ver §9). El backend aún no la implementa. |

## 3. Autenticación

### Access token
- JWT de corta duración (15 minutos, **RN-028**) devuelto por `POST /auth/login` y
  `POST /auth/refresh`.
- Se envía como `Authorization: Bearer <token>`.
- **Se guarda en memoria** (estado de React / Zustand / context) — nunca en `localStorage` ni
  `sessionStorage`.

### Refresh token
- JWT de larga duración (7 días, **RN-029**) **devuelto en el cuerpo JSON** de `POST /auth/login`
  (campo `refreshToken`), no en una cookie.
- El frontend lo conserva para renovar sesión: se envía en el **cuerpo** de `POST /auth/refresh`
  (`{ "refreshToken": "..." }`). En `POST /auth/logout` la petición se autoriza con
  `Authorization: Bearer <accessToken>` y el servidor invalida el refresh token de la sesión.
- **Cada inicio de sesión invalida el refresh token anterior (RN-030)**; un refresh exitoso rota el
  token, por lo que el cliente debe reemplazar el valor almacenado con el que devuelva la respuesta.

### Flujo de renovación de token (gestionado por el interceptor central del cliente HTTP)
1. Una petición devuelve `401` (o el cliente detecta access token expirado).
2. El interceptor llama a `POST /auth/refresh` con el `refreshToken` guardado **una sola vez**.
3. Si el refresh tiene éxito → guardar el nuevo `accessToken` (y el `refreshToken` rotado) y
   reintentar la petición original **exactamente una vez**.
4. Las peticiones concurrentes que fallen mientras hay un refresh en curso se **ponen en cola** y se
   reintentan cuando el refresh resuelva — nunca lanzar refreshes en paralelo.
5. Si el refresh falla → limpiar la sesión, notificar al store de autenticación y redirigir al login
   (recordando la ruta a la que se dirigía).

### Cierre de sesión
- `POST /auth/logout` con `Authorization: Bearer <accessToken>` invalida el refresh token en el
  servidor; el cliente limpia el access/refresh token en memoria y toda la caché de TanStack Query
  (`queryClient.clear()`).

## 4. Envelope de error estándar

Toda respuesta no-2xx usa esta forma (mensaje legible, en español):

```json
{
  "error": "Pelicula con ID 999 no encontrada o inactiva."
}
```

- El backend actual expone un único campo `error` con el mensaje. **No** incluye códigos máquina ni
  `details` por campo todavía.
- El frontend debe mapear el comportamiento por **código HTTP** (tabla siguiente) y, cuando esté
  disponible, por el texto de `error`.
- Los mensajes deben mostrarse tal cual o usarse como base para un mensaje amigable por estado.

### Comportamiento por código de estado

| HTTP | Escenario típico | Comportamiento en frontend |
|---|---|---|
| 400 | Petición malformada / payload inválido / correo duplicado | Mostrar el mensaje de `error` (p. ej. "El correo electrónico ya se encuentra registrado") |
| 401 | Credenciales inválidas | "Credenciales inválidas"; si el backend indica intentos restantes, mostrarlos (ver login) |
| 404 | Recurso inexistente o película inactiva | "Película no disponible" con enlace de vuelta a la cartelera |
| 423 | Cuenta bloqueada temporalmente (5 fallos seguidos) | Mostrar cuenta regresiva ~15 min y deshabilitar el envío |
| 429 | Rate limit | Respetar la cabecera `x-ratelimit-reset` (ver §10) |
| 500 | Error inesperado | Error genérico reintentable (§13) |
| 503 | Mantenimiento / degradado | Banner no bloqueante (§13) |

## 5. Paginación

> ⚠️ **Desactualizado — verificado el 2026-09-10 contra el Mock Server de backend.** La API **sí**
> usa una envoltura: toda respuesta llega como `{ "success": true, "data": ... }`, y la colección
> publicada afirma que aplica a los 57 endpoints. Se comprobó llamando `/countries`,
> `/departments/{id}` y `/cities/{id}`.
>
> Impacto: cualquier servicio que lea la respuesta de axios directamente recibirá un objeto, no un
> arreglo. Hoy `features/location/services/location.service.ts` y `features/movies/services/movies.service.ts` desenvuelven la envoltura dentro de
> la feature; **falta decidir en equipo** si se mueve a un interceptor de `httpClient` para no
> repetirlo en cada feature. Esta sección debe reescribirse cuando se tome esa decisión.

- **Estado actual (obsoleto, ver aviso de arriba):** se documentó que los endpoints de listado
  (`/countries`, `/departments/{id}`, `/cities/{id}`, `/movies`, `/movies/{id}/functions`, …)
  devolvían un **arreglo plano** JSON — **sin** envelope.
- El frontend no debe asumir paginación del lado del servidor ni paginar con `page`/`pageSize` hasta
  que el backend la exponga.
- **Prevista (a confirmar):** si el backend la implementa, usaría este envelope:

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

- Frontend (TanStack Query): tratar la respuesta como arreglo plano hoy; si el backend introduce el
  envelope, migrar con `keepPreviousData` para paginación fluida.

## 6. Dinero y moneda

- Todos los montos son enteros que representan **COP (pesos colombianos) sin decimales**.
- El backend los expone como **número simple** en el JSON (p. ej. `"price": 18000`), sin objeto
  `{ amount, currency }`.
- Nunca hacer aritmética de moneda en componentes con punto flotante; calcular totales en el cliente
  solo en COP entero (y preferir re-derivar los totales desde la respuesta del carrito del servidor).

## 7. Fechas y zonas horarias

- Los timestamps son strings **ISO 8601 UTC** con sufijo `Z`, p. ej. `2026-08-10T15:30:00.000Z`
  (el backend los expone con milisegundos `.000Z`).
- Las fechas sin hora (`releaseDate`) usan `YYYY-MM-DD`.
- Mostrar en `America/Bogota`; las cuentas regresivas deben calcularse contra `Date.now()` (UTC)
  menos los deltas que el servidor exponga para evitar deriva por desfase de reloj.
- Librerías frontend: `date-fns` + `date-fns-tz` (o equivalente); nunca `new Date("YYYY-MM-DD")`
  sin especificar la intención de zona horaria.

## 8. IDs y enums

- Todos los ids de recursos son **enteros autoincrementales** (p. ej. `"id": 1`) — **no** UUIDs.
  Las sub-rutas estáticas (`/movies/weekly`, `/movies/today`, `/movies/filter`) se resuelven por
  literal de ruta antes que `{movieId}`, así que no hay colisión (a confirmar con el backend).
- Los enums/categorías se exponen como **strings legibles de display** (p. ej. `genre: "Accion"`,
  `classification: "PG-13"`, `language: "Ingles"`, `format: "IMAX"`), no snake_case.
- Los booleanos se usan para flags de estado (`isActive`, `isSubtitled`, `available`).

## 9. Claves de idempotencia

- **Prevista (a confirmar con el backend):** `X-Idempotency-Key` en mutaciones de dinero/reservas
  (pagos, confirmación de orden, canje, transferencia). El backend aún no la implementa.
- Mientras tanto, el cliente debe evitar duplicados a nivel de UI (deshabilitar botones durante el
  envío) y tratar los `400`/`409` con mensaje de `error` como conflictos de estado.

## 10. Rate limiting (429)

- El backend responde `429` y expone las cabeceras `x-ratelimit-limit`, `x-ratelimit-remaining` y
  `x-ratelimit-reset` (timestamp de reinicio en segundos).
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
- Las query keys siguen la ruta: `["movies", { filters }]`, `["cart"]`, `["orders", orderId]`.
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
