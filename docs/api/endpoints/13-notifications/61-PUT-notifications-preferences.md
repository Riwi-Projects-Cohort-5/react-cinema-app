# PUT /api/v1/notifications/preferences

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-015** — Notificaciones por correo. Centro de preferencias para notificaciones de marketing/opcionales; los ajustes transaccionales se exponen en solo lectura.

## Propósito
Actualiza las preferencias de notificación de marketing del usuario autenticado (comunicaciones opcionales: promociones, próximos estrenos, correo de marketing). Los ajustes transaccionales (entradas, facturas, confirmaciones de pedido, seguridad) se devuelven pero nunca se pueden modificar — el servidor ignora cualquier intento de desactivarlos.

## Método HTTP
PUT

## URL
`/api/v1/notifications/preferences` (URL completa: `https://api.multicine.com/api/v1/notifications/preferences`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3). Las preferencias son por usuario.

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
  "marketingEmail": true,
  "upcomingReleases": true,
  "promotions": false
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `marketingEmail` | boolean | Sí | Interruptor maestro para correos de marketing |
| `upcomingReleases` | boolean | Sí | Recordatorios de próximos estrenos (la función "Notificarme") |
| `promotions` | boolean | Sí | Ofertas promocionales, alertas Cine Flash, etc. |

Todos los campos son opcionales en el sentido de que los omitidos se dejan sin cambios; al menos uno debe estar presente.

## Respuestas de éxito

**200 OK** — preferencias guardadas. Se devuelve el conjunto efectivo completo, incluido el grupo transaccional de solo lectura.

```json
{
  "preferences": {
    "marketingEmail": true,
    "upcomingReleases": true,
    "promotions": false,
    "transactionalEmail": true,
    "transactionalPush": true,
    "transactionalSms": true
  }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `marketingEmail` / `upcomingReleases` / `promotions` | boolean | Los valores editados (efectivos en el servidor) |
| `transactionalEmail` / `transactionalPush` / `transactionalSms` | boolean | **Solo lectura.** Entradas, facturas, confirmaciones de pedido y avisos de seguridad — siempre `true`, mostrados deshabilitados en la UI. |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Cuerpo malformado (p. ej. sin campos reconocidos) |
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 422 | `VALIDATION_ERROR` | Un campo no es booleano (`details` apunta al campo, §4) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (convenciones §10) |
| 500 | `SERVER_ERROR` | Error genérico reintentable (§13) |

Ejemplo completo — booleano inválido (`422`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Uno o más campos tienen un valor inválido.",
    "details": [
      { "field": "promotions", "message": "promotions debe ser un booleano (true o false)" }
    ],
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- Renderizar **interruptores** (toggles) para `marketingEmail`, `upcomingReleases` y `promotions`.
- **Actualización optimista** con rollback: alternar el interruptor de inmediato, `PUT` del objeto completo, en caso de error revertir al valor anterior y mostrar un toast de error.
- Toast de éxito: "Preferencias guardadas".
- **Fila transaccional**: siempre mostrada como **activa y deshabilitada**, con un ícono de candado y un tooltip ("No puedes desactivar las notificaciones transaccionales como entradas, facturas o seguridad").
- TanStack Query clave `["notifications", "preferences"]`; después del `PUT`, `setQueryData` con la respuesta del servidor (no invalidar-revertir a mitad de edición).
- Ante `401` en pleno vuelo, el interceptor maneja el refresh (§3); al cerrar sesión la caché se limpia.
- Evitar alternar dos veces rápido — deshabilitar los interruptores mientras la mutación está en vuelo.

## Reglas de validación
Validar ANTES de enviar:
- Cada campo presente es booleano (`typeof === "boolean"`).
- Enviar al menos un campo reconocido.
- Reflejar exactamente el estado actual de la UI; nunca enviar los campos transaccionales de solo lectura.

## Reglas de negocio
- **Las comunicaciones transaccionales nunca se pueden desactivar** (entradas, facturas, confirmaciones de pedido, correos de seguridad/restablecimiento). Los intentos de apagarlas se ignoran del lado del servidor y se devuelve el valor efectivo `true`.
- La función "Notificarme" respeta `upcomingReleases`; los usuarios que la desactiven no recibirán recordatorios de estreno aunque estén suscritos.
- Los cambios de preferencias aplican a notificaciones **futuras**; las ya enviadas no se ven afectadas.

## Notas de seguridad
- Las preferencias son privadas del usuario autenticado — nunca rellenar desde flags guardados ni localStorage.
- Los flags transaccionales de solo lectura son informativos; imponer la UI deshabilitada/bloqueada independientemente de cualquier estado del cliente.

## Flujo de ejemplo
1. El usuario abre "Notificaciones" → `GET` del conjunto actual (mediante la consulta `["notifications", "preferences"]`).
2. El usuario alterna `promotions` a apagado → el interruptor cambia (optimista).
3. `PUT /api/v1/notifications/preferences { marketingEmail: true, upcomingReleases: true, promotions: false }`.
4. `200` → caché actualizada con la respuesta del servidor → toast "Preferencias guardadas".
5. El usuario intenta alternar la fila transaccional → está deshabilitada/bloqueada — no se envía ninguna petición.
