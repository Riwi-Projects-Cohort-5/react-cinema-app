# Path Aliases

## Descripción

Los path aliases permiten importar módulos usando referencias cortas y legibles en lugar de rutas relativas (`../../`).

Su objetivo es mantener imports limpios, estables ante cambios de estructura y consistentes en todo el proyecto.

---

## Aliases configurados

| Alias        | Destino           |
| ------------ | ----------------- |
| `@`          | `src/`            |
| `@assets`    | `src/assets/`     |
| `@config`    | `src/config/`     |
| `@features`  | `src/features/`   |
| `@routes`    | `src/routes/`     |
| `@services`  | `src/services/`   |
| `@shared`    | `src/shared/`     |

---

## Configuración

Los aliases se definen en **dos lugares** y deben mantenerse sincronizados:

1. **Vite** — `vite.config.ts` (`resolve.alias`): resuelve los aliases en tiempo de compilación.
2. **TypeScript** — `tsconfig.app.json` (`compilerOptions.paths`): resuelve los aliases para el type-checking y el editor.

---

## Uso

### Ejemplo

```ts
import { env } from "@config/env";
import { httpClient } from "@services/httpClient";
import { useHealth } from "@features/health/hooks/useHealth";
```

### Reglas

- Los imports a módulos dentro de `features`, `routes`, `services`, `shared`, `config` o `assets` usan su alias corto correspondiente.
- El alias `@` se reserva para archivos de la raíz de `src/` (por ejemplo `@/main`).
- Los archivos barril (`export * from "./...`) pueden mantenerse con rutas relativas por ser re-exportaciones internas de un mismo directorio.

---

## Buenas prácticas

- No usar rutas relativas fuera del directorio inmediato del archivo; preferir el alias correspondiente.
- No crear nuevos aliases sin actualizar simultáneamente `vite.config.ts` y `tsconfig.app.json`.
- Verificar que un import resuelva con `npm run build` (ejecuta `tsc -b` y valida los paths).
