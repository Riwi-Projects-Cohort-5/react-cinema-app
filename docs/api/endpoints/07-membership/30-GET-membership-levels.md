# GET /api/v1/membership/levels

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-023** — Programa de fidelización y puntos. Renderiza la escalera de niveles de membresía y el progreso hacia el siguiente nivel.

## Propósito
Devuelve los niveles de membresía (nombre, puntos mínimos, color de insignia y beneficios por nivel). El frontend lo usa para renderizar la barra de progreso "faltan X puntos para Nivel Y" y la tabla de niveles.

## Método HTTP
GET

## URL
`/api/v1/membership/levels` (URL completa: `https://api.multicine.com/api/v1/membership/levels`)

## Autenticación
- Autenticado (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | ¿Obligatoria? | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |
| `Accept-Language` | Opcional | `es` (idioma de la interfaz; el backend localiza los mensajes de error) |
| `X-Request-Id` | Opcional | UUID generado por el cliente, replicado por el servidor para trazabilidad |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno.

## Respuestas de éxito

**200 OK** — lista de niveles ordenada (ascendente por `minPoints`).

```json
{
  "data": [
    {
      "id": "lv_basic",
      "name": "BASIC",
      "minPoints": 0,
      "color": "#64748B",
      "benefits": ["2x1 en dulcería", "Envío de ofertas por correo"]
    },
    {
      "id": "lv_plus",
      "name": "PLUS",
      "minPoints": 1000,
      "color": "#0EA5E9",
      "benefits": ["Descuento 10% en boletas", "Preventa de estrenos"]
    },
    {
      "id": "lv_gold",
      "name": "GOLD",
      "minPoints": 5000,
      "color": "#F59E0B",
      "benefits": ["Entrada gratis cada 10 compras", "Acceso a eventos VIP"]
    }
  ]
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | Clave estable del nivel (p. ej. `lv_basic`) — coincide con `level.id` en `GET /membership` |
| `name` | string | Nombre visual del nivel (p. ej. `BASIC`, `PLUS`, `GOLD`) |
| `minPoints` | integer | Puntos requeridos para alcanzar este nivel |
| `color` | string | Color de acento de la insignia (hex) — solo visual |
| `benefits` | string[] | Etiquetas cortas de beneficios para la tabla de niveles |

## Respuestas de error
Todos los errores usan el sobre compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 500 | `SERVER_ERROR` | Error reintentable (§13) |

Ejemplo completo — error del servidor (`500`):

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Error inesperado. Intenta de nuevo.",
    "requestId": "req_01HZ8..."
  }
}
```

## Consideraciones de frontend
- Clave de TanStack Query: `["membership", "levels"]`.
- **Altamente cacheable** — los umbrales de niveles cambian raramente; usar un `staleTime` largo (p. ej. 24 h) y `gcTime` de horas.
- Barra de progreso: puntos actuales de `GET /membership`, objetivo = `minPoints` de `nextLevel` → "Te faltan X puntos para Nivel Y" (calculado del lado del cliente solo en puntos enteros).
- Nivel superior → barra de progreso llena, "Eres Nivel GOLD" sin objetivo posterior.
- Skeleton mientras carga; error recuperable con reintento (§13).
- Tabla de niveles (nombre, insignia de color, beneficios) renderizada desde esta respuesta.
- La comparten la pantalla de puntos (HU-FE-023) y la tarjeta de membresía; mantenerla bajo una sola clave de query.

## Reglas de validación
- Ninguna (llamada de solo lectura).

## Reglas de negocio
- Los niveles se ordenan por `minPoints` ascendente; el frontend no debe reordenarlos.
- El nivel actual de un usuario es **autoridad del servidor** (`GET /membership`) — la lista de niveles solo define umbrales y textos.
- `minPoints` nunca cambia sin una promoción/cambio de configuración del backend; la caché obsoleta es aceptable (por eso `staleTime` largo).

## Notas de seguridad
- Datos cuasi-públicos de solo lectura, pero se mantienen autenticados para alinearse con el uso de HU-FE-023 (programa de puntos).
- No se devuelve PII; aun así, no registrar la respuesta completa.

## Flujo de ejemplo
```
User opens the membership/points screen
↓
GET /membership (points) + GET /membership/levels (tiers)
↓
Both cached → skeleton while first load
↓
Compute "faltan X puntos para Nivel Y" from points vs nextLevel.minPoints
↓
Render progress bar + tier table
(Subsequent visits served from cache thanks to long staleTime)
```
