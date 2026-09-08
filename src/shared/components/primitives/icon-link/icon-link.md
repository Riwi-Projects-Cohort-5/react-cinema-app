# IconLink

Acción inline con flecha al final: renderiza un `<Link>` cuando recibe `to`, o un `<button>` con `onClick` en caso contrario. Tipografía `text-caption`, color `primary` y flecha que se desplaza en hover.

## Props

| Prop        | Tipo         | Default | Descripción                              |
| ----------- | ------------ | ------- | ---------------------------------------- |
| `children`  | `ReactNode`  | —       | Texto de la acción.                      |
| `to`        | `string`     | —       | Ruta (React Router); renderiza `<Link>`. |
| `onClick`   | `() => void` | —       | Callback; renderiza `<button>`.          |
| `className` | `string`     | —       | Clases adicionales.                      |

## Ejemplo

```tsx
import { IconLink } from "@shared/components/primitives";

<IconLink to="/funciones">Ver funciones</IconLink>;
```
