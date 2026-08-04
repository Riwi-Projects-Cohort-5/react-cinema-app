# POST /api/v1/memberships

## Historia de usuario relacionada
- **HU-FE-006** — Registro de usuario. Alias de backlog: `POST /membership/create` (rediseñado para consistencia REST — nomenclatura de colección de recursos).

## Propósito
Activa/crea la membresía del usuario. En el flujo normal, la membresía se crea automáticamente justo después de la verificación del correo (HU-FE-006); este endpoint también se expone para el flujo explícito de "unirse a la membresía" y es idempotente, así que una llamada duplicada es segura.

## Método HTTP
POST

## URL
`/api/v1/memberships` (URL completa: `https://api.multicine.com/api/v1/memberships`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; el backend localiza los mensajes de error) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, replicado por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "cityId": "8f7e6d5c-4b3a-4c2d-9e1f-0a1b2c3d4e5f"
}
```

| Campo | Tipo | ¿Obligatorio? | Notas |
|---|---|---|---|
| `cityId` | UUID | No | Ciudad preferida para la membresía. Ausente → se usa el `cityId` del perfil (convenciones §8) |

Un cuerpo vacío `{}` es válido.

## Respuestas de éxito

**201 Created** — membresía activada.

```json
{
  "membershipId": "3c2d1e0f-9a8b-7c6d-5e4f-3a2b1c0d9e8f",
  "level": "BASIC",
  "memberNumber": "MC-2026-0001234",
  "message": "¡Bienvenido al programa de membresía!"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `membershipId` | UUID | Id de la nueva membresía (convenciones §8) |
| `level` | string | Siempre `BASIC` al crear (los niveles se ganan, ver `GET /membership/levels`) |
| `memberNumber` | string | Número legible (según convenciones §8, no es un UUID) |

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 409 | `ALREADY_EXISTS` | El usuario ya tiene una membresía → tratarlo como **éxito** (idempotente), navegar a Mi cuenta |
| 422 | `VALIDATION_ERROR` | `cityId` inválido; `details` se mapea a los campos (§4) |
| 429 | `RATE_LIMITED` | Respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Error reintentable (§13) |

Ejemplo completo — ya es miembro (`409`):

```json
{
  "error": {
    "code": "ALREADY_EXISTS",
    "message": "Ya tienes una membresía activa",
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- Se llama desde la pantalla posterior a la verificación (CTA "Activar membresía") y desde el estado vacío "sin membresía" de la tarjeta de membresía.
- **Evitar llamadas duplicadas**: comprobar primero `GET /membership` (clave `["membership"]`) — si resuelve 200, ocultar la CTA por completo.
- Al éxito: invalidar `["membership"]` y `["profile"]` (el perfil incrusta el resumen de membresía) y luego navegar a "Mi cuenta".
- `409 ALREADY_EXISTS` → tratar como éxito: invalidar y navegar (idempotente), sin mostrar un error.
- Spinner de carga en la CTA mientras esté en curso; deshabilitar el botón (guarda de doble clic).
- `422` en `cityId` → mostrar un error en línea en el selector de ciudad.
- Seguir los estados de convenciones §13: cargando, éxito (redirección), error recuperable (reintentar), cuenta regresiva de 429.

## Reglas de validación
- `cityId` debe ser un UUID válido; si se envía, debe referenciar una ciudad existente (el servidor lo vuelve a comprobar).
- No se mueve dinero ni se crea una reserva → no se necesita `X-Idempotency-Key` (§9).

## Reglas de negocio
- La membresía se **crea automáticamente después de la verificación del correo** en el flujo estándar de HU-FE-006; este endpoint es la versión explícita e idempotente de esa activación.
- La creación siempre inicia en `BASIC`; los niveles superiores se alcanzan acumulando puntos (HU-FE-023).
- Un usuario sin cuenta verificada por correo no puede crear una membresía (ruta `403`/`401` según §3).

## Notas de seguridad
- Alcance del propietario (§3): crea una membresía solo para el usuario autenticado.
- Límite de tasa por usuario para evitar spam de membresías (§10).
- `memberNumber` y `membershipId` son capacidades del programa de fidelización — nunca registrarlos ni exponerlos en URLs más allá de las pantallas previstas.

## Flujo de ejemplo
```
User verifies email → "Cuenta activada" screen
↓
Shows "Activar membresía" CTA (hidden if GET /membership already 200)
↓
User clicks → POST /memberships { cityId }
↓
Loading spinner on button
↓
201 → invalidate ["membership"] + ["profile"]
↓
Navigate to "Mi cuenta" (membership card visible)
(409 ALREADY_EXISTS → same outcome, no error)
```
