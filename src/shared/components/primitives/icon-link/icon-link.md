# IconLink

Acción inline con flecha al final: renderiza un `<Link>` cuando recibe `to`, o un `<button>` con `onClick` en caso contrario. Tipografía `text-caption`, color `primary` y flecha que se desplaza en hover. `to` y `onClick` son mutuamente excluyentes y se requiere al menos una.

## Props

| Prop        | Tipo         | Default | Descripción                                                             |
| ----------- | ------------ | ------- | ----------------------------------------------------------------------- |
| `children`  | `ReactNode`  | —       | Texto de la acción.                                                     |
| `to`        | `string`     | —       | Ruta (React Router); renderiza `<Link>`. Requerida si no hay `onClick`. |
| `onClick`   | `() => void` | —       | Callback; renderiza `<button>`. Requerido si no hay `to`.               |
| `className` | `string`     | —       | Clases adicionales.                                                     |

## Ejemplo

```tsx
import { IconLink } from "@shared/components/primitives";

<IconLink to="/funciones">Ver funciones</IconLink>;
```
