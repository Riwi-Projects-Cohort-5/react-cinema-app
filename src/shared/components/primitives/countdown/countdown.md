# Countdown

Cuenta regresiva viva en formato `HH:MM:SS` respaldada por el hook `useCountdown` (`src/shared/hooks/useCountdown.ts`). Usa `tabular-nums` para evitar _jitter_, ícono `Clock` (16px) y tokens del sistema (`text-caption`, `font-primary`, `text-text-primary/secondary`).

## Props

| Prop        | Tipo         | Default | Descripción                                              |
| ----------- | ------------ | ------- | -------------------------------------------------------- |
| `seconds`   | `number`     | —       | Segundos restantes; se recalcula el deadline al cambiar. |
| `onExpire`  | `() => void` | —       | Se dispara una única vez al llegar a cero.               |
| `className` | `string`     | —       | Clases adicionales (tamaños, margen, etc.).              |

## Ejemplo

```tsx
import { Countdown } from "@shared/components/primitives";

<Countdown seconds={16381} onExpire={invalidateCineFlash} />;
```
