# GET /api/v1/health

## Historia de usuario relacionada
- **HU-FE-001** — Configuración de la plataforma frontend (verificación de arranque). **HU-FE-029** — Consumo de API pública (conectividad/disponibilidad de la plataforma).

## Propósito
Sonda de liveness/readiness de la API de Multicine. Se llama **una vez al arrancar la app** (y de nuevo tras una reconexión) para decidir si se muestra el banner global de conectividad. Es deliberadamente pequeña, rápida y no bloqueante: la app arranca sin importar su resultado y solo cambia el estado del banner. La respuesta no trae datos de negocio.

## Método HTTP
GET

## URL
`/api/v1/health` (URL completa: `https://api.multicine.com/api/v1/health`)

## Autenticación
- Pública. No se requiere token. No se aplica límite de peticiones más allá de las reglas compartidas (convenciones §10).

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (convenciones §2) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, que el servidor repite para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — servicio en buen estado.

```json
{
  "status": "ok",
  "service": "multicine-api",
  "version": "v1",
  "timestamp": "2026-08-10T20:00:00Z",
  "database": "ok",
  "uptimeSeconds": 86400
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `status` | string | `"ok"` — saludable |
| `service` | string | Constante `"multicine-api"` (para etiquetado en logs/análisis) |
| `version` | string | Versión de la API `"v1"` |
| `timestamp` | string | ISO 8601 UTC (convenciones §7) |
| `database` | string | `"ok"` cuando la sonda de lectura de la BD pasa |
| `uptimeSeconds` | integer | Tiempo de actividad del proceso del servidor; solo informativo |

## Respuestas de error

Cualquier respuesta no-2xx significa que la plataforma está inalcanzable o degradada. Ante un `503` (o fallo de red) el frontend muestra el banner no bloqueante. El cuerpo usa la envoltura de convenciones §4 y `status` puede ser `"degraded"`:

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "El servicio está degradado o en mantenimiento",
    "requestId": "req_01HZ3KQ8VX2ZP9",
    "retryAfterSeconds": 30
  }
}
```

## Consideraciones de frontend
- **Se llama una vez al arrancar** (antes/en paralelo a los datos de la primera pantalla) y **de nuevo tras un evento de reconexión** (`online`) o cuando las peticiones empiezan a fallar con errores de conectividad.
- Decide el **banner global** (sin conexión/degradado) — **nunca bloquea toda la app**: el usuario puede seguir navegando y los datos en caché de TanStack Query se siguen renderizando (estado sin conexión §13).
- **Reintentos con backoff exponencial** (p. ej. 1s, 2s, 4s … con tope de ~60s) y un **tope de reintentos** (p. ej. 5 intentos) para que un backend caído no sature la red; el banner permanece mientras se reintenta.
- Clave de TanStack Query `["health"]`; `staleTime` 30s para que los montajes repetidos reutilicen la última sonda en lugar de relanzarla; `refetchOnReconnect: true`.
- No uses los datos de health para feature flags — el versionado y la disponibilidad de negocio provienen de las respuestas reales de los endpoints.
- Registra el estado de health en la herramienta de monitoreo (no bloqueante) para el análisis de fallos al arrancar.

## Reglas de validación
- Ninguna (del lado del cliente). No hay parámetros que validar — siempre es un GET sin más.

## Reglas de negocio
- La sonda solo reporta conectividad/disponibilidad de la plataforma — no es una verificación de estado de negocio y debe permanecer libre de health por módulo (la degradación de un módulo se manifiesta a través de los errores de ese módulo).
- El `503` con `retryAfterSeconds` guía el calendario de reintentos (convenciones §10).

## Notas de seguridad
- La respuesta no contiene **información sensible** — sin detalles de infraestructura, hostnames, nombres de BD, versiones más allá del `version` de la API, ni identificadores internos.
- Endpoint público; seguro de llamar sin autenticación desde la ruta de arranque.

## Flujo de ejemplo
1. La app arranca → `GET /health` se dispara en paralelo con las primeras peticiones de datos.
2. 200 `{ status: "ok", ... }` → sin banner; la app se renderiza con normalidad.
3. Una petición posterior falla con un error de conectividad → `GET /health` se vuelve a disparar.
4. `503` (o fallo de red) → aparece el banner global "Conexión inestable"; los reintentos continúan con backoff (con tope).
5. La health se recupera → el banner desaparece; las consultas de datos se reanudan vía `refetchOnReconnect`.
