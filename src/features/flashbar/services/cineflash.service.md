# cineflash.service

`getCineFlash(cityId, signal): Promise<CineFlashResponse>` — `GET /cineflash` con `cityId` como
query param, vía `httpClient` de `@services/httpClient`. Acepta un `AbortSignal` para cancelación
(la provee TanStack Query en el `queryFn`).

## Ejemplo

```ts
import { getCineFlash } from "@features/flashbar/services/cineflash.service";

const data = await getCineFlash(cityId, signal);
```
