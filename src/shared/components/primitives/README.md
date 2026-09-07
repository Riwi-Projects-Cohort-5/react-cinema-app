# Primitivas

## Descripción

Componentes primitivos del sistema de diseño de **React Cinema App**. Cada primitiva vive en su propia carpeta (`kebab-case/`) con su componente y su documentación colocated, y se re-exporta desde el barrel `index.ts` de esta carpeta.

Importación recomendada (desde el barrel):

```tsx
<<<<<<< HEAD
import {
  Checkbox,
  CheckboxRobot,
  Countdown,
  Dropdown,
  IconBadge,
  IconLink,
  Input,
} from "@shared/components/primitives";
=======
import { Checkbox, CheckboxRobot } from "@shared/components/primitives";
>>>>>>> f5bcd3c (feat: add checkbox primitives with barrel and docs)
```

## Catálogo

| Primitiva | Descripción |
| --------- | ----------- |
| [Checkbox](./checkbox/checkbox.md) | Check interactivo. Variante estándar (token `primary`) y "no soy un robot" (token `success`). |
<<<<<<< HEAD
| [Countdown](./countdown/countdown.md) | Cuenta regresiva viva `HH:MM:SS` con reloj y `tabular-nums`; clampa en cero y dispara `onExpire`. Respaldada por `useCountdown` (`src/shared/hooks`). |
| [Dropdown](./dropdown/dropdown.md) | Select (combobox) con navegación por teclado y filtrado de opciones opcional. |
| [IconBadge](./icon-badge/icon-badge.md) | Contenedor cuadrado para íconos decorativos, borde/fondo al 20/12 % del tono. |
| [IconLink](./icon-link/icon-link.md) | Acción inline (link o botón) con flecha al final y hover. |
| [Input](./Input.tsx) | Campo de texto, textarea y select con variantes, estados, iconos y soporte para helper/error messages. |

## Composición de clases (`cn`)

Las primitivas componen sus `className` condicionales con el util compartido **`cn`** (`@shared/utils/cn`), un joiner de clases tipo `clsx` que filtra valores falsy:

```tsx
import { cn } from "@shared/utils/cn";

className={cn(
  "flex items-center gap-2",
  disabled && "cursor-not-allowed opacity-40",
  className,
)}
```

**Regla del sistema:** no se usan clases con `!important` (`!border-0`, etc.). Cuando una primitiva necesita anular estilos de otra, el override se resuelve por **especificidad** (p. ej. variantes `[&_input:]` sobre el wrapper) en lugar de `!`.
=======
>>>>>>> f5bcd3c (feat: add checkbox primitives with barrel and docs)

## Cómo agregar una primitiva

1. Crear la carpeta `primitives/<nombre>/` (kebab-case).
2. Agregar el componente `<Nombre>.tsx` (PascalCase).
3. Agregar el doc colocated `<nombre>.md`.
4. Re-exportar el componente en `primitives/index.ts` (barrel).
5. Agregar una fila a la tabla del catálogo.