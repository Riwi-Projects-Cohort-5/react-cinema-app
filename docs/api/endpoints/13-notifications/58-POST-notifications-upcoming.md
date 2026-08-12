# POST /api/v1/notifications/upcoming

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-005** — Próximos estrenos. Acción complementaria de `GET /movies/upcoming` y `GET /movies/{movieId}`: esta es la llamada de suscripción "Notificarme". Sin alias de backlog — el backlog no separó esta acción en su propia ruta.

## Propósito
Crea una suscripción de recordatorio de estreno para una película próxima. Cuando la película esté por estrenarse, la plataforma notifica al usuario suscrito (push/correo). Se invoca desde el botón "Notificarme" en las tarjetas de próximos estrenos y en la pantalla de detalle de la película. La respuesta de lista (`GET /movies/upcoming`) refleja el estado resultante mediante `notifiedByUser`.

## Método HTTP
POST

## URL
`/api/v1/notifications/upcoming` (URL completa: `https://api.multicine.com/api/v1/notifications/upcoming`)

Sub-ruta estática — nunca colisiona con `/notifications/{notificationId}` porque los ids son UUID (convenciones §8).

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Los usuarios anónimos deben iniciar sesión primero — el frontend abre el modal de autenticación antes de llamar (ver Consideraciones de frontend).

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la UI; los mensajes de error los localiza el backend) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, devuelto por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "movieId": "8a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d"
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `movieId` | UUID v4 | Sí | La película próxima sobre la que se notificará (convenciones §8). Debe existir y seguir siendo un próximo estreno. |

## Respuestas de éxito

**201 Created** — suscripción creada.

```json
{
  "subscriptionId": "c4d5e6f7-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  "movieId": "8a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
  "status": "ACTIVE",
  "message": "Te avisaremos del estreno"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `subscriptionId` | UUID | Id del registro de suscripción (convenciones §8) |
| `movieId` | UUID | Refleja la petición; coincide con la película a la que el usuario se suscribió |
| `status` | enum | Siempre `ACTIVE` al crearse |
| `message` | string | Se muestra textualmente bajo el botón deshabilitado |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Cuerpo malformado |
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3); si el refresh falla → modal de autenticación, reanudar la intención tras iniciar sesión |
| 404 | `NOT_FOUND` | La película no existe o ya no es un próximo estreno |
| 409 | `ALREADY_SUBSCRIBED` | Ya suscrito — **idempotente**: el servidor devuelve la suscripción existente con la misma forma que un `201`. Tratarlo como éxito, sin toast de error. |
| 422 | `VALIDATION_ERROR` | `movieId` no es un UUID válido (`details` apunta al campo, §4) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — ya suscrito (`409`, idempotente):

```json
{
  "error": {
    "code": "ALREADY_SUBSCRIBED",
    "message": "Ya estás suscrito para este estreno.",
    "requestId": "req_01HZ4..."
  }
}
```

Ejemplo completo — película no encontrada o ya estrenada (`404`):

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "La película no está disponible o ya no es un próximo estreno.",
    "requestId": "req_01HZ5..."
  }
}
```

## Consideraciones de frontend
- **Clic anónimo** en "Notificarme" → abrir el modal de autenticación; al iniciar sesión correctamente (se recuerda la ruta prevista, convenciones §3) **reanudar la misma intención** — encolar el `movieId` y hacer esta llamada sin que el usuario vuelva a tocar.
- En caso de éxito: deshabilitar el botón y fijar su etiqueta con el `message` devuelto ("Te avisaremos del estreno"). No mostrar toast para la vía "ya suscrito" (no es un error).
- Invalidar `["movies", "upcoming"]` (y `["movies", movieId]` si la pantalla de detalle está abierta) para que la lista se vuelva a obtener y `notifiedByUser` pase a `true` — nunca fijar esa bandera manualmente.
- **Estado ya suscrito**: las respuestas de lista/detalle ya traen `notifiedByUser: true` → renderizar el estado deshabilitado "Notificado" desde el inicio; no llamar a este endpoint.
- TanStack Query: `useMutation` de un solo disparo con clave `movieId`; `mutationKey: ["notifications", "upcoming", movieId]`. No hay caché GET que invalidar más allá de las claves de películas anteriores.
- Ante `404` (película estrenada mientras tanto) → ocultar silenciosamente el botón deshabilitado o cambiar la tarjeta a "Ya en cartelera" (según `GET /movies/upcoming`).

## Reglas de validación
Validar ANTES de enviar:
- `movieId` es un UUID v4 válido.
- Solo mostrar/permitir el botón mientras la película siga siendo un próximo estreno (`releaseDate`/`releaseCityDate` en el futuro según `GET /movies/upcoming`).
- Deshabilitar el botón mientras la mutación está en vuelo (sin doble suscripción).

## Reglas de negocio
- Solo se pueden suscribir películas **próximas**; una vez estrenada, el servidor rechaza la llamada (`404`).
- La suscripción es única por usuario + película; un duplicado resuelve a la suscripción existente (`409 ALREADY_SUBSCRIBED`), por lo que la operación es efectivamente idempotente.
- El usuario es notificado cerca del estreno usando sus canales configurados (respeta las preferencias de notificación del usuario).

## Notas de seguridad
- La suscripción está ligada al usuario autenticado; los usuarios solo pueden ver/gestionar las suyas.
- Sin datos sensibles en la petición o la respuesta; el id de la película es un UUID público (convenciones §8).

## Flujo de ejemplo
1. El usuario en "Próximos estrenos" toca "Notificarme" en una tarjeta.
2. Sin sesión iniciada → modal de autenticación → el inicio de sesión se completa → se envía el `movieId` encolado.
3. `POST /api/v1/notifications/upcoming { movieId }` → `201`.
4. Botón deshabilitado con el mensaje "Te avisaremos del estreno".
5. `["movies", "upcoming"]` invalidada → el siguiente render de la lista muestra `notifiedByUser: true`.
6. El usuario regresa más tarde → botón ya deshabilitado ("Notificado").
