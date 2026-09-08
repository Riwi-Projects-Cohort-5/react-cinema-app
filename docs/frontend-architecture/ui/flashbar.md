# Flashbar — banner fijo de avisos + toasts

## Flashbar

Componente **composite** (`src/features/flashbar/components/flashbar/Flashbar.tsx`) para avisos
persistentes a nivel de sistema fijados arriba del viewport. Sigue el visual del Figma
"Flashbar" (MULT-243): barra `h-14`, borde superior/inferior e izquierdo (3px) en el tono,
badge de icono, título, separador, mensaje, chip de cuenta regresiva y acción opcional.

Compone primitivas de `src/shared/components/primitives/` y el hook `useCountdown` de
`src/shared/hooks/`:

| Primitiva                          | Uso                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `IconBadge`                        | Caja del icono (borde/fondo al 20/12 % del tono)                       |
| `Countdown` / `useCountdown`       | Cuenta regresiva viva `HH:MM:SS` con `tabular-nums`, sin _jitter_      |
| `IconLink`                         | Acción "Ver funciones" (link o botón) con flecha                       |

Tones: `accent` (default), `success`, `info`, `warning`, `error`. Tokens: 100 % del design
system (`bg-surface`, `border-accent`, `text-text-secondary`, …), sin colores
hardcodeados. `role="status"`; `role="alert"` en tono error.

## Toasts

Capa existente `@services/notify` (sonner) expuesta con el theme del design system vía
`AppToaster` (`src/shared/components/composites/app-toaster/AppToaster.tsx`): superficie, bordes, sombras
y tipografía con tokens; la variante se indica con el borde izquierdo del tono. `AppToaster`
se monta en `App.tsx`; `notifySuccess/Error/Info/Warning` no cambian.

## Feature Cine Flash (`src/features/flashbar/`)

- `interfaces/cineflash.ts` — contrato `GET /cineflash`.
- `services/cineflash.service.ts` — `getCineFlash(cityId, signal)`.
- `hooks/useCineFlash.ts` — TanStack Query `["cineflash", cityId]`, `staleTime` 30 s,
  `refetchInterval` 60 s, `refetchOnWindowFocus`.
- `components/cineflash-banner/CineFlashBanner.tsx` — oculta el banner cuando `pending`/`error`/`!active`
  (no se renderiza un banner vacío); al terminar la cuenta regresiva invalida `["cineflash"]`.

## Deuda técnica (pendientes MULT-243)

- **cityId placeholder**: `CINE_FLASH_DEFAULT_CITY_ID` en `config.ts` — reemplazar con la
  ciudad real de la feature de ubicación cuando exista.
- **422 por ciudad** → abrir el asistente de ubicación (contrato `69-GET-cineflash`).
- **"Ver funciones"** sin ruta: la acción no se renderiza hasta que exista la sección de
  funciones con descuento.
- **Backend pendiente**: endpoint y mock con 404; el banner cae a `null` por error hasta que
  el backend responda.
- **Skeleton / estado vacío y `notifyError`** del feed cuando el backend responda.