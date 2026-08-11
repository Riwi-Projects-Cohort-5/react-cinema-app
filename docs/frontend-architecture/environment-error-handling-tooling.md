# Environment, Error Handling and Tooling

## Alcance

Documenta el subtask **MULT-32** (HU-FE-001 / MULT-29): configuración de entorno, manejo global de
errores, notificaciones visuales, ESLint/Prettier y despliegue con Docker del frontend.

Complementa:
- [`http-client.md`](./http-client.md) — cliente HTTP centralizado, interceptores y modelo `ApiError`.
- [`docs/api/00-conventions.md`](../api/00-conventions.md) — envelope de error estándar y códigos de error.

---

## 1. Variables de entorno

| Variable                 | Ejemplo                            | Descripción                      |
| ------------------------ | ---------------------------------- | -------------------------------- |
| `VITE_API_BASE_URL`      | `https://api.multicine.com/api/v1` | URL base versionada de la API.   |
| `VITE_API_TIMEOUT_MS`    | `15000`                            | Timeout por petición en ms.      |

- Definidas en `.env.example`; copiar a `.env.local` para desarrollo.
- Tipadas en `src/vite-env.d.ts` (interface `ImportMetaEnv`).
- **Validación en runtime** (`src/config/env.ts`): un schema Zod valida las variables al arrancar la
  app y **falla rápido** con un mensaje claro si un valor es inválido. `VITE_API_BASE_URL` acepta una
  URL `http(s)` o una ruta raíz-relativa (p. ej. `/api/v1`); `VITE_API_TIMEOUT_MS` debe ser un entero
  positivo. Ambos tienen default (`/api/v1` y `15000`).
- `httpClient` y los servicios consumen `env` (`@config/env`); ningún componente hardcodea URLs.

## 2. Manejo global de errores

Tres capas complementarias:

1. **`ApiError`** (`src/services/api-error.ts`) — error normalizado que devuelven los interceptores
   del cliente HTTP (ver `http-client.md`).
2. **`registerGlobalErrorHandlers()`** (`src/services/globalErrorHandlers.ts`) — registra listeners de
   `window` para `error` (excepciones no capturadas) y `unhandledrejection` (promesas rechazadas sin
   manejar): registran en consola y muestran un toast. Se llama una vez en `src/main.tsx`.
3. **`ErrorBoundary`** (`src/shared/components/ErrorBoundary.tsx`) — boundary de clase que captura
   errores de **render** de todo el árbol debajo de él. Muestra una UI de fallback con el mensaje y un
   botón **Recargar**, o un `fallback` personalizado vía prop. Envuelve `<App/>` en `src/main.tsx`.

```tsx
// src/main.tsx
registerGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
```

## 3. Notificaciones visuales (sonner)

Capa de toasts construida sobre **sonner** (`src/services/notify.ts`), expuesta por `@services`:

| Función          | Uso                                                        |
| ---------------- | ---------------------------------------------------------- |
| `notifyError`    | Error tipado (`ApiError`, `Error`) o desconocido.          |
| `notifySuccess`  | Confirmación de una operación exitosa.                     |
| `notifyInfo`     | Información general.                                       |
| `notifyWarning`  | Advertencia.                                               |

`notifyError` mapea los campos de `ApiError`:
- `message` → descripción legible.
- `retryAfterSeconds` → "Reintenta en X s" (429, bloqueo de cuenta).
- `requestId` → id de trazabilidad del servidor.
- `onRetry` (opcional) → botón **Reintentar** que re-dispara la acción.

El `<Toaster/>` (sonner) se monta en `src/App.tsx` con `richColors` y posición `top-right`, dentro del
`QueryClientProvider`.

```ts
import { notifyError } from "@services/notify";
import { ApiError } from "@services/api-error";

try {
  // ...
} catch (error) {
  notifyError(error, { onRetry: refetch });
}
```

## 4. ESLint y Prettier

- **ESLint** (`eslint.config.js`, flat config): configs `js.recommended`, `typescript-eslint`,
  `react-hooks`, `react-refresh` + `eslint-config-prettier` al final (desactiva reglas de formato que
  no le corresponden a ESLint).
- **Prettier** (`.prettierrc.json`, convención del equipo):
  `semi: true`, `singleQuote: false`, `tabWidth: 2`, `trailingComma: "es5"`, `printWidth: 100`,
  `bracketSpacing: true`.
- `.prettierignore`: `node_modules`, `dist`, `docs`, `public`, `package-lock.json`, `.env*`.

Scripts (`package.json`):

| Script          | Comando                          |
| --------------- | -------------------------------- |
| `lint`          | `eslint . --ext ts,tsx`          |
| `lint:fix`      | ESLint con `--fix`               |
| `format`        | `prettier --write .`             |
| `format:check`  | `prettier --check .`             |

> Las comillas de los strings no se conservan mezcladas: Prettier normaliza a **dobles** (el estilo
> objetivo). ESLint acepta ambas — la normalización ocurre solo al correr `format`.

## 5. Docker

Imagen en dos etapas (`Dockerfile`):
1. **build** — `node:22-alpine`, `npm ci` + `npm run build`; `VITE_API_BASE_URL` se inyecta como build
   arg (build time).
2. **serve** — `nginx:1.27-alpine` sirve `/app/dist` con `nginx.conf`:
   - Fallback SPA (`try_files $uri $uri/ /index.html`) para las rutas de React Router.
   - Cache `public, immutable` (1 año) para `location /assets/` (assets hasheados).
   - Gzip para text/css/js/json/svg.

`.dockerignore` excluye `node_modules`, `dist`, `docs`, `.git` y `.env*`.

```bash
# Construir y levantar (puerto 8080 por defecto)
docker compose up --build

# O manual, con la URL de la API como build arg
docker build --build-arg VITE_API_BASE_URL=https://api.multicine.com/api/v1 -t multicine-frontend .
docker run -p 8080:80 multicine-frontend
```

> `VITE_API_BASE_URL` es **build time**: Vite la reemplaza en el bundle al compilar. Para otra URL:
> `docker compose build --build-arg VITE_API_BASE_URL=...` o una variable `VITE_API_BASE_URL` en el
> `.env` local.

## 6. Verificación

```bash
npm run build        # tsc -b + vite build
npm run lint         # eslint
npm run format:check # prettier --check
docker compose build # build de la imagen
```
