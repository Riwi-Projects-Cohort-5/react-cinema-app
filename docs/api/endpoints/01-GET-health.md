# GET /health

> **Disponible en el backend.** El endpoint `GET /health` responde `200 OK` cuando el servicio se encuentra disponible.

## Historia de usuario relacionada

* **HU-FE-001** — Configuración de la plataforma frontend (verificación de arranque).
* **HU-FE-029** — Consumo de API pública (conectividad/disponibilidad de la plataforma).

## Propósito

Sonda de liveness/readiness de la API de Multicine. Se llama una vez al arrancar la app y nuevamente tras una reconexión para decidir si se muestra el banner global de conectividad.

La respuesta proporciona información sobre la disponibilidad del servicio y el estado de sus servicios dependientes.

## Método HTTP

GET

## URL

`{{baseUrl}}/health`

## Autenticación

* Pública.
* No se requiere token.

## Cabeceras

| Cabecera       | Requerida   | Descripción                                    |
| -------------- | ----------- | ---------------------------------------------- |
| `Accept`       | Recomendada | `application/json`                             |
| `X-Request-Id` | Opcional    | UUID generado por el cliente para trazabilidad |

## Parámetros de ruta

Ninguno.

## Parámetros de consulta

Ninguno.

## Cuerpo de la petición

Ninguno. Petición GET.

## Respuestas de éxito

**200 OK** — servicio disponible y saludable.

```json
{
  "status": "OK",
  "uptime": 86400,
  "timestamp": "2026-08-10T20:00:00Z",
  "services": {
    "database": "UP"
  }
}
```

| Campo               | Tipo   | Notas                                                                                     |
| ------------------- | ------ | ----------------------------------------------------------------------------------------- |
| `status`            | string | Estado general del servicio. `OK` indica que el servicio está saludable.                  |
| `uptime`            | number | Tiempo de actividad del proceso del servidor.                                             |
| `timestamp`         | string | Fecha y hora de la respuesta en formato ISO 8601.                                         |
| `services.database` | string | Estado de la base de datos. `UP` indica que la sonda de la base de datos está disponible. |

## Respuestas de error

Cualquier respuesta no-2xx significa que la plataforma está inalcanzable o degradada.

Ante un `503` o un fallo de red, el frontend muestra el banner no bloqueante de conectividad y continúa con los reintentos configurados.

Ejemplo:

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

* Se llama una vez al arrancar la aplicación y nuevamente tras un evento de reconexión.
* La consulta utiliza la clave de TanStack Query `["health"]`.
* `staleTime` es de 30 segundos.
* `refetchOnReconnect` está habilitado.
* Se realizan hasta 5 reintentos con backoff exponencial.
* El health check no bloquea el funcionamiento de la aplicación.
* Cuando `services.database` es `UP`, el frontend considera que el servicio está saludable.
* Los datos de health no deben utilizarse para feature flags.

## Reglas de validación

Ninguna del lado del cliente. No hay parámetros que validar.

## Reglas de negocio

La sonda reporta conectividad y disponibilidad de la plataforma. No representa el estado funcional de módulos específicos del negocio.

## Notas de seguridad

La respuesta no contiene información sensible.

El endpoint es público y puede consultarse sin autenticación.

## Flujo de ejemplo

1. La aplicación arranca y ejecuta `GET /health`.
2. Una respuesta `200 OK` con `status: "OK"` y `services.database: "UP"` indica que el servicio está disponible.
3. El frontend muestra `Servicio en línea`.
4. Si el endpoint devuelve un error o falla la conexión, el frontend muestra `Conexión inestable`.
5. Los reintentos continúan según la configuración de TanStack Query.
6. Cuando el health check vuelve a responder correctamente, el estado del indicador se actualiza.
