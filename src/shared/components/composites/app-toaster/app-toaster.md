# AppToaster

Wrapper del sistema de toasts (`sonner`) con el theme del design system: superficie `surface`, borde `border`, sombra `md` y tipografía de tokens; la variante se marca con el borde izquierdo del tono (`success`/`error`/`info`/`warning`). Se monta una única vez en `App.tsx`.

El theme se toma de la aplicación: el hook `useTheme` (`src/shared/hooks/useTheme.ts`) lee y persiste la preferencia en `localStorage` (clave `react-cinema-theme`) y la aplica al `<html data-theme>`. `AppToaster` acepta además un `theme` forzado por prop.

## Props

| Prop    | Tipo                | Default    | Descripción                                                                 |
| ------- | ------------------- | ---------- | --------------------------------------------------------------------------- |
| `theme` | `"light" \| "dark"` | `useTheme` | Theme forzado del contenedor; sin la prop se usa la preferencia persistida. |

La capa pública para disparar toasts sigue siendo `@services/notify` (`notifySuccess`, `notifyError`, `notifyInfo`, `notifyWarning`); los componentes no usan `sonner` directamente.

## Ejemplo

```tsx
import { AppToaster } from "@shared/components/composites";

<AppToaster />;
```
