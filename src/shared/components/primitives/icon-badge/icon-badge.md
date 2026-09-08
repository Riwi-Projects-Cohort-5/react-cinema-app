# IconBadge

Contenedor cuadrado (`28×28`, `rounded-md`) para íconos decorativos, con borde al 20 % y fondo al 12 % del tono (por defecto `accent`). Se ajusta el tono vía `className` (p. ej. el mapeo de tonos del `Flashbar`).

Decorativo: renderiza `aria-hidden` por defecto; el significado lo aporta el texto vecino.

## Props

| Prop        | Tipo        | Default | Descripción                      |
| ----------- | ----------- | ------- | -------------------------------- |
| `icon`      | `ReactNode` | —       | Contenido del badge (ícono).     |
| `className` | `string`    | —       | Clases adicionales (tono, etc.). |

## Ejemplo

```tsx
import { Lightning } from "@phosphor-icons/react";
import { IconBadge } from "@shared/components/primitives";

<IconBadge icon={<Lightning size={16} weight="bold" aria-hidden="true" />} />;
```
