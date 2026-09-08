# Primitivas

## Descripción

Componentes primitivos del sistema de diseño de **React Cinema App**. Cada primitiva vive en su propia carpeta (`kebab-case/`) con su componente y su documentación colocated, y se re-exporta desde el barrel `index.ts` de esta carpeta.

Importación recomendada (desde el barrel):

```tsx
import { Countdown, IconBadge, IconLink } from "@shared/components/primitives";
```

## Catálogo

| Primitiva                               | Descripción                                                                                                                                           |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Countdown](./countdown/countdown.md)   | Cuenta regresiva viva `HH:MM:SS` con reloj y `tabular-nums`; clampa en cero y dispara `onExpire`. Respaldada por `useCountdown` (`src/shared/hooks`). |
| [IconBadge](./icon-badge/icon-badge.md) | Contenedor cuadrado para íconos decorativos, borde/fondo al 20/12 % del tono.                                                                         |
| [IconLink](./icon-link/icon-link.md)    | Acción inline (link o botón) con flecha al final y hover.                                                                                             |

## Cómo agregar una primitiva

1. Crear la carpeta `primitives/<nombre>/` (kebab-case).
2. Agregar el componente `<Nombre>.tsx` (PascalCase).
3. Agregar el doc colocated `<nombre>.md`.
4. Re-exportar el componente en `primitives/index.ts` (barrel).
5. Agregar una fila a la tabla del catálogo.
