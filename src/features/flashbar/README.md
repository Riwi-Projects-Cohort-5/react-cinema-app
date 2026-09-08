# Feature Cine Flash (`src/features/flashbar/`)

## Descripción

Feature del banner fijo de avisos "Cine Flash" (MULT-243): conecta el contrato `GET /cineflash`
(servicio + hook TanStack Query) con el composite `Flashbar` (que compone primitivas de
`@shared/components/primitives`). Se monta en `App.tsx` vía `CineFlashBanner`.

## Módulos

| Módulo                                                               | Ruta                            | Descripción                                                                       |
| -------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| [Interfaces](./interfaces/cineflash.md)                              | `interfaces/cineflash.ts`       | Contrato `CineFlashResponse` y modelos asociados.                                 |
| [Servicio](./services/cineflash.service.md)                          | `services/cineflash.service.ts` | `getCineFlash(cityId, signal)` sobre `httpClient`.                                |
| [Hook](./hooks/useCineFlash.md)                                      | `hooks/useCineFlash.ts`         | TanStack Query `["cineflash", cityId]`, `staleTime` 30 s, `refetchInterval` 60 s. |
| [CineFlashBanner](./components/cineflash-banner/cineflash-banner.md) | `components/cineflash-banner/`  | Contenedor que decide cuándo renderizar el banner.                                |
| [Flashbar](./components/flashbar/flashbar.md)                        | `components/flashbar/`          | Composite del anuncio (registro visual + tonos).                                  |

Importación recomendada desde el barrel de componentes:

```tsx
import { CineFlashBanner, Flashbar } from "@features/flashbar/components";
```

## Tonos

`Flashbar` soporta los 5 tonos del sistema (`accent` default, `success`, `info`, `warning`, `error`).
Hoy el banner usa el default `accent` porque el contrato no expone un tono — ver
[flashbar.md](./components/flashbar/flashbar.md) para la posibilidad de dirigirlo desde el backend.
