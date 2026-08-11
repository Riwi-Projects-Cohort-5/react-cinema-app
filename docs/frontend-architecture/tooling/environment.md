# Variables de entorno

## Descripción

La configuración de entorno del frontend se declara en `.env.example` y se valida en runtime al arrancar la aplicación. Ningún valor se hardcodea en componentes; `httpClient` y los servicios consumen `env` (`@config/env`).

## Variables

| Variable              | Ejemplo                            | Descripción                      |
| --------------------- | ---------------------------------- | -------------------------------- |
| `VITE_API_BASE_URL`   | `https://api.multicine.com/api/v1` | URL base versionada de la API.   |
| `VITE_API_TIMEOUT_MS` | `15000`                            | Timeout por petición en ms.      |

- Definidas en `.env.example`; copiar a `.env.local` para desarrollo.
- Tipadas en `src/vite-env.d.ts` (interface `ImportMetaEnv`).

> `VITE_API_BASE_URL` corresponde a la [URL base versionada del contrato de API](../../api/00-conventions.md#1-url-base-y-versionado): el frontend configura la versión de la API en un único lugar y ningún componente hardcodea URLs.

## Validación en runtime

`src/config/env.ts` valida las variables al arrancar la app con un schema Zod y **falla rápido** con un mensaje claro si un valor es inválido:

- `VITE_API_BASE_URL` acepta una URL `http(s)` o una ruta raíz-relativa (p. ej. `/api/v1`).
- `VITE_API_TIMEOUT_MS` debe ser un entero positivo.
- Ambos tienen default (`/api/v1` y `15000`).

## Uso

```ts
import { env } from "@config/env";
```

## Documentos relacionados

- [Cliente HTTP](../data-layer/http-client.md) — consume `env` para `baseURL` y `timeout`.
- [Despliegue](./deployment.md) — inyección de `VITE_API_BASE_URL` en build.
- [Convenciones de API](../../api/00-conventions.md#1-url-base-y-versionado) — URL base y versionado.
