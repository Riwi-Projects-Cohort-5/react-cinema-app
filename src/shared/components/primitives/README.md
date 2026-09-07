# Primitivas

## Descripción

Componentes primitivos del sistema de diseño de **React Cinema App**. Cada primitiva vive en su propia carpeta (`kebab-case/`) con su componente y su documentación colocated, y se re-exporta desde el barrel `index.ts` de esta carpeta.

Importación recomendada (desde el barrel):

```tsx
import { Checkbox, CheckboxRobot } from "@shared/components/primitives";
```

## Catálogo

| Primitiva | Descripción |
| --------- | ----------- |
| [Checkbox](./checkbox/checkbox.md) | Check interactivo. Variante estándar (token `primary`) y "no soy un robot" (token `success`). |

## Cómo agregar una primitiva

1. Crear la carpeta `primitives/<nombre>/` (kebab-case).
2. Agregar el componente `<Nombre>.tsx` (PascalCase).
3. Agregar el doc colocated `<nombre>.md`.
4. Re-exportar el componente en `primitives/index.ts` (barrel).
5. Agregar una fila a la tabla del catálogo.